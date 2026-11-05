// The word trainer: the HSK 1–4 words of the Chinese section, four ways.
// Meaning: a word, and four meanings to choose from. Word: the other way
// round, a meaning and four words. Writing: a meaning, with its part of
// speech and length, and the word to write stroke by stroke (Hanzi Writer), a
// character at a time. Pinyin: a word, and its reading to type, a tone per
// syllable, or to pick out of four ('pick'). Measure: a noun, and its
// classifier out of four. Sentence: a Tatoeba sentence with a word taken out,
// to put back out of four. Words come from the chosen levels
// and, if any are chosen, parts of speech, those due for review first
// (progressi.js); the card is a click away.

const TEXT = {
  it: {
    back: '← esercizi di cinese', section: 'le parole nella sezione di cinese', tones: 'toni', theme: 'Tema chiaro / scuro', lang: 'EN',
    title: 'allenamento sulle parole', docTitle: 'Allenamento sulle parole · Giuliano Gambacorta', upTo: 'livelli',
    mMeaning: 'significato', mWord: 'parola', mWrite: 'scrittura', mPinyin: 'pinyin', wType: 'da scrivere', wPick: 'a scelta',
    mMeasure: 'classificatore', mCloze: 'frase',
    hMeasure: 'quale classificatore va con questo nome?', hCloze: 'quale parola completa la frase?',
    chooseCl: 'scegli il classificatore (1–4)', chooseCloze: 'scegli la parola che manca (1–4)',
    trans: 'mostra la traduzione', noTrans: 'nascondi la traduzione', loadingSent: 'carico le frasi…',
    cats: 'categorie', catsAll: 'tutte',
    hMeaning: 'che cosa vuol dire questa parola?', hWord: 'quale parola ha questo significato?', hPick: 'come si legge? scegli la lettura giusta',
    chooseWord: 'scegli la parola (1–4)', choosePy: 'scegli la lettura (1–4)', hWrite: 'scrivi la parola che ha questo significato', hPinyin: 'come si legge? scrivi il pinyin e scegli i toni',
    loading: 'carico le parole…', choose: 'scegli il significato (1–4)', writeNow: 'traccia i tratti, un carattere alla volta',
    typeNow: 'scrivi ogni sillaba e scegline il tono (o aggiungi il numero: ma3; ü si scrive v)',
    right: 'giusto', wrong: 'no: la risposta giusta è evidenziata', written: 'scritta', writtenHelp: 'scritta, con {n} suggerimenti',
    gaveUp: 'eccola, tratto per tratto', readRight: 'giusto', readWrong: 'quasi: {ok} sillabe giuste su {n}', readNone: 'no: ecco la lettura',
    chars: '{n} caratteri', char1: '1 carattere', outline: 'mostra il contorno', noOutline: 'nascondi il contorno',
    hintPy: 'suggerisci il pinyin', giveUp: 'non lo so', check: 'controlla', listen: 'ascolta', open: 'apri la scheda →', next: 'prossima →',
    reset: 'azzera', score: 'giuste {ok} su {n} · di fila {streak} · record {best}', none: 'ancora nessuna risposta',
    review: 'parole viste {seen} su {n}, da ripassare {due}, imparate {learned}',
    also: 'si legge anche {py}, con un altro significato', syllable: 'sillaba {n}', toneN: '{n}° tono', neutral: 'neutro', measure: 'classificatore',
    clChar: '{c}: carattere di HSK {n}, che il sillabo non elenca come parola a sé',
    langName: 'English',
    foot: 'Parole e livelli dal sillabo HSK 2025, significati da <a href="https://cc-cedict.org/">CC-CEDICT</a> (CC BY-SA 4.0), registrazioni di <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (CC BY-SA), tratti di <a href="https://hanziwriter.org/">Hanzi Writer</a>: tutto dalla <a href="../../?vista=parole">sezione di cinese</a>.',
    pos: { 名: 'nome', 动: 'verbo', 形: 'aggettivo', 副: 'avverbio', 量: 'classificatore', 代: 'pronome', 连: 'congiunzione', 介: 'preposizione',
      数: 'numerale', 助: 'particella', 后缀: 'suffisso', 数量: 'numerale con classificatore', 前缀: 'prefisso', 叹: 'interiezione' },
  },
  en: {
    back: '← Chinese exercises', section: 'the words in the Chinese section', tones: 'tones', theme: 'Light / dark theme', lang: 'IT',
    title: 'word trainer', docTitle: 'Word trainer · Giuliano Gambacorta', upTo: 'levels',
    mMeaning: 'meaning', mWord: 'word', mWrite: 'writing', mPinyin: 'pinyin', wType: 'typed', wPick: 'picked',
    mMeasure: 'measure word', mCloze: 'sentence',
    hMeasure: 'which measure word goes with this noun?', hCloze: 'which word completes the sentence?',
    chooseCl: 'choose the measure word (1–4)', chooseCloze: 'choose the missing word (1–4)',
    trans: 'show the translation', noTrans: 'hide the translation', loadingSent: 'loading the sentences…',
    cats: 'parts of speech', catsAll: 'all',
    hMeaning: 'what does this word mean?', hWord: 'which word has this meaning?', hPick: 'how is it read? pick the right reading',
    chooseWord: 'choose the word (1–4)', choosePy: 'choose the reading (1–4)', hWrite: 'write the word with this meaning', hPinyin: 'how is it read? type the pinyin and pick the tones',
    loading: 'loading the words…', choose: 'choose the meaning (1–4)', writeNow: 'trace the strokes, a character at a time',
    typeNow: 'type each syllable and pick its tone (or add its number: ma3; ü is typed v)',
    right: 'right', wrong: 'no: the right answer is marked', written: 'written', writtenHelp: 'written, with {n} hints',
    gaveUp: 'here it is, stroke by stroke', readRight: 'right', readWrong: 'almost: {ok} syllables right out of {n}', readNone: 'no: here is the reading',
    chars: '{n} characters', char1: '1 character', outline: 'show the outline', noOutline: 'hide the outline',
    hintPy: 'hint: pinyin', giveUp: 'I don\'t know', check: 'check', listen: 'listen', open: 'open the card →', next: 'next →',
    reset: 'reset', score: '{ok} right out of {n} · streak {streak} · best {best}', none: 'no answers yet',
    review: 'words seen {seen} of {n}, to review {due}, learned {learned}',
    also: 'it also reads {py}, with another meaning', syllable: 'syllable {n}', toneN: 'tone {n}', neutral: 'neutral', measure: 'measure word',
    clChar: '{c}: an HSK {n} character, which the syllabus doesn\'t list as a word of its own',
    langName: 'Italiano',
    foot: 'Words and levels from the HSK syllabus 2025, meanings from <a href="https://cc-cedict.org/">CC-CEDICT</a> (CC BY-SA 4.0), recordings from <a href="https://github.com/hugolpz/audio-cmn">audio-cmn</a> (CC BY-SA), strokes by <a href="https://hanziwriter.org/">Hanzi Writer</a>: all from the <a href="../../?vista=parole">Chinese section</a>.',
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
// without tones, ü as v (its two dots kept apart from the tone marks: lǜ is lv, not lu)
const plain = (py) => py.normalize('NFC').replace(/[ǖǘǚǜü]/g, 'v').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// a syllable without tone (ü as v) and its tone, written: the mark on a or
// e, on the o of ou, else on the last vowel
const MARKED = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', v: 'ǖǘǚǜ' };
function marked(base, tone) {
  let i = base.indexOf('a');
  if (i < 0) i = base.indexOf('e');
  if (i < 0 && base.includes('ou')) i = base.indexOf('o');
  if (i < 0) for (let j = base.length - 1; j >= 0; j--) if (MARKED[base[j]]) { i = j; break; }
  const s = tone >= 1 && tone <= 4 && i >= 0 ? base.slice(0, i) + MARKED[base[i]][tone - 1] + base.slice(i + 1) : base;
  return s.replace(/v/g, 'ü');
}
// a reading from [base, tone] pairs: an apostrophe before a, e, o inside it (xī'ān)
const spell = (sylls) => sylls.map(([b, k], i) => (i && /^[aeo]/.test(b) ? "'" : '') + marked(b, k)).join('');
const letters = (py) => py.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
const posTags = (pos) => (pos || '').replace(/[（）()]/g, '').split('、').filter(Boolean);
// its parts of speech but those in brackets, which the syllabus gives as secondary (对 形、介、（动、量）)
const mainTags = (pos) => posTags((pos || '').replace(/[（(][^）)]*[）)]/g, ''));
const clean = (d) => d.replace(/\s*\(?CL:.*$/, '').replace(/\s*\([^)]*[一-鿿][^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

let hsk = null, ced = null;
const loaded = Promise.all(['hsk', 'cedict'].map((f) => fetch(`../../data/${f}.json`).then((r) => r.json())))
  .then(async ([h, c]) => { hsk = h; ced = c; renderCats(); await Voice.ready; });

// a word's dictionary entry: of its own reading, when it is written like another (地 dì, de)
const entryOf = (w) => ced.words[`${w.w}|${w.py}`] || ced.words[w.w];
const defsOf = (w) => (entryOf(w)?.d || []).map(clean).filter(Boolean);
// the syllabus's words written alike, this one first (长: cháng, zhǎng)
const readingsOf = (w) => [w, ...hsk.words.filter((x) => x.w === w.w && x !== w && syllablesOf(x))];
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

// A noun's classifiers that are HSK measure words, 个 aside (it would fit too
// many): those the dictionary gives it. Some of the commonest are no word of
// the syllabus, only a character of it (瓶 is there as 瓶子, 杯 as 杯子): a
// character the dictionary reads as a classifier counts too, its reading
// that one (处 chù, not chǔ), marked `char`.
let MEASURES = null, NOUN_CL = null;
function measuresOf(w) {
  if (!MEASURES) {
    MEASURES = new Map(hsk.words.filter((x) => posTags(x.pos).includes('量')).map((x) => [x.w, x]));
    for (const { c, level } of hsk.chars) {
      const reading = MEASURES.has(c) ? null : (ced.chars[c] || []).find(([, d]) => d.some((x) => /classifier/i.test(x)));
      if (reading) MEASURES.set(c, { w: c, py: reading[0], level, char: true });
    }
    // the measure words that go with some noun: the choices
    NOUN_CL = new Set(hsk.words.filter((x) => mainTags(x.pos).includes('名')).flatMap((x) => (entryOf(x)?.cl || []).map(([h]) => h)).filter((h) => MEASURES.has(h)));
    NOUN_CL.delete('个');
  }
  return (entryOf(w)?.cl || []).map(([h]) => h).filter((h) => h !== '个' && NOUN_CL.has(h));
}

// Tatoeba's sentences (those of the cards), cut into the syllabus's words by
// the longest match, so that 学 is not found in 学生; loaded on the first one.
// A sentence is [id, zh, pinyin, level, it, en], its level that of its hardest word.
let sentences = null, segments = null, sentencesOf = null;
const loadSentences = () => (loadSentences.p ||= fetch('../../data/sentences.json').then((r) => r.json()).then((d) => {
  const words = new Set(hsk.words.map((w) => w.w)), longest = Math.max(...[...words].map((w) => [...w].length));
  sentences = d.s;
  sentencesOf = new Map();
  segments = sentences.map(([, zh], i) => {
    const cs = [...zh], out = [];
    for (let at = 0; at < cs.length;) {
      let n = Math.min(longest, cs.length - at);
      while (n > 1 && !words.has(cs.slice(at, at + n).join(''))) n--;
      const g = cs.slice(at, at + n).join('');
      out.push(g);
      if (words.has(g)) { if (!sentencesOf.has(g)) sentencesOf.set(g, []); if (!sentencesOf.get(g).includes(i)) sentencesOf.get(g).push(i); }
      at += n;
    }
    return out;
  });
}));
// the sentences with the word of no level above those chosen
const sentencesFor = (w) => (sentencesOf?.get(w.w) || []).filter((i) => sentences[i][3] <= Math.max(...levels));

// ---------- state ----------

// the HSK levels in play, each on its own (at least one); "up to 3" is 1, 2 and 3
const levels = (() => {
  const v = store.get('parole-level', 1);
  return new Set(Array.isArray(v) && v.length ? v : [1, 2, 3, 4].filter((lv) => lv <= v));
})();
// ?modo=meaning|word|write|pinyin|pick (the exercises page links each mode), else the last one used
const MODES = ['meaning', 'word', 'write', 'pinyin', 'pick', 'measure', 'cloze'];
const CHOICE = ['meaning', 'word', 'pick', 'measure', 'cloze'];      // the modes answered out of four
const HANZI = ['word', 'measure', 'cloze'];                          // ...whose choices are words
let mode = MODES.find((m) => m === new URLSearchParams(location.search).get('modo')) || store.get('parole-mode', 'meaning');
if (!MODES.includes(mode)) mode = 'meaning';
const freshStats = () => ({ n: 0, ok: 0, streak: 0, best: 0 });
const stats = store.get('parole-stats', null) || {};
for (const m of MODES) stats[m] ||= freshStats();
// the syllabus's parts of speech in play (none: all), in its order
const CATS = ['名', '动', '形', '副', '量', '代', '连', '介', '数', '助', '后缀', '数量', '前缀', '叹'];
const cats = new Set(store.get('parole-pos', []).filter((c) => CATS.includes(c)));
let showOutline = store.get('parole-outline', false);
let current = null, answered = false;
const recent = [];

// a word of the levels in play: of those due for review the most overdue,
// else a new one (progressi.js), not one of the last ones
const idOf = (w) => `${w.w}|${w.py}`;
const inLevels = (w) => levels.has(w.level) && defsOf(w).length;
const inCats = (w) => !cats.size || mainTags(w.pos).some((p) => cats.has(p));
// the words in play: for measure words the nouns with one (of any part of
// speech chosen), for sentences those with one, a reading per word (地 once)
function poolOf() {
  const fits = {
    pinyin: syllablesOf, pick: syllablesOf,
    measure: (w) => mainTags(w.pos).includes('名') && measuresOf(w).length,
    cloze: (w) => sentencesFor(w).length && hsk.words.find((x) => x.w === w.w) === w,
  }[mode];
  return hsk.words.filter((w) => inLevels(w) && (mode === 'measure' || inCats(w)) && (!fits || fits(w)));
}
function draw() {
  const w = Progress.pick(`words-${mode}`, poolOf(), idOf, recent);
  recent.push(idOf(w));
  if (recent.length > 8) recent.shift();
  return w;
}

function count(ok, grade = ok ? 2 : 0) {
  Progress.record(`words-${mode}`, idOf(current), grade);
  const st = stats[mode];
  st.n++;
  if (ok) { st.ok++; st.streak++; } else st.streak = 0;
  st.best = Math.max(st.best, st.streak);
  store.set('parole-stats', stats);
  showStats();
}

// of the words in play: how many seen, due again, learned
function review() {
  if (!hsk) return '';
  const ids = poolOf().map(idOf);
  const r = Progress.summary(`words-${mode}`, ids);
  return r.seen ? ` · ${t('review', { ...r, n: ids.length })}` : '';
}

function showStats() {
  const st = stats[mode];
  $('#score').textContent = (st.n ? t('score', st) : t('none')) + review();
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
  if (mode === 'cloze' && !sentences) {
    setStatus('loadingSent');
    const m = mode;
    await loadSentences();
    if (mode !== m) return;
  }
  current = draw();
  answered = false;
  showStats();
  $('#answer').hidden = true;
  $('#choices').hidden = !CHOICE.includes(mode);
  $('#choices').classList.toggle('words', HANZI.includes(mode));
  $('#choices').classList.toggle('readings', mode === 'pick');
  $('#write').hidden = mode !== 'write';
  $('#pinyin').hidden = mode !== 'pinyin';
  if (mode === 'meaning' || mode === 'word') askMeaning();
  else if (mode === 'pick') askPick();
  else if (mode === 'measure') askMeasure();
  else if (mode === 'cloze') askCloze();
  else if (mode === 'write') askWrite();
  else askPinyin();
}

function renderPrompt() {
  const w = current;
  if (mode === 'measure') {
    $('#prompt').innerHTML = `<div class="frame"><span class="hz">一</span><span class="blank hz">？</span>` +
      `<button class="word hz" data-say aria-label="${t('listen')}">${w.w}</button></div><div class="meta">${w.py} · ${meaningOf(w)}</div>`;
    return;
  }
  if (mode === 'cloze') {
    const segs = segments[current.sent], at = segs.indexOf(w.w);
    $('#prompt').innerHTML = `<div class="sentence hz" data-sentence>${segs.slice(0, at).join('')}<span class="blank">${'＿'.repeat([...w.w].length + 1)}</span>${segs.slice(at + 1).join('')}</div>` +
      `<div id="transText" class="trans" hidden></div><button id="trans" class="link"></button>`;
    showTrans();
    return;
  }
  $('#prompt').innerHTML = mode === 'write' || mode === 'word'
    ? `<div class="meaning">${meaningOf(w)}</div><div class="meta">${metaOf(w)}</div>${mode === 'write' ? '<div id="pyHint" class="py-hint"></div>' : ''}`
    : `<button class="word hz" data-say aria-label="${t('listen')}">${w.w}</button>`;
}

// three words alike in kind but not in sense (of the word's length, when
// `sameLength` and there are enough; and as `also` wants)
function alike(w, sameLength, also = () => true) {
  // alike in kind: of the part of speech chosen, if any, else of the word's first
  const mine = meaningOf(w), pos = mainTags(w.pos).find((p) => cats.has(p)) || posTags(w.pos)[0];
  const words = new Set(defsOf(w).join(' ').toLowerCase().match(/[a-z]{4,}/g) || []);
  const unlike = (x) => x.w !== w.w && meaningOf(x) && meaningOf(x) !== mine && also(x) &&
    !(meaningOf(x).toLowerCase().match(/[a-z]{4,}/g) || []).some((v) => words.has(v));
  const kind = (x) => (cats.size ? mainTags(x.pos).includes(pos) : posTags(x.pos)[0] === pos);
  let others = shuffle(hsk.words.filter((x) => kind(x) && Math.abs(x.level - w.level) <= 1 && unlike(x)));
  if (sameLength) {
    const n = [...w.w].length, same = others.filter((x) => [...x.w].length === n);
    if (same.length >= 3) others = same;
  }
  if (others.length < 3) others = others.concat(shuffle(hsk.words.filter(unlike)));
  // a word written once among the four
  return others.filter((x, i) => others.findIndex((y) => y.w === x.w) === i).slice(0, 3);
}

// meaning, and word: the word and three alike
function askMeaning() {
  const w = current;
  current.options = shuffle([w, ...alike(w, mode === 'word')]);
  current.answer = w;
  renderPrompt();
  renderChoices();
  setStatus(mode === 'word' ? 'chooseWord' : 'choose');
}

// pinyin out of four: the reading, and three others near it, the tone of a
// syllable or two changed, or a sound often mixed up (zh z, an ang…); never
// another reading of the word (长 cháng, zhǎng), nor 一 and 不 in their own tone
const SWAPS = [['zh', 'z'], ['ch', 'c'], ['sh', 's'], ['ang', 'an'], ['eng', 'en'], ['ing', 'in'], ['ong', 'eng'], ['ian', 'ie'], ['l', 'n'], ['q', 'j'], ['x', 'q']];
let SYLLABLES = null;
function askPick() {
  SYLLABLES ||= new Set(Object.values(ced.chars).flatMap((e) => e.map(([r]) => plain(letters(r)))));
  const w = current, sylls = syllablesOf(w), pairs = sylls.map((x) => [x.base, x.tone]);
  const right = spell(pairs);
  const banned = new Set([right, spell(sylls.map((x) => [x.base, '一不'.includes(x.c) ? x.own : x.tone]))]);
  for (const o of readingsOf(w).slice(1)) banned.add(spell(syllablesOf(o).map((x) => [x.base, x.tone])));
  const tones = [], sounds = [], neutral = [];
  const add = (list, ps) => { const r = spell(ps); if (!banned.has(r) && !list.includes(r)) list.push(r); };
  pairs.forEach(([b, k], i) => {
    if (b === 'r') return;
    for (const k2 of [1, 2, 3, 4]) if (k2 !== k) add(tones, pairs.map((p, j) => (j === i ? [b, k2] : p)));
    if (k !== 5) add(neutral, pairs.map((p, j) => (j === i ? [b, 5] : p)));   // when the others aren't enough (为 wéi, wèi)
    for (const [x, y] of SWAPS) for (const [from, to] of [[x, y], [y, x]]) {
      const at = from.length <= 2 && /^[zcsljqxn]/.test(from) ? (b.startsWith(from) ? 0 : -1) : b.endsWith(from) ? b.length - from.length : -1;
      const b2 = at < 0 ? null : b.slice(0, at) + to + b.slice(at + from.length);
      if (b2 && b2 !== b && SYLLABLES.has(b2)) add(sounds, pairs.map((p, j) => (j === i ? [b2, k] : p)));
    }
  });
  if (pairs.length > 1) add(tones, pairs.map(([b, k]) => [b, k === 5 ? 5 : (k % 4) + 1]));
  const others = [...shuffle(sounds).slice(0, 1), ...shuffle(tones), ...neutral];
  current.options = shuffle([right, ...[...new Set(others)].slice(0, 3)]);
  current.answer = right;
  renderPrompt();
  renderChoices();
  setStatus('choosePy');
}

// measure word: the noun's first (the dictionary's most usual: 件 for 事,
// not 回), and three that go with other nouns,
// of the levels in play when there are enough
function askMeasure() {
  const w = current, mine = measuresOf(w), all = new Set((entryOf(w)?.cl || []).map(([h]) => h));
  const right = mine[0];
  const top = Math.max(...levels);
  let others = shuffle([...NOUN_CL].filter((h) => !all.has(h) && MEASURES.get(h).level <= top));
  if (others.length < 3) others = others.concat(shuffle([...NOUN_CL].filter((h) => !all.has(h) && !others.includes(h))));
  current.options = shuffle([right, ...others.slice(0, 3)]);
  current.answer = right;
  renderPrompt();
  renderChoices();
  setStatus('chooseCl');
}

// sentence: one of the word's, and three words of its kind that aren't in it
// nor inside it or around it (学, 学生)
function askCloze() {
  const w = current, list = sentencesFor(w);
  current.sent = pickOne(list);
  const zh = sentences[current.sent][1];
  current.options = shuffle([w, ...alike(w, true, (x) => !zh.includes(x.w) && !x.w.includes(w.w) && !w.w.includes(x.w))]);
  current.answer = w;
  renderPrompt();
  renderChoices();
  setStatus('chooseCloze');
}
const pickOne = (xs) => xs[(Math.random() * xs.length) | 0];
const transOf = (x) => (I18N.lang === 'it' ? x[4] || x[5] : x[5] || x[4]) || '';
// the sentence's translation, shown unless hidden (without it a sentence may
// take two of the words: 我们 or 大家 休息一下吧); after the answer, always,
// with its reading and source
let showTranslation = store.get('parole-translation', true);
function showTrans() {
  const x = sentences[current.sent], on = showTranslation || answered;
  $('#trans').hidden = answered;
  $('#trans').textContent = t(showTranslation ? 'noTrans' : 'trans');
  $('#transText').hidden = !on;
  if (on) $('#transText').innerHTML = answered
    ? `<i>${x[2]}</i><br>${transOf(x)} <a href="https://tatoeba.org/${I18N.lang}/sentences/show/${x[0]}" target="_blank" rel="noopener">Tatoeba #${x[0]}</a>`
    : transOf(x);
}

function labelOf(x) {
  if (mode === 'measure') return `<span class="hz">${x}</span><small>${MEASURES.get(x).py}</small>`;
  if (mode === 'cloze') return `<span class="hz">${x.w}</span>`;
  if (mode === 'pick') return `<span class="py">${x}</span>`;
  if (mode === 'word') return `<span class="hz">${x.w}</span>`;
  return `<span>${meaningOf(x)}</span>`;
}
function renderChoices() {
  $('#choices').innerHTML = current.options.map((x, i) =>
    `<button class="choice" data-pick="${i}"><kbd>${i + 1}</kbd>${labelOf(x)}</button>`).join('');
}
function pick(i) {
  if (answered || !CHOICE.includes(mode)) return;
  const ok = current.options[i] === current.answer;
  document.querySelectorAll('.choice').forEach((b, j) => {
    b.disabled = true;
    if (current.options[j] === current.answer) b.classList.add('right');
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
  $('#also').textContent = '';
  setStatus('typeNow');
  $('#sylls input')?.focus();
}
function setTone(syl, k) {
  syl.dataset.tone = k;
  syl.querySelectorAll('[data-tone]').forEach((b) => b.classList.toggle('on', +b.dataset.tone === k));
}
function checkPinyin(giveUp = false) {
  if (answered) return;
  const said = [...document.querySelectorAll('.syl')].map((el) => ({
    base: plain(el.querySelector('input').value.trim().replace(/u:/g, 'v')), tone: +el.dataset.tone || 0,
  }));
  // 一 and 不 change their tone in speech: the dictionary's is fine too
  const fits = (want, s) => !giveUp && s.base === want.base && (s.tone === want.tone || ('一不'.includes(want.c) && s.tone === want.own));
  // a word written like another may be read as either: the closest reading counts
  const options = readingsOf(current).map((w) => ({ w, sylls: syllablesOf(w) }));
  const score = (o) => o.sylls.filter((want, i) => fits(want, said[i])).length;
  const best = options.reduce((a, o) => (score(o) > score(a) ? o : a));
  current = best.w;
  current.sylls = best.sylls;
  const also = options.filter((o) => o !== best).map((o) => o.w.py);
  $('#also').textContent = also.length ? t('also', { py: also.join(', ') }) : '';
  let ok = 0;
  document.querySelectorAll('.syl').forEach((el, i) => {
    const want = current.sylls[i];
    const right = fits(want, said[i]);
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
  finish(all, all ? 2 : ok ? 1 : 0);
}

// after any answer: the word, its reading and meanings, the card a click away
function finish(ok, grade) {
  answered = true;
  count(ok, grade);
  const w = current, info = entryOf(w);
  $('#write .acts').hidden = true;
  $('#glyph').textContent = w.w;
  $('#reading').innerHTML = `${w.py}<small>${metaOf(w)}</small>`;
  $('#open').href = `../../?vista=parole#${encodeURIComponent(w.w)}`;
  $('#gloss').innerHTML = `<ol>${defsOf(w).slice(0, 5).map((d) => `<li>${d}</li>`).join('')}</ol>` +
    (info?.cl ? `<div class="other">${t('measure')}: ${info.cl.map(([h, py]) => `<span class="hz">${h}</span> ${py}`).join(', ')}</div>` : '');
  if (mode === 'measure') {
    const b = $('#prompt .blank'), m = MEASURES.get(current.answer);
    b.textContent = current.answer;
    b.classList.add('filled');
    if (m.char) $('#prompt').insertAdjacentHTML('beforeend', `<div class="meta">${t('clChar', { c: m.w, n: m.level })}</div>`);
  }
  if (mode === 'cloze') {
    const b = $('#prompt .blank');
    b.textContent = w.w;
    b.classList.add('filled');
    showTrans();
  }
  $('#answer').hidden = false;
  if (mode === 'cloze') Voice.sentence(sentences[current.sent][1], sentences[current.sent][2]);
  else Voice.word(w.w, w.py);
}

function setMode(m) {
  mode = m;
  store.set('parole-mode', m);
  if (m === 'pinyin' || m === 'pick') store.set('parole-pinyin-way', m);
  showModes();
  showStats();
  next();
}

const HINTS = { meaning: 'hMeaning', word: 'hWord', write: 'hWrite', pinyin: 'hPinyin', pick: 'hPick', measure: 'hMeasure', cloze: 'hCloze' };
function showModes() {
  // the pinyin button stands for both ways, chosen beside it
  const shown = mode === 'pick' ? 'pinyin' : mode;
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === shown));
  $('#pyWay').hidden = shown !== 'pinyin';
  document.querySelectorAll('[data-way]').forEach((b) => b.classList.toggle('on', b.dataset.way === mode));
  $('.hint').textContent = t(HINTS[mode]);
  // measure words are of nouns, whatever is chosen
  $('#cats').hidden = mode === 'measure';
}

// the parts of speech, each with its words in the chosen levels; a part with
// none there can't be chosen (and is let go when the levels change)
function renderCats() {
  if (!hsk) return;
  const L = I18N.lang, n = {};
  for (const w of hsk.words) if (inLevels(w)) for (const p of new Set(mainTags(w.pos))) n[p] = (n[p] || 0) + 1;
  for (const c of [...cats]) if (!n[c]) cats.delete(c);
  store.set('parole-pos', [...cats]);
  $('#catList').innerHTML = `<button data-cat="" class="${cats.size ? '' : 'on'}">${t('catsAll')}</button>` +
    CATS.map((c) => `<button data-cat="${c}" class="${cats.has(c) ? 'on' : ''}" ${n[c] ? '' : 'disabled'}>${TEXT[L].pos[c]} <small>${n[c] || 0}</small></button>`).join('');
  $('#catsNow').textContent = cats.size ? CATS.filter((c) => cats.has(c)).map((c) => TEXT[L].pos[c]).join(', ') : t('catsAll');
}

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  $('#lang').title = t('langName');
  showModes();
  renderCats();
  document.querySelectorAll('[data-level]').forEach((b) => b.classList.toggle('on', levels.has(+b.dataset.level)));
  const s = $('#status');
  if (s.dataset.key) setStatus(s.dataset.key, JSON.parse(s.dataset.vars || '{}'), s.className.replace('status', '').trim());
  if (current) {
    if (mode === 'write' || mode === 'word') {
      // the prompt is the meaning: redraw its line of kind and length, not the boxes
      $('#prompt .meta').textContent = metaOf(current);
      $('#outline').textContent = t(showOutline ? 'noOutline' : 'outline');
    }
    if (mode === 'cloze') {
      showTrans();
    }
    if (CHOICE.includes(mode)) {
      const marks = [...document.querySelectorAll('.choice')].map((b) => b.className);
      renderChoices();
      document.querySelectorAll('.choice').forEach((b, i) => { b.className = marks[i]; b.disabled = answered; });
    }
    if (answered) $('#reading').innerHTML = `${current.py}<small>${metaOf(current)}</small>`;
  }
  showStats();
}

// ---------- controls ----------

// the pinyin button: the way used last
document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () =>
  setMode(b.dataset.mode === 'pinyin' ? store.get('parole-pinyin-way', 'pinyin') : b.dataset.mode)));
document.querySelectorAll('[data-way]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.way !== mode) setMode(b.dataset.way); }));
$('#catList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  const c = b.dataset.cat;
  if (!c) cats.clear();
  else if (cats.has(c)) cats.delete(c);
  else cats.add(c);
  renderCats();
  recent.length = 0;
  next();
});
document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
  const lv = +b.dataset.level;
  if (levels.has(lv)) { if (levels.size > 1) levels.delete(lv); } else levels.add(lv);
  store.set('parole-level', [...levels].sort());
  document.querySelectorAll('[data-level]').forEach((x) => x.classList.toggle('on', levels.has(+x.dataset.level)));
  recent.length = 0;
  renderCats();
  next();
}));
$('#choices').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) pick(+b.dataset.pick); });
$('#prompt').addEventListener('click', (e) => {
  if (!current) return;
  if (e.target.closest('[data-say]')) Voice.word(current.w, current.py);
  else if (e.target.closest('#trans')) {
    showTranslation = !showTranslation;
    store.set('parole-translation', showTranslation);
    showTrans();
  }
  else if (e.target.closest('[data-sentence]') && answered) Voice.sentence(sentences[current.sent][1], sentences[current.sent][2]);
});
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
  if (CHOICE.includes(mode) && /^[1-4]$/.test(e.key)) pick(+e.key - 1);
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
