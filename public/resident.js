// Resident portal. Sidebar ka har item ek page hai.
const me = getUser();
if (!me || !localStorage.getItem('token')) location.href = '/login.html';
if (me && me.role !== 'resident') location.href = home(me);

const MENU = ['Dashboard', 'New Complaint', 'My Complaints', 'History', 'Notice Board', 'Notifications', 'Change Password'];
const ICON = { 'Dashboard': 'grid', 'New Complaint': 'plus', 'My Complaints': 'file', 'History': 'clock', 'Notice Board': 'mega', 'Notifications': 'bell', 'Change Password': 'key' };
const CAT_ICON = { Electrical: 'zap', Plumbing: 'drop', Cleaning: 'trash', Internet: 'wifi' };
const FORM_VIEWS = ['New Complaint', 'Change Password'];   // in pages par auto refresh nahi

let view = 'Dashboard';
let data = { complaints: [], notices: [], notes: { items: [], unread: 0 } };

const badge = s => `<span class="bd ${s.replace(' ', '-')}">${s}</span>`;
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const day = d => new Date(d).toLocaleDateString();
const options = list => list.map(x => `<option>${x}</option>`).join('');

// Server se sirf wahi data lo jo current page ko chahiye
async function load() {
  const jobs = { notes: api('/notifications') };
  if (['Dashboard', 'My Complaints', 'History'].includes(view)) jobs.complaints = api('/complaints');
  if (view === 'Notice Board') jobs.notices = api('/notices');
  const keys = Object.keys(jobs);
  const results = await Promise.all(Object.values(jobs));
  keys.forEach((k, i) => data[k] = results[i]);
}

