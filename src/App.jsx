import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import Courses from './pages/Courses';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { getCurrentUserProfile, supabase } from './lib/supabase';

function RequireStudent({ children }) {
  const [state, setState] = useState({ loading: true, profile: null });

  useEffect(() => {
    let mounted = true;
    getCurrentUserProfile()
      .then((profile) => mounted && setState({ loading: false, profile }))
      .catch(() => mounted && setState({ loading: false, profile: null }));

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      const profile = await getCurrentUserProfile().catch(() => null);
      if (mounted) setState({ loading: false, profile });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (state.loading) return <div className="card mx-auto max-w-4xl">Checking session...</div>;
  if (!state.profile) return <Navigate to="/login" replace />;
  return children;
}

function RequireApprovedStudent({ children }) {
  const [state, setState] = useState({ loading: true, profile: null });

  useEffect(() => {
    getCurrentUserProfile()
      .then((profile) => setState({ loading: false, profile }))
      .catch(() => setState({ loading: false, profile: null }));
  }, []);

  if (state.loading) return <div className="card mx-auto max-w-4xl">Loading profile...</div>;
  if (!state.profile) return <Navigate to="/login" replace />;
  if (!state.profile.approved) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireStudent><StudentDashboard /></RequireStudent>} />
        <Route path="/courses" element={<RequireApprovedStudent><Courses /></RequireApprovedStudent>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
