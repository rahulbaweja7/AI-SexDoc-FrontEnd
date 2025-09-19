import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? '/api' : 'https://ai-sexdoc-backend.onrender.com';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setConflict(false); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setConflict(true);
          setError(data?.message || 'Email already in use.');
          return; // don't throw; we handled it
        }
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      if (!data?.token) throw new Error('Missing token');
      login(data.token, data.user || { email, name, role: data?.user?.role }, data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-[clamp(16px,5vw,40px)] py-10">
      <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
      <p className="text-slate-600 mb-6">Personalize SERA with a secure login.</p>
      {error && (
        <div className="mb-4 p-3 rounded-xl border border-slate-200 bg-white text-slate-800">
          {error}
          {conflict && (
            <div className="mt-2 text-sm">
              Already have an account? <button onClick={() => navigate('/login')} className="underline">Sign in</button>
            </div>
          )}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full border border-slate-300 rounded-xl px-4 py-3" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border border-slate-300 rounded-xl px-4 py-3" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full border border-slate-300 rounded-xl px-4 py-3" />
        <button disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <div className="mt-4 text-sm text-slate-600">Have an account? <Link to="/login">Sign in</Link></div>
    </div>
  );
}
