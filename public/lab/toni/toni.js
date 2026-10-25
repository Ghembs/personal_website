// The tone trainer: a hidden character is pronounced (its syllable, from the
// recordings of voice.js) and its tone is to be guessed; then the character,
// and its card on request. The tone is drawn first, then a character with it,
// so that the four come up equally often (the fourth is far the most common).

const TEXT = {
  it: {
    back: '[ ← cesta dei giochi ]', lang: 'EN', title: 'allenamento sui toni', docTitle: 'Allenamento sui toni · Giuliano Gambacorta',
    hint: 'ascolta un carattere che non vedi e indovinane il tono', upTo: 'fino a', listen: 'ascolta',
    start: 'premi ▶ (o spazio) per ascoltare', loading: 'carico i caratteri…', listening: 'quale tono è? (1–4)',
    right: 'giusto: {n}° tono', wrong: 'no: era il {n}° tono, non il {g}°', compare: 'tocca un tono per sentire la stessa sillaba',
    reveal: '[ mostra la scheda ]', next: '[ prossimo → ]', reset: '[ azzera ]',
    score: 'giuste {ok} su {n} · di fila {streak} · record {best}', none: 'ancora nessuna risposta',
    meanings: 'significati', words: 'parole', open: 'apri nella sezione di cinese →',
    tone: '{n}° tono', d1: 'alto e piatto', d2: 'sale', d3: 'scende e risale', d4: 'scende deciso',
    foot: 'Registrazioni di <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA). Caratteri e significati dalla <a href="../../cinese/">sezione di cinese</a> (HSK 2025, CC-CEDICT).',
  },
  en: {
    back: '[ ← the toy box ]', lang: 'IT', title: 'tone trainer', docTitle: 'Tone trainer · Giuliano Gambacorta',
    hint: 'listen to a character you can\'t see and guess its tone', upTo: 'up to', listen: 'listen',
    start: 'press ▶ (or space) to listen', loading: 'loading the characters…', listening: 'which tone is it? (1–4)',
    right: 'right: tone {n}', wrong: 'no: it was tone {n}, not {g}', compare: 'tap a tone to hear the same syllable in it',
    reveal: '[ show the card ]', next: '[ next → ]', reset: '[ reset ]',
    score: '{ok} right out of {n} · streak {streak} · best {best}', none: 'no answers yet',
    meanings: 'meanings', words: 'words', open: 'open in the Chinese section →',
    tone: 'tone {n}', d1: 'high and level', d2: 'rising', d3: 'dips and rises', d4: 'falling',
    foot: 'Recordings from <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA). Characters and meanings from the <a href="../../cinese/">Chinese section</a> (HSK 2025, CC-CEDICT).',
  },
};
const t = (k, v) => I18N.t(TEXT, k, v);
const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
};

// ---------- tones ----------

const MARKS = { 1: 'āēīōūǖ', 2: 'áéíóúǘ', 3: 'ǎěǐǒǔǚ', 4: 'àèìòùǜ' };
const toneOf = (py) => +(Object.keys(MARKS).find((k) => [...py].some((ch) => MARKS[k].includes(ch))) || 5);
const plain = (py) => py.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();
// Chao's tone letters, 5 the highest: the contour each button draws
const CONTOUR = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 4], 4: [5, 1] };

function contourSvg(k) {
  const y = (v) => 55 - (v - 1) * 12.5, p = CONTOUR[k];
  const grid = [1, 2, 3, 4, 5].map((v) => `<line class="grid" x1="6" x2="94" y1="${y(v)}" y2="${y(v)}"/>`).join('');
  const d = p.length === 3
    ? `M14 ${y(p[0])} Q 44 ${y(p[1]) + 8} 86 ${y(p[2])}`
    : `M14 ${y(p[0])} L86 ${y(p[1])}`;
  return `<svg viewBox="0 0 100 60" aria-hidden="true">${grid}<path class="curve" d="${d}" stroke="var(--t${k})"/></svg>`;
}

// ---------- data ----------

let level = store.get('toni-level', 1);
let stats = store.get('toni-stats', null) || { n: 0, ok: 0, streak: 0, best: 0, per: { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] } };
let hsk = null, ced = null, current = null, answered = false;
const recent = [];

const loaded = Promise.all(['hsk', 'cedict'].map((f) => fetch(`../../cinese/data/${f}.json`).then((r) => r.json())))
  .then(async ([h, c]) => { hsk = h; ced = c; await Voice.ready; });

// characters up to the level, by tone: their first reading, if recorded
function pools() {
  const by = { 1: [], 2: [], 3: [], 4: [] };
  for (const { c, level: lv } of hsk.chars) {
    const py = ced.chars[c]?.[0]?.[0];
    if (lv > level || !py) continue;
    const k = toneOf(py), name = plain(py) + k;
    if (k < 5 && Voice.has(name)) by[k].push({ c, lv, py, k, name });
  }
  return by;
}

// ---------- the game ----------

async function next() {
  await loaded;
  const by = pools(), tones = [1, 2, 3, 4].filter((k) => by[k].length);
  const k = tones[(Math.random() * tones.length) | 0];
  const fresh = by[k].filter((x) => !recent.includes(x.c));
  const list = fresh.length ? fresh : by[k];
  current = list[(Math.random() * list.length) | 0];
  recent.push(current.c);
  if (recent.length > 24) recent.shift();
  answered = false;
  document.body.classList.remove('answered');
  document.querySelectorAll('.tone').forEach((b) => b.classList.remove('right', 'wrong'));
  $('#answer').hidden = true;
  $('#card').hidden = true;
  setStatus('listening');
  play();
}

