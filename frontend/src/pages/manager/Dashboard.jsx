import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import api from '../../api/axios';
import { setManagerData } from '../../store/slices/dashboardSlice';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.dashboard.managerData) || {};

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard/manager');
        dispatch(setManagerData(data.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [dispatch]);

  const weeklyData = (data?.weeklyTrend || []).map((d) => ({
    date: format(new Date(d._id), 'MMM d'),
    count: d.count,
  }));

  const deptData = (data?.departmentWise || []).map((d) => ({
    name: d._id || 'Unknown',
    value: d.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.totalEmployees || 0} color="blue" />
        <StatCard title="Present Today" value={data?.todayPresent || 0} color="emerald" />
        <StatCard title="Absent Today" value={data?.todayAbsent || 0} color="rose" />
        <StatCard title="Late Today" value={data?.lateToday || 0} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Weekly Attendance Trend</h2>
          <div className="h-64">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-12">No data yet</p>
            )}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Department-wise Attendance</h2>
          <div className="h-64">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-12">No department data</p>
            )}
          </div>
        </div>
      </div>

      {/* Absent Today */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-700 p-4 border-b border-slate-200">
          Absent Today
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(data?.absentList || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-emerald-600">
                    All employees are present today!
                  </td>
                </tr>
              ) : (
                (data?.absentList || []).map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.employeeId || '-'}</td>
                    <td className="px-4 py-3">{u.department || '-'}</td>
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
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`card p-4 border-2 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
