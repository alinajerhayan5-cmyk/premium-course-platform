import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [profile, setProfile] = useState(undefined);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [folders, setFolders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [promptFiles, setPromptFiles] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', duration: '', video_url: '', thumbnail_url: '' });
  const [newFolder, setNewFolder] = useState({ section: 'men', category: '', title: '', content: '' });
  const [newPost, setNewPost] = useState({ room: 'GENERAL', title: '', message: '', pinned: false });
  const [newPromptFile, setNewPromptFile] = useState({ section: 'men', category: '', title: '', prompt_text: '', image_url: '' });

  async function loadAll() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setProfile(null);
    const { data: me } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
    setProfile(me);
    if (me?.role !== 'admin') return;

    const [{ data: usersData }, { data: lessonsData }, { data: foldersData }, { data: postsData }, { data: promptFilesData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('prompt_folders').select('*').order('created_at', { ascending: false }),
      supabase.from('group_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('prompt_files').select('*').order('created_at', { ascending: false })
    ]);

    setUsers(usersData || []);
    setLessons(lessonsData || []);
    setFolders(foldersData || []);
    setPosts(postsData || []);
    setPromptFiles(promptFilesData || []);
  }
  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => users.filter((u) => [u.user_id, u.name, u.email].join(' ').toLowerCase().includes(q.toLowerCase())), [q, users]);
  const setApproval = async (id, approved) => { await supabase.from('profiles').update({ approved }).eq('id', id); loadAll(); };
  const addLesson = async (e) => { e.preventDefault(); await supabase.from('lessons').insert([newLesson]); setNewLesson({ title: '', duration: '', video_url: '', thumbnail_url: '' }); loadAll(); };
  const updateLesson = async (id, patch) => { await supabase.from('lessons').update(patch).eq('id', id); loadAll(); };
  const deleteLesson = async (id) => { await supabase.from('lessons').delete().eq('id', id); loadAll(); };
  const addFolder = async (e) => { e.preventDefault(); await supabase.from('prompt_folders').insert([newFolder]); setNewFolder({ section: 'men', category: '', title: '', content: '' }); loadAll(); };
  const updateFolder = async (id, patch) => { await supabase.from('prompt_folders').update(patch).eq('id', id); loadAll(); };
  const deleteFolder = async (id) => { await supabase.from('prompt_folders').delete().eq('id', id); loadAll(); };
  const addPost = async (e) => { e.preventDefault(); await supabase.from('group_posts').insert([newPost]); setNewPost({ room: 'GENERAL', title: '', message: '', pinned: false }); loadAll(); };
  const deletePost = async (id) => { await supabase.from('group_posts').delete().eq('id', id); loadAll(); };
  const addPromptFile = async (e) => { e.preventDefault(); await supabase.from('prompt_files').insert([newPromptFile]); setNewPromptFile({ section: 'men', category: '', title: '', prompt_text: '', image_url: '' }); loadAll(); };
  const updatePromptFile = async (id, patch) => { await supabase.from('prompt_files').update(patch).eq('id', id); loadAll(); };
  const deletePromptFile = async (id) => { await supabase.from('prompt_files').delete().eq('id', id); loadAll(); };

  async function uploadFile(e, bucket, field, setter) {
    const file = e.target.files?.[0]; if (!file) return;
    const path = `${Date.now()}-${file.name}`;
    await supabase.storage.from(bucket).upload(path, file);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setter((prev) => ({ ...prev, [field]: data.publicUrl }));
  }

  if (profile === undefined) return <div className="card">Loading...</div>;
  if (!profile) return <Navigate to="/admin-login" replace />;
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <div className="card flex items-center justify-between"><h1 className="text-xl font-bold">Creators Vaultz Admin Panel</h1><button className="btn-secondary" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin-login'; }}>Logout</button></div>
      <div className="card"><h2 className="mb-1 text-xl font-bold">User Approval</h2><input className="input mb-3" placeholder="Search by USER ID, name, email" value={q} onChange={(e) => setQ(e.target.value)} /><div className="space-y-2">{filtered.map((u) => <div key={u.id} className="flex flex-col gap-2 rounded-xl border border-slate-700 p-3 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{u.name}</p><p className="text-sm text-slate-300">{u.email} • {u.user_id}</p></div><div className="flex gap-2"><button onClick={() => setApproval(u.id, true)} className="btn-primary">Approve</button><button onClick={() => setApproval(u.id, false)} className="btn-secondary">Lock</button></div></div>)}</div></div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card"><h3 className="mb-3 text-lg font-semibold">Lesson Manager</h3><form className="space-y-2" onSubmit={addLesson}><input className="input" placeholder="Lesson title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} required /><input className="input" placeholder="Duration" value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} required /><input className="input" placeholder="Video URL" value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} /><input className="input" placeholder="Thumbnail URL" value={newLesson.thumbnail_url} onChange={(e) => setNewLesson({ ...newLesson, thumbnail_url: e.target.value })} /><input type="file" onChange={(e) => uploadFile(e, 'lesson-thumbnails', 'thumbnail_url', setNewLesson)} /><input type="file" onChange={(e) => uploadFile(e, 'lesson-videos', 'video_url', setNewLesson)} /><button className="btn-primary" type="submit">Upload Lesson</button></form><div className="mt-4 space-y-2">{lessons.map((l) => <div key={l.id} className="rounded border border-slate-700 p-2 text-sm"><input className="input mb-2" defaultValue={l.title} onBlur={(e) => updateLesson(l.id, { title: e.target.value })} /><div className="flex justify-between"><span>{l.duration}</span><button className="btn-secondary" onClick={() => deleteLesson(l.id)}>Delete</button></div></div>)}</div></div>
        <div className="card"><h3 className="mb-3 text-lg font-semibold">Category + Folder + Prompt Manager</h3><form className="space-y-2" onSubmit={addFolder}><select className="input" value={newFolder.section} onChange={(e) => setNewFolder({ ...newFolder, section: e.target.value })}><option value="men">Men</option><option value="women">Women</option></select><input className="input" placeholder="Category" value={newFolder.category} onChange={(e) => setNewFolder({ ...newFolder, category: e.target.value })} required /><input className="input" placeholder="Folder title" value={newFolder.title} onChange={(e) => setNewFolder({ ...newFolder, title: e.target.value })} required /><textarea className="input min-h-24" placeholder="Prompt content" value={newFolder.content} onChange={(e) => setNewFolder({ ...newFolder, content: e.target.value })} required /><button className="btn-primary" type="submit">Create Folder Prompt</button></form><div className="mt-4 space-y-2">{folders.map((f) => <div key={f.id} className="rounded border border-slate-700 p-2 text-sm"><input className="input mb-2" defaultValue={f.title} onBlur={(e) => updateFolder(f.id, { title: e.target.value })} /><textarea className="input" defaultValue={f.content} onBlur={(e) => updateFolder(f.id, { content: e.target.value })} /><div className="mt-2 flex justify-between"><span>{f.section} • {f.category}</span><button className="btn-secondary" onClick={() => deleteFolder(f.id)}>Delete</button></div></div>)}</div></div>
      </div>

      <div className="card"><h3 className="mb-3 text-lg font-semibold">Prompt Image Files Upload (prompt-images bucket)</h3><form className="grid gap-2 md:grid-cols-2" onSubmit={addPromptFile}><select className="input" value={newPromptFile.section} onChange={(e) => setNewPromptFile({ ...newPromptFile, section: e.target.value })}><option value="men">Men</option><option value="women">Women</option></select><input className="input" placeholder="Category / Folder" value={newPromptFile.category} onChange={(e) => setNewPromptFile({ ...newPromptFile, category: e.target.value })} required /><input className="input" placeholder="Prompt title" value={newPromptFile.title} onChange={(e) => setNewPromptFile({ ...newPromptFile, title: e.target.value })} required /><textarea className="input" placeholder="Prompt text" value={newPromptFile.prompt_text} onChange={(e) => setNewPromptFile({ ...newPromptFile, prompt_text: e.target.value })} required /><input className="input" placeholder="Image URL" value={newPromptFile.image_url} onChange={(e) => setNewPromptFile({ ...newPromptFile, image_url: e.target.value })} /><input type="file" accept="image/*" onChange={(e) => uploadFile(e, 'prompt-images', 'image_url', setNewPromptFile)} /><button className="btn-primary md:col-span-2" type="submit">Save Prompt File</button></form><div className="mt-3 space-y-2">{promptFiles.map((pf) => <div key={pf.id} className="rounded border border-slate-700 p-2 text-sm"><div className="grid gap-2 md:grid-cols-2"><input className="input" defaultValue={pf.title} onBlur={(e) => updatePromptFile(pf.id, { title: e.target.value })} /><input className="input" defaultValue={pf.category} onBlur={(e) => updatePromptFile(pf.id, { category: e.target.value })} /><textarea className="input md:col-span-2" defaultValue={pf.prompt_text} onBlur={(e) => updatePromptFile(pf.id, { prompt_text: e.target.value })} /></div><div className="mt-2 flex items-center justify-between"><span>{pf.section} • {new Date(pf.created_at).toLocaleDateString()}</span><button className="btn-secondary" onClick={() => deletePromptFile(pf.id)}>Delete</button></div></div>)}</div></div>

      <div className="card"><h3 className="mb-3 text-lg font-semibold">Group Chat Posts Manager</h3><form className="grid gap-2 md:grid-cols-4" onSubmit={addPost}><select className="input" value={newPost.room} onChange={(e) => setNewPost({ ...newPost, room: e.target.value })}><option>GENERAL</option><option>STUDENTS WINS</option><option>ADMINS UPDATE</option></select><input className="input" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required /><input className="input" placeholder="Message" value={newPost.message} onChange={(e) => setNewPost({ ...newPost, message: e.target.value })} required /><button className="btn-primary" type="submit">Publish</button></form><div className="mt-3 space-y-2">{posts.map((p) => <div key={p.id} className="flex items-center justify-between rounded border border-slate-700 p-2 text-sm"><span>{p.room} • {p.title}</span><button className="btn-secondary" onClick={() => deletePost(p.id)}>Delete</button></div>)}</div></div>
    </div>
  );
}
