// staff-pages.js: staff ke saare pages
let page = 'Dashboard';
let data = { complaints: [], notices: [], notes: { items: [], unread: 0 } };
const FORM_PAGES = ['Change Password'];   // is page par auto refresh nahi

const CAT_ICON = { Electrical: 'zap', Plumbing: 'drop', Cleaning: 'trash', Internet: 'wifi' };
const badge = s => `<span class="bd ${s.replace(' ', '-')}">${s}</span>`;
const day = d => new Date(d).toLocaleDateString();

// Sirf wahi data lo jo page ko chahiye
async function load() {
  const jobs = { notes: api('/notifications') };
  if (['Dashboard', 'My Complaints', 'Completed Work'].includes(page)) jobs.complaints = api('/complaints');
  if (page === 'Notice Board') jobs.notices = api('/notices');
  const keys = Object.keys(jobs);
  const results = await Promise.all(Object.values(jobs));
  keys.forEach((k, i) => data[k] = results[i]);
}

// ---------- chhote parts ----------
// Upar ke 4 cards (Total, Pending, In Progress, Resolved)
function cards(a) {
  const list = [['Total', a.length, 'file'], ['Pending', a.filter(c => c.status === 'Pending').length, 'clock'],
    ['In Progress', a.filter(c => c.status === 'In Progress').length, 'tool'], ['Resolved', a.filter(c => c.status === 'Resolved').length, 'check']];
  return `<div class="cards">${list.map((x, i) => `<div class="c k${i}"><em>${ic(x[2], 22)}</em><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>`;
}

// Complaints ki table. canEdit = true ho to status dropdown se badal sakte hain
function table(a, canEdit) {
  if (!a.length) return '<div class="pn"><p class="empty">Nothing here yet.</p></div>';
  const rows = a.map(c => {
    let status = badge(c.status);
    if (canEdit) {
      status = `<select onchange="act(() => api('/complaints/${c.id}/status', 'PATCH', { status: this.value }), 'Status updated')">
        ${STATUSES.map(s => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
    }
    return `<tr><td>${c.id}</td><td>${ic(CAT_ICON[c.category], 15)} ${esc(c.category)}</td>
      <td>${esc(c.description)}<br><small>${day(c.created_at)} - Best time: ${esc(c.visit_time)}</small></td>
      <td class="${c.priority}">${c.priority}</td>
      <td>${esc(c.resident_name)}<br><small>${esc(c.room)}</small></td>
      <td>${status}</td></tr>`;
  }).join('');
  return `<div class="pn"><table><tr><th>#</th><th>Category</th><th>Problem</th><th>Priority</th><th>Resident</th><th>Status</th></tr>${rows}</table></div>`;
}

// ---------- pages ----------
function content() {
  const a = data.complaints;
  switch (page) {

    // ===== Dashboard =====
    case 'Dashboard': {
      const h = new Date().getHours(), hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      const done = a.filter(c => c.status === 'Resolved').length, prog = a.filter(c => c.status === 'In Progress').length;
      const r = a.length ? Math.round(done / a.length * 100) : 0, p = a.length ? Math.round(prog / a.length * 100) : 0;
      return `<div class="hero"><div><h2>${hello}, ${esc(me.name.split(' ')[0])}</h2><p class="sub">${new Date().toDateString()}. Showing complaints assigned to you.</p></div></div>
        ${cards(a)}
        <div class="pn"><h3>Resolution rate</h3><div class="dnw">
          <div class="dn" style="background:conic-gradient(var(--ok) 0 ${r}%,#3b6bff ${r}% ${r + p}%,#f5a524 ${r + p}% 100%)"><div>${a.length ? r + '%' : '-'}</div></div>
          <div class="lgd"><div><i style="background:var(--ok)"></i>Resolved</div><div><i style="background:#3b6bff"></i>In Progress</div><div><i style="background:#f5a524"></i>Pending</div></div>
        </div></div>
        <h3>Latest complaints</h3>${table(a.slice(0, 5), false)}`;
    }
    // ===== My Complaints (jo abhi baaki hain, status yahin se badlo) =====
    case 'My Complaints':
      return `<h2>My complaints</h2><p class="sub">Complaints assigned to you. Change the status from the table.</p>
        ${table(a.filter(c => c.status !== 'Resolved'), true)}`;
    
        // ===== Completed Work (resolved complaints) =====
    case 'Completed Work':
      return `<h2>Completed work</h2><p class="sub">Complaints you have resolved.</p>
        ${table(a.filter(c => c.status === 'Resolved'), false)}`;
        // ADD NEW PAGES ABOVE THIS LINE

    default:
      return '<h2>Coming soon</h2><p class="sub">This page is not ready yet.</p>';
  }
}

// ---------- screen draw ----------
const bellHtml = () => `${ic('bell', 21)}${data.notes.unread ? `<i>${data.notes.unread}</i>` : ''}`;

async function render() {
  try { await load(); } catch (e) { toast(e.message); return; }
  $('#content').innerHTML = content();
  $('#bell').innerHTML = bellHtml();
  $('#top-name').textContent = me.name;
  $('#av').textContent = me.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (page === 'Notifications' && data.notes.unread) api('/notifications/read', 'POST').catch(() => {});
}

function showPage(name) { page = name; setActive(name); render(); }

// Action chalao, message dikhao, page dobara draw karo
async function act(fn, okMessage) {
  try { await fn(); if (okMessage) toast(okMessage); } catch (e) { toast(e.message); }
  render();
}

// ---------- forms ----------
// ADD NEW FUNCTIONS ABOVE THIS LINE

// Har 15 second mein naya data (form wale pages par nahi, taaki typing na mite)
setInterval(async () => {
  if (document.hidden) return;
  if (FORM_PAGES.includes(page)) {
    try { data.notes = await api('/notifications'); $('#bell').innerHTML = bellHtml(); } catch {}
  } else render();
}, 15000);

render();