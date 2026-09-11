# NovaTech Gear — Modern E-Commerce Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-v4.19-blue.svg?style=for-the-badge&logo=express)
![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-orange.svg?style=for-the-badge&logo=html5)
![Deployment](https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge&logo=render)
![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)

<p align="center">
  <strong>A full-stack, responsive modern electronics and gaming gear e-commerce platform built with Vanilla HTML5/CSS3/JavaScript frontend and Express.js REST API backend.</strong>
</p>

[**Explore GitHub Repository »**](https://github.com/hussainvalidudekula447-bit/NovaTech-Gear)

</div>

---

## 🌟 Key Features

- 🎧 **Dynamic Product Catalog**: Browse curated high-tech electronics, headphones, smartwatches, and mechanical keyboards.
- 🔍 **Real-Time Search & Category Filters**: Instant client-side filtering by category (Audio, Wearables, Accessories, Displays) and keyword matching.
- ↕️ **Smart Sorting**: Sort items by price (low to high, high to low), customer ratings, or alphabetical order.
- 📦 **Interactive Product Details Modal**: View high-resolution imagery, full technical spec sheets, feature lists, and stock availability.
- 🛍️ **Slide-Out Shopping Cart Drawer**:
  - Live quantity adjustment (+ / -) and item removal.
  - Persistent cart state using `localStorage`.
  - Free express shipping progress indicator.
- 🎟️ **Promo Code Engine**: Real-time voucher discounts (Try `SAVE10` for 10% off, `TECH20` for 20% off).
- 💳 **Checkout & Order Processing**:
  - Customer information and shipping address validation.
  - Simulated 256-bit SSL encrypted payment gateway.
  - Automatic inventory deduction upon order confirmation.
- 🧾 **Printable Invoice & Tracking**:
  - Instant itemized printable invoice receipt.
  - Live visual step order tracker (`ORD-XXXXXX`).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+) | Dark Cyberpunk Glassmorphism Theme, CSS Grid & Flexbox, micro-animations |
| **Backend** | Node.js, Express.js | High-performance RESTful API endpoints |
| **Database** | File-Based Persistent JSON | `data/products.json` (Products Catalog) & `data/orders.json` (Orders DB) |
| **Deployment** | Render.com | Automated deployment via GitHub with auto-builds |

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16.x or higher)
- npm (installed automatically with Node.js)

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/hussainvalidudekula447-bit/NovaTech-Gear.git
cd NovaTech-Gear
```

Install dependencies:
```bash
npm install
```

### 3. Run the Application
Start the server:
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products (supports `?category=`, `?search=`, `?sort=`) |
| `GET` | `/api/products/:id` | Get details for a single product |
| `GET` | `/api/categories` | Get category breakdown & product counts |
| `POST` | `/api/promo/validate` | Validate promo discount codes |
| `POST` | `/api/orders` | Process and save a new customer order |
| `GET` | `/api/orders` | Get recent orders list |
| `GET` | `/api/orders/:id` | Look up a specific order by reference ID |

---

## 🎟️ Demo Promo Codes
- `SAVE10` &rarr; 10% Off Entire Order
- `TECH20` &rarr; 20% Off Tech Gadgets
- `WELCOME15` &rarr; 15% Off Welcome Discount

---

## 👨‍💻 Author

- **Hussain Dudekula**
- **GitHub**: [@hussainvalidudekula447-bit](https://github.com/hussainvalidudekula447-bit)
- **Portfolio**: [my-portfolio-hussainvali.vercel.app](https://my-portfolio-hussainvali.vercel.app/)
- **Repository**: [github.com/hussainvalidudekula447-bit/NovaTech-Gear](https://github.com/hussainvalidudekula447-bit/NovaTech-Gear)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
