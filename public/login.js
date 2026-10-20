// Agar pehle se login hai to dashboard par bhej do
if (localStorage.getItem('token')) location.href = home(getUser());
let role = 'resident';
const ROLE_ICON = { resident: 'home', staff: 'tool', admin: 'shield' };

function draw() {
  $('#root').innerHTML = `<div class="lg"><div class="box">${LOGO}
    <p class="sub">Choose your role, then log in.</p>
    <div class="roles">${['resident', 'staff', 'admin'].map(r => `<div class="role ${r === role ? 'on' : ''}" onclick="pick('${r}')"><b>${ic(ROLE_ICON[r], 30)}</b><span>${r[0].toUpperCase() + r.slice(1)}</span></div>`).join('')}</div>
    <label>Email</label><input id="em" type="email">
    <label>Password</label><input id="pw" type="password">
    <div class="err" id="er"></div>
    <button class="btn full" onclick="doLogin()">${ic('key', 16)} Log in</button>
    ${role === 'resident'
      ? '<div class="lnk" onclick="location.href=\'/signup.html\'">New resident? Create an account</div>'
      : role === 'staff'
      ? '<div class="hint">Staff accounts are created by the admin.</div>'
      : '<div class="hint">Admin portal access only.</div>'}
  </div></div>`;
}

// Role badalne par email na mite
function pick(r) {
  const e = $('#em').value;
  role = r;
  draw();
  $('#em').value = e;
}

async function doLogin() {
  try {
    const data = await api('/login', 'POST', { email: $('#em').value, password: $('#pw').value, role });
    saveSession(data);
    location.href = '/dashboard.html';
  } catch (e) {
    $('#er').textContent = e.message;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter' && $('#pw')) doLogin(); });
draw();