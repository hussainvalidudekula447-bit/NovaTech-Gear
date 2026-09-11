// ==========================================================================
// NovaTech Gear — Frontend Application Controller (Vanilla JS)
// ==========================================================================

const API_BASE_URL = '/api';

// State
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'featured';
let appliedPromo = null; // { code, discountPercent, description }
let cart = []; // Array of { id, name, price, image, quantity, stock }

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const productCountText = document.getElementById('product-count-text');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const emptyProducts = document.getElementById('empty-products');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const sortSelect = document.getElementById('sort-select');
const categoryPills = document.querySelectorAll('.category-pill');

// Cart Elements
const cartBadgeCount = document.getElementById('cart-badge-count');
const drawerItemCount = document.getElementById('drawer-item-count');
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartItemsList = document.getElementById('cart-items-list');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDiscountEl = document.getElementById('cart-discount');
const discountRowEl = document.getElementById('discount-row');
const cartTaxEl = document.getElementById('cart-tax');
const cartShippingEl = document.getElementById('cart-shipping');
const cartGrandTotalEl = document.getElementById('cart-grand-total');
const promoInput = document.getElementById('promo-input');
const promoAppliedTag = document.getElementById('promo-applied-tag');
const promoNameDisplay = document.getElementById('promo-name-display');

// Modals
const productModalBackdrop = document.getElementById('product-modal-backdrop');
const productModalContent = document.getElementById('product-modal-content');
const checkoutModalBackdrop = document.getElementById('checkout-modal-backdrop');
const orderSuccessBackdrop = document.getElementById('order-success-backdrop');
const ordersModalBackdrop = document.getElementById('orders-modal-backdrop');
const ordersNavBtn = document.getElementById('orders-nav-btn');
const footerOrdersBtn = document.getElementById('footer-orders-btn');
const topTrackBtn = document.getElementById('top-track-btn');
const toastContainer = document.getElementById('toast-container');

// ==========================================================================
// 1. INITIALIZATION & LIFECYCLE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  fetchProducts();
  setupEventListeners();
});

function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    clearSearchBtn.style.display = currentSearch ? 'block' : 'none';
    filterAndRenderProducts();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    clearSearchBtn.style.display = 'none';
    filterAndRenderProducts();
  });

  // Sort
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterAndRenderProducts();
  });

  // Categories
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      filterAndRenderProducts();
    });
  });

  // Cart Toggle
  cartToggleBtn.addEventListener('click', openCartDrawer);

  // Orders Nav
  ordersNavBtn.addEventListener('click', openOrdersModal);
  if (footerOrdersBtn) footerOrdersBtn.addEventListener('click', openOrdersModal);
  if (topTrackBtn) topTrackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openOrdersModal();
  });

  // Reset Filters Button
  resetFiltersBtn.addEventListener('click', resetAllFilters);

  // Backdrop close
  productModalBackdrop.addEventListener('click', (e) => {
    if (e.target === productModalBackdrop) closeProductModal();
  });
  checkoutModalBackdrop.addEventListener('click', (e) => {
    if (e.target === checkoutModalBackdrop) closeCheckoutModal();
  });
  orderSuccessBackdrop.addEventListener('click', (e) => {
    if (e.target === orderSuccessBackdrop) closeOrderSuccessModal();
  });
  ordersModalBackdrop.addEventListener('click', (e) => {
    if (e.target === ordersModalBackdrop) closeOrdersModal();
  });
}

// ==========================================================================
// 2. PRODUCT FETCHING & RENDERING
// ==========================================================================

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const data = await res.json();
    if (data.success) {
      allProducts = data.data;
      filterAndRenderProducts();
    } else {
      showToast('Failed to load products', 'error');
    }
  } catch (err) {
    console.error('Error loading products:', err);
    showToast('Cannot connect to backend server', 'error');
  }
}

