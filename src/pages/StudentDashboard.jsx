import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getCurrentUserProfile, supabase } from '../lib/supabase';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    getCurrentUserProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return <div className="card mx-auto max-w-6xl">Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[250px_1fr]">
      <aside className="card space-y-3">
        <h3 className="text-lg font-bold">Creators Vaultz</h3>
        <p className="text-sm text-slate-300">Creator Dashboard</p>
        <Link to="/dashboard" className="btn-secondary block text-center">Dashboard</Link>
        <Link to="/courses" className="btn-secondary block text-center">My Courses</Link>
        <button className="btn-secondary w-full" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}>Logout</button>
      </aside>

      <section className="space-y-4">
        <div className="card">
          <h2 className="text-xl font-bold">Dashboard • {profile?.name || 'Student'}</h2>
          <p className="mt-2 text-slate-300">USER ID: <span className="font-mono text-luxury-cyan">{profile?.user_id || 'N/A'}</span></p>
          <p className="mt-2">Approval status: <span className={profile?.approved ? 'text-emerald-400' : 'text-amber-300'}>{profile?.approved ? 'Approved' : 'Pending approval'}</span></p>
        </div>

        <div className={`card ${profile?.approved ? '' : 'opacity-80'}`}>
          <h3 className="mb-2 text-lg font-semibold">MY COURSES</h3>
          {!profile?.approved ? (
            <p className="text-amber-300">Send your USER ID to admin through social media for approval.</p>
          ) : (
            <div>
              <p className="text-emerald-300">Access unlocked.</p>
              <Link to="/courses" className="btn-primary mt-3 inline-block">Open Courses</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-2 text-lg font-semibold">Profile</h3>
          <p className="text-sm text-slate-300">Name: {profile?.name}</p>
          <p className="text-sm text-slate-300">Email: {profile?.email}</p>
          <p className="text-sm text-slate-300">Role: {profile?.role}</p>
        </div>
      </section>
    </div>
  );
}
