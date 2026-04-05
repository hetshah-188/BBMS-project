# Life4U - Blood Bank Management System (BBMS) 🩸

A full-stack, comprehensive Blood Bank Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled beautifully with Tailwind CSS and custom UI animations.

This application connects Blood Banks with Donors and Patients, facilitating immediate requests, advanced donor history analytics, and secure administrative oversight.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router v6, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Atlas or Local)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 🚀 Getting Started

Follow these steps precisely to launch both local development environments concurrently.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (if running DB locally)
- Git

### 1. Backend Setup (Server)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy the `.env.example` template:
     ```bash
     cp .env.example .env
     ```
   - Provide your environment secrets in `.env`:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_signature_secret
     NODE_ENV=development
     ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   _The server should establish a successful MongoDB connection and boot up on port 5000._

### 2. Frontend Setup (React/Vite)

1. Open a **new** terminal alongside your backend terminal and navigate to the frontend directory:
   ```bash
   cd frontend-react
   ```
2. Install the React application dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy the `.env.example` template:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` to point to your backend:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   _The site will launch at `http://localhost:5173/`._

---

## 🧪 Database Scaffolding (Dummy Data)

If you are running the project on a fresh MongoDB instance, you can auto-populate the dashboards with mock data generated inside the `dummy data/` folder.

1. Open **MongoDB Compass**.
2. Connect to your cluster/URI and create a database named `bbms`.
3. Create collections and use the `Import JSON` functionality (Data > Import) to upload the provided dummy files. **Import them in the following order**:
   - `users.json`
   - `donors.json`
   - `blood_banks.json`
   - `blood_inventory.json`
   - `blood_requests.json`
   - `donations.json`

**Login Accounts Provided:**

- **Admin**: `admin@life4u.in`
- **Donor**: `rahul.donor@example.com` or `priya.donor@example.com`
- **Patient**: `amit.recipient@example.com`
- **Universal Testing Password**: `password123`

---

## ✨ Features Profile

- **Global Unified Dashboards**: Role-based access and redirect pipelines (`/admin-dashboard`, `/patient-dashboard`, `/donor-dashboard`).
- **Cryptographic Security**: Implementation of server-side global route guard interceptors protecting UI rendering.
- **Auto-Logout JWT Pipeline**: Realtime token expiry capturing automatically resets clients without crashing DOM boundaries.
- **Actionable Global UI Toasts**: Full displacement of `alert()` popups with CSS-animated interactive React context overlays.
- **Data Persistence Architecture**: Comprehensive schema mappings updating inventory metrics seamlessly when donations occur.

---

_Created and maintained as a specialized portfolio initiative bridging bleeding-edge frontend UI design with secure architectural backends._
