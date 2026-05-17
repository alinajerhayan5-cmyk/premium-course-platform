import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getCurrentUserProfile, supabase } from '../lib/supabase';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    getCurrentUserProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return <div className="card mx-auto max-w-4xl">Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Creators Vaultz Dashboard • {profile?.name || 'Student'}</h2>
          <button className="btn-secondary" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}>Logout</button>
        </div>
        <p className="text-slate-300">USER ID: <span className="font-mono text-luxury-cyan">{profile?.user_id || 'N/A'}</span></p>
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
    </div>
  );
}
