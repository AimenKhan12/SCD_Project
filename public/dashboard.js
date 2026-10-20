const me = getUser();
if (!me || !localStorage.getItem('token')) location.href = '/';
if (me.role === 'resident') location.href = '/resident.html';

const CAT_ICON = { Electrical: 'zap', Plumbing: 'drop', Cleaning: 'trash', Internet: 'wifi' };

// Admin ke liye Manage Staff wala part
const staffPanel = `
  <h3>Manage staff</h3>
  <p class="sub">Add one staff member for each category. Staff will log in with this email and password.</p>
  <div class="pn" id="tbl"></div>
  <div class="pn fm">
    <h3>Add staff member</h3>
    <label>Name</label><input id="an">
    <label>Email</label><input id="ae" type="email">
    <label>Password for this staff member</label><input id="ap" type="password">
    <label>Category</label>
    <select id="ac">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
    <div class="err" id="er"></div>
    <button class="btn full" onclick="addStaff()">${ic('plus', 16)} Add staff</button>
  </div>`;

function draw() {
  const role = me.role[0].toUpperCase() + me.role.slice(1);
  $('#root').innerHTML = `
    <div class="top">${LOGO}<span class="sp"></span>
      <div class="who">${esc(me.name)}<small>${esc(me.category || me.role)}</small></div>
      <button class="btn sm o" onclick="logout()">${ic('out', 15)} Log out</button>
    </div>
    <div class="cont">
      <h2>${role} portal</h2>
      <p class="sub">Welcome, ${esc(me.name)}. Baaki pages baad mein add honge.</p>
      ${me.role === 'admin' ? staffPanel : ''}
    </div>`;
  if (me.role === 'admin') loadStaff();
}

async function loadStaff() {
  try {
    const list = await api('/staff');
    $('#tbl').innerHTML = list.length
      ? `<table><tr><th>Name</th><th>Email</th><th>Category</th><th></th></tr>
         ${list.map(s => `<tr><td>${esc(s.name)}</td><td>${esc(s.email)}</td>
         <td>${ic(CAT_ICON[s.category], 15)} ${esc(s.category)}</td>
         <td><button class="btn sm d" onclick="removeStaff(${s.id})">Remove</button></td></tr>`).join('')}</table>`
      : '<p class="empty">No staff yet. Add the first one below.</p>';
  } catch (e) { toast(e.message); }
}

async function addStaff() {
  try {
    await api('/staff', 'POST', {
      name: $('#an').value, email: $('#ae').value,
      password: $('#ap').value, category: $('#ac').value
    });
    ['an', 'ae', 'ap'].forEach(i => $('#' + i).value = '');
    $('#er').textContent = '';
    toast('Staff added');
    loadStaff();
  } catch (e) { $('#er').textContent = e.message; }
}

async function removeStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  try { await api('/staff/' + id, 'DELETE'); toast('Staff removed'); loadStaff(); }
  catch (e) { toast(e.message); }
}

draw();