// landing-contact.js: contact form (abhi sirf screen par message dikhata hai)

// Topic buttons: ek dabane par wahi chuna jata hai
document.querySelectorAll('.topic').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.topic').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
}));

// Send button
document.getElementById('c-send').addEventListener('click', () => {
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const msg = document.getElementById('c-msg').value.trim();
  const err = document.getElementById('c-err');

  if (!name || !email || !msg) { err.textContent = 'Please fill your name, email and message.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid email address.'; return; }

  err.textContent = '';
  ['c-name', 'c-room', 'c-email', 'c-msg'].forEach(id => document.getElementById(id).value = '');
  toast('Message sent to the help desk');
});