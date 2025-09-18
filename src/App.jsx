import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className={`${isHome ? 'p-0' : 'py-8 px-[clamp(16px,5vw,40px)]'}`}>
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="no-underline text-slate-600">{children}</Link>
  );
}


