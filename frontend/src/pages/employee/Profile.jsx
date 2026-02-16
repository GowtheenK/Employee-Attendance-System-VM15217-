import { useSelector } from 'react-redux';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      <div className="card max-w-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <p className="text-slate-700">{user?.name}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-slate-700">{user?.email}</p>
          </div>
          <div>
            <label className="label">Employee ID</label>
            <p className="text-slate-700">{user?.employeeId || '-'}</p>
          </div>
          <div>
            <label className="label">Department</label>
            <p className="text-slate-700">{user?.department || '-'}</p>
          </div>
          <div>
            <label className="label">Role</label>
            <p className="text-slate-700 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
