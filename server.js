const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Helper to read JSON data safely
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper to write JSON data safely
function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
}

// Active Promo Codes
const PROMO_CODES = {
  'SAVE10': { discountPercent: 10, description: '10% Off Entire Order' },
  'TECH20': { discountPercent: 20, description: '20% Off Tech Gadgets' },
  'WELCOME15': { discountPercent: 15, description: '15% Welcome Discount' }
};

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. GET /api/products (with search, category filter, sorting)
app.get('/api/products', (req, res) => {
  const { category, search, sort, minPrice, maxPrice } = req.query;
  let products = readJsonFile(PRODUCTS_FILE);

  // Filter by category
  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by search term
  if (search) {
    const query = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  // Filter by price
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Sort
  if (sort) {
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
  }

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// 2. GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: product });
});

// 3. GET /api/categories
app.get('/api/categories', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const categories = {};
  
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  res.json({
    success: true,
    data: categories
  });
});

// 4. POST /api/promo/validate
app.post('/api/promo/validate', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Promo code is required' });
  }

  const upperCode = code.trim().toUpperCase();
  const promo = PROMO_CODES[upperCode];

  if (promo) {
    return res.json({
      success: true,
      code: upperCode,
      discountPercent: promo.discountPercent,
      description: promo.description
    });
  } else {
    return res.status(404).json({
      success: false,
      message: 'Invalid promo code. Try SAVE10 or TECH20'
    });
  }
});

// 5. POST /api/orders (Order Processing & Stock Reduction)
app.post('/api/orders', (req, res) => {
  const { customer, items, promoCode } = req.body;

  // Validation
  if (!customer || !customer.fullName || !customer.email || !customer.address) {
    return res.status(400).json({
      success: false,
      message: 'Customer information (Name, Email, Address) is required'
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart cannot be empty'
    });
  }

  const products = readJsonFile(PRODUCTS_FILE);
  const orderItems = [];
  let subtotal = 0;

  // Validate items and check stock
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.id} does not exist.`
      });
    }

    const qty = parseInt(item.quantity, 10) || 1;
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
      });
    }

    // Deduct stock
    product.stock -= qty;

    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image
    });

    subtotal += product.price * qty;
  }

  // Calculate discounts, taxes, and shipping
  let discountPercent = 0;
  if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
    discountPercent = PROMO_CODES[promoCode.toUpperCase()].discountPercent;
  }

  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const discountedSubtotal = subtotal - discountAmount;
  const tax = Number((discountedSubtotal * 0.08).toFixed(2)); // 8% estimated tax
  const shipping = discountedSubtotal > 100 ? 0 : 9.99; // Free shipping above $100
  const total = Number((discountedSubtotal + tax + shipping).toFixed(2));

  // Generate unique Order ID
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    customer: {
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone || 'N/A',
      address: customer.address,
      city: customer.city || 'N/A',
      state: customer.state || 'N/A',
      zip: customer.zip || 'N/A',
      country: customer.country || 'United States'
    },
    items: orderItems,
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount,
    promoCode: discountPercent > 0 ? promoCode.toUpperCase() : null,
    tax,
    shipping,
    total,
    paymentMethod: customer.paymentMethod || 'Credit Card (Simulated)',
    status: 'Confirmed'
  };

  // Persist updated stock and new order
  const orders = readJsonFile(ORDERS_FILE);
  orders.unshift(newOrder);

  writeJsonFile(PRODUCTS_FILE, products);
  writeJsonFile(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: newOrder
  });
});

// 6. GET /api/orders (Order List / History)
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// 7. GET /api/orders/:id (Lookup single order)
app.get('/api/orders/:id', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const order = orders.find(o => o.id.toLowerCase() === req.params.id.toLowerCase());

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order #${req.params.id} not found.`
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// Fallback to index.html for SPA-style routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`⚡ NovaTech Gear Server running at: http://localhost:${PORT}`);
  console.log(`📦 REST API Ready at http://localhost:${PORT}/api/products`);
  console.log(`=========================================`);
});
