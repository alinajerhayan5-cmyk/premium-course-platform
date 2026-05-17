import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserId, supabase } from '../lib/supabase';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            email,
            approved: false,
            role: 'student',
            user_id: createUserId()
          });
          if (profileError) throw profileError;
        }

        setMsg('Signup successful. Check your email confirmation if enabled, then login.');
        setMode('login');
        return;
      }

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        setMsg('Password reset email sent.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md card">
      <h1 className="mb-2 text-2xl font-bold">Creators Vaultz</h1>
      <p className="mb-6 text-sm text-slate-300">Creators Vaultz • Student Access</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {mode !== 'forgot' && <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-50" type="submit">{loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : mode === 'forgot' ? 'Send Reset Link' : 'Login'}</button>
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