function filterAndRenderProducts() {
  let result = [...allProducts];

  // Category filter
  if (currentCategory && currentCategory !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
  }

  // Search filter
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (currentSort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  filteredProducts = result;
  renderProductsGrid(result);
  updateStatusBar();
}

function renderProductsGrid(products) {
  if (!products || products.length === 0) {
    productsGrid.style.display = 'none';
    emptyProducts.style.display = 'block';
    return;
  }

  productsGrid.style.display = 'grid';
  emptyProducts.style.display = 'none';

  productsGrid.innerHTML = products.map(product => {
    const stockClass = product.stock > 10 ? 'stock-in' : (product.stock > 0 ? 'stock-low' : 'stock-out');
    const stockText = product.stock > 10 ? 'In Stock' : (product.stock > 0 ? `Only ${product.stock} left` : 'Sold Out');

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-img-wrap" onclick="openProductModal('${product.id}')">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" class="card-img" loading="lazy" />
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
          <button class="card-quickview-btn" onclick="event.stopPropagation(); openProductModal('${product.id}')">
            <i class="fa-solid fa-eye"></i> Quick View
          </button>
        </div>

        <div class="card-body">
          <span class="card-category">${product.category}</span>
          <h3 class="card-title" onclick="openProductModal('${product.id}')">${escapeHtml(product.name)}</h3>
          
          <div class="card-rating">
            <div class="stars-gold">${generateStars(product.rating)}</div>
            <span>${product.rating.toFixed(1)} (${product.reviewsCount})</span>
          </div>

          <div class="card-footer">
            <div class="price-wrap">
              <div class="current-price">$${product.price.toFixed(2)}</div>
              ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
              <span class="stock-indicator ${stockClass}"><i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${stockText}</span>
            </div>

            <button class="card-add-btn" onclick="addToCart('${product.id}')" title="Add to Cart" ${product.stock <= 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updateStatusBar() {
  const isFiltered = currentCategory !== 'all' || currentSearch !== '';
  resetFiltersBtn.style.display = isFiltered ? 'inline-flex' : 'none';
  
  if (currentSearch) {
    productCountText.textContent = `Found ${filteredProducts.length} results for "${currentSearch}"`;
  } else if (currentCategory !== 'all') {
    productCountText.textContent = `Showing ${filteredProducts.length} items in ${capitalize(currentCategory)}`;
  } else {
    productCountText.textContent = `Showing all ${filteredProducts.length} flagship products`;
  }
}

function filterByCategory(category) {
  currentCategory = category;
  categoryPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === category);
  });
  const catalogEl = document.getElementById('catalog-section');
  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  filterAndRenderProducts();
}

function resetAllFilters() {
  currentCategory = 'all';
  currentSearch = '';
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  sortSelect.value = 'featured';
  currentSort = 'featured';
  categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
  filterAndRenderProducts();
}

// ==========================================================================
// 3. PRODUCT DETAILS MODAL
// ==========================================================================

function openProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const stockClass = product.stock > 10 ? 'stock-in' : (product.stock > 0 ? 'stock-low' : 'stock-out');
  const stockText = product.stock > 10 ? `In Stock (${product.stock} units)` : (product.stock > 0 ? `Low Stock (Only ${product.stock} left)` : 'Out of Stock');

  const specsHtml = product.specs ? Object.entries(product.specs).map(([key, val]) => `
    <div class="spec-item">
      <span>${key}:</span>
      <strong>${val}</strong>
    </div>
  `).join('') : '';

  const featuresHtml = product.features ? product.features.map(f => `
    <li style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-muted);">
      <i class="fa-solid fa-check" style="color: var(--accent-cyan);"></i> ${f}
    </li>
  `).join('') : '';

  productModalContent.innerHTML = `
    <div class="product-detail-grid">
      <div class="modal-img-col">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" class="modal-main-img" />
      </div>

      <div class="modal-info-col">
        <div class="modal-badge-row">
          <span class="card-category">${product.category}</span>
          ${product.badge ? `<span class="card-badge" style="position: static;">${product.badge}</span>` : ''}
          <span class="stock-indicator ${stockClass}" style="margin-left: auto;">
            <i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${stockText}
          </span>
        </div>

        <h2 class="modal-title">${escapeHtml(product.name)}</h2>

        <div class="card-rating" style="margin-bottom: 12px;">
          <div class="stars-gold">${generateStars(product.rating)}</div>
          <span>${product.rating.toFixed(1)} (${product.reviewsCount} customer reviews)</span>
        </div>

        <div class="modal-price-row">
          <span class="modal-price">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="original-price" style="font-size: 1.1rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
          ${product.originalPrice ? `<span class="badge badge-success">Save $${(product.originalPrice - product.price).toFixed(2)}</span>` : ''}
        </div>

        <p class="modal-desc">${escapeHtml(product.description)}</p>

        ${specsHtml ? `
          <div class="modal-specs-box">
            <h5>Technical Specifications</h5>
            <div class="specs-grid">
              ${specsHtml}
            </div>
          </div>
        ` : ''}

        ${featuresHtml ? `
          <div style="margin-bottom: 20px;">
            <h5 style="font-size: 0.88rem; color: var(--accent-cyan); margin-bottom: 8px; text-transform: uppercase;">Key Highlights</h5>
            <ul style="list-style: none;">
              ${featuresHtml}
            </ul>
          </div>
        ` : ''}

        <div class="modal-actions-row">
          <div class="qty-control">
            <button class="qty-btn" onclick="adjustModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-val" id="modal-qty-val">1</span>
            <button class="qty-btn" onclick="adjustModalQty(1)"><i class="fa-solid fa-plus"></i></button>
          </div>

          <button class="btn btn-primary btn-glow" style="flex: 1;" onclick="addModalItemToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i> Add to Bag
          </button>
          
          <button class="btn btn-secondary" onclick="buyNowDirectly('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
            Instant Buy
          </button>
        </div>
      </div>
    </div>
  `;

  productModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function adjustModalQty(delta) {
  const qtyEl = document.getElementById('modal-qty-val');
  if (!qtyEl) return;
  let val = parseInt(qtyEl.textContent, 10) + delta;
  if (val < 1) val = 1;
  if (val > 20) val = 20;
  qtyEl.textContent = val;
}

function addModalItemToCart(productId) {
  const qtyEl = document.getElementById('modal-qty-val');
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
  addToCart(productId, qty);
  closeProductModal();
  openCartDrawer();
}

function buyNowDirectly(productId) {
  const qtyEl = document.getElementById('modal-qty-val');
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
  addToCart(productId, qty);
  closeProductModal();
  openCheckoutModal();
}

// ==========================================================================
// 4. CART MANAGEMENT & PROMO SYSTEM
// ==========================================================================

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('novatech_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = [];
  }
  updateCartUI();
}

function saveCartToStorage() {
  localStorage.setItem('novatech_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast('This product is currently out of stock', 'error');
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.quantity + quantity > product.stock) {
      showToast(`Only ${product.stock} units available in stock`, 'warning');
      existing.quantity = product.stock;
    } else {
      existing.quantity += quantity;
      showToast(`Updated "${product.name}" quantity (${existing.quantity})`, 'success');
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: Math.min(quantity, product.stock)
    });
    showToast(`Added "${product.name}" to cart`, 'success');
  }

  saveCartToStorage();
}

