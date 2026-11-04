// admin-pages.js: admin ke saare pages
let page = 'Dashboard', filter = 'All';
let data = { complaints: [], staff: [], notices: [], notes: { items: [], unread: 0 } };
const FORM_PAGES = ['Manage Staff', 'Notice Board', 'Change Password'];   // inpe auto refresh nahi

const CAT_ICON = { Electrical: 'zap', Plumbing: 'drop', Cleaning: 'trash', Internet: 'wifi' };
const badge = s => `<span class="bd ${s.replace(' ', '-')}">${s}</span>`;
const day = d => new Date(d).toLocaleDateString();
const options = list => list.map(x => `<option>${x}</option>`).join('');

// Sirf wahi data lo jo page ko chahiye
async function load() {
  const jobs = { notes: api('/notifications') };
  if (['Dashboard', 'All Complaints', 'Reports'].includes(page)) jobs.complaints = api('/complaints');
  if (['All Complaints', 'Manage Staff', 'Reports'].includes(page)) jobs.staff = api('/staff');
  if (page === 'Notice Board') jobs.notices = api('/notices');
  const keys = Object.keys(jobs);
  const results = await Promise.all(Object.values(jobs));
  keys.forEach((k, i) => data[k] = results[i]);
}

// ---------- chhote parts ----------
function cards(a) {
  const list = [['Total', a.length, 'file'], ['Pending', a.filter(c => c.status === 'Pending').length, 'clock'],
    ['In Progress', a.filter(c => c.status === 'In Progress').length, 'tool'], ['Resolved', a.filter(c => c.status === 'Resolved').length, 'check']];
  return `<div class="cards">${list.map((x, i) => `<div class="c k${i}"><em>${ic(x[2], 22)}</em><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>`;
}

function bars(rows) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return rows.map(r => `<div class="row"><span>${esc(r[0])}</span><div class="bar" style="width:${r[1] / max * 58 + 3}%"></div><b>${r[1]}</b></div>`).join('');
}

// Admin ki complaints table: staff aur status dropdown se badal sakte hain
function table(a, canEdit) {
  if (!a.length) return '<div class="pn"><p class="empty">Nothing here yet.</p></div>';
  const rows = a.map(c => {
    let staff = esc(c.staff_name || 'Unassigned');
    let status = badge(c.status);
    if (canEdit) {
      const same = data.staff.filter(s => s.category === c.category);
      staff = `<select onchange="act(() => api('/complaints/${c.id}/assign', 'PATCH', { staff_id: this.value }), 'Staff changed')">
        ${c.assigned_to ? '' : '<option value="">Unassigned</option>'}
        ${same.map(s => `<option value="${s.id}" ${s.id === c.assigned_to ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`;
      status = `<select onchange="act(() => api('/complaints/${c.id}/status', 'PATCH', { status: this.value }), 'Status updated')">
        ${STATUSES.map(s => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
    }
    return `<tr><td>${c.id}</td><td>${ic(CAT_ICON[c.category], 15)} ${esc(c.category)}</td>
      <td>${esc(c.description)}<br><small>${day(c.created_at)} - Best time: ${esc(c.visit_time)}</small></td>
      <td class="${c.priority}">${c.priority}</td>
      <td>${esc(c.resident_name)}<br><small>${esc(c.room)}</small></td>
      <td>${staff}</td><td>${status}</td></tr>`;
  }).join('');
  return `<div class="pn"><table><tr><th>#</th><th>Category</th><th>Problem</th><th>Priority</th><th>Resident</th><th>Staff</th><th>Status</th></tr>${rows}</table></div>`;
}

// ---------- pages ----------
function content() {
  const a = data.complaints;
  switch (page) {
    case 'Dashboard': {
      const h = new Date().getHours(), hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      const done = a.filter(c => c.status === 'Resolved').length, prog = a.filter(c => c.status === 'In Progress').length;
      const r = a.length ? Math.round(done / a.length * 100) : 0, p = a.length ? Math.round(prog / a.length * 100) : 0;
      return `<div class="hero"><div><h2>${hello}, ${esc(me.name.split(' ')[0])}</h2><p class="sub">${new Date().toDateString()}</p></div></div>
        ${cards(a)}
        <div class="g2">
          <div class="pn"><h3>Resolution rate</h3><div class="dnw">
            <div class="dn" style="background:conic-gradient(var(--ok) 0 ${r}%,#3b6bff ${r}% ${r + p}%,#f5a524 ${r + p}% 100%)"><div>${a.length ? r + '%' : '-'}</div></div>
            <div class="lgd"><div><i style="background:var(--ok)"></i>Resolved</div><div><i style="background:#3b6bff"></i>In Progress</div><div><i style="background:#f5a524"></i>Pending</div></div>
          </div></div>
          <div class="pn"><h3>Complaints by category</h3>${bars(CATEGORIES.map(c => [c, a.filter(x => x.category === c).length]))}</div>
        </div>
        <h3>Latest complaints</h3>${table(a.slice(0, 5), false)}`;
    }
    case 'All Complaints': {
      const list = filter === 'All' ? a : a.filter(c => c.status === filter);
      return `<h2>All complaints</h2><p class="sub">Change the staff or the status from the table.</p>
        <div class="fl"><span>Show</span><select onchange="filter = this.value; render()">${['All', ...STATUSES].map(s => `<option ${s === filter ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        ${table(list, true)}`;
    }
    case 'Manage Staff':
      return `<h2>Manage staff</h2><p class="sub">Add one staff member for each category. Staff log in with this email and password.</p>
        <div class="pn">${data.staff.length
          ? `<table><tr><th>Name</th><th>Email</th><th>Category</th><th>Open work</th><th></th></tr>${data.staff.map(s =>
            `<tr><td>${esc(s.name)}</td><td>${esc(s.email)}</td><td>${ic(CAT_ICON[s.category], 15)} ${esc(s.category)}</td><td>${s.open_count}</td>
            <td><button class="btn sm d" onclick="removeStaff(${s.id})">Remove</button></td></tr>`).join('')}</table>`
          : '<p class="empty">No staff yet. Add the first one below.</p>'}</div>
        <div class="pn fm mid"><h3>Add staff member</h3>
          <label>Name</label><input id="an">
          <label>Email</label><input id="ae" type="email">
          <label>Password for this staff member (${MIN_PASSWORD}+ characters, 1 number, 1 special character)</label><input id="ap" type="password">
          <label>Category</label><select id="ac">${options(CATEGORIES)}</select>
          <button class="btn full" onclick="addStaff()">${ic('plus', 16)} Add staff</button></div>`;
    case 'Reports': {
      const rated = a.filter(c => c.rating);
      const avg = rated.length ? (rated.reduce((s, c) => s + c.rating, 0) / rated.length).toFixed(1) : '-';
      return `<h2>Reports</h2><p class="sub">Average rating from residents: <b>${avg}</b> out of 5</p>${cards(a)}
        <div class="g2">
          <div class="pn"><h3>Complaints by category</h3>${bars(CATEGORIES.map(c => [c, a.filter(x => x.category === c).length]))}</div>
          <div class="pn"><h3>Open work per staff member</h3>${data.staff.length
            ? bars(data.staff.map(s => [s.name.split(' ')[0] + ' (' + s.category + ')', s.open_count])) : '<p class="empty">No staff yet.</p>'}</div>
        </div>`;
    }
    case 'Notice Board':
      return `<h2>Notice board</h2><p class="sub">Notices posted here are visible to all residents.</p>
        <div class="pn fm mid"><label>New notice</label><textarea id="nn" rows="2" maxlength="300"></textarea>
          <button class="btn full" onclick="postNotice()">${ic('mega', 16)} Post notice</button></div>
        <div class="pn">${data.notices.length
          ? data.notices.map(n => `<div class="nt">${ic('mega', 16)} ${esc(n.text)}<br><small>${day(n.created_at)}</small></div>`).join('')
          : '<p class="empty">No notices yet.</p>'}</div>`;
    case 'Notifications':
      return `<h2>Notifications</h2><p class="sub">Latest updates.</p>
        <div class="pn">${data.notes.items.length
          ? data.notes.items.map(n => `<div class="nt ${n.is_read ? '' : 'u'}">${ic('bell', 16)} ${esc(n.text)}<br><small>${new Date(n.created_at).toLocaleString()}</small></div>`).join('')
          : '<p class="empty">No notifications yet.</p>'}</div>`;
    case 'Change Password':
      return `<h2>Change password</h2><p class="sub">Use a strong password.</p>
        <div class="pn fm mid"><label>Current password</label><input id="op" type="password">
          <label>New password (${MIN_PASSWORD}+ characters, 1 number, 1 special character)</label><input id="np2" type="password">
          <label>Confirm new password</label><input id="np3" type="password">
          <label class="chk-wrap"><input id="cf" type="checkbox"> I confirm this password</label>
          <button class="btn full" onclick="changePassword()">${ic('key', 16)} Save password</button></div>`;
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

// ---------- forms (rules validation.js mein hain) ----------
const addStaff = () => {
  const ok = validate([
    ['an', checkName($('#an').value)],
    ['ae', checkEmail($('#ae').value)],
    ['ap', checkPassword($('#ap').value)]
  ]);
  if (!ok) return;
  act(() => api('/staff', 'POST', { name: $('#an').value, email: $('#ae').value, password: $('#ap').value, category: $('#ac').value }), 'Staff added');
};
const removeStaff = id => confirm('Remove this staff member?') && act(() => api('/staff/' + id, 'DELETE'), 'Staff removed');
const postNotice = () => {
  if (!validate([['nn', checkText($('#nn').value, 'Notice', 3, 300)]])) return;
  act(() => api('/notices', 'POST', { text: $('#nn').value }), 'Notice posted');
};
const changePassword = () => validatePasswordChange() && act(() => api('/password', 'POST', { old: $('#op').value, next: $('#np2').value, confirm: $('#cf').checked }), 'Password changed');

// Har 15 second mein naya data (form wale pages par nahi, taaki typing na mite)
setInterval(async () => {
  if (document.hidden) return;
  if (FORM_PAGES.includes(page)) {
    try { data.notes = await api('/notifications'); $('#bell').innerHTML = bellHtml(); } catch {}
  } else render();
}, 15000);

render();