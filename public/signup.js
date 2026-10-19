// Sign up page (sirf residents ke liye)
$('#root').innerHTML = `<div class="lg"><div class="box">${LOGO}
  <p class="sub">Create a resident account. Staff accounts are made by the admin.</p>
  <label>Full name</label><input id="sn" autocomplete="name">
  <label>Room (block and number)</label><input id="sr" placeholder="Block B, Room 12">
  <label>Email</label><input id="se" type="email" autocomplete="username">
  <label>Password (at least 6 characters)</label><input id="sp" type="password" autocomplete="new-password">
  <div class="err" id="er"></div>
  <button class="btn full" onclick="doSignup()">${ic('plus', 16)} Create account</button>
  <div class="lnk" onclick="location.href='/'">Back to log in</div></div></div>`;

async function doSignup() {
  try {
    const data = await api('/signup', 'POST', {
      name: $('#sn').value,
      room: $('#sr').value,
      email: $('#se').value,
      password: $('#sp').value
    });
    saveSession(data);
    location.href = '/dashboard.html';
  } catch (e) {
    $('#er').textContent = e.message;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doSignup(); });