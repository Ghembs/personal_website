// The tone trainer. Listening: a hidden character is pronounced (its
// syllable, from the recordings of voice.js) and its tone is to be guessed;
// then the character, and its card on request. Speaking: a character is shown
// and said into the microphone; pitch.js draws its pitch against the
// recording's and tells which tone it sounds like. Either way the tone is
// drawn first, then a character with it, so that the four come up equally
// often (the fourth is far the most common).

const TEXT = {
  it: {
    back: '← cesta dei giochi', section: 'la sezione di cinese', theme: 'Tema chiaro / scuro', lang: 'EN', title: 'allenamento sui toni', docTitle: 'Allenamento sui toni · Giuliano Gambacorta',
    hint: 'ascolta un carattere che non vedi e indovinane il tono', upTo: 'fino a', listen: 'ascolta',
    start: 'premi ▶ (o spazio) per ascoltare', loading: 'carico i caratteri…', listening: 'quale tono è? (1–4)',
    right: 'giusto: {n}° tono', wrong: 'no: era il {n}° tono, non il {g}°', compare: 'tocca un tono per sentire la stessa sillaba',
    reveal: 'mostra la scheda', next: 'prossimo →', reset: 'azzera',
    score: 'giuste {ok} su {n} · di fila {streak} · record {best}', none: 'ancora nessuna risposta',
    meanings: 'significati', words: 'parole', open: 'apri nella sezione di cinese →',
    hintSpeak: 'pronuncia il carattere e guarda come sale e scende la tua voce', mListen: 'ascolta', mSpeak: 'parla', model: 'ascolta il modello', micLabel: 'registra',
    sayStart: 'tieni premuto e pronuncia la sillaba (o tocca, e parla)', recording: 'ti ascolto…', recordingFree: 'ti sento…', analysing: 'analizzo…',
    free: 'mani libere', listeningFree: 'mani libere: pronuncia quando vuoi', notHeardFree: 'non ho sentito bene: riprova quando vuoi',
    sayRight: 'giusto: suona come un {n}° tono', sayNear: 'quasi: il {n}° tono è vicino, ma suona più come un {g}°',
    sayWrong: 'suona come un {g}° tono: il {n}° {d}', notHeard: 'non ho sentito bene: riprova, un po\' più forte o più lungo',
    micDenied: 'il microfono non è autorizzato: permettilo nelle impostazioni del browser', micNone: 'nessun microfono disponibile',
    legend: 'tratteggiata: il modello ({n}° tono) · piena: la tua voce', legendCal: ' · la tua altezza si calibra dopo qualche sillaba',
    privacy: 'L\'audio resta nel tuo browser: viene analizzato qui e non viene inviato a nessuno.',
    langName: 'English', tone: '{n}° tono', d1: 'alto e piatto', d2: 'sale', d3: 'scende e risale', d4: 'scende deciso',
    foot: 'Registrazioni di <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA). Caratteri e significati dalla <a href="../../cinese/">sezione di cinese</a> (HSK 2025, CC-CEDICT).',
  },
  en: {
    back: '← the toy box', section: 'the Chinese section', theme: 'Light / dark theme', lang: 'IT', title: 'tone trainer', docTitle: 'Tone trainer · Giuliano Gambacorta',
    hint: 'listen to a character you can\'t see and guess its tone', upTo: 'up to', listen: 'listen',
    start: 'press ▶ (or space) to listen', loading: 'loading the characters…', listening: 'which tone is it? (1–4)',
    right: 'right: tone {n}', wrong: 'no: it was tone {n}, not {g}', compare: 'tap a tone to hear the same syllable in it',
    reveal: 'show the card', next: 'next →', reset: 'reset',
    score: '{ok} right out of {n} · streak {streak} · best {best}', none: 'no answers yet',
    meanings: 'meanings', words: 'words', open: 'open in the Chinese section →',
    hintSpeak: 'say the character and see how your voice rises and falls', mListen: 'listen', mSpeak: 'speak', model: 'hear the model', micLabel: 'record',
    sayStart: 'hold down and say the syllable (or tap, and speak)', recording: 'listening…', recordingFree: 'I hear you…', analysing: 'analysing…',
    free: 'hands free', listeningFree: 'hands free: speak whenever you like', notHeardFree: 'I didn\'t catch that: try again whenever you like',
    sayRight: 'right: it sounds like tone {n}', sayNear: 'almost: tone {n} is close, but it sounds more like {g}',
    sayWrong: 'it sounds like tone {g}: tone {n} {d}', notHeard: 'I didn\'t catch that: try again, a little louder or longer',
    micDenied: 'the microphone isn\'t allowed: allow it in the browser\'s settings', micNone: 'no microphone available',
    legend: 'dashed: the model (tone {n}) · solid: your voice', legendCal: ' · your pitch is calibrated after a few syllables',
    privacy: 'The audio stays in your browser: it is analysed here and sent to no one.',
    langName: 'Italiano', tone: 'tone {n}', d1: 'high and level', d2: 'rising', d3: 'dips and rises', d4: 'falling',
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
const freshStats = () => ({ n: 0, ok: 0, streak: 0, best: 0, per: { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] } });
let stats = store.get('toni-stats', null) || freshStats();
let speakStats = store.get('toni-speak-stats', null) || freshStats();
let mode = store.get('toni-mode', 'listen');
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

// a tone, then a character with it, not one of the last ones
function draw() {
  const by = pools(), tones = [1, 2, 3, 4].filter((k) => by[k].length);
  const k = tones[(Math.random() * tones.length) | 0];
  const fresh = by[k].filter((x) => !recent.includes(x.c));
  const list = fresh.length ? fresh : by[k];
  const x = list[(Math.random() * list.length) | 0];
  recent.push(x.c);
  if (recent.length > 24) recent.shift();
  return x;
}

function count(st, key, k, ok) {
  st.n++;
  st.per[k][1]++;
  if (ok) { st.ok++; st.streak++; st.per[k][0]++; } else st.streak = 0;
  st.best = Math.max(st.best, st.streak);
  store.set(key, st);
}

async function next() {
  await loaded;
  current = draw();
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
  count(stats, 'toni-stats', current.k, ok);
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
  const st = mode === 'speak' ? speakStats : stats;
  $('#score').textContent = st.n ? t('score', st) : t('none');
  $('#bars').innerHTML = [1, 2, 3, 4].map((k) => {
    const [ok, n] = st.per[k], pc = n ? Math.round((100 * ok) / n) : 0;
    return `<div class="bar">${t('tone', { n: k })} · ${n ? `${pc}%` : '–'}<i><b style="width:${pc}%;background:var(--t${k})"></b></i></div>`;
  }).join('');
}

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  $('#lang').title = t('langName');
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
  $('.hint').textContent = t(mode === 'speak' ? 'hintSpeak' : 'hint');
  if (target) {
    const sk = $('#say-status').dataset.key;
    if (sk) setSay(sk, { n: target.k, g: '?', d: t(`d${target.k}`) }, $('#say-status').className.replace('status', '').trim());
    heard(null);
    plot(null);
  }
  showStats();
}

