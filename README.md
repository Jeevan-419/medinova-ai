# MediNova AI - Hospital Management System

A modern, full-stack, enterprise-grade Hospital Management System built on the MERN stack (MongoDB, Express, React, Node.js). 
Designed to be lightweight, easy to use, and completely FREE to host.

---

## 🚀 Quick Start (For Beginners)

We have automated the entire startup process. If you are on Windows, simply double-click the **`start-app.bat`** file!

1. **Double-click `start-app.bat`**
2. It will automatically install all dependencies (first time only).
3. It will launch the backend and frontend simultaneously.
4. Your browser will automatically open to `http://localhost:5173`.
5. To stop everything safely, double-click **`stop-app.bat`**.

---

## ⚙️ Manual Setup & Requirements

If you prefer using the terminal or are on Mac/Linux:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) (Free Tier)

### 2. Configure Environment Variables
You need to connect your database.
1. Go into the `backend/` folder and rename `.env.example` to `.env`.
2. Inside `.env`, replace `your_mongodb_atlas_connection_string` with your actual MongoDB URI.
3. Go into the `frontend/` folder and rename `.env.example` to `.env`. (You can leave the default values for local development).

### 3. Install Everything & Start
Open your terminal in the root folder and run:

```bash
# 1. Install dependencies for the root, frontend, and backend automatically
npm run install-all

# 2. Seed your database with demo data (Doctors, Patients, Appointments)
npm run seed

# 3. Start the entire application (Backend + Frontend simultaneously)
npm run dev
```

---

## ☁️ Free Cloud Deployment

This project is pre-configured to be deployed completely free on Vercel and Render.

### 1. Deploying the Backend (Render)
Render uses the `render.yaml` file in the root directory to automate deployment.
1. Create a free account on [Render](https://render.com/).
2. Click **New > Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` and set up the backend.
5. In the Render Dashboard, add your `MONGO_URI` and `JWT_SECRET` environment variables.

### 2. Deploying the Frontend (Vercel)
Vercel uses the `frontend/vercel.json` file to handle routing.
1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New > Project** and select your GitHub repository.
3. Important: Set the **Framework Preset** to `Vite`.
4. Set the **Root Directory** to `frontend`.
5. In Environment Variables, add:
   `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api` (Replace with your Render URL)
6. Click **Deploy**.

---

## 🛠️ Features
- **Real-Time Dashboard**: Powered by Socket.io. Watch metrics update instantly!
- **Role-Based Access**: Secure JWT authentication for Admin, Doctors, Patients.
- **Appointment Management**: Book, approve, and cancel slots easily.
- **Automated Billing**: Generate PDF invoices and process simulated payments.
- **Responsive UI**: Built with Tailwind CSS and Framer Motion for a premium feel.