// ---------- chhote parts ----------
function cards(a) {
  const list = [
    ['Total', a.length, 'file'],
    ['Pending', a.filter(c => c.status === 'Pending').length, 'clock'],
    ['In Progress', a.filter(c => c.status === 'In Progress').length, 'tool'],
    ['Resolved', a.filter(c => c.status === 'Resolved').length, 'check']
  ];
  return `<div class="cards">${list.map((x, i) =>
    `<div class="c k${i}"><em>${ic(x[2], 22)}</em><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>`;
}

function bars(rows) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return rows.map(r => `<div class="row"><span>${esc(r[0])}</span><div class="bar" style="width:${r[1] / max * 58 + 3}%"></div><b>${r[1]}</b></div>`).join('');
}

// Complaints table. opts.rate = rating column, opts.del = delete icon column
function table(a, opts = {}) {
  if (!a.length) return '<div class="pn"><p class="empty">Nothing here yet.</p></div>';
  const head = `<th>#</th><th>Category</th><th>Problem</th><th>Priority</th><th>Staff</th><th>Status</th>${opts.rate ? '<th>Rating</th>' : ''}${opts.del ? '<th></th>' : ''}`;
  const rows = a.map(c => {
    const rate = opts.rate
      ? `<td>${c.rating
          ? `<span class="st">${stars(c.rating)}</span>`
          : `<select onchange="rate(${c.id}, this.value)"><option value="">Rate</option>${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${n} star${n > 1 ? 's' : ''}</option>`).join('')}</select>`}</td>`
      : '';
    // Delete icon sirf Pending complaint par dikhta hai
    const del = opts.del
      ? `<td>${c.status === 'Pending'
          ? `<button class="icon-del" title="Delete complaint" onclick="deleteComplaint(${c.id})">${ic('trash', 16)}</button>`
          : ''}</td>`
      : '';
    return `<tr><td>${c.id}</td>
      <td>${ic(CAT_ICON[c.category], 15)} ${esc(c.category)}</td>
      <td>${esc(c.description)}<br><small>${day(c.created_at)} - Best time: ${esc(c.visit_time)}</small></td>
      <td class="${c.priority}">${c.priority}</td>
      <td>${esc(c.staff_name || 'Unassigned')}</td>
      <td>${badge(c.status)}</td>${rate}${del}</tr>`;
  }).join('');
  return `<div class="pn"><table><tr>${head}</tr>${rows}</table></div>`;
}

// ---------- pages ----------
function page() {
  const a = data.complaints;
  switch (view) {
    case 'Dashboard': {
      const h = new Date().getHours();
      const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      const done = a.filter(c => c.status === 'Resolved').length;
      const prog = a.filter(c => c.status === 'In Progress').length;
      const r = a.length ? Math.round(done / a.length * 100) : 0;
      const p = a.length ? Math.round(prog / a.length * 100) : 0;
      return `<div class="hero"><div><h2>${hello}, ${esc(me.name.split(' ')[0])}</h2><p class="sub">${new Date().toDateString()} - ${esc(me.room || '')}</p></div>
        <button class="btn" onclick="go('New Complaint')">${ic('plus', 16)} New complaint</button></div>
        ${cards(a)}
        <div class="g2">
          <div class="pn"><h3>Resolution rate</h3><div class="dnw">
            <div class="dn" style="background:conic-gradient(var(--ok) 0 ${r}%,#3b6bff ${r}% ${r + p}%,#f5a524 ${r + p}% 100%)"><div>${a.length ? r + '%' : '-'}</div></div>
            <div class="lgd"><div><i style="background:var(--ok)"></i>Resolved</div><div><i style="background:#3b6bff"></i>In Progress</div><div><i style="background:#f5a524"></i>Pending</div></div>
          </div></div>
          <div class="pn"><h3>Complaints by category</h3>${bars(CATEGORIES.map(c => [c, a.filter(x => x.category === c).length]))}</div>
        </div>
        <h3>Latest complaints</h3>${table(a.slice(0, 5))}`;
    }
    case 'New Complaint':
      // Heading left par hai, form box beech mein (margin: 0 auto)
      return `<h2>New complaint</h2><p class="sub">It goes to the staff member with the least open work in that category.</p>
        <div class="pn fm" style="margin:0 auto 14px">
          <label>Category</label><select id="nc">${options(CATEGORIES)}</select>
          <label>Priority</label><select id="np"><option>Normal</option><option>Urgent</option><option>Low</option></select>
          <label>Best time for a visit to your room</label><select id="nt">${options(['Anytime', 'Morning', 'Afternoon', 'Evening', 'After 5 PM'])}</select>
          <label>Describe the problem (at least 10 characters)</label><textarea id="nd" rows="3" maxlength="500"></textarea>
          <button class="btn full" onclick="submitComplaint()">${ic('check', 16)} Submit complaint</button>
        </div>`;
    case 'My Complaints':
      return `<h2>My complaints</h2><p class="sub">All complaints you have submitted. You can delete a complaint while it is Pending.</p>${table(a, { del: true })}`;
    case 'History':
      return `<h2>History</h2><p class="sub">Rate the work after a complaint is resolved.</p>${table(a.filter(c => c.status === 'Resolved'), { rate: true })}`;
    case 'Notice Board':
      return `<h2>Notice board</h2><p class="sub">Announcements from the hostel admin.</p>
        <div class="pn">${data.notices.length
          ? data.notices.map(n => `<div class="nt">${ic('mega', 16)} ${esc(n.text)}<br><small>${day(n.created_at)}</small></div>`).join('')
          : '<p class="empty">No notices yet.</p>'}</div>`;
    case 'Notifications':
      return `<h2>Notifications</h2><p class="sub">Updates about your complaints.</p>
        <div class="pn">${data.notes.items.length
          ? data.notes.items.map(n => `<div class="nt ${n.is_read ? '' : 'u'}">${ic('bell', 16)} ${esc(n.text)}<br><small>${new Date(n.created_at).toLocaleString()}</small></div>`).join('')
          : '<p class="empty">No notifications yet.</p>'}</div>`;
    case 'Change Password':
      return `<h2>Change password</h2><p class="sub">Use a strong password.</p>
        <div class="pn fm">
          <label>Current password</label><input id="op" type="password">
          <label>New password (${MIN_PASSWORD}+ characters, 1 number, 1 special character)</label><input id="np2" type="password">
          <label>Confirm new password</label><input id="np3" type="password">
          <button class="btn full" onclick="changePassword()">${ic('key', 16)} Save password</button>
        </div>`;
  }
}

// ---------- poori screen ----------
const bellHtml = () => `${ic('bell', 21)}${data.notes.unread ? `<i>${data.notes.unread}</i>` : ''}`;

async function render() {
  try { await load(); } catch (e) { toast(e.message); return; }
  const initials = me.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  $('#root').innerHTML = `<div class="app">
    <aside class="side" id="sd">${LOGO}
      ${MENU.map(m => `<a class="${m === view ? 'on' : ''}" onclick="go('${m}')"><i>${ic(ICON[m])}</i>${m}</a>`).join('')}

      <!-- Sidebar ke neeche resident ka naam aur room -->
      <div class="side-foot">
        <b>${esc(me.name)}</b>
        <small>${esc(me.room || 'Resident')}</small>
      </div>
    </aside>
    <div class="main">
      <div class="top">
        <button class="ham" onclick="$('#sd').classList.toggle('open')">${ic('menu', 22)}</button>
        <b>Resident portal</b><span class="sp"></span>
        <span class="bell" id="bell" onclick="go('Notifications')">${bellHtml()}</span>
        <div class="av">${esc(initials)}</div>
        <div class="who nm">${esc(me.name)}<small>${esc(me.room || 'resident')}</small></div>
        <button class="btn sm o" onclick="logout()">${ic('out', 15)} Log out</button>
      </div>
      <div class="cont">${page()}</div>
    </div></div>`;
  // Notifications page khulte hi sab read ho jayein
  if (view === 'Notifications' && data.notes.unread) api('/notifications/read', 'POST').catch(() => {});
}

function go(name) { view = name; render(); }

// Action chalao, message dikhao, page dobara draw karo
async function act(fn, okMessage) {
  try { await fn(); if (okMessage) toast(okMessage); } catch (e) { toast(e.message); }
  render();
}

// ---------- forms ----------
// Complaint submit: pehle description check hoti hai (rules validation.js mein)
const submitComplaint = () => {
  if (!validate([['nd', checkText($('#nd').value, 'Description', 10, 500)]])) return;
  act(async () => {
    await api('/complaints', 'POST', {
      category: $('#nc').value, priority: $('#np').value,
      visit_time: $('#nt').value, description: $('#nd').value
    });
    view = 'My Complaints';
  }, 'Complaint submitted');
};

const rate = (id, value) => value && act(() => api('/complaints/' + id + '/rate', 'POST', { rating: value }), 'Thanks for rating');

// Pending complaint delete karna (pehle poochta hai)
const deleteComplaint = id => confirm('Delete this complaint? This cannot be undone.') && act(() => api('/complaints/' + id, 'DELETE'), 'Complaint deleted');

// Password change: pehle teeno boxes check hote hain (validatePasswordChange validation.js mein hai)
const changePassword = () => validatePasswordChange() && act(() => api('/password', 'POST', { old: $('#op').value, next: $('#np2').value }), 'Password changed');

// Har 15 second mein naya data (forms wale pages par nahi, taaki typing na mite)
setInterval(async () => {
  if (document.hidden) return;
  if (FORM_VIEWS.includes(view)) {
    try { data.notes = await api('/notifications'); const b = $('#bell'); if (b) b.innerHTML = bellHtml(); } catch {}
  } else render();
}, 15000);

render();