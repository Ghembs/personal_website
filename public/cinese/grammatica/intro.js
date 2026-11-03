// The grammar page: an introduction for beginners, and a tab for each HSK
// level with the items of its grammar syllabus (livelli.js). Language and
// theme switches, pronunciation (voice.js: native recordings, the device's
// voice for whole sentences), stroke-order demos with Hanzi Writer.

const TEXT = {
  it: {
    title: 'Introduzione al cinese · Giuliano Gambacorta', back: '← i caratteri HSK 1–4',
    nTones: 'toni', nPinyin: 'pinyin', nChars: 'caratteri', nGrammar: 'grammatica', theme: 'Tema chiaro / scuro',
    tIntro: 'introduzione', aTabs: 'Schede', levelTitle: 'Grammatica HSK {n} · Giuliano Gambacorta', grammarOf: 'Grammatica HSK {n}',
    levelLead: 'Le voci del programma di grammatica del sillabo HSK (2025) per il livello {n}, nel suo ordine e sotto le sue intestazioni, che sono riportate in cinese accanto a ogni titolo. I livelli si sommano: qui c\'è solo ciò che il livello {n} aggiunge. Le spiegazioni e gli esempi sono miei, e gli esempi usano soltanto parole fino a questo livello. Tocca una frase per ascoltarla, una parola per aprirne la scheda.',
    soon: 'La grammatica di questo livello è in preparazione.', toIntro: '← all\'introduzione', next: 'HSK {n} →',
    foot: 'Testi di Giuliano Gambacorta. Ordine dei tratti: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>. Pronuncia: registrazioni di <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA); le frasi con la sintesi vocale del tuo dispositivo, se ha una voce cinese.',
    noVoice: 'Dove vedi <span class="say-icon">▶</span> puoi ascoltare la pronuncia. Il tuo dispositivo non ha una voce cinese: le frasi vengono lette sillaba per sillaba.',
    lang: 'EN', langName: 'English',
  },
  en: {
    title: 'An introduction to Chinese · Giuliano Gambacorta', back: '← the HSK 1–4 characters',
    nTones: 'tones', nPinyin: 'pinyin', nChars: 'characters', nGrammar: 'grammar', theme: 'Light / dark theme',
    tIntro: 'introduction', aTabs: 'Tabs', levelTitle: 'HSK {n} grammar · Giuliano Gambacorta', grammarOf: 'HSK {n} grammar',
    levelLead: 'The items of the grammar syllabus of the HSK syllabus (2025) for level {n}, in its order and under its headings, given in Chinese beside each title. Levels add up: here is only what level {n} adds. The explanations and examples are mine, and the examples use only words up to this level. Tap a sentence to hear it, a word to open its card.',
    soon: 'The grammar of this level is in the works.', toIntro: '← to the introduction', next: 'HSK {n} →',
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
  route(false);
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

// ---------- tabs: the introduction, or a level ----------

// #hsk1… opens a level; anything else (#toni, #caratteri…) is in the introduction
const levelEl = document.getElementById('level');
const t = (k, v) => I18N.t(TEXT, k, v);
const tabOf = () => (/^#hsk([1-4])$/.exec(location.hash) || [])[1] || 'intro';
function route(scroll = true) {
  const tab = tabOf();
  document.querySelectorAll('[data-tab]').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  document.getElementById('sections').hidden = tab !== 'intro';
  main.hidden = tab !== 'intro';
  levelEl.hidden = tab === 'intro';
  document.title = tab === 'intro' ? t('title') : t('levelTitle', { n: tab });
  if (tab !== 'intro') renderLevel(+tab);
  if (!scroll) return;
  if (tab === 'intro' && location.hash && location.hash !== '#introduzione') document.querySelector(location.hash)?.scrollIntoView();
  else window.scrollTo(0, 0);
}
addEventListener('hashchange', () => route());

// a word of the pattern: its card in the Chinese section (a character's, or a word's)
const link = (w) => `<a class="key" href="../${[...w].length === 1 ? '' : '?vista=parole'}#${encodeURIComponent(w)}">${w}</a>`;
// the syllabus's forms, their words made links (the longest first: 哪儿 before 哪)
function linked(zh, keys = []) {
  const ks = [...keys].sort((a, b) => b.length - a.length);
  let out = '';
  for (let i = 0; i < zh.length;) {
    const k = ks.find((x) => zh.startsWith(x, i));
    if (k) { out += link(k); i += k.length; } else out += zh[i++];
  }
  return out;
}
function renderLevel(n) {
  const L = I18N.lang, items = GRAMMAR[n] || [];
  let html = `<section class="hero"><h1><span class="hz">语法</span> ${t('grammarOf', { n })}</h1>` +
    (items.length ? `<p class="lead">${t('levelLead', { n })}</p>` : `<p class="lead">${t('soon')}</p>`) + '</section>';
  let sec = null;
  for (const it of items) {
    if (it.sec !== sec) {
      if (sec) html += '</section>';
      sec = it.sec;
      html += `<section><h2><span class="hz">${SECTIONS[sec].zh}</span> ${SECTIONS[sec][L]}</h2>`;
    }
    html += `<article class="g"><h3>${it.t[L]}</h3>` +
      `<div class="syl"><span class="hz">${it.sub}</span>${it.zh ? ` · <span class="hz pat">${linked(it.zh, it.keys)}</span>` : ''}</div>` +
      `<p>${it.p[L]}</p>` +
      it.ex.map(([zh, py, itx, en]) => `<div class="s"><span class="hz">${zh}</span><i>${py}</i><span>${L === 'it' ? itx : en}</span></div>`).join('') +
      '</article>';
  }
  if (sec) html += '</section>';
  html += `<section class="next"><a class="go" href="#introduzione">${t('toIntro')}</a>` +
    (n < 4 ? ` <a class="go" href="#hsk${n + 1}">${t('next', { n: n + 1 })}</a>` : '') + '</section>';
  levelEl.innerHTML = html;
}

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
