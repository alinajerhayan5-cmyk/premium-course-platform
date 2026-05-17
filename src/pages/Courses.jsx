import { Bot } from 'lucide-react';

const lessonCards = ['Intro Lesson', 'Prompt Basics', 'Advanced Workflow', 'Case Study'];
const menFolders = ['Things Prompt', 'Model Prompt', 'Shirt Prompt', 'Jacket Prompt', 'Pants Prompt', 'Footwear Prompt'];
const womenFolders = ['Things Prompt', 'Model Prompt', 'Top Prompt', 'Jacket Prompt', 'Pants Prompt', 'Dress Prompt', 'Footwear Prompt', 'Beauty Products Prompt', 'Bag Prompt'];
const chats = ['GENERAL', 'STUDENTS WINS', 'ADMINS UPDATE'];

export default function Courses() {
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
          {lessonCards.map((l) => (
            <div key={l} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <div className="mb-2 aspect-video rounded-lg bg-gradient-to-br from-luxury-violet to-luxury-indigo" />
              <h4 className="font-semibold">{l}</h4>
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
