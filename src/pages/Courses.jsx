import { Bot, MessageSquare, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const MEN_DEFAULT = ['Things Prompt', 'Model Prompt', 'Shirt Prompt', 'Jacket Prompt', 'Pants Prompt', 'Footwear Prompt'];
const WOMEN_DEFAULT = ['Things Prompt', 'Model Prompt', 'Dress Prompt', 'Beauty Prompt', 'Footwear Prompt', 'Fashion Prompt'];
const ROOMS = ['GENERAL', 'STUDENTS WINS', 'ADMINS UPDATE'];

export default function Courses() {
  const [tab, setTab] = useState('lesson');
  const [activeSection, setActiveSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [folders, setFolders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [promptFiles, setPromptFiles] = useState([]);

  useEffect(() => {
    Promise.all([
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('prompt_folders').select('*').order('created_at', { ascending: false }),
      supabase.from('group_posts').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('prompt_files').select('*').order('created_at', { ascending: false })
    ]).then(([l, f, p, pf]) => {
      setLessons(l.data || []);
      setFolders(f.data || []);
      setPosts(p.data || []);
      setPromptFiles(pf.data || []);
    });
  }, []);

  const menFolders = useMemo(() => {
    const db = [...new Set(folders.filter((f) => f.section === 'men').map((f) => f.category || f.title))];
    return db.length ? db : MEN_DEFAULT;
  }, [folders]);
  const womenFolders = useMemo(() => {
    const db = [...new Set(folders.filter((f) => f.section === 'women').map((f) => f.category || f.title))];
    return db.length ? db : WOMEN_DEFAULT;
  }, [folders]);

  const roomPosts = (room) => posts.filter((p) => p.room === room);
  const filesForCategory = promptFiles.filter((f) => f.section === activeSection && f.category === selectedCategory);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="card space-y-4">
        <h3 className="font-bold text-lg">Creators Vaultz</h3>
        <button className={`w-full text-left btn-secondary ${tab === 'lesson' ? 'bg-slate-800' : ''}`} onClick={() => setTab('lesson')}>1. Lesson</button>
        <button className={`w-full text-left btn-secondary ${tab === 'men' ? 'bg-slate-800' : ''}`} onClick={() => { setTab('men'); setActiveSection('men'); setSelectedCategory(null); }}>2. Men Section</button>
        <button className={`w-full text-left btn-secondary ${tab === 'women' ? 'bg-slate-800' : ''}`} onClick={() => { setTab('women'); setActiveSection('women'); setSelectedCategory(null); }}>3. Women Section</button>
        <button className={`w-full text-left btn-secondary ${tab === 'chat' ? 'bg-slate-800' : ''}`} onClick={() => setTab('chat')}>4. Group Chats</button>
      </aside>

      <main className="card">
        {tab === 'lesson' && <LessonsGrid lessons={lessons} />}

        {(tab === 'men' || tab === 'women') && (
          <>
            <h2 className="mb-4 text-xl font-bold">{tab === 'men' ? 'Men Section' : 'Women Section'}</h2>
            {!selectedCategory ? (
              <FolderGrid title="Category Folders" items={tab === 'men' ? menFolders : womenFolders} onSelect={setSelectedCategory} />
            ) : (
              <PromptFileGrid
                section={activeSection}
                category={selectedCategory}
                files={filesForCategory}
                onBack={() => setSelectedCategory(null)}
                onOpen={setModalFile}
              />
            )}
          </>
        )}

        {tab === 'chat' && <ChatPanel roomPosts={roomPosts} />}
      </main>

      {modalFile && <PromptModal file={modalFile} onClose={() => setModalFile(null)} />}
      <button className="fixed bottom-6 right-6 rounded-full bg-gradient-to-r from-luxury-accent to-luxury-cyan p-4 text-slate-950 shadow-glow" aria-label="chatbot"><MessageSquare size={18} /></button>
      <button className="fixed bottom-20 right-6 rounded-full bg-luxury-accent p-3 text-white shadow-glow" aria-label="assistant"><Bot size={16} /></button>
    </div>
  );
}

function LessonsGrid({ lessons }) { return <><h2 className="mb-4 text-xl font-bold">Lessons</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{lessons.map((l) => <article key={l.id} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">{l.thumbnail_url ? <img src={l.thumbnail_url} alt={l.title} className="mb-2 aspect-video w-full rounded-lg object-cover" /> : <div className="mb-2 aspect-video rounded-lg bg-gradient-to-br from-luxury-violet to-luxury-indigo" />}<h4 className="font-semibold">{l.title}</h4><p className="text-sm text-slate-300">Duration: {l.duration}</p>{l.video_url && <a href={l.video_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-luxury-cyan hover:underline">Click to watch video</a>}</article>)}</div></>; }
function FolderGrid({ title, items, onSelect }) { return <><h2 className="mb-4 text-xl font-bold">{title}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <button onClick={() => onSelect(item)} key={item} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left text-sm hover:border-luxury-cyan"><p className="font-semibold">{item}</p><p className="mt-1 text-slate-400">Open category</p></button>)}</div></>; }
function PromptFileGrid({ section, category, files, onBack, onOpen }) { return <><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold capitalize">{section} • {category}</h2><button className="btn-secondary" onClick={onBack}>Back to folders</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{files.map((file) => <button key={file.id} onClick={() => onOpen(file)} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-left">{file.image_url ? <img src={file.image_url} alt={file.title} className="mb-2 aspect-square w-full rounded-lg object-cover" /> : <div className="mb-2 aspect-square rounded-lg bg-slate-700" />}<h4 className="font-semibold">{file.title}</h4><p className="line-clamp-2 text-sm text-slate-300">{file.prompt_text}</p><p className="mt-1 text-xs text-slate-400">{file.section} • {file.category}</p><p className="text-xs text-slate-500">{new Date(file.created_at).toLocaleDateString()}</p></button>)}{files.length===0&&<p className="text-slate-400">No prompt files uploaded yet.</p>}</div></>; }
function PromptModal({ file, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold">{file.title}</h3><button onClick={onClose} className="btn-secondary"><X size={16} /></button></div>{file.image_url && <img src={file.image_url} alt={file.title} className="mb-3 max-h-[420px] w-full rounded-lg object-contain" />}<p className="text-sm text-slate-300">{file.prompt_text}</p><p className="mt-2 text-xs text-slate-400">Section: {file.section} | Category: {file.category}</p><p className="text-xs text-slate-500">Created: {new Date(file.created_at).toLocaleString()}</p></div></div>; }
function ChatPanel({ roomPosts }) { return <><h2 className="mb-4 text-xl font-bold">Group Chat</h2><div className="grid gap-4 lg:grid-cols-[260px_1fr]"><div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">{ROOMS.map((room) => <div key={room} className="mb-2 rounded-lg border border-slate-700 px-3 py-2 text-sm">#{room}</div>)}</div><div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-3">{ROOMS.map((room) => <div key={room}><h4 className="mb-2 font-semibold text-luxury-cyan">{room}</h4>{roomPosts(room).length===0?<p className="text-sm text-slate-400">No posts yet.</p>:roomPosts(room).map((post)=><div key={post.id} className="mb-2 rounded-lg border border-slate-700 p-3"><p className="text-sm font-semibold">{post.title} {post.pinned?'📌':''}</p><p className="text-sm text-slate-300">{post.message}</p></div>)}</div>)}</div></div></>; }
