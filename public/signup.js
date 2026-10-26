// signup.js: resident signup page ka logic
$('#root').innerHTML = `<div class="lg"><div class="box">${LOGO}
  <p class="sub">Create a resident account.</p>
  <label>Full name</label><input id="sn" autocomplete="name">
  <label>Room (block and number)</label><input id="sr" placeholder="Block B, Room 12">
  <label>Email</label><input id="se" type="email" autocomplete="username">
  <label>Password (at least 6 characters)</label><input id="sp" type="password" autocomplete="new-password">
  <div class="err" id="er"></div>
  <button class="btn full" id="sbtn" onclick="doSignup()">${ic('plus', 16)} Create account</button>
  <div class="lnk" onclick="location.href='/'">Back to log in</div></div></div>`;

let done = false;   // account ban gaya to dobara submit na ho

async function doSignup() {
  if (done) return;
  try {
    const data = await api('/signup', 'POST', {
      name: $('#sn').value,
      room: $('#sr').value,
      email: $('#se').value,
      password: $('#sp').value
    });
    saveSession(data);
    done = true;
    $('#er').textContent = '';
    $('#sbtn').disabled = true;                      // button band
    toast('Account created successfully!');          // neeche message
    setTimeout(() => { location.href = '/resident.html'; }, 3000);   // 3 second baad panel (3000 = 3 sec)
  } catch (e) {
    $('#er').textContent = e.message;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doSignup(); });