import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className="min-h-screen">
      {isHome && <div className="h-1 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500"/>}
      {isHome ? <NavBar /> : null}
      <main className={`${isHome ? 'p-0' : ''}`}>
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


