import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? '/api'
  : 'https://ai-sexdoc-backend.onrender.com';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Get user info from Google using the access token
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        // Send to our backend
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token, userInfo }),
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
    },
    onError: () => setError('Google sign-in failed. Please try again.'),
  });

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#0a0a0b] relative overflow-hidden px-14 py-12">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff6b6b]/8 blur-[120px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-7 h-7 rounded-lg" />
          <span className="text-[15px] font-semibold text-white tracking-tight">SERA</span>
        </div>

        {/* Center copy */}
        <div className="relative my-auto max-w-[400px]">
          <div className="w-10 h-10 rounded-xl mb-8" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)', boxShadow: '0 0 40px rgba(255,107,107,0.25)' }} />
          <h1 className="text-[40px] font-bold tracking-[-0.03em] leading-[1.1] text-white mb-5">
            The questions you've been afraid to ask out loud.
          </h1>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Warm, private, judgment-free guidance on sexual health and relationships.
          </p>
        </div>

        {/* Bottom pills */}
        <div className="relative flex items-center gap-8">
          {[['Private', 'No data sold, ever'], ['Judgment-free', 'Ask anything'], ['Always here', '24/7, no wait']].map(([label, desc]) => (
            <div key={label}>
              <p className="text-[12px] font-semibold text-white">{label}</p>
              <p className="text-[11.5px] text-zinc-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col w-full lg:w-[420px] lg:flex-none bg-[#f9f9f7] dark:bg-[#111113]">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-8 pt-10 mb-8">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-6 h-6 rounded-md" />
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">SERA</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          <div className="max-w-[320px]">

            <h2 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-white mb-1.5">
              Welcome back
            </h2>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-10">
              Sign in to continue to SERA
            </p>

            {/* Custom Google button */}
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin flex-shrink-0" />
                  <span className="text-[14px] font-medium text-zinc-600 dark:text-zinc-300">Signing in…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="text-[14px] font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 text-[13px] text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[11.5px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
                SERA is not a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.
              </p>
            </div>
          </div>
        </div>

        <div className="px-10 pb-8">
          <p className="text-[11.5px] text-zinc-400 dark:text-zinc-600">
            Private by design · No ads · No tracking
          </p>
        </div>
      </div>
    </div>
  );
}
