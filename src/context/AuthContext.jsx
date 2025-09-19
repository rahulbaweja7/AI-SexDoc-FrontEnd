import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? '/api' : 'https://ai-sexdoc-backend.onrender.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('sera.jwt') || '' : '');
  const [refreshToken, setRefreshToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('sera.refresh') || '' : '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sera.user') || 'null'); } catch { return null; }
  });

  useEffect(() => { token ? localStorage.setItem('sera.jwt', token) : localStorage.removeItem('sera.jwt'); }, [token]);
  useEffect(() => { refreshToken ? localStorage.setItem('sera.refresh', refreshToken) : localStorage.removeItem('sera.refresh'); }, [refreshToken]);
  useEffect(() => { user ? localStorage.setItem('sera.user', JSON.stringify(user)) : localStorage.removeItem('sera.user'); }, [user]);

  async function refresh() {
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token) return false;
      setToken(data.token);
      if (data?.refreshToken) setRefreshToken(data.refreshToken);
      if (data?.user) setUser(data.user);
      return true;
    } catch { return false; }
  }

  async function fetchWithAuth(input, init = {}) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    let res = await fetch(input, { ...init, headers });
    if (res.status === 401 && await refresh()) {
      const headers2 = new Headers(init.headers || {});
      if (token) headers2.set('Authorization', `Bearer ${localStorage.getItem('sera.jwt')}`);
      headers2.set('Content-Type', headers2.get('Content-Type') || 'application/json');
      res = await fetch(input, { ...init, headers: headers2 });
    }
    return res;
  }

  const value = useMemo(() => ({
    token,
    refreshToken,
    user,
    isAuthenticated: Boolean(token),
    login: (jwt, profile, rTok) => { setToken(jwt); if (profile) setUser(profile); if (rTok) setRefreshToken(rTok); },
    logout: () => { setToken(''); setUser(null); setRefreshToken(''); },
    refresh,
    fetchWithAuth,
  }), [token, refreshToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
