# Inventory Management System - Full Project Explanation

## 1. Project Overview

This is a full-stack inventory and stock tracking system built with:

- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: React (Vite) + Tailwind CSS
- Authentication: JWT token based login/register
- Access Control: Role-based (admin/staff)
- Analytics and Export: Dashboard reports + PDF/Excel export

Main business goal:

- Manage products
- Track stock in/out transactions
- Monitor low-stock alerts
- View analytics
- Export inventory reports

---

## 2. High-Level Architecture

### 2.1 Backend responsibilities

Backend handles:

- API routes
- User authentication and authorization
- Product CRUD
- Stock movement history
- Summary analytics calculations
- Report export to PDF and Excel

### 2.2 Frontend responsibilities

Frontend handles:

- Login/register UI
- Protected routing
- Dashboard and analytics visualization
- Product management forms/tables
- Stock in/out forms and history
- Report download actions

### 2.3 Data storage

MongoDB collections:

- Users
- Products
- StockHistories

All major product and stock records are user-scoped, so each logged-in user sees their own inventory data.

---

## 3. Workspace Structure and Meaning

### 3.1 Root

- [README.md](README.md): marketing-style overview and quick start
- [PROJECT_FULL_EXPLANATION.md](PROJECT_FULL_EXPLANATION.md): this detailed explanation

### 3.2 Backend

- [backend/server.js](backend/server.js): app bootstrap, middleware, route mounting, DB connection
- [backend/routes](backend/routes): route definitions
- [backend/controllers](backend/controllers): business logic
- [backend/models](backend/models): Mongoose schemas
- [backend/middlewares](backend/middlewares): auth/role/error handling
- [backend/utils/AsyncHandler.js](backend/utils/AsyncHandler.js): async error wrapper

### 3.3 Frontend

- [frontend/src/main.jsx](frontend/src/main.jsx): React entry point and providers
- [frontend/src/App.jsx](frontend/src/App.jsx): route tree
- [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx): auth state lifecycle
- [frontend/src/services](frontend/src/services): API client layer
- [frontend/src/pages](frontend/src/pages): screen-level UI
- [frontend/src/components](frontend/src/components): reusable and layout components

---

## 4. Backend Step-by-Step Flow

## 4.1 Server startup

Source: [backend/server.js](backend/server.js)

1. Loads environment variables from .env.
2. Creates Express app.
3. Adds security middlewares:
   - Helmet
   - Rate limiting
4. Adds CORS and JSON parser.
5. Registers health route at /.
6. Mounts API routers:
   - /api/auth
   - /api/products
   - /api/stock
   - /api/reports
   - /api/export
7. Registers global error handler.
8. Connects to MongoDB and starts server.

## 4.2 Authentication and authorization

Core files:

- [backend/controllers/UserController.js](backend/controllers/UserController.js)
- [backend/middlewares/ProtectRouters.js](backend/middlewares/ProtectRouters.js)
- [backend/middlewares/AdminMiddleware.js](backend/middlewares/AdminMiddleware.js)

Flow:

1. Register endpoint receives name, email, password, role.
2. Password is hashed via bcrypt.
3. User is saved in MongoDB.
4. JWT token is generated and returned.
5. Login endpoint validates email/password and returns JWT.
6. Protected middleware reads Authorization header, verifies JWT, and loads user into req.user.
7. Admin middleware allows only users with role=admin for restricted routes.

## 4.3 Product lifecycle

Core files:

- [backend/routes/ProductRouter.js](backend/routes/ProductRouter.js)
- [backend/controllers/ProductController.js](backend/controllers/ProductController.js)
- [backend/models/ProductModel.js](backend/models/ProductModel.js)

Flow:

1. Create product (admin only): checks duplicate name per user and inserts product.
2. If initial quantity > 0, creates stock history entry of type IN.
3. List products: returns only products belonging to logged user.
4. Read single product: user-scoped lookup by id.
5. Update product (admin only): supports field updates and optional manual quantity adjustment.
6. Manual quantity adjustment also creates stock history (IN or OUT depending on difference).
7. Delete product (admin only): deletes product and its history.
8. Low stock endpoint returns products where quantity <= minStock or quantity <= 10.

