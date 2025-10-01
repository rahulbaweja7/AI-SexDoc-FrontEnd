import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  // Apply persisted theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sera.theme');
      const shouldDark = saved ? saved === 'dark' : false; // default to light unless explicitly set
      document.documentElement.classList.toggle('dark', shouldDark);
    } catch {}
  }, []);
  return (
    <div className="min-h-screen">
      {isHome && <div className="h-1 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500"/>}
      <NavBar />
      <main className={`${isHome ? 'pt-[56px]' : 'pt-[56px]'}`}>
        <Outlet key={location.pathname} />
      </main>
      {isHome && <div className="h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400"/>}
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="no-underline text-slate-600">{children}</Link>
  );
}


