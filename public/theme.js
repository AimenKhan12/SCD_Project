// theme.js  -  Light / Dark theme (har page par chalti hai, choice browser mein yaad rehti hai)
(function () {
  // 1) Pehle saved theme lo; na ho to phone/laptop ki setting dekho
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var systemDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (systemDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);   // CSS isi se theme pehchanti hai

  // 2) Icons (chaand aur suraj)
  var SUN  = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // 3) Button ka icon: dark ho to suraj dikhao, light ho to chaand
  function showIcon() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;                      // jis page par button nahi, wahan kuch nahi hota
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = dark ? SUN : MOON;
    btn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
    btn.setAttribute('aria-label', btn.title);
  }

  // 4) Click par theme badlo aur yaad rakho
  document.addEventListener('DOMContentLoaded', function () {
    showIcon();
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      showIcon();
    });
  });
})();