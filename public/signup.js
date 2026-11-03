// signup.js: resident signup page ka logic
$('#root').innerHTML = `<div class="lg"><div class="box">${LOGO}
  <p class="sub">Create a resident account.</p>
  <label>Full name</label><input id="sn" autocomplete="name">
  <label>Room (block and number)</label><input id="sr" placeholder="Block B, Room 12">
  <label>Phone number (e.g. 030012345678)</label><input id="sph" type="tel" placeholder="030012345678">
  <label>Email</label><input id="se" type="email" autocomplete="username">
  <label>Password (${MIN_PASSWORD}+ characters, 1 number, 1 special character)</label>
  <div class="pw-wrap">
    <input id="sp" type="password" autocomplete="new-password">
    <button type="button" class="pw-eye" id="spbtn" title="Show password" onclick="togglePw()">${ic('eyeoff', 18)}</button>
  </div>
  <div style="display: flex; align-items: center; gap: 10px; margin-top: 12px; text-align: left; width: 100%;">
  <input type="checkbox" id="sc" style="width: 18px; height: 18px; margin: 0; cursor: pointer;">
  <label for="sc" style="margin: 0; cursor: pointer; font-weight: normal; display: inline;">I confirm this password</label>
</div>
  <div class="err" id="er"></div>
  <button class="btn full" id="sbtn" onclick="doSignup()">${ic('plus', 16)} Create account</button>
  <div class="lnk" onclick="location.href='/login.html'">Back to log in</div></div></div>`;

let done = false;   // account ban gaya to dobara submit na ho

// Eye icon par click: password dikhao ya chhupao, aur icon badlo
function togglePw() {
  const p = $('#sp');
  const show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#spbtn').innerHTML = ic(show ? 'eye' : 'eyeoff', 18);   // dikh raha ho to slash wali eye
  $('#spbtn').title = show ? 'Hide password' : 'Show password';
}

async function doSignup() {
  if (done) return;
  $('#er').textContent = '';
if (!$('#sc').checked) {
    $('#er').textContent = 'Please confirm your password by checking the box.';
    return;
  }
  // Pehle har field check karo (rules validation.js mein hain)
  const ok = validate([
    ['sn', checkName($('#sn').value)],
    ['sr', checkRoom($('#sr').value)],
    ['sph', checkPhone($('#sph').value)],
    ['se', checkEmail($('#se').value)],
    ['sp', checkPassword($('#sp').value)]
  ]);
  if (!ok) return;

  try {
    const data = await api('/signup', 'POST', {
      name: $('#sn').value,
      room: $('#sr').value,
      phone: $('#sph').value,
      email: $('#se').value,
      password: $('#sp').value
    });
    saveSession(data);
    done = true;
    $('#sbtn').disabled = true;                      // button band
    toast('Account created successfully!');          // neeche message
    setTimeout(() => { location.href = '/resident.html'; }, 3000);   // 3 second baad panel (3000 = 3 sec)
  } catch (e) {
    $('#er').textContent = e.message;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doSignup(); });