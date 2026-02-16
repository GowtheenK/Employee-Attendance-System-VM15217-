import Attendance from '../models/Attendance.model.js';
import User from '../models/User.model.js';
import { stringify } from 'csv-stringify/sync';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const checkIn = async (req, res) => {
  try {
    const now = new Date();
    const today = startOfDay(now);

    let record = await Attendance.findOne({ userId: req.user.id, date: today });
    if (record?.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const status = now.getHours() >= 10 ? 'late' : 'present';

    if (record) {
      record.checkInTime = now;
      record.status = status;
      await record.save();
    } else {
      record = await Attendance.create({
        userId: req.user.id,
        date: today,
        checkInTime: now,
        status,
      });
    }
    res.json({ success: true, attendance: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const now = new Date();
    const today = startOfDay(now);
    const record = await Attendance.findOne({ userId: req.user.id, date: today });
    if (!record || !record.checkInTime) {
      return res.status(400).json({ success: false, message: 'Not checked in today' });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }
    record.checkOutTime = now;
    const hours = (record.checkOutTime - record.checkInTime) / (1000 * 60 * 60);
    record.totalHours = Math.round(hours * 100) / 100;
    await record.save();
    res.json({ success: true, attendance: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const myHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user.id };
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0);
      query.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, attendance: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const mySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);

    const records = await Attendance.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    }).lean();

    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const halfDay = records.filter((r) => r.status === 'half-day').length;
    const totalDays = new Date(y, m, 0).getDate();
    const absent = totalDays - records.length;
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);

    res.json({
      success: true,
      summary: { present, absent, late, halfDay, totalHours },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const todayStatus = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const record = await Attendance.findOne({ userId: req.user.id, date: today }).lean();
    res.json({
      success: true,
      today: record || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manager endpoints
export const allAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const query = {};

    if (employeeId) query.userId = employeeId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .limit(500)
      .lean();

    res.json({ success: true, attendance: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const employeeAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.id })
      .sort({ date: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, attendance: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const teamSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).lean();

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      late: records.filter((r) => r.status === 'late').length,
      absent: 0,
      halfDay: records.filter((r) => r.status === 'half-day').length,
    };
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportCsv = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};
    if (employeeId) query.userId = employeeId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .lean();

    const rows = records.map((r) => ({
      Date: r.date?.toISOString().split('T')[0],
      Employee: r.userId?.name,
      EmployeeId: r.userId?.employeeId,
      Department: r.userId?.department,
      CheckIn: r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-',
      CheckOut: r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      Status: r.status,
      TotalHours: r.totalHours || 0,
    }));

    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const todayAttendance = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const records = await Attendance.find({
      date: today,
      checkInTime: { $exists: true, $ne: null },
    })
      .populate('userId', 'name email employeeId department')
      .lean();
    const absentUsers = await User.find({
      role: 'employee',
      _id: { $nin: records.map((r) => r.userId._id) },
    }).select('name email employeeId department');
    res.json({
      success: true,
      present: records,
      absent: absentUsers,
      presentCount: records.length,
      absentCount: absentUsers.length,
      late: records.filter((r) => r.status === 'late'),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
