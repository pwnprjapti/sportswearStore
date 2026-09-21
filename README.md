# 🛍️ UrbanVogue - Men's & Children's Clothing E-Commerce Website

A modern, mobile-first e-commerce web application built for clothing retail businesses selling **Men's Wear** and **Children's / Kids' Wear**. Engineered specifically to run with **zero monthly recurring software fees**, allowing you to launch and operate smoothly well within a **15k budget**.

---

## 🌟 Key Features

### 👔 1. Customer Storefront
- **Dual Focus Collections**: Dedicated sections for **Men's Apparel** (Formal & Oxford shirts, casual tees, stretch denim, chinos, ethnic kurtas) and **Children's Wear** (Boys' polos & shorts, girls' twirl party dresses, organic baby rompers, festive sets).
- **Fast Interactive Filtering**: Filter instantly by Men vs Kids, subcategory, size (e.g. S, M, L, XL or 2-3Y, 4-5Y), and sort by price or popularity.
- **Product Detail Modal**: Multi-image preview, size selector, color selector, quantity counter, fabric details, and stock availability indicator.
- **Slide-out Cart Drawer**:
  - Live item count badge.
  - Interactive **Free Delivery Progress Bar** (e.g., *"Add ₹300 more to unlock FREE Delivery!"*).
  - Quantity increment/decrement and instant item removal.
- **High-Converting 1-Click WhatsApp Ordering**:
  - Customers can place orders directly to the shopkeeper's WhatsApp with a pre-formatted message detailing items, sizes, customer address, and total amount.
- **Alternative Payment Modes**:
  - **Cash on Delivery (COD)**.
  - **UPI / QR / NetBanking ready**.
- **Real-Time Order Tracking**: Customers can check status (Pending, Confirmed, Shipped, Delivered) using their order number or phone number.

### 🔐 2. Store Owner Admin Panel (`/admin`)
- **Protected Login**: Secure JWT authentication (Default: `admin` / `admin123`).
- **Live Sales Dashboard**: Total revenue, total orders placed, pending shipments, active catalog count, and low stock warnings (≤ 5 units left).
- **Product Inventory Management**:
  - Add new clothing items with photo upload or image URL.
  - Set category (Men / Kids), subcategory, price, original MSRP discount, stock count, and size pills.
  - Edit or delete items with real-time storefront update.
- **Order Processing**:
  - View all incoming orders with customer name, phone, delivery address, and ordered items.
  - Update order status (*Pending &rarr; Confirmed &rarr; Shipped &rarr; Delivered*).
  - **1-Click "Chat on WhatsApp"** button next to each customer order to notify them about shipping or clarify address details!
- **Store Settings Management**:
  - Easily change Shop Name, Tagline, Contact Phone, WhatsApp Order Number, Address, Delivery Fee, and Announcement Bar message without touching any code!

---

## 💰 How This Fits the 15k Budget

| Item | Recommended Provider | Typical Cost |
| :--- | :--- | :--- |
| **Custom Domain** (`.in` or `.com`) | Namecheap / Hostinger / GoDaddy | ₹800 - ₹1,200 / year |
| **Cloud Web Hosting** | Render (Free Web Service) or Railway / VPS | ₹0 - ₹350 / month |
| **Database** | Embedded SQLite (Built-in) | **₹0 (Free forever)** |
| **Product Media Storage** | Local uploads or Cloudinary Free Tier (25 GB) | **₹0 (Free tier)** |
| **WhatsApp Order Gateway** | Direct WhatsApp Web / Mobile Link | **₹0 (No SMS API costs)** |
| **Total Annual Running Cost** | | **~₹1,200 - ₹2,500 / year** |

*Leaves over 85% of your 15k budget for branding, photography, or initial marketing!*

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Website Server
```bash
npm start
```

- **Storefront**: Open [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: Open [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Default Username**: `admin`
  - **Default Password**: `admin123`

---

## 🌐 Deploying to Render (Free & Instant)

1. Push this project to your GitHub repository.
2. Open [render.com](https://render.com) and click **New +** &rarr; **Web Service**.
3. Select your repository.
4. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Deploy Web Service**! (Deploys in under 30 seconds with 0 errors).

---

## 💡 Client Interactive Testing Mode (LocalStorage Engine)
- **Zero Native Dependencies**: No SQLite or C++ compiler required.
- **Client Isolated Demos**: Each user/client testing the store gets their own isolated local state in their browser.
- **Full Capabilities**: Add/edit/delete products, place WhatsApp orders, change store settings, and track orders.
- **1-Click Reset**: Click "Reset Demo" in the admin dashboard to restore original demo products anytime.

---

## 📁 Project Structure

```
clothingWebsite/
├── config/
│   └── database.js          # SQLite connection and schema tables
├── controllers/
│   ├── adminController.js   # Admin auth, sales stats, product CRUD, settings
│   ├── orderController.js   # Checkout, order creation, WhatsApp message generator
│   └── productController.js # Catalog filtering by Men/Kids, sizes, search
├── database/
│   └── seed.js              # Initial high quality seed catalog for Men & Kids
├── middleware/
│   ├── auth.js              # Admin JWT validation
│   └── upload.js            # Multer image upload handler
├── public/
│   ├── index.html           # Modern mobile-first boutique storefront
│   ├── admin.html           # Store owner dashboard
│   ├── css/
│   │   └── style.css        # Custom apparel UI styles
│   ├── js/
│   │   ├── app.js           # Storefront cart, WhatsApp checkout, live filters
│   │   └── admin.js         # Admin dashboard interactivity
│   └── uploads/             # Uploaded product photo files
├── routes/
│   ├── adminRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── settingsRoutes.js
├── scripts/
│   └── verify.js            # Automated verification test suite
├── .env                     # Environment variables configuration
├── server.js                # Express web server entry point
└── package.json
```
