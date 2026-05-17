import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setErr('This account is not an admin.');
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="mb-4 text-2xl font-bold">Creators Vaultz Admin</h1>
      <form className="space-y-3" onSubmit={submit}>
        <input className="input" type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-300">{err}</p>}
        <button className="btn-primary w-full" type="submit">Login as Admin</button>
      </form>
    </div>
  );
}
