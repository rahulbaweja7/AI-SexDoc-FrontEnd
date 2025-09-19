import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className="min-h-screen">
      <div className="h-1 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500"/>
      <NavBar />
      <main className={`${isHome ? 'p-0' : 'py-8 px-[clamp(16px,5vw,40px)]'}`}>
        <Outlet key={location.pathname} />
      </main>
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400"/>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="no-underline text-slate-600">{children}</Link>
  );
}


