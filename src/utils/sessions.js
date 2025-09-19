export function createSession(title) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const now = Date.now();
  const session = { id, title: title || 'New chat', createdAt: now, updatedAt: now, messages: [] };
  const all = getAllSessions();
  all.unshift(session);
  saveAllSessions(all);
  return session;
}

export function getAllSessions() {
  try { return JSON.parse(localStorage.getItem('sera.sessions') || '[]'); } catch { return []; }
}

export function saveAllSessions(list) {
  try { localStorage.setItem('sera.sessions', JSON.stringify(list.slice(0, 200))); } catch {}
}

export function getSession(id) {
  return getAllSessions().find(s => s.id === id) || null;
}

export function addMessageToSession(id, message) {
  const all = getAllSessions();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return;
  all[idx].messages.push(message);
  all[idx].updatedAt = Date.now();
  if (!all[idx].title && message.sender === 'You') all[idx].title = message.content.slice(0, 60);
  saveAllSessions(all);
}

export function renameSession(id, title) {
  const all = getAllSessions();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return;
  all[idx].title = title;
  saveAllSessions(all);
}

export function deleteSession(id) {
  const all = getAllSessions().filter(s => s.id !== id);
  saveAllSessions(all);
}
