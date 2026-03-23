import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleTheme() {
    const nowDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nowDark);
    try { localStorage.setItem('sera.theme', nowDark ? 'dark' : 'light'); } catch {}
  }

  function goToChat() {
    const done = localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
    setMenuOpen(false);
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-[#0e0e10]/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60'
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1080px] mx-auto h-14 px-5 flex items-center justify-between">

        {/* Logo → home */}
        <Link to="/" className="no-underline flex items-center gap-2 group">
          <div className="relative">
            <img src="/logo-sera.png?v=2" alt="SERA" className="w-6 h-6 rounded-lg transition-transform group-hover:scale-110" loading="lazy" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-zinc-900 dark:text-white">SERA</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </button>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="no-underline text-[13.5px] font-medium px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          ) : (
            <>
              {/* Open chat */}
              <button
                onClick={goToChat}
                className="hidden md:flex text-[13.5px] font-medium px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Open chat
              </button>

              {/* Avatar dropdown */}
              <div className="relative hidden md:block" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen(v => !v)}
                  className="flex items-center justify-center rounded-full ring-2 ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600 transition-all"
                >
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name || 'You'} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {(user?.name || user?.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {avatarOpen && (
                  <div className="absolute right-0 top-10 w-52 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141416] shadow-xl shadow-zinc-900/10 dark:shadow-zinc-900/50 py-1.5 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-[13px] font-semibold text-zinc-900 dark:text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-[11.5px] text-zinc-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { navigate('/settings'); setAvatarOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-zinc-400" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.295.663.67.851 1.11 0 0 .749.36.749 1.89H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Settings
                      </button>
                      <button
                        onClick={() => { goToChat(); setAvatarOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-zinc-400" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Open chat
                      </button>
                    </div>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
                      <button
                        onClick={() => { logout(); setAvatarOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className={`block w-4 h-[1.5px] bg-zinc-800 dark:bg-zinc-200 transition-all origin-center ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-4 h-[1.5px] bg-zinc-800 dark:bg-zinc-200 transition-all ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-4 h-[1.5px] bg-zinc-800 dark:bg-zinc-200 transition-all origin-center ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-200 ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white dark:bg-[#0e0e10] border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
          {isAuthenticated ? (
            <div className="space-y-2">
              {/* User row */}
              <div className="flex items-center gap-3 px-3 py-2">
                {user?.picture
                  ? <img src={user.picture} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                  : <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">{(user?.name || '?')[0].toUpperCase()}</div>
                }
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-zinc-400">{user?.email}</p>
                </div>
              </div>
              <button onClick={goToChat} className="w-full text-[13.5px] font-medium py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                Open chat
              </button>
              <button onClick={() => { navigate('/settings'); setMenuOpen(false); }} className="w-full text-[13.5px] py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                Settings
              </button>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-[13px] py-2 text-red-500">
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="no-underline block text-center text-[13.5px] font-medium py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
