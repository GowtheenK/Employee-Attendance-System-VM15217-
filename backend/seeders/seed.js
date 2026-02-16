import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Attendance from '../models/Attendance.model.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Manager User',
    email: 'manager@test.com',
    password: 'manager123',
    role: 'manager',
  },
  {
    name: 'John Doe',
    email: 'john@test.com',
    password: 'employee123',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering',
  },
  {
    name: 'Jane Smith',
    email: 'jane@test.com',
    password: 'employee123',
    role: 'employee',
    employeeId: 'EMP002',
    department: 'Design',
  },
  {
    name: 'Bob Wilson',
    email: 'bob@test.com',
    password: 'employee123',
    role: 'employee',
    employeeId: 'EMP003',
    department: 'Engineering',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_attendance');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Attendance.deleteMany({});

    const users = [];
    for (const u of seedUsers) {
      const user = await User.create(u);
      users.push(user);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      for (const user of users.filter((u) => u.role === 'employee')) {
        const checkIn = new Date(d);
        checkIn.setHours(9, 30, 0, 0);
        const checkOut = new Date(d);
        checkOut.setHours(18, 0, 0, 0);
        const status = i === 0 ? 'late' : 'present';

        await Attendance.create({
          userId: user._id,
          date: d,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status,
          totalHours: 8.5,
        });
      }
    }

    console.log('Seed completed successfully!');
    console.log('Manager: manager@test.com / manager123');
    console.log('Employee: john@test.com / employee123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
