// login.js: login page ka logic

// Agar pehle se login hai to apne panel par bhej do (role ke hisaab se)
if (localStorage.getItem('token')) location.href = home(getUser());

let role = 'resident';
const ROLE_ICON = { resident: 'home', staff: 'tool', admin: 'shield' };

function draw() {
  $('#root').innerHTML = `<div class="lg"><div class="box">${LOGO}
    <p class="sub">Choose your role, then log in.</p>
    <div class="roles">${['resident', 'staff', 'admin'].map(r => `<div class="role ${r === role ? 'on' : ''}" onclick="pick('${r}')"><b>${ic(ROLE_ICON[r], 30)}</b><span>${r[0].toUpperCase() + r.slice(1)}</span></div>`).join('')}</div>
    <label>Email</label><input id="em" type="email">
    <label>Password</label>
    <div class="pw-wrap">
      <input id="pw" type="password">
      <button type="button" class="pw-eye" id="pwbtn" title="Show password" onclick="togglePw()">${ic('eyeoff', 18)}</button>
    </div>
    <div class="err" id="er"></div>
    <button class="btn full" id="lbtn" onclick="doLogin()">${ic('key', 16)} Log in</button>
    ${role === 'resident'
      ? '<div class="lnk" onclick="location.href=\'/signup.html\'">New resident? Create an account</div>'
     : role === 'staff'
      ? '<div class="hint">Staff accounts are created by the admin.</div>'
      : '<div class="hint">Admin accounts are created by the system.</div>'}

  </div></div>`;
}

// Role badalne par email na mite
function pick(r) {
  const e = $('#em').value;
  role = r;
  draw();
  $('#em').value = e;
}

// Eye icon par click: password dikhao ya chhupao, aur icon badlo
function togglePw() {
  const p = $('#pw');
  const show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#pwbtn').innerHTML = ic(show ? 'eye' : 'eyeoff', 18);  // dikh raha ho to slash wali eye
  $('#pwbtn').title = show ? 'Hide password' : 'Show password';
}

async function doLogin() {
  const btn = $('#lbtn');
  if (btn.disabled) return;                 // pehle se login chal raha hai
  $('#er').textContent = '';

  // Login par sirf khali aur email format check hota hai (password ka rule nahi)
  const ok = validate([
    ['em', checkEmail($('#em').value)],
    ['pw', $('#pw').value ? '' : 'Password is required.']
  ]);
  if (!ok) return;

  btn.disabled = true;
  btn.textContent = 'Logging in...';        // user ko pata chale ke kaam ho raha hai
  try {
    const data = await api('/login', 'POST', { email: $('#em').value, password: $('#pw').value, role });
    saveSession(data);
    location.href = home(data.user);   // resident, admin ya staff ka sahi page
  } catch (e) {
    $('#er').textContent = e.message;
    btn.disabled = false;                   // galat password: button wapas normal
    btn.innerHTML = `${ic('key', 16)} Log in`;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter' && $('#pw')) doLogin(); });
draw();