# Inventory Management System - Overview

This project is a full-stack inventory management application built with the MERN ecosystem.

It helps users and teams manage product inventory in one place by providing:

- Secure user authentication with role-based access
- Product management with stock quantity tracking
- Stock in and stock out operations with movement history
- Low-stock monitoring for quick restocking decisions
- Dashboard analytics and report exports in PDF and Excel

## Architecture at a glance

- Backend: Node.js + Express + MongoDB (Mongoose) + JWT
- Frontend: React (Vite) + Tailwind CSS + Axios + Recharts
- Data flow: Frontend pages call API services, backend validates user/token, performs business logic, stores data in MongoDB, and returns results to the UI

## Main modules

- Authentication: Register, login, current-user session check
- Products: Create, update, delete, list, and low-stock lookup
- Stock: Record IN and OUT transactions with reasons
- Reports: Inventory summary and downloadable exports

## Who this project is for

This system is suitable for shops, warehouses, or internal teams that need a simple but structured way to track stock, monitor inventory health, and generate basic operational reports.