async function play() {
  if (!current) { next(); return; }
  $('#play').classList.add('on');
  await Voice.syllable(current.name);
  $('#play').classList.remove('on');
}

function guess(g) {
  if (!current) { next(); return; }
  if (answered) {
    // after the answer: the same syllable in the tone asked for
    Voice.syllable(plain(current.py) + g);
    return;
  }
  answered = true;
  document.body.classList.add('answered');
  const ok = g === current.k;
  stats.n++;
  stats.per[current.k][1]++;
  if (ok) { stats.ok++; stats.streak++; stats.per[current.k][0]++; } else stats.streak = 0;
  stats.best = Math.max(stats.best, stats.streak);
  store.set('toni-stats', stats);
  document.querySelector(`.tone[data-tone="${current.k}"]`).classList.add('right');
  if (!ok) document.querySelector(`.tone[data-tone="${g}"]`).classList.add('wrong');
  setStatus(ok ? 'right' : 'wrong', { n: current.k, g }, ok ? 'ok' : 'no');
  $('#glyph').textContent = current.c;
  $('#reading').innerHTML = `<span style="color:var(--t${current.k})">${current.py}</span><small>HSK ${current.lv}</small>`;
  $('#answer').hidden = false;
  showStats();
  setTimeout(() => { if (answered && $('#status').dataset.key !== 'compare') setStatus('compare', {}, ''); }, 2200);
}

// the card, on request: readings, meanings, a few words
function reveal() {
  if (!current) return;
  const { c } = current;
  const entries = ced.chars[c] || [];
  const [first, ...others] = entries;
  const words = hsk.words.filter((w) => w.level <= level && w.w !== c && w.w.includes(c)).slice(0, 6);
  $('#card').innerHTML =
    `<b>${t('meanings')}</b>` +
    (first ? `<ol>${first[1].slice(0, 4).map((x) => `<li>${x}</li>`).join('')}</ol>` : '') +
    others.filter(([, d]) => d.length).map(([py, d]) => `<div class="other">${py}: ${d.slice(0, 2).join('; ')}</div>`).join('') +
    (words.length ? `<div class="words"><b>${t('words')}</b> · ${words.map((w) =>
      `<button data-word="${w.w}" data-py="${w.py}"><span class="hz">${w.w}</span> ${w.py}</button>`).join(' · ')}</div>` : '') +
    `<a href="../../cinese/#${encodeURIComponent(c)}">${t('open')}</a>`;
  $('#card').hidden = false;
}

function setStatus(key, vars = {}, cls = '') {
  const s = $('#status');
  s.dataset.key = key;
  s.className = `status ${cls}`;
  s.textContent = t(key, vars);
}

function showStats() {
  $('#score').textContent = stats.n ? t('score', stats) : t('none');
  $('#bars').innerHTML = [1, 2, 3, 4].map((k) => {
    const [ok, n] = stats.per[k], pc = n ? Math.round((100 * ok) / n) : 0;
    return `<div class="bar">${t('tone', { n: k })} · ${n ? `${pc}%` : '–'}<i><b style="width:${pc}%;background:var(--t${k})"></b></i></div>`;
  }).join('');
}

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  $('#tones').innerHTML = [1, 2, 3, 4].map((k) =>
    `<button class="tone" data-tone="${k}">${contourSvg(k)}<span class="n" style="color:var(--t${k})">${t('tone', { n: k })}</span>` +
    `<span class="d">${t(`d${k}`)}</span><kbd>${k}</kbd></button>`).join('');
  if (current && answered) {
    document.querySelector(`.tone[data-tone="${current.k}"]`).classList.add('right');
  }
  document.querySelectorAll('[data-level]').forEach((b) => b.classList.toggle('on', +b.dataset.level === level));
  const s = $('#status');
  setStatus(s.dataset.key || 'start', current ? { n: current.k, g: '?' } : {}, s.className.replace('status', '').trim());
  if (!$('#card').hidden) reveal();
  showStats();
}

// ---------- controls ----------

$('#play').addEventListener('click', () => (answered ? next() : play()));
$('#tones').addEventListener('click', (e) => { const b = e.target.closest('.tone'); if (b) guess(+b.dataset.tone); });
$('#next').addEventListener('click', next);
$('#reveal').addEventListener('click', reveal);
$('#card').addEventListener('click', (e) => { const w = e.target.closest('[data-word]'); if (w) Voice.word(w.dataset.word, w.dataset.py); });
$('#glyph').addEventListener('click', () => current && answered && Voice.word(current.c, current.py));
document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
  level = +b.dataset.level;
  store.set('toni-level', level);
  document.querySelectorAll('[data-level]').forEach((x) => x.classList.toggle('on', x === b));
  recent.length = 0;
}));
$('#reset').addEventListener('click', () => {
  stats = { n: 0, ok: 0, streak: 0, best: 0, per: { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] } };
  store.set('toni-stats', stats);
  showStats();
});
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === ' ') { e.preventDefault(); answered ? next() : play(); }
  else if (e.key === 'Enter') { e.preventDefault(); next(); }
  else if (/^[1-4]$/.test(e.key)) guess(+e.key);
  else if (e.key === 'r' || e.key === 'R') play();
  else if (e.key === 's' || e.key === 'S') reveal();
});
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });

render();
setStatus('loading');
loaded.then(() => setStatus('start'));
