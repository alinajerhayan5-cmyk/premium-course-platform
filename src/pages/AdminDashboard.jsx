import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const isAdmin = localStorage.getItem('pcp_admin') === '1';
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('pcp_users') || '[]'));

  const filtered = useMemo(
    () => users.filter((u) => [u.user_id, u.name, u.email].join(' ').toLowerCase().includes(q.toLowerCase())),
    [q, users]
  );

  const setApproval = (id, approved) => {
    const next = users.map((u) => (u.user_id === id ? { ...u, approved } : u));
    setUsers(next);
    localStorage.setItem('pcp_users', JSON.stringify(next));
    const current = JSON.parse(localStorage.getItem('pcp_current_user') || 'null');
    if (current?.user_id === id) localStorage.setItem('pcp_current_user', JSON.stringify({ ...current, approved }));
  };

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="mb-3 text-xl font-bold">User Approval</h2>
        <input className="input mb-3" placeholder="Search by USER ID, name, email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.user_id} className="flex flex-col gap-2 rounded-xl border border-slate-700 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-slate-300">{u.email} • {u.user_id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setApproval(u.user_id, true)} className="btn-primary">Approve</button>
                <button onClick={() => setApproval(u.user_id, false)} className="btn-secondary">Lock</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-slate-400">No users found.</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Lesson Prompt Management</h3>
          <textarea className="input min-h-40" defaultValue={'- Add/Edit lesson prompts\n- Manage folder prompts for men/women sections'} />
        </div>
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Group Chats Management</h3>
          <textarea className="input min-h-40" defaultValue={'GENERAL\nSTUDENTS WINS\nADMINS UPDATE'} />
        </div>
      </div>
    </div>
  );
}
