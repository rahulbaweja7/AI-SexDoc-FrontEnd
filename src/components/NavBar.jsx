import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }

  function goToChat() {
    const done = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="w-full max-w-[1200px] mx-auto py-3 px-[clamp(16px,5vw,40px)] flex items-center justify-between">
        <Link to="/" className="no-underline flex items-center gap-2">
          <img src="/logo-sera.png?v=2" alt="SERA" className="w-7 h-7 rounded" loading="lazy" />
          <span className="text-slate-900 font-extrabold text-[20px] tracking-[0.2px]">S<span className="text-[#ff6b6b]">ERA</span></span>
        </Link>
        <nav className={`${open ? 'grid gap-2' : 'hidden md:flex md:items-center md:gap-4'}`}>
          <Link to="/" className={`no-underline px-3 py-1.5 rounded-md ${pathname === '/' ? 'text-slate-900 bg-slate-100 border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>Home</Link>
          <Link to="/history" className={`no-underline px-3 py-1.5 rounded-md ${pathname.startsWith('/history') ? 'text-slate-900 bg-slate-100 border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>History</Link>
          <Link to="/about" className={`no-underline px-3 py-1.5 rounded-md ${pathname.startsWith('/about') ? 'text-slate-900 bg-slate-100 border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn-primary hidden md:inline-flex" onClick={goToChat}>Go to Chat</button>
          <button onClick={toggleTheme} className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white">🌓</button>
          <button aria-label="Menu" className="inline-flex md:hidden w-[38px] h-[38px] rounded-lg border border-slate-200 bg-white items-center justify-center gap-1.5 flex-col" onClick={() => setOpen(v => !v)}>
            <span className="block w-[18px] h-[2px] bg-slate-900"></span>
            <span className="block w-[18px] h-[2px] bg-slate-900"></span>
            <span className="block w-[18px] h-[2px] bg-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
}


