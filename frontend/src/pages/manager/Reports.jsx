import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    employeeId: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      const { data } = await api.get('/attendance/all', { params });
      const att = data.attendance || [];
      setReportData(att);
      const empMap = {};
      att.forEach((a) => {
        if (a.userId && !empMap[a.userId._id]) {
          empMap[a.userId._id] = a.userId;
        }
      });
      setEmployees(Object.values(empMap));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      const res = await api.get(`/attendance/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.startDate, filters.endDate, filters.employeeId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Reports</h1>

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
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchData} className="btn-primary">
          Load
        </button>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="btn-success"
        >
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

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
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No data. Adjust filters and click Load.
                    </td>
                  </tr>
                ) : (
                  reportData.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{format(new Date(r.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3">{r.userId?.name || '-'}</td>
                      <td className="px-4 py-3">{r.userId?.employeeId || '-'}</td>
                      <td className="px-4 py-3">
                        {r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium status-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.totalHours || 0}</td>
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
