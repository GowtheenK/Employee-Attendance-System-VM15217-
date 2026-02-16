import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Welcome from './pages/auth/Welcome';
import EmployeeLayout from './layouts/EmployeeLayout';
import ManagerLayout from './layouts/ManagerLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import MyAttendance from './pages/employee/MyAttendance';
import Profile from './pages/employee/Profile';
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/Welcome" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'manager' ? '/manager' : '/'} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/Welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute role="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="mark-attendance" element={<MarkAttendance />} />
        <Route path="my-attendance" element={<MyAttendance />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/manager/*"
        element={
          <ProtectedRoute role="manager">
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="attendance" element={<AllAttendance />} />
        <Route path="calendar" element={<TeamCalendar />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  
  );
}

export default App;
