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
  const [loading, setLoading] = useState(false);

  async function onGoogleSuccess(credentialResponse) {
    setError('');
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0e0e10] flex items-center justify-center px-5">
      {/* background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#ff6b6b]/6 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[380px] text-center">

        {/* Orb */}
        <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-[#ff6b6b]/20 blur-xl" />
          <div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 45%, #e84a4a 100%)',
              boxShadow: '0 0 40px rgba(255,107,107,0.3)',
            }}
          />
        </div>

        <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Welcome to SERA
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">
          Sign in to save your conversations<br />and personalize your experience.
        </p>

        {/* Google button */}
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-[13px] text-zinc-400 dark:text-zinc-500">
              <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              Signing in…
            </div>
          ) : (
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              theme="outline"
              size="large"
              shape="pill"
              text="signin_with"
              width="280"
            />
          )}
        </div>

        {error && (
          <p className="mt-5 text-[13px] text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <p className="mt-10 text-[11.5px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
          Private by design. No ads, no tracking.<br />Your conversations stay yours.
        </p>
      </div>
    </div>
  );
}
