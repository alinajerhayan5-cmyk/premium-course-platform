import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (email === 'admin@platform.com' && password === 'admin123') {
      localStorage.setItem('pcp_admin', '1');
      navigate('/admin');
    } else setErr('Invalid admin credentials');
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
      <form className="space-y-3" onSubmit={submit}>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-300">{err}</p>}
        <button className="btn-primary w-full" type="submit">Login as Admin</button>
      </form>
    </div>
  );
}
