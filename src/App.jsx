import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import Courses from './pages/Courses';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function RequireStudent({ children }) {
  const user = JSON.parse(localStorage.getItem('pcp_current_user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireApprovedStudent({ children }) {
  const user = JSON.parse(localStorage.getItem('pcp_current_user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (!user.approved) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireStudent>
              <StudentDashboard />
            </RequireStudent>
          }
        />
        <Route
          path="/courses"
          element={
            <RequireApprovedStudent>
              <Courses />
            </RequireApprovedStudent>
          }
        />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
