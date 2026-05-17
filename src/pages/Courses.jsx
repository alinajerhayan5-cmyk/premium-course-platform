import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const menFolders = ['Things Prompt', 'Model Prompt', 'Shirt Prompt', 'Jacket Prompt', 'Pants Prompt', 'Footwear Prompt'];
const womenFolders = ['Things Prompt', 'Model Prompt', 'Top Prompt', 'Jacket Prompt', 'Pants Prompt', 'Dress Prompt', 'Footwear Prompt', 'Beauty Products Prompt', 'Bag Prompt'];
const chats = ['GENERAL', 'STUDENTS WINS', 'ADMINS UPDATE'];

export default function Courses() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    supabase.from('lessons').select('*').order('created_at', { ascending: false }).then(({ data }) => setLessons(data || []));
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="card space-y-4">
        <h3 className="font-bold">Navigation</h3>
        <div><p className="font-semibold text-luxury-cyan">1. Lesson</p></div>
        <div><p className="font-semibold text-luxury-cyan">2. Men Section</p>{menFolders.map((f) => <p className="text-sm text-slate-300" key={f}>• {f}</p>)}</div>
        <div><p className="font-semibold text-luxury-cyan">3. Women Section</p>{womenFolders.map((f) => <p className="text-sm text-slate-300" key={f}>• {f}</p>)}</div>
        <div><p className="font-semibold text-luxury-cyan">4. Group Chats</p>{chats.map((f) => <p className="text-sm text-slate-300" key={f}>• {f}</p>)}</div>
      </aside>
      <main className="card">
        <h2 className="mb-4 text-xl font-bold">Lesson Videos</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((l) => (
            <div key={l.id} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              {l.thumbnail_url ? <img src={l.thumbnail_url} alt={l.title} className="mb-2 aspect-video w-full rounded-lg object-cover" /> : <div className="mb-2 aspect-video rounded-lg bg-gradient-to-br from-luxury-violet to-luxury-indigo" />}
              <h4 className="font-semibold">{l.title}</h4>
              <p className="text-sm text-slate-300">{l.duration}</p>
              {l.video_url && <a href={l.video_url} target="_blank" rel="noreferrer" className="text-luxury-cyan text-sm">Open Video</a>}
            </div>
          ))}
        </div>
      </main>
      <button className="fixed bottom-6 right-6 rounded-full bg-luxury-accent p-4 text-white shadow-glow" aria-label="chatbot">
        <Bot />
      </button>
    </div>
  );
}
