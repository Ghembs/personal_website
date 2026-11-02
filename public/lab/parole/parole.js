// The word trainer: the HSK 1–4 words of the Chinese section, three ways.
// Meaning: a word, and four meanings to choose from. Writing: a meaning, with
// its part of speech and length, and the word to write stroke by stroke
// (Hanzi Writer), a character at a time. Pinyin: a word, and its reading to
// type, a tone per syllable. Words come up at random within the chosen
// levels, not the last ones again; the card is a click away.

const TEXT = {
  it: {
    back: '← cesta dei giochi', section: 'le parole nella sezione di cinese', tones: 'toni', theme: 'Tema chiaro / scuro', lang: 'EN',
    title: 'allenamento sulle parole', docTitle: 'Allenamento sulle parole · Giuliano Gambacorta', upTo: 'fino a',
    mMeaning: 'significato', mWrite: 'scrittura', mPinyin: 'pinyin',
    hMeaning: 'che cosa vuol dire questa parola?', hWrite: 'scrivi la parola che ha questo significato', hPinyin: 'come si legge? scrivi il pinyin e scegli i toni',
    loading: 'carico le parole…', choose: 'scegli il significato (1–4)', writeNow: 'traccia i tratti, un carattere alla volta',
    typeNow: 'scrivi ogni sillaba e scegline il tono (o aggiungi il numero: ma3)',
    right: 'giusto', wrong: 'no: la risposta giusta è evidenziata', written: 'scritta', writtenHelp: 'scritta, con {n} suggerimenti',
    gaveUp: 'eccola, tratto per tratto', readRight: 'giusto', readWrong: 'quasi: {ok} sillabe giuste su {n}', readNone: 'no: ecco la lettura',
    chars: '{n} caratteri', char1: '1 carattere', outline: 'mostra il contorno', noOutline: 'nascondi il contorno',
    hintPy: 'suggerisci il pinyin', giveUp: 'non lo so', check: 'controlla', listen: 'ascolta', open: 'apri la scheda →', next: 'prossima →',
    reset: 'azzera', score: 'giuste {ok} su {n} · di fila {streak} · record {best}', none: 'ancora nessuna risposta',
    syllable: 'sillaba {n}', toneN: '{n}° tono', neutral: 'neutro', measure: 'classificatore',
    langName: 'English',
    foot: 'Parole e livelli dal sillabo HSK 2025, significati da <a href="https://cc-cedict.org/">CC-CEDICT</a> (CC BY-SA 4.0), registrazioni di <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (CC BY-SA), tratti di <a href="https://hanziwriter.org/">Hanzi Writer</a>: tutto dalla <a href="../../cinese/?vista=parole">sezione di cinese</a>.',
    pos: { 名: 'nome', 动: 'verbo', 形: 'aggettivo', 副: 'avverbio', 量: 'classificatore', 代: 'pronome', 连: 'congiunzione', 介: 'preposizione',
      数: 'numerale', 助: 'particella', 后缀: 'suffisso', 数量: 'numerale con classificatore', 前缀: 'prefisso', 叹: 'interiezione' },
  },
  en: {
    back: '← the toy box', section: 'the words in the Chinese section', tones: 'tones', theme: 'Light / dark theme', lang: 'IT',
    title: 'word trainer', docTitle: 'Word trainer · Giuliano Gambacorta', upTo: 'up to',
    mMeaning: 'meaning', mWrite: 'writing', mPinyin: 'pinyin',
    hMeaning: 'what does this word mean?', hWrite: 'write the word with this meaning', hPinyin: 'how is it read? type the pinyin and pick the tones',
    loading: 'loading the words…', choose: 'choose the meaning (1–4)', writeNow: 'trace the strokes, a character at a time',
    typeNow: 'type each syllable and pick its tone (or add its number: ma3)',
    right: 'right', wrong: 'no: the right answer is marked', written: 'written', writtenHelp: 'written, with {n} hints',
    gaveUp: 'here it is, stroke by stroke', readRight: 'right', readWrong: 'almost: {ok} syllables right out of {n}', readNone: 'no: here is the reading',
    chars: '{n} characters', char1: '1 character', outline: 'show the outline', noOutline: 'hide the outline',
    hintPy: 'hint: pinyin', giveUp: 'I don\'t know', check: 'check', listen: 'listen', open: 'open the card →', next: 'next →',
    reset: 'reset', score: '{ok} right out of {n} · streak {streak} · best {best}', none: 'no answers yet',
    syllable: 'syllable {n}', toneN: 'tone {n}', neutral: 'neutral', measure: 'measure word',
    langName: 'Italiano',
    foot: 'Words and levels from the HSK syllabus 2025, meanings from <a href="https://cc-cedict.org/">CC-CEDICT</a> (CC BY-SA 4.0), recordings from <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (CC BY-SA), strokes by <a href="https://hanziwriter.org/">Hanzi Writer</a>: all from the <a href="../../cinese/?vista=parole">Chinese section</a>.',
    pos: { 名: 'noun', 动: 'verb', 形: 'adjective', 副: 'adverb', 量: 'measure word', 代: 'pronoun', 连: 'conjunction', 介: 'preposition',
      数: 'numeral', 助: 'particle', 后缀: 'suffix', 数量: 'numeral with measure word', 前缀: 'prefix', 叹: 'interjection' },
  },
};
const t = (k, v) => I18N.t(TEXT, k, v);
const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
};

