import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar" style={{ width: 240, background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #eee' }}>
        <div>
          <h2 style={{ color: '#ff6b6b' }}>SERA</h2>
          <nav style={{ display: 'grid', gap: 8 }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </div>
        <div className="bottom-options" style={{ display: 'grid', gap: 8 }}>
          <a href="#">Settings</a>
          <Link to="/">Logout</Link>
        </div>
      </aside>
      <main className="main-panel" style={{ flex: 1, padding: '48px 64px' }}>
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: '#555' }}>{children}</Link>
  );
}


