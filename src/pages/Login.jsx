import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? '/api' : 'https://ai-sexdoc-backend.onrender.com';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      if (!data?.token) throw new Error('Missing token');
      login(data.token, data.user || { email, role: data?.user?.role }, data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-[clamp(16px,5vw,40px)] py-10">
      <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
      <p className="text-slate-600 mb-6">Sign in to personalize your experience.</p>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border border-slate-300 rounded-xl px-4 py-3" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full border border-slate-300 rounded-xl px-4 py-3" />
        <button disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="mt-4 text-sm text-slate-600">No account? <Link to="/register">Create one</Link></div>
    </div>
  );
}
