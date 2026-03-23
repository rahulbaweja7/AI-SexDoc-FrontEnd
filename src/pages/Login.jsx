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
    <div className="min-h-screen flex">

      {/* ── Left panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#0a0a0b] relative overflow-hidden px-14 py-12">
        {/* grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff6b6b]/8 blur-[120px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-auto">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-7 h-7 rounded-lg" />
          <span className="text-[16px] font-semibold text-white">SERA</span>
        </div>

        {/* Center copy */}
        <div className="relative my-auto max-w-[420px]">
          <div className="w-10 h-10 rounded-xl mb-8 flex-shrink-0" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }} />
          <h1 className="text-[38px] font-bold tracking-[-0.03em] leading-[1.15] text-white mb-5">
            The questions you've been afraid to ask out loud.
          </h1>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Warm, private, judgment-free guidance on sexual health and relationships. Always here, never tracking.
          </p>
        </div>

        {/* Bottom features */}
        <div className="relative mt-auto flex items-center gap-8">
          {[
            ['Private', 'No data sold, ever'],
            ['Judgment-free', 'Ask anything'],
            ['Always here', '24/7, no wait'],
          ].map(([label, desc]) => (
            <div key={label}>
              <p className="text-[12px] font-semibold text-white">{label}</p>
              <p className="text-[11.5px] text-zinc-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col w-full lg:w-[440px] lg:flex-none bg-[#f9f9f7] dark:bg-[#111113] relative">
        {/* mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-8 pt-10 mb-auto">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-6 h-6 rounded-md" />
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">SERA</span>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center flex-1 px-10 py-16 max-w-[380px] mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              Sign in to continue to SERA
            </p>
          </div>

          {/* Google button container */}
          <div className={`rounded-2xl overflow-hidden border transition-colors ${
            loading
              ? 'border-zinc-200 dark:border-zinc-700'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
          }`}>
            {loading ? (
              <div className="flex items-center justify-center gap-3 h-12 bg-white dark:bg-[#1a1a1d] text-[14px] text-zinc-500 dark:text-zinc-400">
                <span className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
                Signing in…
              </div>
            ) : (
              <div className="flex justify-center items-center bg-white dark:bg-[#1a1a1d] py-1">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                  width="340"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-[13px] text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
              By signing in you agree that SERA is not a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="px-10 pb-8 max-w-[380px] mx-auto w-full">
          <p className="text-[11.5px] text-zinc-400 dark:text-zinc-600">
            Private by design · No ads · No tracking
          </p>
        </div>
      </div>
    </div>
  );
}