function updateCartQuantity(productId, newQty) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQty > item.stock) {
    showToast(`Maximum available stock is ${item.stock}`, 'warning');
    item.quantity = item.stock;
  } else {
    item.quantity = newQty;
  }

  saveCartToStorage();
}

function removeFromCart(productId) {
  const item = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  if (item) {
    showToast(`Removed "${item.name}" from cart`, 'info');
  }
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadgeCount.textContent = totalCount;
  drawerItemCount.textContent = `(${totalCount} item${totalCount === 1 ? '' : 's'})`;

  // Render Drawer Items
  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; margin-bottom: 12px; color: var(--text-dim);"></i>
        <h4>Your Bag is Empty</h4>
        <p style="font-size: 0.88rem; margin-top: 6px;">Add exciting gear to get started!</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 16px;" onclick="closeCartDrawer()">
          Explore Products
        </button>
      </div>
    `;
    document.getElementById('checkout-btn').disabled = true;
  } else {
    document.getElementById('checkout-btn').disabled = false;
    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" />
        <div class="cart-item-info">
          <h5>${escapeHtml(item.name)}</h5>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-controls">
            <div class="cart-item-qty">
              <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})"><i class="fa-solid fa-minus"></i></button>
              <span>${item.quantity}</span>
              <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})"><i class="fa-solid fa-plus"></i></button>
            </div>
            <span style="font-size: 0.82rem; font-weight: 700; color: #fff;">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  // Calculate Totals
  calculateAndRenderTotals();
}

function calculateAndRenderTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;

  if (appliedPromo) {
    discountAmount = (subtotal * appliedPromo.discountPercent) / 100;
  }

  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * 0.08;
  const shipping = subtotal === 0 ? 0 : (discountedSubtotal >= 100 ? 0 : 9.99);
  const grandTotal = subtotal === 0 ? 0 : (discountedSubtotal + tax + shipping);

  // Update Drawer UI
  cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (appliedPromo && discountAmount > 0) {
    discountRowEl.style.display = 'flex';
    cartDiscountEl.textContent = `-$${discountAmount.toFixed(2)} (${appliedPromo.discountPercent}%)`;
  } else {
    discountRowEl.style.display = 'none';
  }

  cartTaxEl.textContent = `$${tax.toFixed(2)}`;
  cartShippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  cartGrandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;

  // Shipping perk notice
  const shippingPerkEl = document.getElementById('shipping-perk-text');
  if (shippingPerkEl) {
    if (discountedSubtotal >= 100) {
      shippingPerkEl.innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> You have unlocked <strong>FREE Express Shipping</strong>!`;
    } else if (subtotal > 0) {
      shippingPerkEl.innerHTML = `<i class="fa-solid fa-truck"></i> Add <strong>$${(100 - discountedSubtotal).toFixed(2)}</strong> more for FREE Shipping!`;
    }
  }

  return { subtotal, discountAmount, tax, shipping, grandTotal };
}

