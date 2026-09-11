# NovaTech Gear — High-Performance Tech & Gaming Gear

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Website-2ea44f?style=for-the-badge&logo=render&logoColor=white)](https://novatech-gear-ecommerce.onrender.com/)
[![Render Deploy](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://novatech-gear-ecommerce.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://novatech-gear-ecommerce.onrender.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br />

### 🌐 **[👉 Explore Live Storefront Demo](https://novatech-gear-ecommerce.onrender.com/)**

<p align="center">
  <strong>A full-stack, cyberpunk-inspired high-performance tech and gaming gear e-commerce platform built with an Express.js REST API backend and a responsive Vanilla HTML5/CSS3/JavaScript frontend.</strong>
</p>

</div>

---

## 🔗 Live Application

| Resource | Link |
| :--- | :--- |
| **🌐 Live Production Website** | [https://novatech-gear-ecommerce.onrender.com](https://novatech-gear-ecommerce.onrender.com/) |
| **🐙 GitHub Repository** | [https://github.com/hussainvalidudekula447-bit/NovaTech-Gear](https://github.com/hussainvalidudekula447-bit/NovaTech-Gear) |

---

## 🌟 Key Features

- 🎧 **Curated Next-Gen Gear Catalog**: Browse studio wireless ANC headphones, custom RGB mechanical keyboards, ultra-fast 240Hz gaming monitors, and smart fitness wearables.
- 🔍 **Live Search & Category Filters**: Instant filtering across product categories (`audio`, `gaming`, `displays`, `wearables`, `accessories`) and real-time keyword search.
- ↕️ **Smart Sorting**: Sort products dynamically by ascending/descending price, customer review ratings, or product name.
- ⚡ **Interactive Product Spec Modal**: Inspect comprehensive technical specs, key feature breakdowns, stock availability badges, and high-resolution product imagery.
- 🛍️ **Slide-Out Shopping Cart Drawer**:
  - Live quantity adjustment (`+` / `-`) and instant item removal.
  - Persistent shopping bag state across sessions using `localStorage`.
  - Free express shipping progress threshold indicator ($150+).
- 🎟️ **Promo Code Discount Engine**: Real-time voucher code verification (e.g., `SAVE10`, `TECH20`, `WELCOME15`).
- 💳 **Secure Checkout & Order Processing**:
  - Complete customer billing and destination shipping address validation.
  - Simulated 256-bit SSL encrypted payment processing.
  - Automatic inventory stock deduction upon order confirmation.
- 🧾 **Printable Invoice & Tracking**:
  - Printable receipt format with dedicated print styles (`@media print`).
  - Real-time order lookup and live milestone status tracker (`ORD-XXXXXX`).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+) | Dark Cyberpunk Glassmorphism theme, Orbitron & Inter typography, CSS Grid & Flexbox, micro-animations, zero external UI frameworks |
| **Backend** | Node.js, Express.js | High-performance RESTful API endpoints & static asset delivery |
| **Database** | File-Based Persistent JSON | `data/products.json` (Gear Catalog) & `data/orders.json` (Orders DB) |
| **Deployment** | Render.com | Automated CI/CD deployment from GitHub `main` branch |

---

## 📁 Project Structure

```
NovaTech-Gear/
│
├── 📁 data/
│   ├── products.json          # Curated tech & gaming products catalog
│   └── orders.json            # Persistent customer orders database
│
├── 📁 public/                 # Static frontend assets
│   ├── 📁 css/
│   │   └── style.css          # Cyberpunk glassmorphism styling & responsive design
│   ├── 📁 js/
│   │   └── app.js             # Cart state, modals, checkout & tracking logic
│   └── index.html             # Single-page cyberpunk storefront layout
│
├── server.js                  # Express.js REST API server & static file host
├── render.yaml                # Render Blueprint deployment config
├── package.json               # Node.js dependencies and scripts
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation & live links
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (installed automatically with Node.js)

### 2. Clone and Run
```bash
# Clone the repository
git clone https://github.com/hussainvalidudekula447-bit/NovaTech-Gear.git

# Navigate into the project directory
cd NovaTech-Gear

# Install dependencies
npm install

# Start the Node.js server
npm start
```

### 3. Open in Browser
Visit `http://localhost:3000` in your web browser.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products (supports `?category=`, `?search=`, `?sort=`, `?minPrice=`, `?maxPrice=`) |
| `GET` | `/api/products/:id` | Get details for a specific product by ID |
| `GET` | `/api/categories` | Get category breakdown & product counts |
| `POST` | `/api/promo/validate` | Validate promotional discount codes |
| `POST` | `/api/orders` | Process and save a new customer order |
| `GET` | `/api/orders` | Retrieve recent order history |
| `GET` | `/api/orders/:id` | Look up order status by reference ID |

---

## 🎟️ Demo Promo Codes

| Promo Code | Discount | Description |
| :--- | :--- | :--- |
| `SAVE10` | **10% OFF** | 10% Off Entire Order |
| `TECH20` | **20% OFF** | 20% Off Tech Gadgets |
| `WELCOME15` | **15% OFF** | 15% Welcome Discount |

---

## 👨‍💻 Author

- **Hussain Dudekula**
- GitHub: [@hussainvalidudekula447-bit](https://github.com/hussainvalidudekula447-bit)
- Live Store: [novatech-gear-ecommerce.onrender.com](https://novatech-gear-ecommerce.onrender.com/)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
