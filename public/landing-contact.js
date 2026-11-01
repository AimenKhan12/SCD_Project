// landing-contact.js: contact form (abhi sirf screen par message dikhata hai)

// Topic buttons: ek dabane par wahi chuna jata hai
document.querySelectorAll('.topic').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.topic').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
}));

// Send button
document.getElementById('c-send').addEventListener('click', () => {
  const room = document.getElementById('c-room').value.trim();

  // Rules validation.js mein hain. Room zaroori nahi, par likha ho to sahi format mein ho
  const ok = validate([
    ['c-name', checkName(document.getElementById('c-name').value)],
    ['c-room', room ? checkRoom(room) : ''],
    ['c-email', checkEmail(document.getElementById('c-email').value)],
    ['c-msg', checkText(document.getElementById('c-msg').value, 'Message', 10, 500)]
  ]);
  if (!ok) return;

  ['c-name', 'c-room', 'c-email', 'c-msg'].forEach(id => document.getElementById(id).value = '');
  toast('Message sent to the help desk');
});