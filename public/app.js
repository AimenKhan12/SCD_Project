// app.js: shared helpers. Har page isko sabse pehle load karta hai.
const CATEGORIES = ['Electrical', 'Plumbing', 'Cleaning', 'Internet'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

// Role ke hisaab se kaunsa page kholna hai
const home = u => !u ? '/login.html' : u.role === 'resident' ? '/resident.html' : u.role === 'admin' ? '/admin.html' : '/staff.html';

// Icons. Use: ic('bell', 20)
const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  key: '<circle cx="8" cy="15" r="5"/><path d="M12 11l9-9M18 5l3 3M15 8l2 2"/>',
  check: '<path d="M22 11v1a10 10 0 1 1-6-9.1"/><path d="M22 4L12 14l-3-3"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  mega: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19 5a10 10 0 0 1 0 14M15.5 8.5a5 5 0 0 1 0 7"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
  drop: '<path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z"/>',
  wifi: '<path d="M5 12.5a11 11 0 0 1 14 0M1.4 9a16 16 0 0 1 21.2 0M8.5 16.1a6 6 0 0 1 7 0M12 20h.01"/>',
  trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3 1.2-6.8-5-4.9 6.9-1z"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'
};

const ic = (name, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

// HostelCare logo
const LOGO = `<div class="logo"><svg viewBox="0 0 40 40" width="42" height="42"><defs><linearGradient id="lgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f9b8e"/><stop offset="1" stop-color="#0a4a5a"/></linearGradient></defs><rect width="40" height="40" rx="10" fill="url(#lgg)"/><path d="M9 19.5 20 10l11 9.5V31H9z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="m15.5 22 3.6 3.6 6-6.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>HostelCare</b><small>Complaint Management</small></div></div>`;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
const saveSession = d => { localStorage.setItem('token', d.token); localStorage.setItem('user', JSON.stringify(d.user)); };
const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); location.href = '/login.html'; };   // sirf login hataya, theme yaad rehti hai

// Neeche chhota message
function toast(msg) {
  const d = document.createElement('div');
  d.className = 'tt';
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}

// Complaint ki timeline popup mein dikhana (teeno panels mein yahi function chalta hai)
async function track(id) {
  try {
    const steps = await api('/complaints/' + id + '/history');
    const items = steps.map(h => `<li><b>${esc(h.status)}</b><br><small>${new Date(h.created_at).toLocaleString()}${h.note ? ' - ' + esc(h.note) : ''}</small></li>`).join('');
    document.body.insertAdjacentHTML('beforeend',
      `<div class="tl-bg" onclick="this.remove()"><div class="tl-box" onclick="event.stopPropagation()">
         <h3>Complaint #${id} timeline</h3><ul class="tl">${items}</ul>
         <button class="btn" onclick="this.closest('.tl-bg').remove()">Close</button></div></div>`);
  } catch (e) { toast(e.message); }
}

// Server se baat karne ke liye. Example: api('/login', 'POST', { ... })
async function api(path, method = 'GET', body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && localStorage.getItem('token')) logout();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}