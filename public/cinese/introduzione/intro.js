// Introduction page: language and theme switches, pronunciation (voice.js:
// native recordings, the device's voice for whole sentences), stroke-order
// demos with Hanzi Writer.

const TEXT = {
  it: {
    title: 'Introduzione al cinese · Giuliano Gambacorta', back: '← i caratteri HSK 1–4',
    nTones: 'toni', nPinyin: 'pinyin', nChars: 'caratteri', nGrammar: 'grammatica', theme: 'Tema chiaro / scuro',
    foot: 'Testi di Giuliano Gambacorta. Ordine dei tratti: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>. Pronuncia: registrazioni di <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA); le frasi con la sintesi vocale del tuo dispositivo, se ha una voce cinese.',
    noVoice: 'Dove vedi <span class="say-icon">▶</span> puoi ascoltare la pronuncia. Il tuo dispositivo non ha una voce cinese: le frasi vengono lette sillaba per sillaba.',
    lang: 'EN', langName: 'English',
  },
  en: {
    title: 'An introduction to Chinese · Giuliano Gambacorta', back: '← the HSK 1–4 characters',
    nTones: 'tones', nPinyin: 'pinyin', nChars: 'characters', nGrammar: 'grammar', theme: 'Light / dark theme',
    foot: 'Texts by Giuliano Gambacorta. Stroke order: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>. Pronunciation: recordings from <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA); sentences with your device\'s speech synthesis, if it has a Chinese voice.',
    noVoice: 'Where you see <span class="say-icon">▶</span> you can listen to the pronunciation. Your device has no Chinese voice: sentences are read syllable by syllable.',
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
  voiceNote?.();
  watchStrokes?.();
}

const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
  drawStrokes();
});

// ---------- pronunciation ----------

// words and syllables are always there (recordings); only sentences need a voice
function voiceNote() {
  const note = document.getElementById('voice-note');
  if (note && !Voice.hasVoice) note.innerHTML = I18N.t(TEXT, 'noVoice');
}
setTimeout(() => Voice.onVoice(() => voiceNote()), 1500);   // voices arrive late on some browsers

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-say]');
  if (b) { Voice.word(b.dataset.say, b.dataset.py); return; }
  // grammar sentences: the Chinese part, with its pinyin for the syllables
  const s = e.target.closest('.s');
  if (s) Voice.sentence(s.querySelector('.hz').textContent, s.querySelector('i')?.textContent);
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
