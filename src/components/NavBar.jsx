import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  function toggleTheme() {
    const el = document.documentElement;
    const nowDark = !el.classList.contains('dark');
    el.classList.toggle('dark', nowDark);
    try { localStorage.setItem('sera.theme', nowDark ? 'dark' : 'light'); } catch {}
  }

  function goToChat() {
    const done = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="w-full max-w-[1200px] mx-auto py-3 px-[clamp(16px,5vw,40px)] flex items-center justify-between">
        <Link to="/" className="no-underline flex items-center gap-2">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-7 h-7 rounded" loading="lazy" />
          <span className="text-slate-900 dark:text-white font-extrabold text-[20px] tracking-[0.2px]">S<span className="text-[#ff6b6b]">ERA</span></span>
        </Link>
        <nav className={`${open ? 'grid gap-2' : 'hidden md:flex md:items-center md:gap-4'}`}>
          <Link to="/" className={`no-underline px-3 py-1.5 rounded-md ${pathname === '/' ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>Home</Link>
          <Link to="/history" className={`no-underline px-3 py-1.5 rounded-md ${pathname.startsWith('/history') ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>History</Link>
          <Link to="/about" className={`no-underline px-3 py-1.5 rounded-md ${pathname.startsWith('/about') ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>About</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`no-underline px-3 py-1.5 rounded-md ${pathname.startsWith('/admin') ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="no-underline px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700">Sign in</Link>
              <Link to="/register" className="btn-primary">Create account</Link>
            </>
          ) : (
            <>
              <span className="hidden md:inline text-slate-600 dark:text-slate-300">Hi, {user?.name || user?.email || 'you'}</span>
              <button className="btn-primary hidden md:inline-flex" onClick={goToChat}>Go to Chat</button>
              <button onClick={logout} className="no-underline px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700">Sign out</button>
            </>
          )}
          <button onClick={toggleTheme} className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">🌓</button>
          <button aria-label="Menu" className="inline-flex md:hidden w-[38px] h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center gap-1.5 flex-col" onClick={() => setOpen(v => !v)}>
            <span className="block w-[18px] h-[2px] bg-slate-900 dark:bg-white"></span>
            <span className="block w-[18px] h-[2px] bg-slate-900 dark:bg-white"></span>
            <span className="block w-[18px] h-[2px] bg-slate-900 dark:bg-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}


