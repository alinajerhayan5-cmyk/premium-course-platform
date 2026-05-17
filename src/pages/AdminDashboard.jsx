import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [profile, setProfile] = useState(undefined);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', duration: '', video_url: '', thumbnail_url: '' });
  const [newFolder, setNewFolder] = useState({ section: 'men', category: '', title: '', content: '' });

  async function loadAll() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setProfile(null);
    const { data: me } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
    setProfile(me);
    if (me?.role !== 'admin') return;

    const [{ data: usersData }, { data: lessonsData }, { data: foldersData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('prompt_folders').select('*').order('created_at', { ascending: false })
    ]);

    setUsers(usersData || []);
    setLessons(lessonsData || []);
    setFolders(foldersData || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(
    () => users.filter((u) => [u.user_id, u.name, u.email].join(' ').toLowerCase().includes(q.toLowerCase())),
    [q, users]
  );

  const setApproval = async (id, approved) => {
    await supabase.from('profiles').update({ approved }).eq('id', id);
    loadAll();
  };

  const addLesson = async (e) => {
    e.preventDefault();
    await supabase.from('lessons').insert([newLesson]);
    setNewLesson({ title: '', duration: '', video_url: '', thumbnail_url: '' });
    loadAll();
  };

  const deleteLesson = async (id) => {
    await supabase.from('lessons').delete().eq('id', id);
    loadAll();
  };

  const addFolder = async (e) => {
    e.preventDefault();
    await supabase.from('prompt_folders').insert([newFolder]);
    setNewFolder({ section: 'men', category: '', title: '', content: '' });
    loadAll();
  };

  const deleteFolder = async (id) => {
    await supabase.from('prompt_folders').delete().eq('id', id);
    loadAll();
  };

  async function uploadFile(e, bucket, field) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${Date.now()}-${file.name}`;
    await supabase.storage.from(bucket).upload(path, file);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setNewLesson((prev) => ({ ...prev, [field]: data.publicUrl }));
  }

  if (profile === undefined) return <div className="card">Loading...</div>;
  if (!profile) return <Navigate to="/admin-login" replace />;
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <div className="card flex items-center justify-between">
        <h1 className="text-xl font-bold">Creators Vaultz Admin Panel</h1>
        <button className="btn-secondary" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin-login'; }}>Logout</button>
      </div>

      <div className="card">
        <h2 className="mb-1 text-xl font-bold">User Approval</h2>
        <p className="mb-3 text-sm text-slate-300">Approved: {users.filter((u) => u.approved).length} / {users.length}</p>
        <input className="input mb-3" placeholder="Search by USER ID, name, email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-xl border border-slate-700 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-slate-300">{u.email} • {u.user_id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setApproval(u.id, true)} className="btn-primary">Approve</button>
                <button onClick={() => setApproval(u.id, false)} className="btn-secondary">Lock</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Lessons Management</h3>
          <form className="space-y-2" onSubmit={addLesson}>
            <input className="input" placeholder="Title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} required />
            <input className="input" placeholder="Duration" value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} required />
            <input className="input" placeholder="Video URL" value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} />
            <input className="input" placeholder="Thumbnail URL" value={newLesson.thumbnail_url} onChange={(e) => setNewLesson({ ...newLesson, thumbnail_url: e.target.value })} />
            <div className="text-sm text-slate-300">Upload thumbnail</div><input type="file" onChange={(e) => uploadFile(e, 'lesson-thumbnails', 'thumbnail_url')} />
            <div className="text-sm text-slate-300">Upload video</div><input type="file" onChange={(e) => uploadFile(e, 'lesson-videos', 'video_url')} />
            <button className="btn-primary" type="submit">Add Lesson</button>
          </form>
          <div className="mt-4 space-y-2">{lessons.map((l) => <div key={l.id} className="rounded border border-slate-700 p-2 text-sm flex justify-between"><span>{l.title} ({l.duration})</span><button className="btn-secondary" onClick={() => deleteLesson(l.id)}>Delete</button></div>)}</div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Prompt Folders Management</h3>
          <form className="space-y-2" onSubmit={addFolder}>
            <select className="input" value={newFolder.section} onChange={(e) => setNewFolder({ ...newFolder, section: e.target.value })}><option value="men">Men</option><option value="women">Women</option></select>
            <input className="input" placeholder="Category" value={newFolder.category} onChange={(e) => setNewFolder({ ...newFolder, category: e.target.value })} required />
            <input className="input" placeholder="Title" value={newFolder.title} onChange={(e) => setNewFolder({ ...newFolder, title: e.target.value })} required />
            <textarea className="input min-h-24" placeholder="Content" value={newFolder.content} onChange={(e) => setNewFolder({ ...newFolder, content: e.target.value })} required />
            <button className="btn-primary" type="submit">Add Folder Prompt</button>
          </form>
          <div className="mt-4 space-y-2">{folders.map((f) => <div key={f.id} className="rounded border border-slate-700 p-2 text-sm flex justify-between"><span>{f.section} • {f.title}</span><button className="btn-secondary" onClick={() => deleteFolder(f.id)}>Delete</button></div>)}</div>
        </div>
      </div>
    </div>
  );
}
