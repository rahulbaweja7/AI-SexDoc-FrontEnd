// MongoDB-backed session API — used when user is logged in
// Falls back to localStorage (sessions.js) when logged out

const API_BASE = import.meta.env.VITE_API_URL || 'https://ai-sexdoc-backend.onrender.com';

function getToken() {
  return localStorage.getItem('sera.jwt');
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function dbGetSessions() {
  const res = await fetch(`${API_BASE}/sessions`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const sessions = await res.json();
  // Normalize to same shape as localStorage sessions
  return sessions.map(s => ({
    id: s._id,
    title: s.title,
    createdAt: new Date(s.createdAt).getTime(),
    updatedAt: new Date(s.updatedAt).getTime(),
    messages: [],
  }));
}

export async function dbCreateSession(title) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title: title || 'New chat' }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  const s = await res.json();
  return { id: s._id || s.id, title: s.title, createdAt: new Date(s.createdAt).getTime(), updatedAt: new Date(s.updatedAt).getTime(), messages: [] };
}

export async function dbGetSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch session');
  const s = await res.json();
  return {
    id: s._id,
    title: s.title,
    createdAt: new Date(s.createdAt).getTime(),
    updatedAt: new Date(s.updatedAt).getTime(),
    messages: s.messages || [],
  };
}

export async function dbRenameSession(id, title) {
  await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
}

export async function dbDeleteSession(id) {
  await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function dbSaveMessages(id, messages) {
  await fetch(`${API_BASE}/sessions/${id}/messages/bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
}
