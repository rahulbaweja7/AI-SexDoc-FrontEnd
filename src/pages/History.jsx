import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? '/api' : 'https://ai-sexdoc-backend.onrender.com';

export default function History() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(''); setLoading(true);
      try {
        let list = [];
        if (isAuthenticated) {
          const res = await fetchWithAuth(`${API_BASE}/history`, { method: 'GET' });
          const data = await res.json().catch(() => ([]));
          if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
          list = Array.isArray(data) ? data : (data?.items || []);
        } else {
          const raw = localStorage.getItem('sera.localHistory');
          list = raw ? JSON.parse(raw) : [];
        }
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load history');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [fetchWithAuth, isAuthenticated]);

  return (
    <div className="max-w-[900px] mx-auto px-[clamp(16px,5vw,40px)] py-8">
      <h1 className="text-2xl font-extrabold mb-3">Your chat history</h1>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-500 mb-1">{new Date(it.timestamp || Date.now()).toLocaleString()}</div>
            <div className="font-semibold">You: {it.userMessage}</div>
            <div className="text-slate-700 dark:text-slate-300">SERA: {it.reply}</div>
          </div>
        ))}
        {!loading && items.length === 0 && <p>No history yet.</p>}
      </div>
    </div>
  );
}


