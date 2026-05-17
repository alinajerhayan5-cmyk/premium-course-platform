import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureProfileForUser, supabase } from '../lib/supabase';

function safeAdminLog(step, payload = {}) {
  const safePayload = {
    ...payload,
    email: payload.email ? String(payload.email).replace(/(^.).+(@.*$)/, '$1***$2') : undefined
  };
  console.info(`[AdminLogin] ${step}`, safePayload);
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const authUser = signInData?.user;
      if (!authUser) throw new Error('Authentication succeeded but no user was returned.');

      safeAdminLog('signed_in', { userId: authUser.id, email: authUser.email });

      const profile = await ensureProfileForUser(authUser);

      safeAdminLog('profile_loaded', {
        userId: authUser.id,
        email: authUser.email,
        profileFound: Boolean(profile),
        profileRole: profile?.role,
        profileApproved: profile?.approved
      });

      if (!profile || profile.role !== 'admin' || profile.approved !== true) {
        await supabase.auth.signOut();
        setErr('This account is not an approved admin.');
        return;
      }

      navigate('/admin');
    } catch (caughtError) {
      setErr(caughtError?.message || 'Unable to login as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="mb-4 text-2xl font-bold">Creators Vaultz Admin</h1>
      <form className="space-y-3" onSubmit={submit}>
        <input className="input" type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-300">{err}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60" type="submit">{loading ? 'Checking…' : 'Login as Admin'}</button>
      </form>
    </div>
  );
}
