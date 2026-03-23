import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? '/api'
  : 'https://ai-sexdoc-backend.onrender.com';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function onGoogleSuccess(credentialResponse) {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Sign in failed');
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-[clamp(16px,5vw,40px)] py-16 flex flex-col items-center text-center">
      <h1 className="text-2xl font-extrabold mb-2">Welcome to SERA</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Sign in to save your conversations and personalize your experience.</p>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <GoogleLogin
        onSuccess={onGoogleSuccess}
        onError={() => setError('Google sign-in failed. Please try again.')}
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="280"
      />
    </div>
  );
}
