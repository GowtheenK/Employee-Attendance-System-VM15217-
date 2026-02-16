import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../../api/axios';
import { setEmployeeData } from '../../store/slices/dashboardSlice';
import { setToday } from '../../store/slices/attendanceSlice';

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.dashboard.employeeData) || {};
  const { today } = useSelector((s) => s.attendance);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, todayRes] = await Promise.all([
          api.get('/dashboard/employee'),
          api.get('/attendance/today'),
        ]);
        dispatch(setEmployeeData(dashRes.data.data));
        dispatch(setToday(todayRes.data.today));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [dispatch]);

  const stats = data?.stats || {};
  const recent = data?.recentAttendance || [];
  const isCheckedIn = today?.checkInTime && !today?.checkOutTime;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Welcome back, {user?.name}
      </h1>

      {/* Today Status */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Today's Status</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            <p className={`mt-1 text-lg font-medium ${isCheckedIn ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isCheckedIn
                ? `Checked in at ${today?.checkInTime ? format(new Date(today.checkInTime), 'h:mm a') : '-'}`
                : 'Not checked in yet'}
            </p>
          </div>
          <Link to="/mark-attendance" className="btn-primary">
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present (Month)" value={stats.present || 0} color="emerald" />
        <StatCard title="Absent (Month)" value={stats.absent || 0} color="rose" />
        <StatCard title="Late (Month)" value={stats.late || 0} color="amber" />
        <StatCard title="Total Hours (Month)" value={stats.totalHours?.toFixed(1) || '0'} color="blue" />
      </div>

      {/* Recent */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-700 p-4 border-b border-slate-200">
          Recent Attendance (Last 7 days)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check In</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check Out</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No recent attendance
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {format(new Date(r.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium status-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.totalHours || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <div className={`card p-4 border-2 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