// ---------- speaking ----------

let target = null;                          // the character to say, with its recorded syllables
let voiceMeans = store.get('toni-voice', []);   // how high the speaker's last syllables sat
// the speaker's centre, once a few syllables are known (the tones come up evenly)
const centre = () => (voiceMeans.length >= 4 ? voiceMeans.reduce((a, b) => a + b, 0) / voiceMeans.length : null);

function setSay(key, vars = {}, cls = '') {
  const s = $('#say-status');
  s.dataset.key = key;
  s.className = `status ${cls}`;
  s.textContent = t(key, vars);
}

async function nextSay() {
  await loaded;
  target = draw();
  const base = plain(target.py);
  target.base = base;
  target.models = Promise.all([1, 2, 3, 4].map((k) => (Voice.has(base + k) ? Pitch.reference(base + k) : null)))
    .then((list) => Object.fromEntries(list.map((m, i) => [i + 1, m])));
  $('#say-glyph').textContent = target.c;
  $('#say-py').innerHTML = `<span style="color:var(--t${target.k})">${target.py}</span><small>HSK ${target.lv}</small>`;
  setSay(handsFree && MIC.ctx ? 'listeningFree' : 'sayStart');
  heard(null);
  plot(null);
  target.models.then(() => plot(null));
}

// the curves: the four of the recording faint, the one to say dashed, the speaker's solid
async function plot(user) {
  const svg = $('#plot'), tg = target;
  if (!tg) { svg.innerHTML = ''; return; }
  const models = await tg.models;
  if (tg !== target) return;
  const ks = [1, 2, 3, 4].filter((k) => models[k]);
  const mc = ks.reduce((a, k) => a + models[k].mean, 0) / (ks.length || 1);
  const X = (i) => 12 + (i / (Pitch.POINTS - 1)) * 276, Y = (v) => 75 - Math.max(-10, Math.min(10, v)) * 6.5;
  const line = (c, off) => c.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v - off).toFixed(1)}`).join('');
  let out = [-6, -3, 0, 3, 6].map((v) => `<line class="grid" x1="6" x2="294" y1="${Y(v)}" y2="${Y(v)}"/>`).join('');
  for (const k of ks) out += `<path class="${k === tg.k ? 'target' : 'ref'}" stroke="var(--t${k})" d="${line(models[k].contour, mc)}"/>`;
  if (user) {
    // the speaker's curve about their own centre; until it is known, level with the model's
    const c = centre(), off = c !== null ? c : user.mean - (models[tg.k] ? models[tg.k].mean - mc : 0);
    out += `<path class="you" d="${line(user.contour, off)}"/>`;
  }
  svg.innerHTML = out;
  $('#legend').textContent = t('legend', { n: tg.k }) + (centre() === null ? t('legendCal') : '');
}

// the four tones, the one heard marked; tapping one plays the syllable in it
function heard(ranked) {
  $('#heard').innerHTML = [1, 2, 3, 4].map((k) => {
    const cls = !ranked ? '' : k === ranked[0].tone ? (k === target.k ? ' right' : ' wrong') : '';
    return `<button class="tone${cls}" data-say-tone="${k}">${contourSvg(k)}<span class="d" style="color:var(--t${k})">${t('tone', { n: k })}</span></button>`;
  }).join('');
}

// The microphone. Once allowed it stays open and keeps its last seconds, so a
// take starts a little before the press and ends a little after the release
// (we start speaking as we press, and stop as we let go). Every block of about
// 20 ms is weighed against the room's own noise: that moves the level ring,
// ends a tapped take when the voice stops and, hands free, starts the takes.
const MIC = { ctx: null, rate: 48000, chunks: [], pos: 0, noise: 0.003, run: 0 };
const PRE = 0.35, POST = 0.3, KEEP = 6;      // seconds
let taking = null;          // the take being recorded: { mode: 'hold' | 'tap' | 'free', start, voiced, last }
let analysing = false, pressed = 0, released = false;
let handsFree = store.get('toni-free', false), quietUntil = 0;
const now = () => MIC.pos / MIC.rate;

async function openMic() {
  if (MIC.ctx) {
    if (MIC.ctx.state === 'suspended') await MIC.ctx.resume();
    return true;
  }
  let stream;
  try {
    // echo cancellation keeps the model's voice, from the speakers, out of the takes
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true, channelCount: 1 } });
  } catch (e) {
    setSay(e.name === 'NotAllowedError' ? 'micDenied' : 'micNone', {}, 'no');
    return false;
  }
  const ctx = new AudioContext();
  const src = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(1024, 1, 1);
  node.onaudioprocess = (e) => hear(e.inputBuffer.getChannelData(0));
  src.connect(node);
  node.connect(ctx.destination);               // silent: its output stays empty
  Object.assign(MIC, { ctx, rate: ctx.sampleRate, src, node });
  return true;
}

function hear(block) {
  const x = new Float32Array(block);
  MIC.chunks.push([MIC.pos, x]);
  MIC.pos += x.length;
  while (MIC.chunks.length && MIC.chunks[0][0] < MIC.pos - KEEP * MIC.rate) MIC.chunks.shift();
  let e = 0;
  for (const v of x) e += v * v;
  const rms = Math.sqrt(e / x.length);
  // the room's noise: follows a quieter moment at once, a louder one slowly
  MIC.noise = rms < MIC.noise ? MIC.noise * 0.6 + rms * 0.4 : MIC.noise * 1.002;
  const voice = rms > Math.max(MIC.noise * 4, 0.0005);
  meter(Math.min(1, Math.log10(Math.max(1, rms / MIC.noise)) / 1.6));
  const t = now();
  if (taking) {
    if (voice) { taking.voiced = true; taking.last = t; }
    // a tapped or hands-free take ends a little after the voice does
    if (taking.mode !== 'hold' && taking.voiced && t - taking.last > 0.45) finish();
    else if (t - taking.start > 3.5) finish();
  } else if (handsFree && mode === 'speak' && !analysing && performance.now() > quietUntil) {
    MIC.run = voice ? MIC.run + 1 : 0;
    if (MIC.run >= 3) { MIC.run = 0; begin('free', t - 0.07); }
  }
}

let meterRaf = 0, meterLevel = 0;
function meter(v) {
  meterLevel = Math.max(v, meterLevel * 0.85);
  if (!meterRaf) meterRaf = requestAnimationFrame(() => { meterRaf = 0; $('#mic').style.setProperty('--lvl', meterLevel.toFixed(2)); });
}

function begin(m, at = now()) {
  taking = { mode: m, start: at, voiced: m === 'free', last: at };
  $('#mic').classList.add('on');
  setSay(m === 'free' ? 'recordingFree' : 'recording');
}

// the take, with a little before and after; a hold waits for its last bit to arrive
function finish() {
  if (!taking) return;
  const tk = taking, t1 = now() + (tk.mode === 'hold' ? POST : 0.1);
  taking = null;
  $('#mic').classList.remove('on');
  const a = Math.max(0, Math.round((tk.start - PRE) * MIC.rate)), b = Math.round(t1 * MIC.rate);
  setTimeout(() => analyseTake(slice(a, b)), Math.max(0, (t1 - now()) * 1000) + 40);
}
function slice(a, b) {
  const out = new Float32Array(Math.max(0, b - a));
  for (const [at, x] of MIC.chunks) {
    const lo = Math.max(a, at), hi = Math.min(b, at + x.length);
    if (hi > lo) out.set(x.subarray(lo - at, hi - at), lo - a);
  }
  return out;
}

async function press() {
  released = false;
  pressed = performance.now();
  if (!target) await nextSay();
  if (!(await openMic())) return;
  if (taking) { finish(); return; }              // a tapped take, tapped again
  begin(released ? 'tap' : 'hold');
}
function release() {
  released = true;
  if (!taking || taking.mode !== 'hold') return;
  // a quick tap: the take goes on until the voice stops
  if (performance.now() - pressed < 400) taking.mode = 'tap';
  else finish();
}

// a take: its curve, the closest tone, the verdict
async function analyseTake(samples) {
  const tg = target;
  analysing = true;
  setSay('analysing');
  let user = null;
  try { user = Pitch.analyse(await Pitch.resample(samples, MIC.rate)); } catch (e) { /* unreadable: as not heard */ }
  analysing = false;
  quietUntil = performance.now() + 500;
  if (!user) { setSay(handsFree ? 'notHeardFree' : 'notHeard', {}, 'no'); return; }
  const ranked = Pitch.classify(user, await tg.models, centre());
  voiceMeans = [...voiceMeans, user.mean].slice(-16);
  store.set('toni-voice', voiceMeans);
  const g = ranked[0].tone, k = tg.k, ok = g === k;
  // the right tone a close second: not quite wrong
  const near = !ok && ranked[1]?.tone === k && ranked[1].dist - ranked[0].dist < 0.12 + 0.15 * ranked[0].dist;
  count(speakStats, 'toni-speak-stats', k, ok);
  setSay(ok ? 'sayRight' : near ? 'sayNear' : 'sayWrong', { n: k, g, d: t(`d${k}`) }, ok ? 'ok' : near ? '' : 'no');
  heard(ranked);
  plot(user);
  showStats();
}

// the recordings played here are not takes
function model(name) {
  quietUntil = performance.now() + 1800;
  if (taking?.mode === 'free') { taking = null; $('#mic').classList.remove('on'); }
  Voice.syllable(name);
}

async function setFree(on) {
  handsFree = on;
  store.set('toni-free', on);
  $('#free').checked = on;
  $('#speak').classList.toggle('hands-free', on);
  if (on && mode === 'speak' && (await openMic())) setSay('listeningFree');
  else if (!on) { if (taking?.mode === 'free') { taking = null; $('#mic').classList.remove('on'); } setSay('sayStart'); }
}

function setMode(m) {
  mode = m;
  store.set('toni-mode', m);
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  $('#listen').hidden = m !== 'listen';
  $('#speak').hidden = m !== 'speak';
  $('.hint').textContent = t(m === 'speak' ? 'hintSpeak' : 'hint');
  if (m === 'speak' && !target) nextSay();
  // hands free again: the microphone opens on the first touch (browsers want a gesture)
  $('#free').checked = handsFree;
  $('#speak').classList.toggle('hands-free', handsFree);
  if (m === 'speak' && handsFree && MIC.ctx) setSay('listeningFree');
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
  if (mode === 'speak') { speakStats = freshStats(); store.set('toni-speak-stats', speakStats); } else { stats = freshStats(); store.set('toni-stats', stats); }
  showStats();
});
document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
// the microphone: held down, it records until let go; tapped, until tapped again (or 3 s)
$('#mic').addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
$('#mic').addEventListener('pointerup', release);
$('#mic').addEventListener('pointerleave', () => { if (taking?.mode === 'hold') release(); });
$('#free').addEventListener('change', (e) => setFree(e.target.checked));
addEventListener('pointerdown', () => { if (handsFree && mode === 'speak' && !MIC.ctx) setFree(true); });
$('#model').addEventListener('click', () => target && model(target.name));
$('#say-next').addEventListener('click', nextSay);
$('#say-glyph').addEventListener('click', () => target && model(target.name));
$('#heard').addEventListener('click', (e) => { const b = e.target.closest('[data-say-tone]'); if (b && target) model(target.base + b.dataset.sayTone); });
addEventListener('keyup', (e) => { if (mode === 'speak' && e.key === ' ') release(); });
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (mode === 'speak') {
    if (e.key === ' ') { e.preventDefault(); if (!e.repeat) press(); }
    else if (e.key === 'Enter') { e.preventDefault(); nextSay(); }
    else if (/^[1-4]$/.test(e.key) && target) model(target.base + e.key);
    else if (e.key === 'm' || e.key === 'M') target && model(target.name);
    return;
  }
  if (e.key === ' ') { e.preventDefault(); answered ? next() : play(); }
  else if (e.key === 'Enter') { e.preventDefault(); next(); }
  else if (/^[1-4]$/.test(e.key)) guess(+e.key);
  else if (e.key === 'r' || e.key === 'R') play();
  else if (e.key === 's' || e.key === 'S') reveal();
});
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
});

render();
setStatus('loading');
loaded.then(() => setStatus('start'));
setMode(mode);
