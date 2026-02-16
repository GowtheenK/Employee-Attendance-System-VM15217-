import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import api from '../../api/axios';
import { setHistory, setSummary } from '../../store/slices/attendanceSlice';

const STATUS_COLORS = {
  present: 'bg-emerald-500',
  absent: 'bg-slate-200',
  late: 'bg-amber-500',
  'half-day': 'bg-orange-500',
};

export default function MyAttendance() {
  const dispatch = useDispatch();
  const { history, summary } = useSelector((s) => s.attendance);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('calendar'); // 'calendar' | 'table'

  useEffect(() => {
    const fetch = async () => {
      try {
        const [histRes, sumRes] = await Promise.all([
          api.get('/attendance/my-history', { params: { month, year } }),
          api.get('/attendance/my-summary', { params: { month, year } }),
        ]);
        dispatch(setHistory(histRes.data.attendance));
        dispatch(setSummary(sumRes.data.summary));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [month, year, dispatch]);

  const histMap = (history || []).reduce((acc, r) => {
    acc[new Date(r.date).toDateString()] = r;
    return acc;
  }, {});

  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Attendance History</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="input w-32"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {format(new Date(2000, m - 1), 'MMMM')}
            </option>
          ))}
        </select>
        <select
          className="input w-24"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          onClick={() => setView(view === 'calendar' ? 'table' : 'calendar')}
          className="btn-secondary"
        >
          {view === 'calendar' ? 'Table View' : 'Calendar View'}
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex gap-4 flex-wrap">
          <span className="px-3 py-1 rounded status-present">Present: {summary.present}</span>
          <span className="px-3 py-1 rounded status-absent">Absent: {summary.absent}</span>
          <span className="px-3 py-1 rounded status-late">Late: {summary.late}</span>
          <span className="px-3 py-1 rounded status-half-day">Half Day: {summary.halfDay}</span>
          <span className="px-3 py-1 rounded bg-blue-100 text-blue-800">Hours: {summary.totalHours?.toFixed(1)}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Present
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Late
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" /> Half Day
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-200" /> Absent
        </span>
      </div>

      {view === 'calendar' ? (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-600">
                {d}
              </div>
            ))}
            {Array.from({ length: start.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50 p-2 min-h-[60px]" />
            ))}
            {days.map((d) => {
              const rec = histMap[d.toDateString()];
              const status = rec?.status || 'absent';
              const isSelected = selected && isSameDay(d, new Date(selected.date));
              return (
                <div
                  key={d.toISOString()}
                  onClick={() => setSelected(rec ? { ...rec, date: d } : null)}
                  className={`p-2 min-h-[60px] bg-white cursor-pointer hover:bg-slate-50 transition ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <span className="text-sm text-slate-700">{format(d, 'd')}</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block w-4 h-4 rounded-full ${
                        STATUS_COLORS[status] || 'bg-slate-200'
                      }`}
                      title={status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {selected && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <h3 className="font-medium text-slate-700">
                {format(new Date(selected.date), 'MMMM d, yyyy')}
              </h3>
              <p>Status: <span className={`status-${selected.status}`}>{selected.status}</span></p>
              <p>Check In: {selected.checkInTime ? format(new Date(selected.checkInTime), 'h:mm a') : '-'}</p>
              <p>Check Out: {selected.checkOutTime ? format(new Date(selected.checkOutTime), 'h:mm a') : '-'}</p>
              <p>Hours: {selected.totalHours || 0}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
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
              {(history || []).map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{format(new Date(r.date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium status-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : '-'}
                  </td>
                  <td className="px-4 py-3">{r.totalHours || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
