// validation.js: saare form rules ek hi jagah. Browser aur server.js dono isi file ko use karte hain.
// Rule badalna ho (jaise password ki length) to sirf yahin badlo.

const MIN_PASSWORD = 8;   // password ki kam se kam length

// ---------- Rules: error ka message deta hai, sahi ho to '' (khali) ----------
function checkRequired(value, label) {
  return String(value || '').trim() ? '' : label + ' is required.';
}

function checkName(value) {
  const v = String(value || '').trim();
  if (!v) return 'Name is required.';
  if (v.length < 2) return 'Name must be at least 2 letters.';
  if (v.length > 50) return 'Name must be at most 50 characters.';
  if (!/^[\p{L} ]+$/u.test(v)) return 'Name can only have letters and spaces.';
  return '';
}

function checkEmail(value) {
  const v = String(value || '').trim();
  if (!v) return 'Email is required.';
  if (!v.includes('@')) return 'Email must contain @.';
  
  const parts = v.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'Enter a valid email, like name@gmail.com.';
  }

  const domain = parts[1];
  // 1. Domain mein capital letter (jaise Gmail.com) mana hai
  if (/[A-Z]/.test(domain)) {
    return 'Domain must be in lowercase (e.g., gmail.com, not Gmail.com).';
  }
  // 2. Dot (.) hona zaroori hai
  if (!domain.includes('.')) {
    return 'Email domain must contain a dot (e.g., gmail.com).';
  }
  // 3. Double/triple m (.comm / .commm) ko pakarne ke liye aur valid extension check
  if (/\.comm+$/i.test(domain) || !/^[a-z0-9.-]+\.(com|org|net|edu|pk|co|io)$/i.test(domain)) {
    return 'Enter a valid email domain like @gmail.com (not .comm).';
  }
  return '';
}
function checkPassword(value) {
  const v = String(value || '');
  if (!v) return 'Password is required.';
  if (v.length < MIN_PASSWORD) return 'Password must be at least ' + MIN_PASSWORD + ' characters.';
  if (!/[0-9]/.test(v)) return 'Password must have at least 1 number.';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must have at least 1 special character, like @ or !.';
  return '';
}

function checkRoom(value) {
  const v = String(value || '').trim();
  if (!v) return 'Room is required.';
  if (!/[0-9]/.test(v)) return 'Room must have a number, like Block B, Room 12.';
  if (!/^[A-Za-z0-9 ,\-]+$/.test(v)) return 'Room can only have letters, numbers, spaces, comma and hyphen.';
  return '';
}
// Phone number: spaces ya dash chalte hain, par asli digits 11 hon (jaise 03001234567)
function checkPhone(value) {
  const v = String(value || '').replace(/[\s-]/g, '');
  if (!v) return 'Phone number is required.';
  if (!/^[0-9]{11}$/.test(v)) return 'Phone number must be 11 digits, like 03001234567.';
  return '';
}
// Lamba text (complaint, message, notice): kam se kam aur zyada se zyada length
function checkText(value, label, min, max) {
  const v = String(value || '').trim();
  if (!v) return label + ' is required.';
  if (v.length < min) return label + ' must be at least ' + min + ' characters.';
  if (v.length > max) return label + ' must be at most ' + max + ' characters.';
 if (!/[A-Za-z]/.test(v)) return label + ' must contain letters (not just numbers or symbols).';
  return '';
}

function checkSame(a, b) {
  if (!b) return 'Please confirm your new password.';
  return a === b ? '' : 'Passwords do not match.';
}

// ---------- Sirf browser ke liye: error field ke neeche dikhana ----------
// Field ke neeche laal text aata hai. msg khali ho to error hat jata hai
function showError(id, msg) {
  const input = document.getElementById(id);
  const holder = input.closest('.pw-wrap') || input.closest('.chk-wrap') || input;
  let box = holder.nextElementSibling;
  if (!box || !box.classList.contains('field-err')) {
    box = document.createElement('div');
    box.className = 'field-err';
    holder.after(box);
  }
  box.textContent = msg;
  input.classList.toggle('bad', !!msg);
}

// rules = [['fieldId', errorMessage], ...]. Sab theek ho to true deta hai
function validate(rules) {
  let ok = true, first = null;
  rules.forEach(([id, msg]) => {
    showError(id, msg);
    if (msg) { ok = false; if (!first) first = id; }
  });
  if (first) document.getElementById(first).focus();
  return ok;
}

// Change password form (teeno panels mein same): ids op, np2, np3
function validatePasswordChange() {
  const old = $('#op').value, next = $('#np2').value, again = $('#np3').value;
  return validate([
    ['op', old ? '' : 'Enter your current password.'],
    ['np2', checkPassword(next) || (old && next === old ? 'New password must be different from the current one.' : '')],
    ['np3', checkSame(next, again)],
    ['cf', $('#cf').checked ? '' : 'Please tick the box to confirm.']
  ]);
}

// Password box + eye icon (show/hide). Change Password ke teeno boxes yahi use karte hain
function pwField(id) {
  return `<div class="pw-wrap"><input id="${id}" type="password"><button type="button" class="pw-eye" title="Show password" onclick="togglePwField('${id}', this)">${ic('eyeoff', 18)}</button></div>`;
}
function togglePwField(id, btn) {
  const input = document.getElementById(id), show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.innerHTML = ic(show ? 'eye' : 'eyeoff', 18);
}

// Type karte hi us field ka error hat jaye
if (typeof document !== 'undefined') {
  document.addEventListener('input', e => {
    if (e.target.classList && e.target.classList.contains('bad')) showError(e.target.id, '');
  });
}

// server.js isi file ko require karta hai
if (typeof module !== 'undefined') {
  module.exports = { MIN_PASSWORD, checkRequired, checkName, checkEmail, checkPassword, checkRoom, checkPhone, checkText, checkSame };
}