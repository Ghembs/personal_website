// Introduction page: language and theme switches, pronunciation through the
// device's speech synthesis (when it has a Chinese voice), stroke-order demos
// with Hanzi Writer.

const TEXT = {
  it: {
    title: 'Introduzione al cinese · Giuliano Gambacorta', back: '← i caratteri HSK 1–4',
    nTones: 'toni', nPinyin: 'pinyin', nChars: 'caratteri', nGrammar: 'grammatica', theme: 'Tema chiaro / scuro',
    foot: 'Testi di Giuliano Gambacorta. Ordine dei tratti: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>. La pronuncia usa la sintesi vocale del tuo dispositivo.',
    noVoice: 'Il tuo dispositivo non ha una voce cinese per la sintesi vocale: i pulsanti di ascolto sono disattivati.',
    lang: 'EN', langName: 'English',
  },
  en: {
    title: 'An introduction to Chinese · Giuliano Gambacorta', back: '← the HSK 1–4 characters',
    nTones: 'tones', nPinyin: 'pinyin', nChars: 'characters', nGrammar: 'grammar', theme: 'Light / dark theme',
    foot: 'Texts by Giuliano Gambacorta. Stroke order: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>. Pronunciation uses your device\'s speech synthesis.',
    noVoice: 'Your device has no Chinese voice for speech synthesis: the listen buttons are off.',
    lang: 'IT', langName: 'Italiano',
  },
};

// Both texts live in the page: the Italian one in <main>, the English one in
// a template; switching swaps them, so anchors (#toni, #caratteri) stay valid.
const main = document.querySelector('main');
const texts = { it: main.innerHTML, en: document.getElementById('main-en').innerHTML };
let shown = 'it';
function applyLanguage() {
  if (shown !== I18N.lang) { main.innerHTML = texts[I18N.lang]; shown = I18N.lang; }
  I18N.apply(TEXT);
  document.title = I18N.t(TEXT, 'title');
  const b = document.getElementById('lang');
  b.textContent = I18N.t(TEXT, 'lang');
  b.title = I18N.t(TEXT, 'langName');
  findVoice?.();
  watchStrokes?.();
}

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
  if (note && !voice && voices.length) note.textContent = I18N.t(TEXT, 'noVoice');
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
// animate when the section comes into view, once per text shown
let io = null;
function watchStrokes() {
  io?.disconnect();
  const strokes = document.querySelector('.strokes');
  if (!('IntersectionObserver' in window)) { drawStrokes(); return; }
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { drawStrokes(); io.disconnect(); }
  }, { rootMargin: '100px' });
  io.observe(strokes);
}

document.getElementById('lang').addEventListener('click', () => {
  I18N.set(I18N.other);
  const y = window.scrollY / Math.max(1, document.body.scrollHeight);
  applyLanguage();
  window.scrollTo(0, y * document.body.scrollHeight);
});
applyLanguage();
