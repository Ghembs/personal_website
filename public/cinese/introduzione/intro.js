// Introduction page: theme switch, pronunciation through the device's speech
// synthesis (when it has a Chinese voice), stroke-order demos with Hanzi Writer.

const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
  drawStrokes();
});

// ---------- pronunciation ----------

const synth = window.speechSynthesis;
let voice = null;
function findVoice() {
  const voices = synth ? synth.getVoices() : [];
  voice = voices.find((v) => /^zh[-_](CN|Hans)/i.test(v.lang)) || voices.find((v) => /^zh/i.test(v.lang)) || null;
  document.body.classList.toggle('no-voice', !voice);
  const note = document.getElementById('voice-note');
  if (note && !voice && voices.length) {
    note.textContent = 'Il tuo dispositivo non ha una voce cinese per la sintesi vocale: i pulsanti di ascolto sono disattivati.';
  }
}
if (synth) {
  findVoice();
  synth.addEventListener?.('voiceschanged', findVoice);
} else {
  document.body.classList.add('no-voice');
}

function say(text) {
  if (!voice) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.75;
  synth.speak(u);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-say]');
  if (b) { say(b.dataset.say); return; }
  // grammar sentences: the Chinese part
  const s = e.target.closest('.s');
  if (s) say(s.querySelector('.hz').textContent);
});

// ---------- stroke order ----------

const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const writers = [];
function drawStrokes() {
  if (!window.HanziWriter) return;
  writers.length = 0;
  document.querySelectorAll('.sw').forEach((el, k) => {
    el.innerHTML = '';
    const w = HanziWriter.create(el, el.dataset.char, {
      width: 110, height: 110, padding: 8,
      strokeColor: css('--ink-stroke'), radicalColor: css('--red'), outlineColor: css('--line'),
      showCharacter: false, strokeAnimationSpeed: 1.1, delayBetweenStrokes: 260,
    });
    writers.push(w);
    el.onclick = () => w.animateCharacter();
    setTimeout(() => w.animateCharacter(), 300 + k * 250);
  });
}
// animate when the section comes into view, once
const strokes = document.querySelector('.strokes');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { drawStrokes(); io.disconnect(); }
  }, { rootMargin: '100px' });
  io.observe(strokes);
} else {
  drawStrokes();
}
