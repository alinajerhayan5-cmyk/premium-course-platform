import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserId, isDemoMode } from '../lib/supabase';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('pcp_users') || '[]');

    if (mode === 'signup') {
      const user = { name, email, password, user_id: createUserId(), approved: false };
      users.push(user);
      localStorage.setItem('pcp_users', JSON.stringify(users));
      localStorage.setItem('pcp_current_user', JSON.stringify(user));
      navigate('/dashboard');
      return;
    }

    if (mode === 'forgot') {
      setMsg('Password reset requested. In demo mode this is simulated.');
      return;
    }

    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return setMsg('User not found. Try Sign up in demo mode.');
    localStorage.setItem('pcp_current_user', JSON.stringify(found));
    navigate('/dashboard');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md card">
      <h1 className="mb-2 text-2xl font-bold">Student Portal</h1>
      <p className="mb-6 text-sm text-slate-300">{isDemoMode ? 'Demo mode active (missing Supabase keys).' : 'Supabase mode active.'}</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {mode !== 'forgot' && <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
        <button className="btn-primary w-full" type="submit">{mode === 'signup' ? 'Sign up' : mode === 'forgot' ? 'Send Reset Link' : 'Login'}</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button className="btn-secondary" onClick={() => setMode('login')}>Login</button>
        <button className="btn-secondary" onClick={() => setMode('signup')}>Sign up</button>
        <button className="btn-secondary" onClick={() => setMode('forgot')}>Forgot password</button>
      </div>
      <Link to="/admin-login" className="mt-5 inline-block text-luxury-cyan hover:underline">Go to Admin Login</Link>
    </motion.div>
  );
}
