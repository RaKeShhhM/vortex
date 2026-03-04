# ⚡ Vortex — Distributed Task Orchestrator

A production-grade task scheduling system built with the MERN stack,
implementing core OS, DBMS, and OOP concepts.

## 🚀 Live Demo
- Frontend: [coming soon]
- Backend API: [coming soon]

## 🛠️ Tech Stack
- **Frontend:** React, Redux Toolkit, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT + bcrypt

## 🧠 Concepts Implemented
- **OS:** Priority Scheduling (Min-Heap), Worker Threads, Resource Monitoring
- **DBMS:** ACID Transactions, Compound Indexing, .populate() joins
- **OOP:** Inheritance, Encapsulation, Polymorphism, Singleton Pattern

## ✨ Features
- 📧 Real email sending via Nodemailer + Gmail
- 💾 Real file backup using Node.js fs module
- 🔐 JWT Authentication with Role Based Access Control
- 📊 Live System Status (CPU, RAM, Queue, Workers)
- 🗂️ Tasks grouped by day and hour on dashboard

## ⚙️ How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend
cd server
npm install
# Create .env file (see .env.example)
node index.js

### Frontend
cd client
npm install
npm start