# 🚛 TransitOps - Advanced Fleet Management System

![TransitOps Banner](https://img.shields.io/badge/TransitOps-Fleet_Operations_Reimagined-6366f1?style=for-the-badge&logo=react)

**TransitOps** is an enterprise-grade, full-stack Fleet Management System built during the Odoo Hackathon. It provides a real-time, AI-driven dashboard for logistics companies to manage vehicles, drivers, trips, fuel efficiency, and maintenance with a stunning, modern UI.

---

## ✨ Key Features

### 📊 Real-Time AI Dashboard
- **Live Fleet KPIs:** Monitor Active Vehicles, Drivers on Duty, Fuel Efficiency (km/L), and Fleet ROI in real-time.
- **✨ AI Fleet Insights:** Automated predictive analytics engine that flags vehicles for predictive maintenance, tracks driver safety trends, and suggests routing optimizations based on fuel costs.
- **Dynamic Charting:** Interactive Recharts visualizer for Vehicle Status and Trip lifecycles.
- **PDF & CSV Export:** One-click export for all reports and dashboards.

### 🛣️ Trip Operations & Dispatch
- **Live Routing Integration:** Automated location autocomplete via OpenStreetMap Nominatim API for Source and Destination.
- **Profitability Tracking:** Automatic *Net Profit* calculations based on planned revenue vs. actual fuel consumed.
- **Lifecycle Management:** Move trips through `DRAFT` -> `DISPATCHED` -> `COMPLETED` phases.

### 🚘 Vehicle & Maintenance Registry
- **Comprehensive Registry:** Track heavy trucks, vans, buses, and cars, including acquisition costs and live odometers.
- **Maintenance Logging:** Log oil changes, tire replacements, and view historical maintenance records.

### 👤 Driver Management (Govt. API Validations)
- **Parivahan Validation:** Strict regex-based validation simulating India's Parivahan licensing system formats (`XX-00-0000-0000000`).
- **Age & Safety:** Enforces strict 18+ age checks (DOB) and tracks a dynamic Driver Safety Score.

### 🔐 Secure Authentication & RBAC
- **Google Account Validation:** Ensures users can only register with valid `@gmail.com` accounts via a simulated verification API.
- **Role-Based Access Control:** Built for `FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, and `FINANCIAL_ANALYST`.

---

## 🛠️ Technology Stack

### **Frontend (Vite + React)**
- **React 18** (Hooks, Context)
- **Vite** (Next-generation frontend tooling)
- **Axios** (JWT Intercepted API calls)
- **Recharts** (Data Visualization)
- **Vanilla CSS (Glassmorphism & Gradients)** - Zero heavy UI libraries, pure CSS magic.

### **Backend (Spring Boot + Java)**
- **Spring Boot 3** (RESTful architecture)
- **Spring Security + JWT** (Stateless authentication)
- **Spring Data JPA / Hibernate** (ORM)
- **H2 Database** (In-memory SQL database for rapid prototyping)
- **Lombok** (Boilerplate reduction)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Java 17**
- **Maven**

### 1. Start the Backend (Spring Boot)
Open a terminal in the `backend/` directory:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*The backend will run on `http://localhost:8080` and auto-initialize the H2 database schema.*

### 2. Start the Frontend (Vite)
Open a new terminal in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 📸 Application Screenshots

*(Insert screenshots of your beautiful Glassmorphism Dashboard, Trip Dispatch, and AI Insights here during your Hackathon presentation)*

---

## 🧪 Testing the Application

1. **Register a User:** Navigate to the Register page. Enter a valid `@gmail.com` address. 
2. **Login:** Use your newly created credentials.
3. **Add a Vehicle:** Navigate to `Vehicles` -> Add Vehicle.
4. **Add a Driver:** Navigate to `Drivers`. Ensure they are over 18 and use a valid license format (e.g., `MH-12-2023-1234567`).
5. **Dispatch a Trip:** Head to `Trips`, type a real-world city in the Source/Destination fields to see the Autocomplete in action, assign your vehicle/driver, and dispatch!

---

## 🏆 Hackathon Notes
This project successfully completed **100% of the Core Requirements** and **all proposed Bonus Features**, including:
- ✅ *Advanced Dashboard Analytics & Charts*
- ✅ *Predictive AI Fleet Insights*
- ✅ *PDF / CSV Reporting Engine*
- ✅ *OpenStreetMap / Nominatim API Integration*
- ✅ *Mock Parivahan & Google API Validations*

**Built with ❤️ for the Odoo Hackathon.**