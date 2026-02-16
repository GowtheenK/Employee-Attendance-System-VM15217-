import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../../api/axios';
import { setAllAttendance } from '../../store/slices/attendanceSlice';
import apiClient from '../../api/axios';

export default function AllAttendance() {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((s) => s.attendance);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    employeeId: '',
    status: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await apiClient.get('/attendance/all', {
          params: { startDate: '2020-01-01', endDate: '2030-12-31' },
        });
        const ids = [...new Set((data.attendance || []).map((a) => a.userId?._id).filter(Boolean))];
        const empMap = {};
        (data.attendance || []).forEach((a) => {
          if (a.userId && !empMap[a.userId._id]) {
            empMap[a.userId._id] = a.userId;
          }
        });
        setEmployees(Object.values(empMap));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.employeeId) params.employeeId = filters.employeeId;
        if (filters.status) params.status = filters.status;
        const { data } = await api.get('/attendance/all', { params });
        dispatch(setAllAttendance(data.attendance || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters, dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">All Employees Attendance</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input w-40"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input w-40"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Employee</label>
          <select
            className="input w-48"
            value={filters.employeeId}
            onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
          >
            <option value="">All</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input w-32"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Employee ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(allAttendance || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No attendance records
                    </td>
                  </tr>
                ) : (
                  (allAttendance || []).map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(r.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.userId?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.userId?.employeeId || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.userId?.department || '-'}
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
        )}
      </div>
    </div>
  );
}