// ---------- words ----------

const MARKS = { 1: 'āēīōūǖ', 2: 'áéíóúǘ', 3: 'ǎěǐǒǔǚ', 4: 'àèìòùǜ' };
const toneOf = (py) => +(Object.keys(MARKS).find((k) => [...py].some((ch) => MARKS[k].includes(ch))) || 5);
const plain = (py) => py.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();
const letters = (py) => py.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
const posTags = (pos) => (pos || '').replace(/[（）()]/g, '').split('、').filter(Boolean);
const clean = (d) => d.replace(/\s*\(?CL:.*$/, '').replace(/\s*\([^)]*[一-鿿][^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

let hsk = null, ced = null;
const loaded = Promise.all(['hsk', 'cedict'].map((f) => fetch(`../../cinese/data/${f}.json`).then((r) => r.json())))
  .then(async ([h, c]) => { hsk = h; ced = c; await Voice.ready; });

const defsOf = (w) => (ced.words[w.w]?.d || []).map(clean).filter(Boolean);
// a meaning to recognise: the first sense or two, short
const meaningOf = (w) => {
  const d = defsOf(w), first = d[0] || '';
  return first.length < 28 && d[1] ? `${first}; ${d[1]}` : first;
};

// The word's syllables, a character each, cut from the syllabus's pinyin with
// the readings the dictionary knows for each character; null if they don't fit.
function syllablesOf(w) {
  const chars = [...w.w], py = letters(w.py.split('/')[0]);   // 谁 shéi/shuí: the first
  const cut = (i, at) => {
    if (i === chars.length) return at === py.length ? [] : null;
    const options = chars[i] === '儿' && i === chars.length - 1 ? ['r'] : [];
    for (const [r] of ced.chars[chars[i]] || []) options.push(letters(r));
    for (const o of [...new Set(options)].sort((a, b) => b.length - a.length)) {
      const part = py.slice(at, at + o.length);
      if (!o || plain(part) !== plain(o)) continue;
      const rest = cut(i + 1, at + o.length);
      if (rest) return [{ c: chars[i], py: part, base: plain(part), tone: toneOf(part), own: toneOf(o) }, ...rest];
    }
    return null;
  };
  return cut(0, 0);
}

// ---------- state ----------

let level = store.get('parole-level', 1);
let mode = store.get('parole-mode', 'meaning');
const freshStats = () => ({ n: 0, ok: 0, streak: 0, best: 0 });
const stats = store.get('parole-stats', null) || { meaning: freshStats(), write: freshStats(), pinyin: freshStats() };
let showOutline = store.get('parole-outline', false);
let current = null, answered = false;
const recent = [];

function draw() {
  const pool = hsk.words.filter((w) => w.level <= level && defsOf(w).length && (mode !== 'pinyin' || syllablesOf(w)));
  const fresh = pool.filter((w) => !recent.includes(w.w));
  const list = fresh.length ? fresh : pool;
  const w = list[(Math.random() * list.length) | 0];
  recent.push(w.w);
  if (recent.length > 30) recent.shift();
  return w;
}

function count(ok) {
  const st = stats[mode];
  st.n++;
  if (ok) { st.ok++; st.streak++; } else st.streak = 0;
  st.best = Math.max(st.best, st.streak);
  store.set('parole-stats', stats);
  showStats();
}

function showStats() {
  const st = stats[mode];
  $('#score').textContent = st.n ? t('score', st) : t('none');
}

function setStatus(key, vars = {}, cls = '') {
  const s = $('#status');
  s.dataset.key = key;
  s.dataset.vars = JSON.stringify(vars);
  s.className = `status ${cls}`;
  s.textContent = t(key, vars);
}

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const metaOf = (w) => [posTags(w.pos).map((p) => TEXT[I18N.lang].pos[p] || p).join(', '),
  [...w.w].length === 1 ? t('char1') : t('chars', { n: [...w.w].length }), `HSK ${w.level}`].filter(Boolean).join(' · ');

// ---------- the round ----------

async function next() {
  await loaded;
  current = draw();
  answered = false;
  $('#answer').hidden = true;
  $('#choices').hidden = mode !== 'meaning';
  $('#write').hidden = mode !== 'write';
  $('#pinyin').hidden = mode !== 'pinyin';
  if (mode === 'meaning') askMeaning();
  else if (mode === 'write') askWrite();
  else askPinyin();
}

function renderPrompt() {
  const w = current;
  $('#prompt').innerHTML = mode === 'write'
    ? `<div class="meaning">${meaningOf(w)}</div><div class="meta">${metaOf(w)}</div><div id="pyHint" class="py-hint"></div>`
    : `<button class="word hz" data-say aria-label="${t('listen')}">${w.w}</button>`;
}

// meaning: the word's own, and three of words alike in kind but not in sense
function askMeaning() {
  const w = current, mine = meaningOf(w), pos = posTags(w.pos)[0];
  const words = new Set(defsOf(w).join(' ').toLowerCase().match(/[a-z]{4,}/g) || []);
  const unlike = (x) => x.w !== w.w && meaningOf(x) && meaningOf(x) !== mine &&
    !(meaningOf(x).toLowerCase().match(/[a-z]{4,}/g) || []).some((v) => words.has(v));
  let others = shuffle(hsk.words.filter((x) => posTags(x.pos)[0] === pos && Math.abs(x.level - w.level) <= 1 && unlike(x)));
  if (others.length < 3) others = others.concat(shuffle(hsk.words.filter(unlike)));
  const options = shuffle([w, ...others.slice(0, 3)]);
  current.options = options;
  renderPrompt();
  renderChoices();
  setStatus('choose');
}
function renderChoices() {
  $('#choices').innerHTML = current.options.map((x, i) =>
    `<button class="choice" data-pick="${i}"><kbd>${i + 1}</kbd><span>${meaningOf(x)}</span></button>`).join('');
}
function pick(i) {
  if (answered || mode !== 'meaning') return;
  const ok = current.options[i] === current;
  document.querySelectorAll('.choice').forEach((b, j) => {
    b.disabled = true;
    if (current.options[j] === current) b.classList.add('right');
    else if (j === i) b.classList.add('wrong');
  });
  setStatus(ok ? 'right' : 'wrong', {}, ok ? 'ok' : 'no');
  finish(ok);
}

// writing: a box per character, the one to write marked; its strokes from memory,
// a hint after three misses on a stroke (or the outline, on request)
let writers = [], writing = 0, hints = 0;
function inkColours() {
  const css = getComputedStyle(document.documentElement);
  const paper = css.getPropertyValue('--paper').trim() || `rgb(${css.getPropertyValue('--fg')})`;
  return { strokeColor: paper, radicalColor: paper, drawingColor: paper, highlightColor: css.getPropertyValue('--t2').trim(),
    outlineColor: `rgba(${css.getPropertyValue('--fg').trim()}, 0.14)` };
}
function askWrite() {
  renderPrompt();
  hints = 0;
  writing++;
  const chars = [...current.w], el = $('#boxes');
  const size = Math.max(64, Math.min(150, Math.floor(((el.clientWidth || 520) - 12 * (chars.length - 1)) / chars.length)));
  el.innerHTML = chars.map(() => `<div class="box" style="width:${size}px;height:${size}px"></div>`).join('');
  writers = chars.map((c, i) => HanziWriter.create(el.children[i], c, {
    width: size, height: size, padding: 8, showCharacter: false, showOutline, showHintAfterMisses: 3,
    strokeAnimationSpeed: 1.3, delayBetweenStrokes: 120, ...inkColours(),
  }));
  $('#outline').textContent = t(showOutline ? 'noOutline' : 'outline');
  $('#write .acts').hidden = false;
  setStatus('writeNow');
  quizFrom(0, writing);
}
function quizFrom(k, run) {
  if (run !== writing) return;
  [...$('#boxes').children].forEach((b, i) => b.classList.toggle('now', i === k));
  writers[k].quiz({
    onMistake: (s) => { if (s.mistakesOnStroke === 3) hints++; },
    onComplete: () => {
      if (run !== writing) return;
      if (k + 1 < writers.length) quizFrom(k + 1, run);
      else {
        $('#boxes .now')?.classList.remove('now');
        setStatus(hints ? 'writtenHelp' : 'written', { n: hints }, hints ? '' : 'ok');
        finish(!hints);
      }
    },
  });
}
function giveUpWrite() {
  if (answered) return;
  const run = ++writing;
  $('#boxes .now')?.classList.remove('now');
  writers.forEach((w) => { w.cancelQuiz(); w.hideCharacter(); });
  const show = (i) => { if (run === writing && i < writers.length) writers[i].animateCharacter({ onComplete: () => show(i + 1) }); };
  show(0);
  setStatus('gaveUp', {}, 'no');
  finish(false);
}

// pinyin: letters and a tone for each syllable; a number typed after the
// letters picks the tone too
function askPinyin() {
  renderPrompt();
  current.sylls = syllablesOf(current);
  const marks = ['', 'ā', 'á', 'ǎ', 'à', 'a'];
  $('#sylls').innerHTML = current.sylls.map((s, i) => `<div class="syl" data-i="${i}">` +
    `<span class="hz">${s.c}</span>` +
    `<input type="text" inputmode="latin" autocapitalize="off" spellcheck="false" aria-label="${t('syllable', { n: i + 1 })}">` +
    `<div class="pick">${[1, 2, 3, 4, 5].map((k) => `<button type="button" data-tone="${k}" title="${k === 5 ? t('neutral') : t('toneN', { n: k })}" style="--c:var(--t${k === 5 ? 3 : k})">${marks[k]}</button>`).join('')}</div>` +
    `<div class="want"></div></div>`).join('');
  $('#pyGiveUp').disabled = false;
  $('#pinyin [type=submit]').disabled = false;
  setStatus('typeNow');
  $('#sylls input')?.focus();
}
function setTone(syl, k) {
  syl.dataset.tone = k;
  syl.querySelectorAll('[data-tone]').forEach((b) => b.classList.toggle('on', +b.dataset.tone === k));
}
function checkPinyin(giveUp = false) {
  if (answered) return;
  let ok = 0;
  document.querySelectorAll('.syl').forEach((el, i) => {
    const want = current.sylls[i];
    const base = plain(el.querySelector('input').value.trim().replace(/u:/g, 'v'));
    const tone = +el.dataset.tone || 0;
    // 一 and 不 change their tone in speech: the dictionary's is fine too
    const toneOk = tone === want.tone || ('一不'.includes(want.c) && tone === want.own);
    const right = !giveUp && base === want.base && toneOk;
    ok += right;
    el.classList.add(right ? 'right' : 'wrong');
    el.querySelector('input').disabled = true;
    el.querySelectorAll('button').forEach((b) => (b.disabled = true));
    el.querySelector('.want').innerHTML = `<span style="color:var(--t${want.tone === 5 ? 3 : want.tone})">${want.py}</span>`;
  });
  const n = current.sylls.length, all = ok === n;
  setStatus(all ? 'readRight' : ok && !giveUp ? 'readWrong' : 'readNone', { ok, n }, all ? 'ok' : 'no');
  $('#pyGiveUp').disabled = true;
  $('#pinyin [type=submit]').disabled = true;
  finish(all);
}

// after any answer: the word, its reading and meanings, the card a click away
function finish(ok) {
  answered = true;
  count(ok);
  const w = current, info = ced.words[w.w];
  $('#write .acts').hidden = true;
  $('#glyph').textContent = w.w;
  $('#reading').innerHTML = `${w.py}<small>${metaOf(w)}</small>`;
  $('#open').href = `../../cinese/?vista=parole#${encodeURIComponent(w.w)}`;
  $('#gloss').innerHTML = `<ol>${defsOf(w).slice(0, 5).map((d) => `<li>${d}</li>`).join('')}</ol>` +
    (info?.cl ? `<div class="other">${t('measure')}: ${info.cl.map(([h, py]) => `<span class="hz">${h}</span> ${py}`).join(', ')}</div>` : '');
  $('#answer').hidden = false;
  Voice.word(w.w, w.py);
}

function setMode(m) {
  mode = m;
  store.set('parole-mode', m);
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  $('.hint').textContent = t({ meaning: 'hMeaning', write: 'hWrite', pinyin: 'hPinyin' }[m]);
  showStats();
  next();
}

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  $('#lang').title = t('langName');
  $('.hint').textContent = t({ meaning: 'hMeaning', write: 'hWrite', pinyin: 'hPinyin' }[mode]);
  document.querySelectorAll('[data-level]').forEach((b) => b.classList.toggle('on', +b.dataset.level === level));
  const s = $('#status');
  if (s.dataset.key) setStatus(s.dataset.key, JSON.parse(s.dataset.vars || '{}'), s.className.replace('status', '').trim());
  if (current) {
    if (mode === 'write') {
      // the prompt is the meaning: redraw it without touching the boxes
      const hint = $('#pyHint')?.textContent || '';
      $('#prompt .meta').textContent = metaOf(current);
      $('#pyHint').textContent = hint;
      $('#outline').textContent = t(showOutline ? 'noOutline' : 'outline');
    }
    if (mode === 'meaning') {
      const marks = [...document.querySelectorAll('.choice')].map((b) => b.className);
      renderChoices();
      document.querySelectorAll('.choice').forEach((b, i) => { b.className = marks[i]; b.disabled = answered; });
    }
    if (answered) $('#reading').innerHTML = `${current.py}<small>${metaOf(current)}</small>`;
  }
  showStats();
}

// ---------- controls ----------

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
  level = +b.dataset.level;
  store.set('parole-level', level);
  document.querySelectorAll('[data-level]').forEach((x) => x.classList.toggle('on', x === b));
  recent.length = 0;
  next();
}));
$('#choices').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) pick(+b.dataset.pick); });
$('#prompt').addEventListener('click', (e) => { if (e.target.closest('[data-say]') && current) Voice.word(current.w, current.py); });
$('#outline').addEventListener('click', () => {
  showOutline = !showOutline;
  store.set('parole-outline', showOutline);
  writers.forEach((w) => (showOutline ? w.showOutline() : w.hideOutline()));
  $('#outline').textContent = t(showOutline ? 'noOutline' : 'outline');
});
$('#hintPy').addEventListener('click', () => { $('#pyHint').textContent = current.py; Voice.word(current.w, current.py); });
$('#giveUp').addEventListener('click', giveUpWrite);
$('#pinyin').addEventListener('submit', (e) => { e.preventDefault(); if (answered) next(); else checkPinyin(); });
$('#pyGiveUp').addEventListener('click', () => checkPinyin(true));
$('#sylls').addEventListener('click', (e) => { const b = e.target.closest('[data-tone]'); if (b) setTone(b.closest('.syl'), +b.dataset.tone); });
$('#sylls').addEventListener('input', (e) => {
  // "ma3": the number is the tone; then on to the next syllable
  const el = e.target, m = /^(.*?)([0-5])$/.exec(el.value);
  if (!m) return;
  el.value = m[1];
  const syl = el.closest('.syl');
  setTone(syl, +m[2] || 5);
  syl.nextElementSibling?.querySelector('input')?.focus();
});
$('#next').addEventListener('click', next);
$('#listen').addEventListener('click', () => current && Voice.word(current.w, current.py));
$('#glyph').addEventListener('click', () => current && Voice.word(current.w, current.py));
$('#reset').addEventListener('click', () => { stats[mode] = freshStats(); store.set('parole-stats', stats); showStats(); });
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target.closest('input');
  if (e.key === 'Enter' && answered && !typing) { e.preventDefault(); next(); return; }
  if (typing) return;
  if (mode === 'meaning' && /^[1-4]$/.test(e.key)) pick(+e.key - 1);
});
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
});

render();
setStatus('loading');
setMode(mode);
