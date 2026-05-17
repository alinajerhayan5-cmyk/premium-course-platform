import { Link, Navigate } from 'react-router-dom';

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('pcp_current_user') || 'null');

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card">
        <h2 className="text-xl font-bold">Welcome, {user?.name || 'Student'}</h2>
        <p className="text-slate-300">USER ID: <span className="font-mono text-luxury-cyan">{user?.user_id || 'N/A'}</span></p>
        <p className="mt-2">Approval status: <span className={user?.approved ? 'text-emerald-400' : 'text-amber-300'}>{user?.approved ? 'Approved' : 'Pending approval'}</span></p>
      </div>

      <div className={`card ${user?.approved ? '' : 'opacity-80'}`}>
        <h3 className="mb-2 text-lg font-semibold">MY COURSES</h3>
        {!user?.approved ? (
          <p className="text-amber-300">Send your USER ID to admin through social media for approval.</p>
        ) : (
          <div>
            <p className="text-emerald-300">Access unlocked.</p>
            <Link to="/courses" className="btn-primary mt-3 inline-block">Open Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