async function applyPromoCode() {
  const code = promoInput.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a promo code', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();

    if (data.success) {
      appliedPromo = data;
      promoAppliedTag.style.display = 'flex';
      promoNameDisplay.textContent = `${data.code} (${data.discountPercent}% OFF)`;
      promoInput.value = '';
      calculateAndRenderTotals();
      showToast(`Promo "${data.code}" applied! Saved ${data.discountPercent}%`, 'success');
    } else {
      showToast(data.message || 'Invalid promo code', 'error');
    }
  } catch (e) {
    showToast('Could not validate promo code', 'error');
  }
}

function removePromoCode() {
  appliedPromo = null;
  promoAppliedTag.style.display = 'none';
  calculateAndRenderTotals();
  showToast('Promo code removed', 'info');
}

function copyPromo(code) {
  if (promoInput) {
    promoInput.value = code;
    openCartDrawer();
    applyPromoCode();
  }
}

function openCartDrawer() {
  cartDrawer.classList.add('active');
  cartDrawerBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  cartDrawer.classList.remove('active');
  cartDrawerBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================================================
// 5. CHECKOUT & ORDER PROCESSING
// ==========================================================================

function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Your shopping bag is empty', 'warning');
    return;
  }

  closeCartDrawer();
  const totals = calculateAndRenderTotals();

  // Populate mini items list
  const miniListEl = document.getElementById('checkout-mini-items');
  miniListEl.innerHTML = cart.map(item => `
    <div class="checkout-mini-item">
      <div class="mini-item-left">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="mini-item-img" />
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <div style="color: var(--text-dim); font-size: 0.78rem;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
        </div>
      </div>
      <span style="font-weight: 700; color: #fff;">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  // Populate mini totals
  const miniTotalsEl = document.getElementById('checkout-mini-totals');
  miniTotalsEl.innerHTML = `
    <div class="summary-row" style="margin-bottom: 6px;">
      <span>Subtotal</span>
      <span>$${totals.subtotal.toFixed(2)}</span>
    </div>
    ${totals.discountAmount > 0 ? `
      <div class="summary-row discount-row" style="margin-bottom: 6px;">
        <span>Discount (${appliedPromo.code})</span>
        <span class="text-green">-$${totals.discountAmount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="summary-row" style="margin-bottom: 6px;">
      <span>Estimated Tax (8%)</span>
      <span>$${totals.tax.toFixed(2)}</span>
    </div>
    <div class="summary-row" style="margin-bottom: 6px;">
      <span>Express Shipping</span>
      <span>${totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}</span>
    </div>
    <div class="summary-row total-row" style="margin-top: 10px;">
      <span>Total Amount</span>
      <span class="gradient-text">$${totals.grandTotal.toFixed(2)}</span>
    </div>
  `;

  document.getElementById('checkout-btn-amount').textContent = `$${totals.grandTotal.toFixed(2)}`;

  checkoutModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  checkoutModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

async function handleOrderSubmission(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submit-order-btn');
  const submitText = document.getElementById('submit-order-text');
  const submitSpinner = document.getElementById('submit-order-spinner');

  const name = document.getElementById('cust-name').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const state = document.getElementById('cust-state').value.trim();
  const zip = document.getElementById('cust-zip').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Credit Card (Simulated)';

  if (!name || !email || !address || !city) {
    showToast('Please complete all required shipping fields', 'warning');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitSpinner.style.display = 'block';

  const orderPayload = {
    customer: {
      fullName: name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      paymentMethod
    },
    items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
    promoCode: appliedPromo ? appliedPromo.code : null
  };

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const result = await res.json();

    if (result.success) {
      // Clear Cart
      cart = [];
      appliedPromo = null;
      promoAppliedTag.style.display = 'none';
      saveCartToStorage();

      // Refresh product stock
      fetchProducts();

      // Show Receipt Modal
      closeCheckoutModal();
      showOrderSuccessReceipt(result.data);
      showToast('🎉 Order processed successfully!', 'success');
    } else {
      showToast(result.message || 'Error processing order', 'error');
    }
  } catch (err) {
    console.error('Order submission error:', err);
    showToast('Network error while processing order', 'error');
  } finally {
    submitBtn.disabled = false;
    submitText.style.display = 'inline-block';
    submitSpinner.style.display = 'none';
  }
}

// ==========================================================================
// 6. ORDER RECEIPT & TRACKING
// ==========================================================================

let latestPlacedOrder = null;

function showOrderSuccessReceipt(order) {
  latestPlacedOrder = order;

  document.getElementById('receipt-order-id').textContent = order.id;
  document.getElementById('receipt-date').textContent = new Date(order.createdAt).toLocaleString();
  document.getElementById('receipt-customer-name').textContent = order.customer.fullName;
  document.getElementById('receipt-customer-email').textContent = order.customer.email;
  document.getElementById('receipt-customer-phone').textContent = order.customer.phone || 'N/A';
  document.getElementById('receipt-customer-address').textContent = order.customer.address;
  document.getElementById('receipt-customer-location').textContent = `${order.customer.city}, ${order.customer.state} ${order.customer.zip}`;
  document.getElementById('receipt-customer-country').textContent = order.customer.country || 'United States';

  // Receipt Table
  const tbody = document.getElementById('receipt-items-tbody');
  tbody.innerHTML = order.items.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">$${item.price.toFixed(2)}</td>
      <td class="text-right"><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
    </tr>
  `).join('');

  // Receipt Totals
  const totalsBox = document.getElementById('receipt-totals-container');
  totalsBox.innerHTML = `
    <div class="receipt-total-line"><span>Subtotal:</span> <span>$${order.subtotal.toFixed(2)}</span></div>
    ${order.discountAmount > 0 ? `
      <div class="receipt-total-line text-green"><span>Discount (${order.promoCode}):</span> <span>-$${order.discountAmount.toFixed(2)}</span></div>
    ` : ''}
    <div class="receipt-total-line"><span>Tax (8%):</span> <span>$${order.tax.toFixed(2)}</span></div>
    <div class="receipt-total-line"><span>Shipping:</span> <span>${order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span></div>
    <div class="receipt-total-line grand-total"><span>Total Paid:</span> <span>$${order.total.toFixed(2)}</span></div>
  `;

  orderSuccessBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
  orderSuccessBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function viewOrderTrackingFromReceipt() {
  if (!latestPlacedOrder) return;
  closeOrderSuccessModal();
  openOrdersModal();
  trackSpecificOrder(latestPlacedOrder.id);
}

// Order Management Modal
async function openOrdersModal() {
  ordersModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  await fetchAndRenderRecentOrders();
}

function closeOrdersModal() {
  ordersModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

async function fetchAndRenderRecentOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    const data = await res.json();
    const tbody = document.getElementById('orders-list-tbody');

    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(order => `
        <tr>
          <td><strong class="receipt-highlight">${order.id}</strong></td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>${escapeHtml(order.customer.fullName)}</td>
          <td>${order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
          <td><strong>$${order.total.toFixed(2)}</strong></td>
          <td><span class="badge badge-success">${order.status || 'Confirmed'}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="trackSpecificOrder('${order.id}')">
              <i class="fa-solid fa-location-crosshairs"></i> Track
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 24px; color: var(--text-muted);">
            No orders found yet. Place your first order!
          </td>
        </tr>
      `;
    }
  } catch (e) {
    console.error('Error loading orders:', e);
  }
}

async function trackOrderById() {
  const orderId = document.getElementById('track-order-input').value.trim();
  if (!orderId) {
    showToast('Please enter an Order ID', 'warning');
    return;
  }
  trackSpecificOrder(orderId);
}

async function trackSpecificOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await res.json();
    const resultBox = document.getElementById('tracked-order-result');

    if (data.success) {
      const order = data.data;
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="color: #fff; font-size: 1.1rem;">Tracking: <span class="receipt-highlight">${order.id}</span></h4>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Recipient: ${escapeHtml(order.customer.fullName)} • Destination: ${escapeHtml(order.customer.city || 'Standard')}</span>
          </div>
          <span class="badge badge-success" style="font-size: 0.85rem;"><i class="fa-solid fa-box"></i> Status: ${order.status || 'Processing'}</span>
        </div>

        <div class="stepper-container">
          <div class="step-item completed">
            <div class="step-icon"><i class="fa-solid fa-check"></i></div>
            <span class="step-title">Order Placed</span>
          </div>
          <div class="step-item completed">
            <div class="step-icon"><i class="fa-solid fa-check"></i></div>
            <span class="step-title">Payment Verified</span>
          </div>
          <div class="step-item active">
            <div class="step-icon"><i class="fa-solid fa-box-open"></i></div>
            <span class="step-title">Processing & QC</span>
          </div>
          <div class="step-item">
            <div class="step-icon"><i class="fa-solid fa-truck-fast"></i></div>
            <span class="step-title">Dispatched</span>
          </div>
          <div class="step-item">
            <div class="step-icon"><i class="fa-solid fa-house"></i></div>
            <span class="step-title">Delivered</span>
          </div>
        </div>
      `;
      resultBox.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(data.message || 'Order ID not found', 'error');
    }
  } catch (e) {
    showToast('Failed to track order', 'error');
  }
}

// ==========================================================================
// 7. UTILITIES
// ==========================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function generateStars(rating) {
  let stars = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  for (let i = 0; i < full; i++) stars += '<i class="fa-solid fa-star"></i> ';
  if (half) stars += '<i class="fa-solid fa-star-half-stroke"></i> ';
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) stars += '<i class="fa-regular fa-star"></i> ';

  return stars;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
