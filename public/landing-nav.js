// landing-nav.js: header ka kaam (mobile menu, scroll shadow, login button)
const header = document.getElementById('site-header');
const links = document.getElementById('site-links');
const menuBtn = document.getElementById('menu-btn');
const loginBtn = document.getElementById('login-btn');

// 1. Mobile menu: button dabane par links khulte ya band hote hain
menuBtn.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// 2. Scroll karne par header ke neeche halka shadow aata hai
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10));

// 3. Agar user pehle se login hai to "Login" ki jagah "Dashboard" dikhao
const user = getUser();
if (user && localStorage.getItem('token')) {
  loginBtn.href = home(user);
  document.getElementById('login-text').textContent = 'Dashboard';
}