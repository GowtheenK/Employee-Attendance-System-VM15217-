import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4">
      <div className="card w-full max-w-xl p-10 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Employee Attendance System</h1>
          <p className="text-slate-600">
            Track daily attendance, view summaries, and manage your team with a clean, simple interface.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link to="/login" className="btn-primary w-full sm:w-40">
            Sign In
          </Link>
          <Link to="/register" className="btn-secondary w-full sm:w-40">
            Register
          </Link>
          
        </div>
        
      </div>
    </div>
  );
}

