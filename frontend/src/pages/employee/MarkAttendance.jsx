import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../../api/axios';
import { setToday } from '../../store/slices/attendanceSlice';
import { setEmployeeData } from '../../store/slices/dashboardSlice';

export default function MarkAttendance() {
  const dispatch = useDispatch();
  const { today } = useSelector((s) => s.attendance);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/attendance/today');
        dispatch(setToday(data.today));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [dispatch]);

  const isCheckedIn = today?.checkInTime && !today?.checkOutTime;
  const isCheckedOut = today?.checkOutTime;

  const handleAction = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      if (isCheckedIn) {
        const { data } = await api.post('/attendance/checkout');
        dispatch(setToday(data.attendance));
        dispatch(setEmployeeData(null)); // Invalidate cache
        setMessage({ type: 'success', text: 'Checked out successfully!' });
      } else if (!isCheckedOut) {
        const { data } = await api.post('/attendance/checkin');
        dispatch(setToday(data.attendance));
        dispatch(setEmployeeData(null));
        setMessage({ type: 'success', text: 'Checked in successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>

      <div className="card p-8 max-w-lg mx-auto text-center">
        <p className="text-slate-600 mb-2">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        <p className="text-lg text-slate-700 mb-6">
          Current time: {format(new Date(), 'h:mm:ss a')}
        </p>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {isCheckedOut ? (
          <div className="space-y-4">
            <p className="text-emerald-600 font-medium">You have completed today's attendance</p>
            <div className="grid grid-cols-2 gap-4 text-left text-sm">
              <div>
                <span className="text-slate-500">Check In:</span>{' '}
                {today?.checkInTime ? format(new Date(today.checkInTime), 'h:mm a') : '-'}
              </div>
              <div>
                <span className="text-slate-500">Check Out:</span>{' '}
                {today?.checkOutTime ? format(new Date(today.checkOutTime), 'h:mm a') : '-'}
              </div>
              <div>
                <span className="text-slate-500">Total Hours:</span> {today?.totalHours || 0}
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{' '}
                <span className={`px-2 py-0.5 rounded status-${today?.status}`}>{today?.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-4 text-lg font-semibold rounded-xl transition ${
              isCheckedIn
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'btn-success'
            }`}
          >
            {loading ? 'Processing...' : isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
        )}
      </div>
    </div>
  );
}
