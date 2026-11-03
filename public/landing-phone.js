
// landing-phone.js: hero ka phone. Category chuno, Submit dabao, timeline chalti hai.
// Category ka naam, icon, rang (landing-phone.css se), sample text, tile ka text: sab yahin se aata hai
const CATS = [
  ['Electrical', 'zap',   'var(--c-elec)',  'Tube light is not working in the corridor.', 'Lights, fans, sockets and wiring.'],
  ['Plumbing',   'drop',  'var(--c-plumb)', 'Tap is leaking in the washroom.',            'Taps, leaks, washrooms and water supply.'],
  ['Cleaning',   'trash', 'var(--c-clean)', 'Corridor needs cleaning today.',             'Rooms, corridors and bathrooms.'],
  ['Internet',   'wifi',  'var(--c-net)',   'Wifi is very slow in my room.',              'Wi-Fi speed, routers and dropped connections.']
];

const phoneScreen = document.getElementById('phone-screen');
let picked = 3;      // pehle Internet chuni hui hai
let timer = null;

// Screen 1: category chuno aur Submit karo
function showForm() {
  clearInterval(timer);
  phoneScreen.innerHTML = `
    <div class="ph-title">${ic('plus')} New complaint</div>
    <div class="ph-label">Category</div>
    <div class="ph-cats">${CATS.map((c, i) => `
      <button class="ph-cat ${i === picked ? 'on' : ''}" style="--c:${c[2]}" onclick="picked=${i};showForm()">${ic(c[1], 18)}<span>${c[0]}</span></button>`).join('')}
    </div>
    <div class="ph-text">${CATS[picked][3]}</div>
    <button class="btn full" onclick="showTrack()">${ic('check')} Submit</button>`;
}

// Screen 2: timeline ek ek step bharti hai
function showTrack() {
  const c = CATS[picked];
  const steps = ['Submitted', 'Assigned to staff', 'In progress', 'Resolved'];
  const notes = ['Your ' + c[0] + ' complaint #12 was submitted.', 'Assigned to the ' + c[0] + ' staff member.', 'Your complaint #12 is now In Progress.', 'Your complaint #12 is now Resolved.'];
  let k = 0;
  phoneScreen.innerHTML = `
    <div class="ph-title">${ic(c[1])} ${c[0]} #12</div>
    <div class="ph-steps">${steps.map((s, i) => `<div class="ph-step" id="ph-s${i}"><i></i><span>${s}</span></div>`).join('')}</div>
    <div class="ph-note" id="ph-note"></div>
    <div class="ph-stars" id="ph-stars"></div>
    <button class="btn sm o" id="ph-new" style="display:none" onclick="showForm()">New complaint</button>`;
  clearInterval(timer);
  const tick = () => {
    for (let i = 0; i <= k; i++) document.getElementById('ph-s' + i).classList.add('on');
    document.getElementById('ph-note').innerHTML = ic('bell', 14) + '<span>' + notes[k] + '</span>';
    if (k === 3) {
      clearInterval(timer);
      document.getElementById('ph-stars').textContent = '★★★★★';
      document.getElementById('ph-new').style.display = 'inline-flex';
    }
    k++;
  };
  tick();
  timer = setInterval(tick, 1300);   // 1300 = 1.3 second har step
}

// 3D tilt: mouse hilane par phone thoda ghoomta hai
const stage = document.getElementById('stage');
stage.addEventListener('mousemove', e => {
  const r = stage.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  document.getElementById('phone').style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
});
stage.addEventListener('mouseleave', () => document.getElementById('phone').style.transform = '');

showForm();