import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllSessions } from '../utils/sessions.js';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? '/api' : 'https://ai-sexdoc-backend.onrender.com';

export default function History() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(''); setLoading(true);
      try {
        // Local sessioned history
        const local = getAllSessions();
        // Optional: merge with remote list later
        if (mounted) setSessions(local);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load');
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
        {sessions.map(s => (
          <Link key={s.id} to={`/chat?session=${encodeURIComponent(s.id)}`} className="block no-underline">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900 dark:text-white">{s.title || 'Untitled chat'}</div>
                <div className="text-sm text-slate-500">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {s.messages?.slice(-2).map((m,i) => (
                  <span key={i}>{m.sender}: {m.content}{i === 0 ? ' · ' : ''}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
        {!loading && sessions.length === 0 && <p>No conversations yet.</p>}
      </div>
    </div>
  );
}


