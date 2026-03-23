import React, { createContext, useContext, useMemo, useState } from 'react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? '/api'
  : 'https://ai-sexdoc-backend.onrender.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sera.jwt') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sera.user') || 'null'); } catch { return null; }
  });

  function login(jwt, profile) {
    setToken(jwt);
    if (profile) setUser(profile);
    localStorage.setItem('sera.jwt', jwt);
    if (profile) localStorage.setItem('sera.user', JSON.stringify(profile));
  }

  function logout() {
    setToken('');
    setUser(null);
    localStorage.removeItem('sera.jwt');
    localStorage.removeItem('sera.user');
    localStorage.removeItem('sera.refresh');
  }

  async function fetchWithAuth(input, init = {}) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/json');
    return fetch(input, { ...init, headers });
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    fetchWithAuth,
    API_BASE,
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
