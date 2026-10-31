// staff-sidebar.js: login check, icons, logo, menu click
const me = getUser();
if (!me || !localStorage.getItem('token')) location.href = '/login.html';
if (me && me.role !== 'staff') location.href = home(me);

// Icons, logo, naam aur category lagao
document.querySelectorAll('[data-ic]').forEach(el => el.innerHTML = ic(el.dataset.ic));
$('#logo-box').innerHTML = LOGO;
$('#logo-box').onclick = () => showPage('Dashboard');
$('#side-name').textContent = me.name;
$('#side-cat').textContent = (me.category || '') + ' staff';

// Menu par click (showPage staff-pages.js mein hai)
document.querySelectorAll('.side a[data-page]').forEach(a => {
  a.onclick = () => { showPage(a.dataset.page); $('#sd').classList.remove('open'); };
});

// Sidebar mein current page highlight karo
function setActive(name) {
  document.querySelectorAll('.side a[data-page]').forEach(a => a.classList.toggle('on', a.dataset.page === name));
}