## 4.4 Stock movement lifecycle

Core files:

- [backend/routes/StockRouter.js](backend/routes/StockRouter.js)
- [backend/controllers/ProductController.js](backend/controllers/ProductController.js)
- [backend/models/StockHistoryModel.js](backend/models/StockHistoryModel.js)

Flow:

1. Stock In endpoint increases product quantity.
2. Stock Out endpoint decreases quantity (with insufficient stock check).
3. Both endpoints create StockHistory records with reason and quantity.
4. History endpoint returns records sorted by newest first.
5. Controller also maps populated productId into product for frontend compatibility.

## 4.5 Reports and exports

Core files:

- [backend/routes/ReportRouter.js](backend/routes/ReportRouter.js)
- [backend/controllers/ReportController.js](backend/controllers/ReportController.js)
- [backend/routes/ExportRouter.js](backend/routes/ExportRouter.js)
- [backend/controllers/ExportController.js](backend/controllers/ExportController.js)

Summary report computes:

- total products
- total inventory value
- out of stock count
- low stock count
- category distribution
- stock movement totals

Export module:

- PDF export streams a generated PDF via PDFKit
- Excel export generates .xlsx via xlsx library

---

## 5. Backend API Map

Base URL prefix: /api

### Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me

### Products

- GET /products
- POST /products (admin)
- GET /products/low-stock
- GET /products/:id
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

### Stock

- POST /stock/in
- POST /stock/out
- GET /stock/history

### Reports

- GET /reports/summary
- GET /reports/stock-movement

### Export

- GET /export/products/pdf
- GET /export/products/excel

---

## 6. Database Model Explanation

## 6.1 User model

Source: [backend/models/UserModel.js](backend/models/UserModel.js)

Fields:

- name
- email (unique)
- password (hashed)
- role (staff or admin)
- timestamps

## 6.2 Product model

Source: [backend/models/ProductModel.js](backend/models/ProductModel.js)

Fields:

- user reference (owner)
- name
- sku
- category
- price
- quantity
- minStock
- description
- supplier
- timestamps

Important index:

- Unique composite index on user + name
  - prevents same user from creating duplicate product names

## 6.3 Stock history model

Source: [backend/models/StockHistoryModel.js](backend/models/StockHistoryModel.js)

Fields:

- user reference
- productId reference
- type (IN or OUT)
- quantity
- reason
- date
- timestamps

---

## 7. Frontend Step-by-Step Flow

## 7.1 App bootstrap

Source: [frontend/src/main.jsx](frontend/src/main.jsx)

Order of wrapping:

1. BrowserRouter
2. ErrorBoundary
3. AuthProvider
4. App route tree

This means every route can access auth context and route navigation.

## 7.2 Route system

Source: [frontend/src/App.jsx](frontend/src/App.jsx)

Public routes:

- /login
- /register

Protected routes (inside ProtectedRoute + DashboardLayout):

- /dashboard
- /products
- /stock-in
- /stock-out
- /reports
- /low-stock

Default behavior:

- / and unknown paths redirect to /dashboard

## 7.3 Auth context lifecycle

Source: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)

1. On load, checks if token exists in localStorage.
2. If token exists, calls current user endpoint.
3. If valid, sets user in context.
4. If invalid, logs out and clears token.
5. Exposes login/register/logout methods to the app.

## 7.4 API client and token injection

Source: [frontend/src/services/api.js](frontend/src/services/api.js)

- Axios base URL from VITE_API_URL (fallback localhost:5000/api)
- Request interceptor adds Authorization Bearer token
- Response interceptor handles 401 pass-through for caller logic

## 7.5 Service layer

- [frontend/src/services/authService.js](frontend/src/services/authService.js)
- [frontend/src/services/productService.js](frontend/src/services/productService.js)
- [frontend/src/services/stockService.js](frontend/src/services/stockService.js)
- [frontend/src/services/reportService.js](frontend/src/services/reportService.js)

Each service maps frontend actions to backend endpoints and returns response data.

## 7.6 Key pages behavior

