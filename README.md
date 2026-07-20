# 🚚 TransitOps - Fleet Management System

Hey there! 👋 Welcome to **TransitOps**, a full-stack fleet management dashboard I built for the Odoo Hackathon. 

Managing logistics and fleets can be incredibly chaotic, so I wanted to build something that makes the lives of logistics companies a whole lot easier. TransitOps helps teams keep track of their vehicles, drivers, and trips—all in one place. As a fun challenge, I also threw in some predictive analytics to help with maintenance forecasting and smarter routing.

## ✨ What's inside?

- **📊 The Dashboard:** Your command center. See active vehicles, drivers on duty, and fuel efficiency in real-time.
- **🔮 Predictive Analytics:** Get a heads-up on which vehicles might need maintenance soon, and check out suggested routes based on fuel costs.
- **🗺️ Trip Management:** Say goodbye to manual entry! Uses the OpenStreetMap Nominatim API for location autocomplete. It calculates net profit based on planned revenue vs. actual fuel used, and tracks your trips from `DRAFT` to `COMPLETED`.
- **🚚 Vehicle & Driver Management:** Keep a comprehensive log of all vehicles (heavy trucks, vans, you name it) and their maintenance histories.
- **🪪 Driver Validations:** To keep things realistic, I simulated India's Parivahan licensing system (checking formats like `XX-00-0000-0000000`). It also enforces age checks and tracks driver safety scores.
- **🔐 Auth & Security:** Role-based access control (Manager, Driver, Safety, Analyst). Added a mock verification step to ensure users register with a `@gmail.com` account!

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite ⚡
- Axios for API calls
- Recharts for some beautiful data visualization 📈
- Custom CSS (kept it lightweight without heavy UI libraries)

**Backend:**
- Spring Boot 3 🍃
- Spring Security + JWT for robust authentication
- Spring Data JPA / Hibernate
- H2 Database (local file-backed by default to make testing a breeze, but fully postgres-ready)

## 🚀 Running it locally

Want to give it a spin? You'll need Node.js (v18+) and Java 17 installed on your machine.

### 1. Fire up the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*The backend runs on `http://localhost:8080`. It uses an H2 database by default, so you don't need to stress about setting up Postgres right away. Data is stored locally in `backend/data/transitops`.*

*(Pro-tip: If you want to use Postgres, just set `SPRING_PROFILES_ACTIVE=postgres` and provide your `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.)*

### 2. Launch the Frontend

```bash
cd frontend
npm install
npm run dev
```
*Your frontend will be live and kicking at `http://localhost:5173`.*

## 🧪 How to test drive it

1. Register a new account (remember to use a `@gmail.com` address!).
2. Log in to the dashboard.
3. Head over to **Vehicles** and add your first truck or van.
4. Go to **Drivers** and hire someone. Make sure they are 18+ and use a valid license format (like `MH-12-2023-1234567`).
5. Jump to **Trips**, type a city name (enjoy the autocomplete!), assign your new vehicle and driver, and hit dispatch!

## 🏆 Hackathon Completion

I'm super proud to share that I managed to get through all the core requirements *and* the bonus features for the hackathon:
- ✅ Dashboard analytics & charts
- ✅ AI fleet insights
- ✅ PDF / CSV reports
- ✅ OpenStreetMap API integration
- ✅ Mock Parivahan & Google API validations

---

Thanks for checking out TransitOps! Feel free to explore the code, and if you have any questions or feedback, I'd love to hear it. Built with ❤️ by [Smit Khatri](https://github.com/Smitkhatri2007).
