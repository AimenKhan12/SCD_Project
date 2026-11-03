// forgot.js: forgot password page (resident ke liye). Email + signup wale phone number se naya password.
$('#root').innerHTML = `
  <a href="/login.html" class="btn-back-corner">&larr; Back to Login</a>
  <div class="lg"><div class="box">${LOGO}
  <p class="sub">Reset your password. Enter your email and the phone number you used at signup.</p>

  <label>Email</label><input id="fe" type="email" autocomplete="username">
  <label>Phone number</label><input id="fp" inputmode="numeric" placeholder="03001234567" autocomplete="tel">

  <label>New password (${MIN_PASSWORD}+ characters, 1 number, 1 special character)</label>
  <div class="pw-wrap">
    <input id="fn" type="password" autocomplete="new-password">
    <button type="button" class="pw-eye" id="fnb" title="Show password" onclick="eye('fn','fnb')">${ic('eyeoff', 18)}</button>
  </div>

  <label>Confirm new password</label>
  <div class="pw-wrap">
    <input id="fc" type="password" autocomplete="new-password">
    <button type="button" class="pw-eye" id="fcb" title="Show password" onclick="eye('fc','fcb')">${ic('eyeoff', 18)}</button>
  </div>

  <div class="err" id="er"></div>
  <button class="btn full" id="fbtn" onclick="doReset()">${ic('key', 16)} Reset password</button>
  <div class="lnk" onclick="location.href='/login.html'">Back to log in</div>
  </div></div>`;

let done = false;   // password badal gaya to dobara submit na ho

// Eye icon par click: password dikhao ya chhupao (dono boxes ke liye)
function eye(inputId, btnId) {
  const p = $('#' + inputId);
  const show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#' + btnId).innerHTML = ic(show ? 'eye' : 'eyeoff', 18);
  $('#' + btnId).title = show ? 'Hide password' : 'Show password';
}

async function doReset() {
  if (done) return;
  $('#er').textContent = '';

  // Pehle har field check karo (rules validation.js mein hain)
  const ok = validate([
    ['fe', checkEmail($('#fe').value)],
    ['fp', checkPhone($('#fp').value)],
    ['fn', checkPassword($('#fn').value)],
    ['fc', checkSame($('#fn').value, $('#fc').value)]
  ]);
  if (!ok) return;

  const btn = $('#fbtn');
  btn.disabled = true;
  btn.textContent = 'Resetting...';
  try {
    await api('/forgot-password', 'POST', { email: $('#fe').value, phone: $('#fp').value, password: $('#fn').value });
    done = true;
    toast('Password changed successfully!');
    setTimeout(() => { location.href = '/login.html'; }, 3000);   // 3 second baad login page
  } catch (e) {
    $('#er').textContent = e.message;
    btn.disabled = false;
    btn.innerHTML = `${ic('key', 16)} Reset password`;
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doReset(); });