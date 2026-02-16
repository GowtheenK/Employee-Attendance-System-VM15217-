## Profile
Name: Gowtheen K

College Name: VelTech MultiTech Dr.Rangarajan Dr.Sakunthala Engineering College

Contact Number: +91 6381907353

# Employee Attendance System

A full-stack attendance tracking system with **Employee** and **Manager** roles, built with React, Node.js, Express, and MongoDB.

![Employee Attendance](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## Features

### Employee
- Register / Login
- Mark attendance (Check In / Check Out)
- View attendance history (Calendar & Table view)
- Monthly summary (Present, Absent, Late, Total Hours)
- Dashboard with stats and quick Check In/Out

### Manager
- Login
- View all employees' attendance
- Filter by employee, date range, status
- Team attendance summary
- Export reports to CSV
- Dashboard with team stats, charts
- Team calendar view
- Absent employees list

## Tech Stack

| Layer     | Technology          |
| --------- | ------------------- |
| Frontend  | React 18, Redux Toolkit, Tailwind CSS, Recharts, React Router |
| Backend   | Node.js, Express    |
| Database  | MongoDB             |
| Auth      | JWT                 |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm 

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd Employee_attandance
```

### 2. Install dependencies

```bash
# Install root and workspace deps
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment variables

Copy the example env file and configure:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_attendance
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- **Manager:** `manager@test.com` / `manager123`
- **Employee:** `john@test.com` / `employee123`

### 5. Run the application

**Option A – Run both together (root):**

```bash
npm run dev
```

**Option B – Run separately:**

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:5173  

## Project Structure

```
Employee_attandance/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description        |
| ------ | -------- | ------------------ |
| POST   | /api/auth/register | Register user   |
| POST   | /api/auth/login    | Login           |
| GET    | /api/auth/me       | Get current user|

### Attendance (Employee)
| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| POST   | /api/attendance/checkin   | Check in      |
| POST   | /api/attendance/checkout  | Check out     |
| GET    | /api/attendance/my-history| My history    |
| GET    | /api/attendance/my-summary| Monthly summary |
| GET    | /api/attendance/today     | Today's status |

### Attendance (Manager)
| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /api/attendance/all         | All attendance     |
| GET    | /api/attendance/employee/:id| Employee attendance|
| GET    | /api/attendance/summary     | Team summary      |
| GET    | /api/attendance/export      | Export CSV        |
| GET    | /api/attendance/today-status| Today's status    |

### Dashboard
| Method | Endpoint | Description        |
| ------ | -------- | ------------------ |
| GET    | /api/dashboard/employee | Employee stats |
| GET    | /api/dashboard/manager  | Manager stats  |

## Screenshots

![alt text](<ScreenShot/Screenshot 2026-02-16 173901.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173913.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173919.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173938.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173945.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173948.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 173955.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 174115.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 174118.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 174121.png>)
![alt text](<ScreenShot/Screenshot 2026-02-16 174128.png>)

## License

MIT
