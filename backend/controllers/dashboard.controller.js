import Attendance from '../models/Attendance.model.js';
import User from '../models/User.model.js';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const employeeDashboard = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date();

    const todayRecord = await Attendance.findOne({ userId: req.user.id, date: today }).lean();
    const monthRecords = await Attendance.find({
      userId: req.user.id,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    const present = monthRecords.filter((r) => r.status === 'present').length;
    const late = monthRecords.filter((r) => r.status === 'late').length;
    const absent = Math.max(
      0,
      new Date().getDate() - monthRecords.length
    );
    const totalHours = monthRecords.reduce((s, r) => s + (r.totalHours || 0), 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: weekAgo },
    })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    res.json({
      success: true,
      data: {
        today: todayRecord,
        stats: { present, absent, late, totalHours },
        recentAttendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const managerDashboard = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    const todayRecords = await Attendance.find({
      date: today,
      checkInTime: { $exists: true, $ne: null },
    })
      .populate('userId', 'name email employeeId department')
      .lean();

    const absentToday = await User.find({
      role: 'employee',
      _id: { $nin: todayRecords.map((r) => r.userId._id) },
    }).select('name email employeeId department');

    const lateToday = todayRecords.filter((r) => r.status === 'late');

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyData = await Attendance.aggregate([
      { $match: { date: { $gte: weekStart, $lte: today } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const deptData = await User.aggregate([
      { $match: { role: 'employee', department: { $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        todayPresent: todayRecords.length,
        todayAbsent: absentToday.length,
        lateToday: lateToday.length,
        absentList: absentToday,
        lateList: lateToday,
        weeklyTrend: weeklyData,
        departmentWise: deptData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
