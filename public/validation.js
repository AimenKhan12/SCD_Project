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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, like name@gmail.com.';
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
// Naya Phone Number Validation Function
function checkPhone(value) {
  const v = String(value || '').trim();
  if (!v) return 'Phone number is required.';
  if (!/^\d+$/.test(v)) return 'Phone number must contain only numbers.';
  if (v.length <= 11) return 'Phone number must be more than 11 digits.';
  return '';
}
// Lamba text (complaint, message, notice): kam se kam aur zyada se zyada length
function checkText(value, label, min, max) {
  const v = String(value || '').trim();
  if (!v) return label + ' is required.';
  if (v.length < min) return label + ' must be at least ' + min + ' characters.';
  if (v.length > max) return label + ' must be at most ' + max + ' characters.';
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
  const holder = input.closest('.pw-wrap') || input;
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
    ['np3', checkSame(next, again)]
  ]);
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