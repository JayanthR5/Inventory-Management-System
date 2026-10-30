# InventoryMaster Backend 🛠️

This is the RESTful API for the Inventory Management System, powered by Node.js, Express, and MongoDB.

## 🚀 Key Features

- **Robust Authentication**: JWT-based auth with secure password hashing (Bcrypt).
- **Role-Based Access**: Specialized middlewares for Admin-only operations.
- **Efficient Data Modeling**: Mongoose schemas for Products, Users, and Stock Movements.
- **Reporting & Exports**: Integration with `PDFKit` for PDF generation and `XLSX` for Excel exports.
- **Secure by Default**: Uses `Helmet` for security headers and `express-rate-limit` to prevent brute force.

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user; the first account is admin and later accounts are staff | Public |
| POST | `/api/auth/login` | Login and get token | Public |
| GET | `/api/auth/me` | Get current user profile | Private |

### 📦 Products
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | Get all products | Private |
| POST | `/api/products` | Create new product | Admin |
| GET | `/api/products/:id` | Get single product | Private |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/products/low-stock` | Get low stock items | Private |

### 🔄 Stock Movements
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/stock/history` | Get all movements | Private |
| POST | `/api/stock/in` | Record stock in | Private |
| POST | `/api/stock/out` | Record stock out | Private |

### 📊 Reports & Exports
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/reports/summary` | Get dashboard stats | Private |
| GET | `/api/reports/stock-movement` | Get stock movement stats | Private |
| GET | `/api/export/products/excel` | Export products to Excel | Private |
| GET | `/api/export/products/pdf` | Export products to PDF | Private |

---

## 🛠️ Installation

1. Navigate to directory: `cd backend`
2. Install dependencies: `npm install`
3. Start local Redis on Windows before starting the API:
   ```powershell
   Get-Service Redis
   Start-Service Redis
   ```
   If Redis is not installed as a service, run `redis-server` in a separate terminal.
4. Configure environment:
   - Create a `.env` file in the root of the `backend` folder.
   - Add the following:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_super_secret_key
     NODE_ENV=development
     REDIS_URL=redis://localhost:6379
     REDIS_CACHE_TTL_SECONDS=60
     ```
5. Start development server: `npm run dev`

Product and low-stock list responses are cached per authenticated user in Redis.
MongoDB remains the source of truth; successful product and stock mutations
invalidate that user's product caches. Redis failures are logged and do not
prevent MongoDB-backed requests or writes from completing.

The first public registration becomes the initial `admin`; later public
registrations create `staff` accounts. To promote an existing account, run this
from the `backend` directory:

```powershell
npm run promote-admin -- user@example.com
```

Stock-in and stock-out quantity changes use conditional atomic MongoDB updates
to prevent negative inventory and lost updates during concurrent requests.

Run the cache behavior tests with:

```powershell
npm test
```

These tests isolate MongoDB and Redis at the controller boundary, so they do
not require Atlas credentials or modify live data.

---

## 📦 Core Dependencies

- **Express 5.x**: Next-gen web framework.
- **Mongoose**: Elegant mongodb object modeling.
- **jsonwebtoken**: For secure token-based auth.
- **bcrypt**: For secure password hashing.
- **helmet**: To secure Express apps by setting various HTTP headers.
- **pdfkit & xlsx**: For generating professional reports.

---

<p align="center">
  Backend documentation maintained by the Development Team.
</p>