### Login page

Source: [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)

- Form validation via React Hook Form + Yup
- Calls auth context login
- Stores token and redirects to requested route

### Register page

Source: [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)

- Form validation
- Calls register and immediately logs user in
- Navigates to dashboard

### Dashboard page

Source: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)

- Loads products, stock history, and summary in parallel
- Displays KPI cards and charts
- Shows recent stock movements

### Products page

Source: [frontend/src/pages/Products.jsx](frontend/src/pages/Products.jsx)

- Fetches products list
- Client-side search by name/SKU
- Add/edit via modal
- Delete with confirmation

### Stock In / Stock Out pages

Sources:

- [frontend/src/pages/StockIn.jsx](frontend/src/pages/StockIn.jsx)
- [frontend/src/pages/StockOut.jsx](frontend/src/pages/StockOut.jsx)
- [frontend/src/components/stock/StockModal.jsx](frontend/src/components/stock/StockModal.jsx)
- [frontend/src/pages/StockPages.jsx](frontend/src/pages/StockPages.jsx)

- Use modal to submit stock transactions
- Display filtered movement history table
- Operation type determines endpoint (in or out)

### Reports page

Source: [frontend/src/pages/Reports.jsx](frontend/src/pages/Reports.jsx)

- Loads summary analytics
- Renders category and movement charts
- Triggers PDF/Excel downloads from API

### Low Stock page

Source: [frontend/src/pages/LowStock.jsx](frontend/src/pages/LowStock.jsx)

- Calls low-stock endpoint
- Displays alerts table with search

## 7.7 Layout and navigation

Sources:

- [frontend/src/components/layout/DashboardLayout.jsx](frontend/src/components/layout/DashboardLayout.jsx)
- [frontend/src/components/layout/Sidebar.jsx](frontend/src/components/layout/Sidebar.jsx)
- [frontend/src/components/layout/Navbar.jsx](frontend/src/components/layout/Navbar.jsx)
- [frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx)

Highlights:

- Sidebar menu items are filtered by user role
- Reports menu shown only to admin
- ProtectedRoute blocks unauthenticated access

---

## 8. End-to-End User Journey (Practical)

1. User opens app and sees login/register screen.
2. User registers or logs in.
3. Backend returns JWT token.
4. Frontend stores token in localStorage.
5. User enters dashboard and navigates modules from sidebar.
6. User creates products.
7. User performs stock in/out actions.
8. Backend writes movement history records.
9. Dashboard/reports show updated analytics.
10. Admin exports PDF/Excel reports.

---

## 9. Environment Variables and Run Steps

## 9.1 Backend .env

Minimum variables:

- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_secret
- FRONTEND_URL=http://localhost:5173 (optional but recommended)

## 9.2 Frontend .env

- VITE_API_URL=http://localhost:5000/api

## 9.3 Run locally

Backend:

1. Go to backend folder
2. Install dependencies
3. Add backend .env
4. Run npm run dev

Frontend:

1. Go to frontend folder
2. Install dependencies
3. Add frontend .env
4. Run npm run dev

---

## 10. Security and Reliability Notes

Implemented:

- JWT-based route protection
- Role-based access checks for admin actions
- Helmet security headers
- Rate limiting to reduce abuse
- Centralized async error forwarding

Important operational note:

- Token is stored in localStorage, which is common for SPAs but should be handled carefully with strong XSS protection practices.

---

## 11. Observed Implementation Notes

These are useful when maintaining or improving the project:

- Dashboard has fallback logic using productList in one path where that variable is not defined; this can cause runtime issues in that fallback branch.
- Registration currently auto-assigns admin role in register page request payload.
- Stock pages refresh using full page reload after successful stock action; this works but can be improved with state refresh for smoother UX.

---

## 12. Short Summary

This project is a practical full-stack inventory platform where:

- Backend provides secure user-scoped inventory APIs
- Frontend offers protected, role-aware management screens
- Stock operations are audited in history
- Reports provide analytics and downloadable files

It is a solid base for production-like inventory workflows and can be extended with pagination, audit logs, and advanced filtering.
