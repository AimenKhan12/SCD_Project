// landing-contact.js: contact form (abhi sirf screen par message dikhata hai)

// Topic buttons: ek dabane par wahi chuna jata hai
document.querySelectorAll('.topic').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.topic').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
}));

// Send button
document.getElementById('c-send').addEventListener('click', async () => {
  const room = document.getElementById('c-room').value.trim();
  const nameVal = document.getElementById('c-name').value;
  const emailVal = document.getElementById('c-email').value;
  const msgVal = document.getElementById('c-msg').value;

  // Rules validation.js mein hain
  const ok = validate([
    ['c-name', checkName(nameVal)],
    ['c-room', room ? checkRoom(room) : ''],
    ['c-email', checkEmail(emailVal)],
    ['c-msg', checkText(msgVal, 'Message', 10, 500)]
  ]);
  if (!ok) return;

  try {
    // Database mein save karne ke liye API call
    await api('/contact', 'POST', {
      name: nameVal,
      room: room,
      email: emailVal,
      message: msgVal
    });

    ['c-name', 'c-room', 'c-email', 'c-msg'].forEach(id => document.getElementById(id).value = '');
    toast('Message sent and saved successfully!');
  } catch (e) {
    alert(e.message || 'Failed to send message');
  }
});