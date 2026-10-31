// landing-sections.js: category tiles, how-it-works steps, numbers, scroll animation
document.documentElement.classList.add('js');   // isse sections scroll par animate hote hain

// Category tiles (CATS landing-phone.js se aata hai)
document.getElementById('tiles').innerHTML = CATS.map(c => `
  <div class="tile" style="--c:${c[2]}" onclick="this.classList.toggle('flip')">
    <div class="tile-in">
      <div class="tile-front">${ic(c[1], 32)}<b>${c[0]}</b></div>
      <div class="tile-back">${c[4]}</div>
    </div>
  </div>`).join('');

// How it works: [naam, icon, text]. Step badalna ho to yahan badlo
const STEPS = [
  ['Submit', 'plus', 'Choose a category, set the priority and tell us the best time for a visit.'],
  ['Auto-assign', 'users', 'The staff member with the least open work in that category gets it.'],
  ['Work', 'tool', 'Staff updates the status and you get a notification at every step.'],
  ['Rate', 'star', 'When it is resolved, rate the work so the hostel can improve.']
];
let current = 0;
function showSteps() {
  const s = STEPS[current];
  document.getElementById('steps').innerHTML = `
    <div class="step-row">${STEPS.map((x, i) => `<button class="step-btn ${i <= current ? 'on' : ''}" onclick="current=${i};showSteps()"><span>${i + 1}</span>${x[0]}</button>`).join('')}</div>
    <div class="step-bar"><i style="width:${(current + 1) * 25}%"></i></div>
    <div class="step-info">${ic(s[1], 28)}<div><b>${s[0]}</b><p>${s[2]}</p></div></div>`;
}
showSteps();
setInterval(() => { current = (current + 1) % STEPS.length; showSteps(); }, 4000);   // 4000 = 4 second

// Scroll karne par section dikhe aur numbers ginte hue aayein
const watcher = new IntersectionObserver(items => items.forEach(item => {
  if (!item.isIntersecting) return;
  item.target.classList.add('in');
  item.target.querySelectorAll('[data-n]').forEach(num => {
    let i = 0;
    const target = Number(num.dataset.n);
    const t = setInterval(() => { i++; num.textContent = Math.round(target * i / 12); if (i >= 12) clearInterval(t); }, 40);
  });
  watcher.unobserve(item.target);
}), { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => watcher.observe(el));