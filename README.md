# InventoryMaster Pro 🚀

[![Build Status](https://img.shields.io/badge/Build-Success-brightgreen.svg)](https://github.com/your-username/inventory-master)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Full Stack](https://img.shields.io/badge/Stack-MERN-blue?logo=mongodb&logoColor=white)](https://www.mongodb.com/mern-stack)
[![Premium UI](https://img.shields.io/badge/UI-Modern-hotpink)](https://tailwindcss.com)

A premium, state-of-the-art Inventory Management System built with the MERN stack. Designed for high efficiency, scalability, and a stunning user experience.

---

## ✨ Features

- **📊 Advanced Analytics**: Real-time insights into stock levels, category distribution, and inventory health.
- **📦 Smart Product Management**: Comprehensive CRUD operations with SKU tracking and categorization.
- **🔄 Dynamic Stock Movements**: Track every item movement with automated audit trails.
- **🛡️ Enterprise-Grade Security**: JWT authentication, role-based access control (RBAC), and secure API endpoints.
- **📑 Professional Reporting**: Generate PDF reports and export inventory data to Excel.
- **🎨 Premium UI/UX**: Built with React 19, Tailwind CSS v4, and smooth animations using Framer Motion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **State Management**: React Hooks & Context API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Yup

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **Security**: JWT, Bcrypt, Helmet, Express Rate Limit
- **File Handling**: PDFKit, XLSX

---

## 📂 Project Structure

```bash
📦 inventory-master
 ┣ 📂 backend          # Node.js/Express API
 ┃ ┣ 📂 controllers    # Request handlers
 ┃ ┣ 📂 models         # Mongoose schemas
 ┃ ┣ 📂 routes         # API endpoints
 ┃ ┣ 📂 middlewares    # Auth & validation
 ┃ ┗ 📜 server.js      # Entry point
 ┣ 📂 frontend         # React/Vite App
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components   # Reusable UI
 ┃ ┃ ┣ 📂 pages        # Application views
 ┃ ┃ ┗ 📂 hooks        # Custom React hooks
 ┗ 📜 README.md        # Root documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or Local Instance

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from template:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## Functional Requirements:

1. User Authentication and Authorization 
2. Product Management 
3. Inventory Tracking 
4. Category Management 
5. Search and Filter Functionality 
6. Dashboard and Analytics

## Non-Functional Requirements: 

1. Performance and Scalability 
2. Security and Reliability 
3. Availability and Usability 
4. Data integrity and Backup 
5. Compatibility

##   Methodology 

1. The user logs into the system and enters inventory details. 
2. The backend validates the data and stores it securely in MongoDB. 
3. The system processes stock movements and generates analytics. 
4. The frontend dashboard displays inventory reports and stock information.

## Result

1.DASHBOARD 

<img width="497" height="224" alt="image" src="https://github.com/user-attachments/assets/615758df-2946-4171-b45e-e7e4034655b2" />

2.PRODUCTS 

<img width="520" height="265" alt="image" src="https://github.com/user-attachments/assets/9da801f4-b32e-4bd4-9768-c79e9ca419fa" />

3.Reports

<img width="473" height="268" alt="image" src="https://github.com/user-attachments/assets/c3ccd582-2cab-4529-8839-d096586bf80e" />

4.  DATABASES (MongoDb)

   <img width="486" height="248" alt="image" src="https://github.com/user-attachments/assets/7242c9f8-7761-461a-81f6-c630515d7b1f" />




   

## 📜 Documentation

- [Root Overview](./README.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Production Checklist](./docs/PRODUCTION_CHECKLIST.md)
- [Backend API Guide](./backend/README.md)
- [Frontend Guide](./frontend/README.md)






---


