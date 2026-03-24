# Inventory Management System - Quick Explanation

## 1. What This Project Does

This project is a full-stack inventory system that helps you:

- Register/login users
- Manage products (create, edit, delete)
- Record stock in and stock out
- Track stock movement history
- Detect low-stock items
- View analytics and download reports (PDF/Excel)

Tech stack:

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React (Vite), Tailwind CSS, Axios, Recharts

---

## 2. Project Structure (Simple View)

- backend: API, business logic, database models, auth middleware
- frontend: UI pages, components, API service layer, auth context

Main backend entry: [backend/server.js](backend/server.js)
Main frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx)

---

## 3. How Backend Works (Step by Step)

## 3.1 App startup

From [backend/server.js](backend/server.js):

1. Loads env variables
2. Creates Express app
3. Adds Helmet, rate limit, CORS, JSON parser
4. Mounts routes
5. Connects MongoDB
6. Starts server

## 3.2 Route groups

- Auth routes: [backend/routes/UserRouter.js](backend/routes/UserRouter.js)
- Product routes: [backend/routes/ProductRouter.js](backend/routes/ProductRouter.js)
- Stock routes: [backend/routes/StockRouter.js](backend/routes/StockRouter.js)
- Reports routes: [backend/routes/ReportRouter.js](backend/routes/ReportRouter.js)
- Export routes: [backend/routes/ExportRouter.js](backend/routes/ExportRouter.js)

## 3.3 Authentication flow

Files:

- [backend/controllers/UserController.js](backend/controllers/UserController.js)
- [backend/middlewares/ProtectRouters.js](backend/middlewares/ProtectRouters.js)
- [backend/middlewares/AdminMiddleware.js](backend/middlewares/AdminMiddleware.js)

Process:

1. Register hashes password and creates user
2. Login validates credentials
3. JWT token is generated
4. Protected middleware validates token
5. Admin middleware blocks non-admin on restricted endpoints

## 3.4 Product and stock logic

File: [backend/controllers/ProductController.js](backend/controllers/ProductController.js)

- Product CRUD is user-scoped (each user sees only own data)
- Create/update/delete actions supported
- Stock in/out updates quantity and creates StockHistory records
- Low stock API uses minStock and threshold checks

## 3.5 Reports and export

Files:

- [backend/controllers/ReportController.js](backend/controllers/ReportController.js)
- [backend/controllers/ExportController.js](backend/controllers/ExportController.js)

- Summary report gives total products, inventory value, low stock count, category stats, stock movement totals
- Export endpoints return PDF and Excel files

---

## 4. How Frontend Works (Step by Step)

## 4.1 App bootstrap and routing

Files:

- [frontend/src/main.jsx](frontend/src/main.jsx)
- [frontend/src/App.jsx](frontend/src/App.jsx)

Flow:

1. App is wrapped with BrowserRouter, ErrorBoundary, AuthProvider
2. Public routes: login and register
3. Protected routes: dashboard, products, stock, reports, low-stock

## 4.2 Auth state management

File: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)

- On app load, checks token from localStorage
- Calls current-user API if token exists
- Sets user in context or logs out if invalid

## 4.3 API communication layer

Files:

- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/src/services/authService.js](frontend/src/services/authService.js)
- [frontend/src/services/productService.js](frontend/src/services/productService.js)
- [frontend/src/services/stockService.js](frontend/src/services/stockService.js)
- [frontend/src/services/reportService.js](frontend/src/services/reportService.js)

- Axios interceptor attaches Bearer token to requests
- Services provide clean functions used by pages

## 4.4 Main pages

- Login/Register: [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx), [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)
- Dashboard: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- Products: [frontend/src/pages/Products.jsx](frontend/src/pages/Products.jsx)
- Stock in/out: [frontend/src/pages/StockIn.jsx](frontend/src/pages/StockIn.jsx), [frontend/src/pages/StockOut.jsx](frontend/src/pages/StockOut.jsx)
- Reports: [frontend/src/pages/Reports.jsx](frontend/src/pages/Reports.jsx)
- Low stock: [frontend/src/pages/LowStock.jsx](frontend/src/pages/LowStock.jsx)

---

## 5. API Endpoints (Quick Reference)

Base: /api

- Auth: /auth/register, /auth/login, /auth/me
- Products: /products, /products/:id, /products/low-stock
- Stock: /stock/in, /stock/out, /stock/history
- Reports: /reports/summary, /reports/stock-movement
- Export: /export/products/pdf, /export/products/excel

---

## 6. Database Models

- User model: [backend/models/UserModel.js](backend/models/UserModel.js)
- Product model: [backend/models/ProductModel.js](backend/models/ProductModel.js)
- Stock history model: [backend/models/StockHistoryModel.js](backend/models/StockHistoryModel.js)

Key design:

- Product name is unique per user (composite index)
- Stock operations are fully auditable via StockHistory

---

## 7. Local Setup

## 7.1 Backend

1. Go to backend folder
2. Install packages
3. Create .env with:
   - PORT
   - MONGO_URI
   - JWT_SECRET
   - FRONTEND_URL
4. Run: npm run dev

## 7.2 Frontend

1. Go to frontend folder
2. Install packages
3. Create .env with:
   - VITE_API_URL=http://localhost:5000/api
4. Run: npm run dev

---

## 8. End-to-End User Flow

1. User registers/logs in
2. Token is saved in localStorage
3. User accesses protected dashboard
4. User creates products
5. User performs stock in/out operations
6. History and reports update from backend data
7. User exports PDF/Excel reports

---

## 9. In One Line

This is a role-aware, JWT-secured MERN inventory system with product management, stock auditing, analytics dashboards, and report export features.
