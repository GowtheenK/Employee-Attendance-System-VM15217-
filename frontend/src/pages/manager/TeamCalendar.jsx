import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import api from '../../api/axios';
import { setAllAttendance } from '../../store/slices/attendanceSlice';

const STATUS_COLORS = {
  present: 'bg-emerald-500',
  late: 'bg-amber-500',
  'half-day': 'bg-orange-500',
};

export default function TeamCalendar() {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((s) => s.attendance);
  const [current, setCurrent] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const month = current.getMonth() + 1;
  const year = current.getFullYear();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const start = startOfMonth(current);
        const end = endOfMonth(current);
        const params = {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        };
        if (selectedEmployee) params.employeeId = selectedEmployee;
        const { data } = await api.get('/attendance/all', { params });
        dispatch(setAllAttendance(data.attendance || []));
        const empMap = {};
        (data.attendance || []).forEach((a) => {
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
    fetch();
  }, [current, selectedEmployee, dispatch]);

  const histMap = (allAttendance || []).reduce((acc, r) => {
    const key = `${r.userId?._id || ''}-${new Date(r.date).toDateString()}`;
    acc[key] = r;
    return acc;
  }, {});

  const start = startOfMonth(current);
  const end = endOfMonth(current);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Team Calendar View</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="btn-secondary">
          Previous
        </button>
        <span className="text-lg font-semibold text-slate-700">
          {format(current, 'MMMM yyyy')}
        </span>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="btn-secondary">
          Next
        </button>
        <select
          className="input w-48"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 text-sm text-slate-600 mb-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Present
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Late
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" /> Half Day
        </span>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-200 overflow-x-auto">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-600 min-w-[80px]">
                {d}
              </div>
            ))}
            {Array.from({ length: start.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50 p-2 min-h-[80px] min-w-[80px]" />
            ))}
            {days.map((d) => {
              const empIds = [...new Set(employees.map((e) => e._id))];
              const recs = empIds
                .map((id) => histMap[`${id}-${d.toDateString()}`])
                .filter(Boolean);
              const statuses = [...new Set(recs.map((r) => r.status))];
              return (
                <div
                  key={d.toISOString()}
                  className="p-2 min-h-[80px] min-w-[80px] bg-white"
                >
                  <span className="text-sm text-slate-700">{format(d, 'd')}</span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {statuses.map((s) => (
                      <span
                        key={s}
                        className={`inline-block w-3 h-3 rounded-full ${
                          STATUS_COLORS[s] || 'bg-slate-200'
                        }`}
                      />
                    ))}
                    {recs.length > 0 && (
                      <span className="text-xs text-slate-500 ml-1">{recs.length}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
