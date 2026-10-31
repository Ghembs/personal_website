// 汉字 HSK 1–4: the characters as one cloud of billboards (Babylon.js thin
// instances, a single draw call), arranged by level, radical or phonetic family.
// The instances are the HSK characters followed by one node per radical and one
// per phonetic component: the radicals and phonetic views show only their own
// nodes, as a galaxy, and a clicked node raises a column of its characters
// across the galactic plane.
// Data comes from scripts/build-hanzi.mjs (see data/ and the page footer).

const THEMES = {
  dark: {
    level: { 1: '#f3e6c8', 2: '#e8b15a', 3: '#d9644a', 4: '#7fb0c9' },
    tone: { 1: '#5d9de6', 2: '#f0b34a', 3: '#6fbf73', 4: '#e8574a', 5: '#a8a8a8' },
    radicals: '#c4a6f0',
    phonetic: '#6fd1c4',
    orbit: [0.77, 0.65, 0.94],
    line: [0.94, 0.9, 0.82],
    writer: { strokeColor: '#efe6d2', radicalColor: '#c8503c', outlineColor: 'rgba(239,230,210,0.15)', highlightColor: '#e8b15a', drawingColor: '#efe6d2' },
  },
  light: {
    level: { 1: '#2b303b', 2: '#b0741a', 3: '#bf3b2c', 4: '#2c6a8f' },
    tone: { 1: '#2160c4', 2: '#c4870f', 3: '#2d8a44', 4: '#c43b2b', 5: '#7a7a7a' },
    radicals: '#7448c2',
    phonetic: '#138476',
    orbit: [0.45, 0.28, 0.76],
    line: [0.12, 0.13, 0.17],
    writer: { strokeColor: '#1e222c', radicalColor: '#b8402e', outlineColor: 'rgba(30,34,44,0.12)', highlightColor: '#b0741a', drawingColor: '#1e222c' },
  },
};
let theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
try { theme = localStorage.getItem('hanzi-theme') || theme; } catch (e) { /* private mode */ }
let COLORS = THEMES[theme];
document.documentElement.dataset.theme = theme;
const TEXT = {
  it: {
    radicals: 'radicale', phonetic: 'componente fonetica', tone1: '1° tono', tone2: '2° tono', tone3: '3° tono', tone4: '4° tono', tone5: 'neutro',
    rings: 'anelli: numero di tratti', strokes: '{n} tratti', radical: 'Radicale', radicalN: 'Radicale · {n} tratti', component: 'Componente fonetica',
    meaning: 'Significato', meanings: 'Significati', readsAs: 'Come si legge la famiglia', nChars: '{n} caratteri · {lv}',
    composition: 'Composizione', what: "cos'è?", phon: 'Fonetico {p}, semantico {s}', picto: 'Pittogramma', ideo: 'Ideogramma',
    relations: 'Sinonimi e contrari · {lv}', syn: 'simile', ant: 'contrario',
    family: 'Famiglia fonetica di {p}', examples: "Frasi d'esempio", examplesLv: "Frasi d'esempio · {lv}", loading: 'caricamento…',
    listen: 'ascolta', noSentences: 'Nessuna frase in questi livelli.', words: 'Parole · {lv}', noWords: 'Nessuna parola in questi livelli.',
    lexChars: 'caratteri', lexWords: 'parole', aLex: 'Caratteri o parole', hChars: '汉字', hWords: '词语',
    posOther: 'altre', wordChars: 'Caratteri', sameChars: 'Parole con gli stessi caratteri · {lv}', openWord: 'apri la scheda di {w}',
    measure: 'classificatore', all: 'tutte', char1: 'carattere', charN: 'caratteri', clear: 'Annulla ricerca',
    practice: 'esercitati', again: 'ricomincia', failed: 'Qualcosa è andato storto nel caricamento.',
    pos: { 名: 'nomi', 动: 'verbi', 形: 'aggettivi', 副: 'avverbi', 量: 'classificatori', 代: 'pronomi', 数: 'numerali', 助: 'particelle',
      介: 'preposizioni', 连: 'congiunzioni', 叹: 'interiezioni', 拟声: 'onomatopee', 前缀: 'prefissi', 后缀: 'suffissi' },
    // page
    home: '← giulianogambacorta', intro: 'introduzione', vLevels: 'livelli', vRadicals: 'radicali', vPhonetic: 'famiglie fonetiche',
    cLevel: 'colore: livello', cTone: 'colore: tono', search: '字, pinyin o inglese', word1: 'parola', wordN: 'parole', strokesBtn: 'tratti', done: 'fine',
    sources: 'Pronuncia: <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA). Sinonimi e contrari: <a href="https://github.com/omwn/omw-data/tree/main/wns/cow" target="_blank" rel="noopener">Chinese Open Wordnet</a> e <a href="https://wordnet.princeton.edu/" target="_blank" rel="noopener">WordNet</a>. Dati: <a href="https://cc-cedict.org/" target="_blank" rel="noopener">CC-CEDICT</a> (CC BY-SA 4.0), <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noopener">Make Me a Hanzi</a> (LGPL), sillabo HSK 2025. Frasi: <a href="https://tatoeba.org/" target="_blank" rel="noopener">Tatoeba</a> (CC BY 2.0 FR). Tratti: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>.',
    lang: 'EN', langName: 'English', theme: 'Tema chiaro / scuro', aView: 'Vista', aLevels: 'Livelli visibili', aDim: 'Dimensioni', aColor: 'Colore',
    aClose: 'Chiudi', aGrip: 'Riduci o espandi la scheda', title: '汉字 · HSK 1–4 · Giuliano Gambacorta',
  },
  en: {
    radicals: 'radical', phonetic: 'phonetic component', tone1: '1st tone', tone2: '2nd tone', tone3: '3rd tone', tone4: '4th tone', tone5: 'neutral',
    rings: 'rings: number of strokes', strokes: '{n} strokes', radical: 'Radical', radicalN: 'Radical · {n} strokes', component: 'Phonetic component',
    meaning: 'Meaning', meanings: 'Meanings', readsAs: 'How the family reads', nChars: '{n} characters · {lv}',
    composition: 'Composition', what: 'what is it?', phon: 'Phonetic {p}, semantic {s}', picto: 'Pictogram', ideo: 'Ideogram',
    relations: 'Synonyms and antonyms · {lv}', syn: 'like', ant: 'opposite',
    family: 'Phonetic family of {p}', examples: 'Example sentences', examplesLv: 'Example sentences · {lv}', loading: 'loading…',
    listen: 'listen', noSentences: 'No sentences in these levels.', words: 'Words · {lv}', noWords: 'No words in these levels.',
    lexChars: 'characters', lexWords: 'words', aLex: 'Characters or words', hChars: '汉字', hWords: '词语',
    posOther: 'other', wordChars: 'Characters', sameChars: 'Words sharing its characters · {lv}', openWord: 'open the card of {w}',
    measure: 'measure word', all: 'all', char1: 'character', charN: 'characters', clear: 'Clear search',
    practice: 'practise', again: 'start again', failed: 'Something went wrong while loading.',
    pos: { 名: 'nouns', 动: 'verbs', 形: 'adjectives', 副: 'adverbs', 量: 'measure words', 代: 'pronouns', 数: 'numerals', 助: 'particles',
      介: 'prepositions', 连: 'conjunctions', 叹: 'interjections', 拟声: 'onomatopoeia', 前缀: 'prefixes', 后缀: 'suffixes' },
    home: '← giulianogambacorta', intro: 'introduction', vLevels: 'levels', vRadicals: 'radicals', vPhonetic: 'phonetic families',
    cLevel: 'colour: level', cTone: 'colour: tone', search: '字, pinyin or English', word1: 'word', wordN: 'words', strokesBtn: 'strokes', done: 'done',
    sources: 'Pronunciation: <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener">audio-cmn</a> (Chen Wang, Yue Tan; CC BY-SA). Synonyms and antonyms: <a href="https://github.com/omwn/omw-data/tree/main/wns/cow" target="_blank" rel="noopener">Chinese Open Wordnet</a> and <a href="https://wordnet.princeton.edu/" target="_blank" rel="noopener">WordNet</a>. Data: <a href="https://cc-cedict.org/" target="_blank" rel="noopener">CC-CEDICT</a> (CC BY-SA 4.0), <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noopener">Make Me a Hanzi</a> (LGPL), HSK syllabus 2025. Sentences: <a href="https://tatoeba.org/" target="_blank" rel="noopener">Tatoeba</a> (CC BY 2.0 FR). Strokes: <a href="https://hanziwriter.org/" target="_blank" rel="noopener">Hanzi Writer</a>.',
    lang: 'IT', langName: 'Italiano', theme: 'Light / dark theme', aView: 'View', aLevels: 'Shown levels', aDim: 'Dimensions', aColor: 'Colour',
    aClose: 'Close', aGrip: 'Fold or unfold the card', title: '汉字 · HSK 1–4 · Giuliano Gambacorta',
  },
};
const t = (key, vars) => I18N.t(TEXT, key, vars);
const NODE_NAMES = { get radicals() { return t('radicals'); }, get phonetic() { return t('phonetic'); } };
const POS_NAMES = new Proxy({}, { get: (_, k) => TEXT[I18N.lang].pos[k] });
const posTags = (pos) => (pos || '').replace(/[（）()]/g, '').split('、').filter(Boolean);
const LEVEL_NAMES = { 1: 'HSK 1', 2: 'HSK 2', 3: 'HSK 3', 4: 'HSK 4' };
const TONE_NAMES = new Proxy({}, {
  get: (_, k) => t(`tone${k}`),
  ownKeys: () => ['1', '2', '3', '4', '5'],
  getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
});
const TONES = { āēīōūǖ: 1, áéíóúǘ: 2, ǎěǐǒǔǚ: 3, àèìòùǜ: 4 };
const IDS = /[⿰-⿻？]/;
const GLYPH = 1.1;            // world size of a character
const TRANSITION = 1.4;       // seconds
const SPREAD = 1.3;           // breathing room between characters, in every view
const GALAXY_BETA = 0.72;      // how far from above a galaxy is seen, in 3D

const $ = (s) => document.querySelector(s);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function toneOf(py) {
  for (const ch of py || '') for (const [marks, t] of Object.entries(TONES)) if (marks.includes(ch)) return t;
  return 5;
}
const plain = (py) => (py || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();

// ---------- layouts ----------

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function sphere(k, n, r) {
  const y = 1 - (2 * (k + 0.5)) / n, s = Math.sqrt(1 - y * y), a = k * GOLDEN;
  return [Math.cos(a) * s * r, y * r, Math.sin(a) * s * r];
}

// Concentric shells, HSK 1 inside; each shell as wide as an even density needs.
function layoutLevels(chars, out) {
  const byLevel = {};
  chars.forEach((x, i) => (byLevel[x.level] ||= []).push(i));
  let r = 0;
  for (const list of Object.keys(byLevel).sort().map((lv) => byLevel[lv])) {
    r = Math.max(r + 5, 0.72 * SPREAD * Math.sqrt(list.length));
    list.forEach((i, k) => out.set(sphere(k, list.length, r), i * 3));
  }
}

// Two-armed spiral of nodes, the busiest at the core, as evenly spaced along
// the arms as the arms are apart: the same disc in 2D and 3D. `plane` maps
// (x, y) on the disc, and the k-th node, to world coordinates.
function layoutGalaxy(nodes, out, base, plane) {
  const step = SPREAD * 2.2, pitch = (SPREAD * 3.2) / Math.PI, r0 = SPREAD * 2.5;
  nodes.forEach((n, k) => {
    const along = ((k >> 1) + 0.5) * step;       // how far down its arm
    const r = Math.sqrt(r0 * r0 + 2 * pitch * along);
    const a = (r - r0) / pitch + (k % 2) * Math.PI;
    out.set(plane(Math.cos(a) * r, Math.sin(a) * r, k), (base + k) * 3);
  });
}

// Radicals on concentric orbits, one per stroke count (10 and more share the
// outermost), busiest first along each orbit. A gap is left at `labelAngle`
// for the orbit's number. `plane` maps (x, y) on the disc to world coordinates.
// Returns the orbits: [{ r, label }].
const ORBIT_MAX = 10;
function layoutOrbits(keys, strokesOf, out, base, labelAngle, plane) {
  const rings = new Map();
  keys.forEach((key, k) => {
    const n = Math.min(ORBIT_MAX, strokesOf(key));
    (rings.get(n) || rings.set(n, []).get(n)).push(k);
  });
  const spacing = SPREAD * 2.3, gap = SPREAD * 2.4;
  const orbits = [];
  let r = 0;
  for (const n of [...rings.keys()].sort((a, b) => a - b)) {
    const list = rings.get(n);
    r = Math.max(r ? r + gap : SPREAD * 3, ((list.length + 1.5) * spacing) / (2 * Math.PI));
    const room = 2 * Math.PI - (2.2 * spacing) / r;          // leave the label's slot free
    list.forEach((k, j) => {
      const a = labelAngle + Math.PI - room / 2 + (room * (j + 0.5)) / list.length;
      out.set(plane(Math.cos(a) * r, Math.sin(a) * r, j), (base + k) * 3);
    });
    orbits.push({ r, label: n === ORBIT_MAX ? `${n}+` : `${n}` });
  }
  return orbits;
}

// A radical's characters stand in rings stacked above and below it.
function column(list, cx, cy, cz, out) {
  const PER = 7, R = SPREAD * 1.9, STEP = SPREAD * 2;
  list.forEach((i, j) => {
    const ring = Math.floor(j / PER), m = Math.min(PER, list.length - ring * PER);
    const a = ((j % PER) / m) * Math.PI * 2 + ring * 0.35;
    const side = ring % 2 ? -1 : 1, h = (Math.floor(ring / 2) + 1) * STEP;
    out.set([cx + Math.cos(a) * R, cy + side * h, cz + Math.sin(a) * R], i * 3);
  });
}

// ---------- 2D layouts (in the XY plane, seen through an orthographic camera) ----------

// Sunflower disc: even spacing, first items at the centre.
function phyllo(k, step) {
  const r = step * Math.sqrt(k + 0.5), a = k * GOLDEN;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

// Where discs of these radii go: in a row on wide screens, two by two on tall ones.
function discCentres(radii, wide) {
  const centres = [];
  if (wide) {
    let x = 0;
    radii.forEach((r, k) => { x += (k ? radii[k - 1] : 0) + r + (k ? 4 : 0); centres.push([x, 0]); });
    const mid = (centres[0][0] - radii[0] + centres.at(-1)[0] + radii.at(-1)) / 2;
    centres.forEach((c) => (c[0] -= mid));
  } else {
    const R = Math.max(...radii) + 2;
    const grid = [[-R, R], [R, R], [-R, -R], [R, -R]];
    if (radii.length < 3) grid.splice(0, 4, [0, R], [0, -R]);
    centres.push(...grid.slice(0, radii.length));
  }
  return centres;
}

// The shown levels as separate discs. Hidden levels wait at the centre.
function layoutLevels2D(chars, out, wide, shown) {
  const byLevel = {};
  chars.forEach((x, i) => {
    if (shown.has(x.level)) (byLevel[x.level] ||= []).push(i);
    else out.set([0, 0, 0], i * 3);
  });
  const lists = Object.keys(byLevel).sort().map((lv) => byLevel[lv]);
  const step = SPREAD * 1.05;
  const centres = discCentres(lists.map((l) => step * Math.sqrt(l.length) + 1), wide);
  lists.forEach((l, k) => l.forEach((i, j) => {
    const [x, y] = phyllo(j, step);
    out.set([centres[k][0] + x, centres[k][1] + y, 0], i * 3);
  }));
}

const WORD_ADV = GLYPH * 0.84;      // from one character of a word to the next

// Concentric rings around a centre, as many per ring as fit; returns the outer radius.
function rings2D(list, cx, cy, r0, out, gap = SPREAD * 1.4) {
  let r = r0, j = 0;
  while (j < list.length) {
    const cap = Math.max(6, Math.floor((2 * Math.PI * r) / gap)), n = Math.min(cap, list.length - j);
    for (let k = 0; k < n; k++, j++) {
      const a = (k / n) * Math.PI * 2 + r * 0.3;
      out.set([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0], list[j] * 3);
    }
    r += gap;
  }
  return r;
}

// ---------- page ----------

async function main() {
  const [hsk, ced, dec] = await Promise.all(['hsk', 'cedict', 'decomp'].map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
  const chars = hsk.chars;
  const N = chars.length;
  const index = new Map(chars.map((x, i) => [x.c, i]));
  const reading = chars.map(({ c }) => ced.chars[c]?.[0]?.[0] || dec[c]?.py || '');
  const tone = reading.map(toneOf);

  const wordsOf = new Map();
  for (const w of hsk.words) for (const ch of new Set(w.w)) if (index.has(ch)) (wordsOf.get(ch) || wordsOf.set(ch, []).get(ch)).push(w);

  const radicalOf = chars.map(({ c }) => dec[c]?.r || '?');
  const byRadical = new Map();
  radicalOf.forEach((r, i) => (byRadical.get(r) || byRadical.set(r, []).get(r)).push(i));

  // Phonetic families: characters sharing a phonetic component, plus that
  // component itself when it is an HSK character (青 with 请 清 情 晴). Each
  // character joins its largest family; families need two members.
  const phon = new Map();
  chars.forEach(({ c }) => {
    const e = dec[c]?.e;
    if (e?.t === 'pictophonetic' && e.p) (phon.get(e.p) || phon.set(e.p, new Set()).get(e.p)).add(c);
  });
  for (const [p, set] of phon) if (index.has(p)) set.add(p);
  const familyOf = new Map();
  [...phon.entries()].filter(([, s]) => s.size > 1).sort((a, b) => b[1].size - a[1].size)
    .forEach(([p, s]) => s.forEach((c) => { if (!familyOf.has(c)) familyOf.set(c, p); }));
  const families = new Map();
  chars.forEach(({ c }, i) => {
    const p = familyOf.get(c);
    if (p) (families.get(p) || families.set(p, []).get(p)).push(i);
  });
  for (const [p, list] of families) if (list.length < 2) { families.delete(p); list.forEach((i) => familyOf.delete(chars[i].c)); }

  const strokesOf = (c) => dec[c]?.n || 1;

  // The words, by reading; a word spelt alike but read differently is another word.
  const words = [...hsk.words].sort((a, b) => plain(a.py).localeCompare(plain(b.py)) || a.level - b.level);
  const wordIds = new Map(words.map((w, k) => [`${w.w} ${w.py}`, k]));
  const wordId = (w) => wordIds.get(`${w.w} ${w.py}`);
  const wordsWith = new Map();                  // character -> ids of its words
  words.forEach((w, k) => { for (const ch of new Set(w.w)) (wordsWith.get(ch) || wordsWith.set(ch, []).get(ch)).push(k); });
  // each character's tone in this word: bàba is 4 then neutral, whatever 爸 reads alone
  function tonesOf(w) {
    let rest = w.py.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
    return [...w.w].map((ch) => {
      const py = (ced.chars[ch] || []).map(([p]) => p).find((p) => plain(rest).startsWith(plain(p)));
      if (!py) return tone[index.get(ch)];
      const part = rest.slice(0, plain(py).length);
      rest = rest.slice(part.length);
      return toneOf(part);
    });
  }

  // Galaxy nodes, after the characters: radicals, then phonetic components.
  const GROUPS = {
    radicals: { members: byRadical, keyOf: (i) => radicalOf[i] },
    phonetic: { members: families, keyOf: (i) => familyOf.get(chars[i].c) },
  };
  const nodes = [];                       // { view, key, list }
  const nodeOf = { radicals: new Map(), phonetic: new Map() };
  for (const [view, gdef] of Object.entries(GROUPS)) {
    gdef.base = N + nodes.length;
    gdef.keys = [...gdef.members.keys()].sort((a, b) => gdef.members.get(b).length - gdef.members.get(a).length);
    if (view === 'radicals') gdef.keys.sort((a, b) => Math.min(ORBIT_MAX, strokesOf(a)) - Math.min(ORBIT_MAX, strokesOf(b)));
    gdef.keys.forEach((key) => {
      nodeOf[view].set(key, N + nodes.length);
      nodes.push({ view, key, list: gdef.members.get(key) });
    });
  }
  // Orbit numbers for the radicals, one instance each, after the nodes.
  const orbitCount = new Set(GROUPS.radicals.keys.map((k) => Math.min(ORBIT_MAX, strokesOf(k)))).size;
  const NL = N + nodes.length, T = NL + orbitCount;
  const glyphs = [...chars.map((x) => x.c), ...nodes.map((n) => n.key)];
  const nodeFor = (view, i) => nodeOf[view].get(GROUPS[view].keyOf(i)) ?? -1;
  // Other radicals a character contains, among its direct components.
  const alsoContains = chars.map(({ c }, i) => [...new Set([...(dec[c]?.d || '')]
    .filter((x) => !IDS.test(x) && x !== radicalOf[i] && nodeOf.radicals.has(x)))].map((x) => nodeOf.radicals.get(x)));

  // Layouts cover all T instances; nodes rest on their galaxy, hidden outside their view.
  const galaxy = new Float32Array(T * 3);
  layoutGalaxy(GROUPS.phonetic.keys, galaxy, GROUPS.phonetic.base, (x, y, k) => [x, Math.sin(k * 1.3) * 0.8, y]);
  const jitter = (j) => Math.sin(j * 1.3) * 0.5;
  const orbits3D = layoutOrbits(GROUPS.radicals.keys, strokesOf, galaxy, GROUPS.radicals.base,
    -Math.PI / 2, (x, y, j) => [x, jitter(j), y]);
  orbits3D.forEach((o, k) => { galaxy.set([0, 0, -o.r], (NL + k) * 3); glyphs.push(o.label); });
  const LAYOUTS = { levels: new Float32Array(galaxy) };
  layoutLevels(chars, LAYOUTS.levels);
  const galaxy2D = new Float32Array(T * 3);
  layoutGalaxy(GROUPS.phonetic.keys, galaxy2D, GROUPS.phonetic.base, (x, y) => [x, y, 0]);
  const orbits2D = layoutOrbits(GROUPS.radicals.keys, strokesOf, galaxy2D, GROUPS.radicals.base,
    Math.PI / 2, (x, y) => [x, y, 0]);
  orbits2D.forEach((o, k) => galaxy2D.set([0, o.r, 0], (NL + k) * 3));
  const levels2D = () => {
    const out = new Float32Array(galaxy2D);
    layoutLevels2D(chars, out, window.innerWidth > window.innerHeight * 1.2, levels);
    return out;
  };

  // ---------- Babylon ----------

  const canvas = $('#scene');
  const engine = new BABYLON.Engine(canvas, true, { stencil: false, antialias: true }, false);
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.35, 68, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 160;
  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.004;
  camera.minZ = 0.3;
  camera.useAutoRotationBehavior = true;
  camera.autoRotationBehavior.idleRotationSpeed = 0.04;
  camera.autoRotationBehavior.idleRotationWaitTime = 4000;

  // Glyph atlas, drawn with the subset font.
  await Promise.all([document.fonts.load('80px HanziSerif'), document.fonts.load('italic 40px "Cormorant Garamond"')]);
  const COLS = Math.ceil(Math.sqrt(T)), CS = 96;
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasCanvas.height = COLS * CS;
  const g = atlasCanvas.getContext('2d');
  g.font = `${CS * 0.8}px HanziSerif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  glyphs.forEach((c, i) => {
    g.font = i >= NL ? `italic ${CS * 0.5}px "Cormorant Garamond", serif` : `${CS * 0.8}px HanziSerif`;
    g.fillText(c, (i % COLS) * CS + CS / 2, Math.floor(i / COLS) * CS + CS * 0.54);
  });
  const atlas = new BABYLON.DynamicTexture('atlas', atlasCanvas, scene, true);
  atlas.hasAlpha = true;
  atlas.anisotropicFilteringLevel = 4;
  atlas.update();

  BABYLON.Effect.ShadersStore.glyphVertexShader = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec2 cell;
    attribute vec4 tint;
    #include<instancesDeclaration>
    uniform mat4 view;
    uniform mat4 viewProjection;
    uniform vec2 cellSize;
    uniform vec3 eye;
    uniform vec2 fog;
    varying vec2 vUV;
    varying vec4 vTint;
    void main(void) {
      #include<instancesVertex>
      vec3 center = finalWorld[3].xyz;
      float s = length(finalWorld[0].xyz);
      vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
      vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
      gl_Position = viewProjection * vec4(center + (right * position.x + up * position.y) * s, 1.0);
      vUV = (cell + uv) * cellSize;
      float d = distance(eye, center);
      // fade with distance, and right in front of the camera
      vTint = vec4(tint.rgb, tint.a * (1.0 - 0.8 * smoothstep(fog.x, fog.y, d)) * smoothstep(1.5, 7.0, d));
    }`;
  BABYLON.Effect.ShadersStore.glyphFragmentShader = `
    precision highp float;
    varying vec2 vUV;
    varying vec4 vTint;
    uniform sampler2D atlas;
    void main(void) {
      float a = texture2D(atlas, vUV).a * vTint.a;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vTint.rgb, a);
    }`;
  const mat = new BABYLON.ShaderMaterial('glyph', scene, { vertex: 'glyph', fragment: 'glyph' }, {
    attributes: ['position', 'uv', 'cell', 'tint'],
    uniforms: ['world', 'view', 'viewProjection', 'cellSize', 'eye', 'fog'],
    samplers: ['atlas'],
    needAlphaBlending: true,
  });
  mat.setTexture('atlas', atlas);
  mat.setVector2('cellSize', new BABYLON.Vector2(1 / COLS, 1 / COLS));
  mat.backFaceCulling = false;
  mat.disableDepthWrite = true;

  const mesh = BABYLON.MeshBuilder.CreatePlane('glyphs', { size: 1 }, scene);
  mesh.material = mat;
  mesh.alwaysSelectAsActiveMesh = true;   // instances spread far from the plane's bounds
  mesh.isPickable = false;

  const matrices = new Float32Array(T * 16);
  const cells = new Float32Array(T * 2);
  const tints = new Float32Array(T * 4);
  for (let i = 0; i < T; i++) {
    // atlas rows counted from the bottom: the texture is flipped on upload
    cells.set([i % COLS, COLS - 1 - Math.floor(i / COLS)], i * 2);
    matrices.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], i * 16);
  }
  mesh.thinInstanceSetBuffer('matrix', matrices, 16, false);
  mesh.thinInstanceSetBuffer('cell', cells, 2, true);
  mesh.thinInstanceSetBuffer('tint', tints, 4, false);

  // ---------- state ----------

  const pos = new Float32Array(LAYOUTS.levels);
  let from = new Float32Array(pos), to = LAYOUTS.levels, tStart = -1;
  const scale = new Float32Array(T).fill(0);
  const alpha = new Float32Array(T).fill(0);
  const pickable = new Uint8Array(T);
  let view = 'levels', colorMode = 'level', posFilter = 'all';
  const levels = new Set([1, 2, 3, 4]);
  const levelText = () => (levels.size === 4 ? 'HSK 1–4' : `HSK ${[...levels].sort().join(' · ')}`);
  // 2D by default on narrow screens; the choice is remembered.
  let flat = window.innerWidth <= 700;
  try { const v = localStorage.getItem('hanzi-dim'); if (v) flat = v === '2'; } catch (e) { /* private mode */ }
  let sentences = null;
  fetch('data/sentences.json').then((r) => r.json()).then((d) => {
    sentences = d;
    if (selected >= 0 && !isNode(selected)) renderExamples(selected);
    if (wordSel >= 0) renderWordCard();
  });
  // synonyms and antonyms (scripts/build-relations.mjs): { item: [synonyms, antonyms] }
  let relations = null;
  fetch('data/relations.json').then((r) => r.json()).then((d) => {
    relations = d;
    if (selected >= 0 && !isNode(selected)) renderRelations(selected);
    if (wordSel >= 0) renderWordCard();
  });
  let selected = -1, hovered = -1, open = -1;   // open: radical node whose column is up
  let related = new Set(), highlight = new Set(), column_ = new Set();
  let lines = null;
  const target = BABYLON.Vector3.Zero();

  const isNode = (i) => i >= N && i < NL;
  const isLabel = (i) => i >= NL;
  const nodeView = (i) => nodes[i - N].view;
  const galactic = () => view !== 'levels';
  const inLevel = (i) => levels.has(chars[i].level);
  // A family's members are ordered by reading, so tones line up in the column.
  const members = (node) => nodes[node - N].list.filter(inLevel)
    .sort((a, b) => (nodeView(node) === 'phonetic' ? plain(reading[a]).localeCompare(plain(reading[b])) || tone[a] - tone[b] : 0) ||
      chars[a].level - chars[b].level);
  // Characters per node within the level filter, refreshed when it changes.
  const nodeCount = new Uint16Array(nodes.length);
  const recount = () => nodes.forEach((n, k) => { nodeCount[k] = n.list.filter(inLevel).length; });
  recount();

  function setColors() {
    for (let i = 0; i < T; i++) {
      const c = isLabel(i) ? COLORS.radicals : isNode(i) ? COLORS[nodeView(i)] : colorMode === 'level' ? COLORS.level[chars[i].level] : COLORS.tone[tone[i]];
      tints.set(hex(c), i * 4);
    }
    const names = colorMode === 'level' ? LEVEL_NAMES : TONE_NAMES;
    $('#legend').innerHTML = Object.entries(names)
      .map(([k, n]) => `<span style="--c:${COLORS[colorMode][k]}">${n}</span>`).join('') +
      (galactic() ? `<span style="--c:${COLORS[view]}">${NODE_NAMES[view]}</span>` : '') +
      (view === 'radicals' ? `<span class="plain">${t('rings')}</span>` : '');
    mesh.thinInstanceBufferUpdated('tint');
    colourWords();
  }

  // A galaxy layout: the open node's column raised, every other character
  // folded into its own node (a character with no family waits at the core,
  // and stands there alone when selected).
  // In 2D the open node's characters ring it instead, and the other radicals
  // they contain gather on an outer ring: everything else disappears.
  let lonely = -1;
  function galaxyLayout() {
    const base = flat ? galaxy2D : galaxy;
    const out = new Float32Array(base);
    for (let i = 0; i < N; i++) {
      const n = nodeFor(view, i);
      out.set(n >= 0 ? base.subarray(n * 3, n * 3 + 3) : [0, 0, 0], i * 3);
    }
    column_ = new Set();
    alsoContainsOpen = new Set();
    if (open >= 0) {
      const list = members(open);
      column_ = new Set(list);
      if (view === 'radicals') alsoContainsOpen = new Set(list.flatMap((j) => alsoContains[j]));
      const [cx, cy, cz] = base.subarray(open * 3, open * 3 + 3);
      if (flat) {
        const r = rings2D(list, cx, cy, SPREAD * 2.4, out);
        rings2D([...alsoContainsOpen], cx, cy, r + SPREAD * 1.2, out);
      } else {
        column(list, cx, cy, cz, out);
      }
    } else if (lonely >= 0) {
      column_ = new Set([lonely]);
    }
    return out;
  }

  // 2D levels: a selected character gathers the ones it forms words with
  // around itself; the rest stays as a faint backdrop.
  function flatLevels() {
    const out = levels2D();
    if (selected >= 0 && !isNode(selected)) {
      const [cx, cy] = out.subarray(selected * 3, selected * 3 + 2);
      rings2D([...related].filter((j) => !isNode(j) && inLevel(j)), cx, cy, SPREAD * 2.4, out);
    }
    return out;
  }
  const currentLayout = () => (galactic() ? galaxyLayout() : flat ? flatLevels() : LAYOUTS.levels);

  function moveTo(layout) {
    from = new Float32Array(pos);
    to = layout;
    tStart = performance.now() / 1000;
    clearLines();
    orbitMesh?.dispose();
    orbitMesh = null;
    if (flat) fit();
  }

  // The galaxy is flat: look at it from above; the other views from the side.
  let betaGoal = null;
  function setView(v) {
    view = v;
    if (!flat) betaGoal = v === 'levels' ? Math.PI / 2.35 : GALAXY_BETA;
    open = -1;
    lonely = -1;
    moveTo(currentLayout());
    document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
    setColors();
  }

  // An open column stands across the galaxy: turn to see it from the side.
  function openNode(node, alone = -1) {
    if (open === node && lonely === alone) return;
    open = node;
    lonely = alone;
    if (!flat) betaGoal = node >= 0 ? 1.3 : GALAXY_BETA;
    moveTo(galaxyLayout());
  }

  // Who is linked to the selection in the current view.
  function relatedTo(i) {
    const out = new Set();
    if (isNode(i)) {
      members(i).forEach((j) => out.add(j));
    } else if (view === 'radicals') {
      out.add(nodeFor('radicals', i));
      alsoContains[i].forEach((n) => out.add(n));
    } else if (view === 'phonetic') {
      const n = nodeFor('phonetic', i);
      if (n >= 0) { out.add(n); members(n).forEach((j) => out.add(j)); }
    } else {
      for (const w of wordsOf.get(chars[i].c) || []) if (levels.has(w.level)) for (const ch of w.w) if (index.has(ch)) out.add(index.get(ch));
    }
    out.delete(i);
    return out;
  }

  // Faint orbit circles of the radicals view, in 3D or 2D.
  let orbitMesh = null;
  function drawOrbits() {
    orbitMesh?.dispose();
    orbitMesh = null;
    if (view !== 'radicals') return;
    const c = new BABYLON.Color4(...COLORS.orbit, open >= 0 ? 0.05 : 0.14);
    const segs = [], cols = [];
    for (const o of flat ? orbits2D : orbits3D) {
      const pts = [];
      for (let k = 0; k <= 96; k++) {
        const a = (k / 96) * Math.PI * 2;
        pts.push(flat ? new BABYLON.Vector3(Math.cos(a) * o.r, Math.sin(a) * o.r, 0.01) : new BABYLON.Vector3(Math.cos(a) * o.r, 0, Math.sin(a) * o.r));
      }
      segs.push(pts);
      cols.push(pts.map(() => c));
    }
    orbitMesh = BABYLON.MeshBuilder.CreateLineSystem('orbits', { lines: segs, colors: cols, useVertexAlpha: true }, scene);
    orbitMesh.isPickable = false;
  }

  function clearLines() {
    lines?.dispose();
    lines = null;
  }

  // Selection links; in a galaxy also the open column: each character to its
  // node, and in the radicals view (in violet) to the other radicals it contains.
  function drawLines() {
    clearLines();
    const p = (i) => new BABYLON.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
    const segs = [], cols = [];
    const add = (a, b, c) => { segs.push([p(a), p(b)]); cols.push([c, c]); };
    const paper = new BABYLON.Color4(...COLORS.line, 0.2);
    const violet = new BABYLON.Color4(...COLORS.orbit, 0.3);
    if (galactic() && open >= 0) {
      for (const i of column_) {
        add(open, i, paper);
        if (view === 'radicals') for (const n of alsoContains[i]) add(i, n, violet);
      }
    }
    if (selected >= 0 && !isNode(selected) && view !== 'phonetic') {
      const strong = new BABYLON.Color4(...COLORS.line, 0.45);
      for (const j of related) if (isNode(j) || inLevel(j)) add(selected, j, strong);
    }
    if (!segs.length) return;
    lines = BABYLON.MeshBuilder.CreateLineSystem('rel', { lines: segs, colors: cols, useVertexAlpha: true }, scene);
    lines.isPickable = false;
  }

  // ---------- frame ----------

  scene.onBeforeRenderObservable.add(() => {
    const now = performance.now() / 1000;
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.1);
    if (tStart >= 0) {
      const t = Math.min(1, (now - tStart) / TRANSITION), e = ease(t);
      for (let k = 0; k < pos.length; k++) pos[k] = from[k] + (to[k] - from[k]) * e;
      if (t >= 1) { tStart = -1; drawLines(); drawOrbits(); }
    }
    const gal = galactic();
    const focus = selected >= 0 || highlight.size > 0;
    const k = 1 - Math.exp(-dt * 8);
    for (let i = 0; i < T; i++) {
      let s = 1, a = 1;
      if (isLabel(i)) {
        if (view !== 'radicals') { s = 0; a = 0; }
        else { s = 2.4; a = open >= 0 ? 0 : 0.85; }
        pickable[i] = 0;
      } else if (isNode(i)) {
        const n = nodeCount[i - N];
        if (nodeView(i) !== view || !n) { s = 0; a = 0; }
        else {
          s = 1 + 0.16 * Math.sqrt(n);
          if (i === selected || i === open) s *= 1.6;
          else if (open >= 0 && !related.has(i) && !alsoContainsOpen.has(i)) a = flat ? 0 : 0.4;
          else if (flat && open >= 0 && alsoContainsOpen.has(i)) s = 1.3;
        }
      } else if (gal && !column_.has(i)) { s = 0; a = 0; }
      else if (!inLevel(i)) { s = 0; a = 0; }
      else if (i === selected) { s = 2.4; }
      else if (related.has(i) || highlight.has(i)) { s = 1.35; }
      else if (narrowSearch() && !highlight.has(i)) { a = 0; }
      else if (focus && !gal) { a = flat && selected >= 0 ? 0.07 : 0.32; }
      if (i === hovered && a > 0.1) s *= 1.3;
      if (!isLabel(i)) pickable[i] = a > 0.1 && s > 0.2 ? 1 : 0;
      scale[i] += (s - scale[i]) * k;
      alpha[i] += (a - alpha[i]) * k;
      const sc = scale[i] * GLYPH;
      const m = i * 16;
      matrices[m] = sc; matrices[m + 5] = sc; matrices[m + 10] = sc;
      matrices[m + 12] = pos[i * 3]; matrices[m + 13] = pos[i * 3 + 1]; matrices[m + 14] = pos[i * 3 + 2];
      tints[i * 4 + 3] = alpha[i];
    }
    mesh.thinInstanceBufferUpdated('matrix');
    mesh.thinInstanceBufferUpdated('tint');
    wordFrame(now, k);

    const ease3 = 1 - Math.exp(-dt * 3);
    if (flat) {
      // 2D: pan and zoom towards their goals, fitted to what is on show.
      half += (halfGoal - half) * ease3;
      target.set(panGoal.x, panGoal.y, 0);
      const aspect = canvas.clientWidth / canvas.clientHeight;
      camera.orthoTop = half; camera.orthoBottom = -half;
      camera.orthoLeft = -half * aspect; camera.orthoRight = half * aspect;
    } else {
      const f = selected >= 0 ? selected : open;
      if (f >= 0) target.set(pos[f * 3], pos[f * 3 + 1], pos[f * 3 + 2]);
      else target.set(0, 0, 0);
    }
    BABYLON.Vector3.LerpToRef(camera.target, target, flat && dragging ? 1 : ease3, camera.target);
    if (betaGoal !== null) {
      camera.beta += (betaGoal - camera.beta) * (1 - Math.exp(-dt * 2.5));
      if (Math.abs(betaGoal - camera.beta) < 0.005) betaGoal = null;
    }
    // On narrow screens the card is a bottom sheet: keep the selection above it.
    const lift = !flat && selected >= 0 && canvas.clientWidth <= 700 ? camera.radius * (card.classList.contains('peek') ? 0.06 : 0.17) : 0;
    camera.targetScreenOffset.y += (lift - camera.targetScreenOffset.y) * (1 - Math.exp(-dt * 3));
    mat.setVector3('eye', camera.position);
    mat.setVector2('fog', flat ? new BABYLON.Vector2(1e4, 2e4) : new BABYLON.Vector2(camera.radius * 0.7, camera.radius * 2));
  });
  // Radicals reached through the open column's characters stay lit.
  let alsoContainsOpen = new Set();

  // ---------- 2D camera: orthographic, panned and zoomed by hand ----------

  let half = 30, halfGoal = 30, dragging = false;
  const panGoal = new BABYLON.Vector2(0, 0);
  const sheet = () => canvas.clientWidth <= 700 && !card.hidden;

  // What is (or is about to be) on screen, framed with a margin; with the
  // bottom sheet open the frame is the visible top part of the screen.
  function fit() {
    if (lexicon === 'words') { fitWords(); return; }
    const show = [];
    if (galactic()) {
      if (open >= 0) show.push(open, ...column_, ...alsoContainsOpen);
      else if (lonely >= 0) show.push(lonely);
      else nodes.forEach((n, k) => { if (n.view === view && nodeCount[k]) show.push(N + k); });
    } else if (selected >= 0) {
      show.push(selected, ...[...related].filter((j) => !isNode(j)));
    } else {
      for (let i = 0; i < N; i++) if (inLevel(i)) show.push(i);
    }
    if (!show.length) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const i of show) {
      x0 = Math.min(x0, to[i * 3]); x1 = Math.max(x1, to[i * 3]);
      y0 = Math.min(y0, to[i * 3 + 1]); y1 = Math.max(y1, to[i * 3 + 1]);
    }
    frame(x0, x1, y0, y1);
  }
  function frame(x0, x1, y0, y1) {
    // The free part of the screen: above the bottom sheet on phones, left of
    // the card on wider screens. Fit there, and shift the aim to match.
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const side = !card.hidden && !sheet() ? Math.min(W * 0.6, card.offsetWidth + 32) : 0;
    const top = sheet() ? card.getBoundingClientRect().top - 8 : H;
    const bar = $('#bar').offsetHeight + 8;
    const fw = W - side, fh = top - bar;
    const pxPerUnit = Math.min(fw / (x1 - x0 + 4), fh / (y1 - y0 + 4));
    halfGoal = Math.min(200, Math.max(4, H / 2 / pxPerUnit));
    const k = (2 * halfGoal) / H;                  // world units per pixel
    panGoal.set((x0 + x1) / 2 + (side / 2) * k, (y0 + y1) / 2 - (H / 2 - (bar + fh / 2)) * k);
  }

  function applyCamera() {
    if (flat) {
      camera.detachControl();
      camera.useAutoRotationBehavior = false;
      camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 2;
      camera.radius = 80;
      camera.targetScreenOffset.set(0, 0);
      betaGoal = null;
    } else {
      camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
      camera.attachControl(canvas, true);
      camera.useAutoRotationBehavior = true;
      camera.autoRotationBehavior.idleRotationSpeed = 0.04;
      camera.radius = 68;
      betaGoal = view === 'levels' ? Math.PI / 2.35 : open >= 0 ? 1.3 : GALAXY_BETA;
    }
    document.querySelectorAll('[data-dim]').forEach((b) => b.classList.toggle('on', (b.dataset.dim === '2') === flat));
  }

  function setFlat(on) {
    flat = on;
    try { localStorage.setItem('hanzi-dim', on ? '2' : '3'); } catch (e) { /* private mode */ }
    applyCamera();
    moveTo(currentLayout());
  }

  // Drag to pan, wheel or pinch to zoom.
  const touches = new Map();
  let pinch = 0;
  canvas.addEventListener('pointerdown', (e) => {
    if (!flat) return;
    touches.set(e.pointerId, [e.clientX, e.clientY]);
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!flat || !touches.has(e.pointerId)) return;
    const [px, py] = touches.get(e.pointerId);
    touches.set(e.pointerId, [e.clientX, e.clientY]);
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) { halfGoal = Math.min(200, Math.max(3, halfGoal * (pinch / d))); half = halfGoal; }
      pinch = d;
      return;
    }
    const k = (2 * half) / canvas.clientHeight;
    panGoal.x -= (e.clientX - px) * k;
    panGoal.y += (e.clientY - py) * k;
  });
  const lift_ = (e) => { touches.delete(e.pointerId); pinch = 0; dragging = touches.size > 0; };
  canvas.addEventListener('pointerup', lift_);
  canvas.addEventListener('pointercancel', lift_);
  canvas.addEventListener('wheel', (e) => {
    if (!flat) return;
    e.preventDefault();
    halfGoal = Math.min(200, Math.max(3, halfGoal * Math.exp(e.deltaY * 0.0012)));
  }, { passive: false });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());

  // ---------- words ----------

  // A list by part of speech, in the page itself: nearly two thousand words
  // can only be read as text. A word opened from it shows as a constellation,
  // the words sharing its characters around it: a layer of its own over the
  // same atlas, 2D only, every word as its characters, one instance each.
  let lexicon = 'chars', was3D = false;
  let wordSel = -1, wordNear = new Set(), wordHits = null;    // wordHits: what was searched, if anything
  const wordWidth = (k) => [...words[k].w].length * WORD_ADV;
  // a short meaning: the first, without measure words or Chinese in brackets
  const gloss = (w) => (ced.words[w.w]?.d?.[0] || ced.chars[w.w]?.[0]?.[1]?.[0] || '').split(';')[0]
    .replace(/\s*\(?CL:.*$/, '').replace(/\s*\([^)]*[一-鿿][^)]*\)/g, '').trim();
  const wordMesh = BABYLON.MeshBuilder.CreatePlane('words', { size: 1 }, scene);
  wordMesh.material = mat;
  wordMesh.alwaysSelectAsActiveMesh = true;
  wordMesh.isPickable = false;
  wordMesh.setEnabled(false);
  const wordFirst = [];                  // each word's first instance
  let G = 0;
  words.forEach((w) => { wordFirst.push(G); G += [...w.w].length; });
  const wMatrices = new Float32Array(G * 16), wCells = new Float32Array(G * 2), wTints = new Float32Array(G * 4);
  words.forEach((w, k) => [...w.w].forEach((ch, j) => {
    const g = wordFirst[k] + j, i = index.get(ch);
    wCells.set([i % COLS, COLS - 1 - Math.floor(i / COLS)], g * 2);
    wMatrices.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], g * 16);
  }));
  wordMesh.thinInstanceSetBuffer('matrix', wMatrices, 16, false);
  wordMesh.thinInstanceSetBuffer('cell', wCells, 2, true);
  wordMesh.thinInstanceSetBuffer('tint', wTints, 4, false);
  const wordTones = words.map(tonesOf);
  function colourWords() {
    words.forEach((w, k) => [...w.w].forEach((_, j) => {
      wTints.set(hex(colorMode === 'level' ? COLORS.level[w.level] : COLORS.tone[wordTones[k][j]]), (wordFirst[k] + j) * 4);
    }));
    wordMesh.thinInstanceBufferUpdated('tint');
    if (lexicon === 'words') renderWordList();
  }

  // Each word under each of its parts of speech; the rarest share a section.
  const SECTIONS = ['名', '动', '形', '副', '代', '量', 'other'];
  const sectionsOf = (w) => {
    const list = posTags(w.pos).map((p) => (SECTIONS.includes(p) ? p : 'other'));
    return list.length ? [...new Set(list)] : ['other'];
  };
  const wordList = $('#wordlist');
  const closedSections = new Set();
  const inkOf = (k) => [...words[k].w].map((ch, j) =>
    `<span style="color:${colorMode === 'level' ? COLORS.level[words[k].level] : COLORS.tone[wordTones[k][j]]}">${ch}</span>`).join('');
  const listRow = (k) => `<div class="lw"><button class="open" data-open="${k}"><span class="hz">${inkOf(k)}</span>` +
    `<span class="py">${words[k].py}</span><span class="gl">${gloss(words[k])}</span></button>` +
    `<button class="say" data-word="${words[k].w}" data-py="${words[k].py}" aria-label="${t('listen')} ${words[k].w}">▸</button></div>`;
  function renderWordList() {
    wordList.style.paddingTop = `${$('#bar').offsetHeight + 4}px`;
    const shown = (wordHits ?? words.map((_, k) => k)).filter((k) => levels.has(words[k].level));
    const count = new Set(shown).size;
    const groups = SECTIONS.map((sec) => {
      const list = shown.filter((k) => sectionsOf(words[k]).includes(sec));
      if (!list.length) return '';
      const name = sec === 'other' ? t('posOther') : POS_NAMES[sec];
      const byLevel = [1, 2, 3, 4].map((lv) => [lv, list.filter((k) => words[k].level === lv)]).filter(([, l]) => l.length);
      return `<details class="sec" data-sec="${sec}"${closedSections.has(sec) ? '' : ' open'}>` +
        `<summary>${sec === 'other' ? '' : `<span class="hz">${sec}</span> `}${name} <small>${list.length}</small></summary>` +
        byLevel.map(([lv, l]) => `<h3>HSK ${lv} <small>${l.length}</small></h3><div class="lws">${l.map(listRow).join('')}</div>`).join('') +
        `</details>`;
    }).join('');
    wordList.innerHTML = `<div class="count">${count} ${count === 1 ? t('word1') : t('wordN')} · ${levelText()}</div>` +
      (groups || `<p class="muted">${t('noWords')}</p>`);
  }
  wordList.addEventListener('toggle', (e) => {
    const sec = e.target.dataset?.sec;
    if (sec) { if (e.target.open) closedSections.delete(sec); else closedSections.add(sec); }
  }, true);
  wordList.addEventListener('click', (e) => {
    const say = e.target.closest('.say');
    if (say) { Voice.word(say.dataset.word, say.dataset.py); return; }
    const row = e.target.closest('[data-open]');
    if (row) selectWord(+row.dataset.open);
  });

  // The constellation: the word at the centre, its kin around it; the others
  // wait there, unseen.
  const wordPos = new Float32Array(words.length * 3);
  let wordFrom = new Float32Array(wordPos), wordTo = new Float32Array(wordPos), wordStart = -1;
  const wordAlpha = new Float32Array(words.length), wordScale = new Float32Array(words.length).fill(1);
  function wordLayout() {
    const out = new Float32Array(words.length * 3);
    if (wordSel >= 0) rings2D([...wordNear], 0, 0, SPREAD * 4.5, out, SPREAD * 3);
    return out;
  }
  function moveWords() {
    wordFrom = new Float32Array(wordPos);
    wordTo = wordLayout();
    wordStart = performance.now() / 1000;
    fitWords();
  }
  // Framed like the characters.
  function fitWords() {
    if (wordSel < 0) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const k of [wordSel, ...wordNear]) {
      const x = wordTo[k * 3], y = wordTo[k * 3 + 1], h = wordWidth(k) / 2;
      x0 = Math.min(x0, x - h); x1 = Math.max(x1, x + h);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    frame(x0, x1, y0, y1);
  }
  function wordFrame(now, k) {
    if (lexicon !== 'words') return;
    const t = wordStart < 0 ? 1 : Math.min(1, (now - wordStart) / (TRANSITION * 0.7)), e = ease(t);
    if (t >= 1) wordStart = -1;
    words.forEach((w, n) => {
      const a = n === wordSel || wordNear.has(n) ? 1 : 0;
      wordAlpha[n] += (a - wordAlpha[n]) * k;
      wordScale[n] += ((n === wordSel ? 1.9 : 1) - wordScale[n]) * k;
      const x = wordFrom[n * 3] + (wordTo[n * 3] - wordFrom[n * 3]) * e;
      const y = wordFrom[n * 3 + 1] + (wordTo[n * 3 + 1] - wordFrom[n * 3 + 1]) * e;
      wordPos[n * 3] = x; wordPos[n * 3 + 1] = y;
      const len = [...w.w].length, s = a || wordAlpha[n] > 0.01 ? wordScale[n] : 0;
      for (let j = 0; j < len; j++) {
        const g = wordFirst[n] + j, m = g * 16;
        wMatrices[m] = GLYPH * s; wMatrices[m + 5] = GLYPH * s; wMatrices[m + 10] = GLYPH * s;
        wMatrices[m + 12] = x + (j - (len - 1) / 2) * WORD_ADV * wordScale[n]; wMatrices[m + 13] = y;
        wTints[g * 4 + 3] = wordAlpha[n];
      }
    });
    wordMesh.thinInstanceBufferUpdated('matrix');
    wordMesh.thinInstanceBufferUpdated('tint');
  }

  function pickWord(sx, sy) {
    const u = (2 * half) / canvas.clientHeight;      // world units per pixel
    const x = camera.target.x + (sx - canvas.clientWidth / 2) * u;
    const y = camera.target.y - (sy - canvas.clientHeight / 2) * u;
    const pad = 3 * u;
    let best = -1, bestD = Infinity;
    words.forEach((w, k) => {
      if (wordAlpha[k] < 0.05) return;
      const dx = Math.abs(x - wordPos[k * 3]), dy = Math.abs(y - wordPos[k * 3 + 1]);
      if (dx < (wordWidth(k) * wordScale[k]) / 2 + pad && dy < (GLYPH * wordScale[k]) / 2 + pad && dx < bestD) { bestD = dx; best = k; }
    });
    return best;
  }

  // Words sharing a character with this one, the most of them first.
  function kinOf(k) {
    const n = new Map();
    for (const ch of new Set(words[k].w)) for (const j of wordsWith.get(ch)) if (j !== k && levels.has(words[j].level)) n.set(j, (n.get(j) || 0) + 1);
    return new Set([...n.keys()].sort((a, b) => n.get(b) - n.get(a) || words[a].level - words[b].level).slice(0, 36));
  }

  function selectWord(k) {
    wordSel = k;
    wordNear = k >= 0 ? kinOf(k) : new Set();
    card.classList.toggle('is-word', k >= 0);
    card.hidden = k < 0;
    wordList.classList.toggle('away', k >= 0);
    hoverEl.hidden = true;
    if (k >= 0) {
      renderWordCard();
      history.replaceState(null, '', `?vista=parole#${encodeURIComponent(words[k].w)}`);
    } else {
      history.replaceState(null, '', '?vista=parole');
    }
    showResults();
    moveWords();
  }
  function openWord(k) { setLexicon('words'); selectWord(k); }

  // The levels changed, or the window: the selection may be gone.
  function refreshWords() {
    if (wordSel >= 0 && !levels.has(words[wordSel].level)) selectWord(-1);
    else if (wordSel >= 0) selectWord(wordSel);
  }

  const wordChip = (w) => `<button class="chip go" data-open="${wordId(w)}"><span class="hz">${w.w}</span><small>${w.py}</small></button>`;
  function renderWordCard() {
    const w = words[wordSel], list = [...new Set(w.w)];
    const info = ced.words[w.w];
    const pinyin = w.py.normalize('NFC');
    card.querySelector('.big').textContent = w.w;
    card.querySelector('.big').dataset.len = [...w.w].length;
    card.querySelector('.level').textContent = `HSK ${w.level}${w.pos ? ` · ${posTags(w.pos).map((p) => POS_NAMES[p] || p).join(', ')}` : ''}`;
    card.querySelector('.readings').innerHTML = `<button class="say" data-word="${w.w}" data-py="${w.py}" aria-label="${t('listen')} ${w.w}">${pinyin}</button>`;
    const cl = info?.cl ? `<div class="other">${t('measure')}: ${info.cl.map(([h, py]) => `<span class="hz">${h}</span> ${py}`).join(', ')}</div>` : '';
    const defs = info?.d || ced.chars[w.w]?.[0]?.[1] || [];
    card.querySelector('.meanings').innerHTML = `<h2>${t('meanings')}</h2><ol>${defs.map((x) => `<li>${x}</li>`).join('')}</ol>${cl}`;
    card.querySelector('.parts').innerHTML = `<h2>${t('wordChars')}</h2><div class="chips">${list.map((c) => chip(c)).join('')}</div>`;
    const kin = [...wordNear].sort((a, b) => words[a].level - words[b].level);
    card.querySelector('.family').innerHTML = kin.length
      ? `<h2>${t('sameChars', { lv: levelText() })}</h2><div class="chips">${kin.map((j) => wordChip(words[j])).join('')}</div>` : '';
    relationsOf([w.w]);
    examplesOf(w.w, sentences ? sentences.s.filter((x) => x[1].includes(w.w)).slice(0, 6) : []);
    card.querySelector('.words').innerHTML = '';
    showWriter(w.w);
    card.scrollTop = 0;
  }

  // Characters or words: the words are 2D, whatever the characters were.
  function setLexicon(m) {
    if (m === lexicon) return;
    wordSel = -1;
    wordNear = new Set();
    card.hidden = true;
    card.classList.remove('is-word');
    if (practicing()) setPractice(false);
    selected = -1;
    related = new Set();
    if (m === 'words' && view !== 'levels') setView('levels');
    lexicon = m;
    document.body.classList.toggle('lex-words', m === 'words');
    document.querySelectorAll('[data-lex]').forEach((b) => b.classList.toggle('on', b.dataset.lex === m));
    $('#bar h1 .hz').textContent = t(m === 'words' ? 'hWords' : 'hChars');
    clearLines();
    mesh.setEnabled(m === 'chars');
    wordMesh.setEnabled(m === 'words');
    wordList.hidden = m !== 'words';
    if (m === 'words') {
      was3D = !flat;
      if (was3D) { flat = true; applyCamera(); }
      wordList.classList.remove('away');
      renderWordList();
    } else {
      if (was3D) { flat = false; applyCamera(); }
      moveTo(currentLayout());
    }
    history.replaceState(null, '', m === 'words' ? '?vista=parole' : location.pathname);
    runSearch(false);
  }

  // ---------- picking: project the centres, nearest one under the pointer ----------

  const tmp = new BABYLON.Vector3();
  function pickAt(x, y) {
    const vp = scene.getTransformMatrix(), vm = camera.getViewMatrix();
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const focal = H / 2 / Math.tan(camera.fov / 2);
    const perPx = H / (2 * half);                  // 2D: pixels per world unit
    let best = -1, bestD = Infinity;
    for (let i = 0; i < T; i++) {
      if (!pickable[i]) continue;
      tmp.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      const zv = BABYLON.Vector3.TransformCoordinates(tmp, vm).z;
      if (!flat && zv <= camera.minZ) continue;
      const p = BABYLON.Vector3.TransformCoordinates(tmp, vp);
      const sx = ((p.x + 1) / 2) * W, sy = ((1 - p.y) / 2) * H;
      const r = Math.max(10, flat ? scale[i] * GLYPH * perPx * 0.55 : (scale[i] * GLYPH * focal) / zv * 0.55);
      const d = Math.hypot(sx - x, sy - y);
      if (d < r && d / r + zv * 0.002 < bestD) { bestD = d / r + zv * 0.002; best = i; }
    }
    return best;
  }

  const label = (i) => (isNode(i)
    ? `<span class="hz">${glyphs[i]}</span> ${NODE_NAMES[nodeView(i)]}${nodeView(i) === 'radicals' ? ` · ${t('strokes', { n: strokesOf(glyphs[i]) })}` : ''} · ${nodeCount[i - N]}`
    : `<span class="hz">${glyphs[i]}</span> ${reading[i]}`);

  const hoverEl = $('#hover');
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    if (lexicon === 'words') {
      const k = pickWord(e.offsetX, e.offsetY);
      if (k >= 0) selectWord(k); else deselect();
      return;
    }
    const i = pickAt(e.offsetX, e.offsetY);
    if (i >= 0) select(i); else deselect();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const k = lexicon === 'words' ? pickWord(e.offsetX, e.offsetY) : -1;
    hovered = lexicon === 'words' ? -1 : pickAt(e.offsetX, e.offsetY);
    const over = hovered >= 0 || k >= 0;
    canvas.style.cursor = over ? 'pointer' : 'grab';
    hoverEl.hidden = !over;
    if (over) {
      hoverEl.innerHTML = k >= 0 ? `<span class="hz">${words[k].w}</span> ${words[k].py} · ${gloss(words[k])}` : label(hovered);
      hoverEl.style.left = `${e.clientX}px`;
      hoverEl.style.top = `${e.clientY}px`;
    }
  });
  canvas.addEventListener('pointerleave', () => { hovered = -1; hoverEl.hidden = true; });

  // ---------- card ----------

  const card = $('#card');
  let writers = [], writing = 0;           // writing: the run in progress, newer ones cancel it

  const chip = (c, extra = '') => {
    const d = dec[c], go = index.has(c) || (galactic() && nodeOf[view].has(c));
    const py = index.has(c) ? reading[index.get(c)] : d?.py?.split(',')[0] || '';
    const def = (d?.def || '').split(/[;,]/)[0];
    return `<${go ? 'button' : 'span'} class="chip${go ? ' go' : ''}" ${go ? `data-go="${c}"` : ''}>` +
      `<span class="hz">${c}</span>${py ? `<small>${py}</small>` : ''}${def ? ` ${def}` : ''}${extra}</${go ? 'button' : 'span'}>`;
  };

  // Practice mode: the writer alone in the card, as large as it fits.
  const practicing = () => card.classList.contains('practice');
  function writerSize(n = 1) {
    if (practicing()) {
      const r = card.getBoundingClientRect();
      return Math.max(160, Math.floor(Math.min(r.width - 48, r.height - 120, 440)));
    }
    return n === 1 ? 96 : Math.min(96, Math.floor((card.clientWidth - 46 - (n - 1) * 6) / n));
  }

  function strokeBox(c, size) {
    const box = document.createElement('div');
    box.className = 'stroke-box';
    box.style.width = box.style.height = `${size}px`;
    $('#writer').append(box);
    return window.HanziWriter ? HanziWriter.create(box, c, {
      width: size, height: size, padding: practicing() ? 14 : 6,
      ...COLORS.writer,
      showCharacter: false, strokeAnimationSpeed: 1.3, delayBetweenStrokes: 140,
      onLoadCharDataError: () => { box.innerHTML = ''; },
    }) : null;
  }

  // A character or a word: a box each, its strokes drawn one after the other.
  let writerChar = null;
  function showWriter(text, quiz = practicing()) {
    writerChar = text;
    const list = [...text];
    $('#writer').innerHTML = '';
    $('#write-step').innerHTML = '';
    if (quiz) { writeFrom(list, 0); return; }
    const size = writerSize(list.length);
    writers = list.map((c) => strokeBox(c, size));
    playWriters();
  }
  function playWriters() {
    const run = ++writing, list = writers;
    list.forEach((w) => w?.hideCharacter());
    const next = (i) => {
      if (run === writing && i < list.length) list[i]?.animateCharacter({ onComplete: () => next(i + 1) });
    };
    next(0);
  }
  // Practice: one character at a time, the word as far as it got above it.
  function writeFrom(list, k) {
    const run = ++writing;
    $('#writer').innerHTML = '';
    const mark = (at) => {
      if (list.length > 1) $('#write-step').innerHTML = list.map((c, i) => `<span class="hz${i === at ? ' now' : i < at ? ' done' : ''}">${c}</span>`).join('');
    };
    mark(k);
    const w = strokeBox(list[k], writerSize());
    writers = [w];
    w?.quiz({
      showHintAfterMisses: 2,
      onComplete: () => {
        if (k + 1 === list.length) mark(k + 1);
        else setTimeout(() => { if (run === writing) writeFrom(list, k + 1); }, 600);
      },
    });
  }

  function setPractice(on) {
    card.classList.toggle('practice', on);
    card.querySelector('[data-writer="quiz"]').textContent = on ? t('again') : t('practice');
    if (on) card.classList.remove('peek');
    card.scrollTop = 0;
    // the card has its new size on the next frame
    requestAnimationFrame(() => { if (writerChar) showWriter(writerChar, on); if (flat) fit(); });
  }

  // ---------- the bottom sheet on phones: a grip folds it down to its head ----------

  function setPeek(on) {
    card.classList.toggle('peek', on);
    if (flat) requestAnimationFrame(fit);
  }
  const grip = card.querySelector('.grip');
  grip.addEventListener('click', () => setPeek(!card.classList.contains('peek')));
  let swipe = null;
  card.addEventListener('pointerdown', (e) => {
    if (canvas.clientWidth > 700 || !e.target.closest('.grip, .head')) return;
    swipe = e.clientY;
  });
  card.addEventListener('pointerup', (e) => {
    if (swipe === null) return;
    const d = e.clientY - swipe;
    swipe = null;
    if (d > 30) setPeek(true);
    else if (d < -30) setPeek(false);
  });

  const tonePy = (py) => `<span style="color:${COLORS.tone[toneOf(py)]}">${py}</span>`;
  const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  // a reading to listen to (voice.js): its syllable
  const sayPy = (py, c) => `<button class="say" data-read="${py}" data-char="${c}" aria-label="${t('listen')} ${py}" style="color:${COLORS.tone[toneOf(py)]}">${py}</button>`;

  function renderNodeCard(node) {
    const r = glyphs[node], d = dec[r] || {};
    const list = members(node);
    const phonetic = nodeView(node) === 'phonetic';
    const own = index.has(r) ? reading[index.get(r)] : (d.py || '').split(',')[0];
    card.querySelector('.big').textContent = r;
    card.querySelector('.level').textContent = phonetic ? t('component') : t('radicalN', { n: strokesOf(r) });
    card.querySelector('.readings').innerHTML = own ? sayPy(own, r) : '';
    card.querySelector('.meanings').innerHTML = `<h2>${t('meaning')}</h2><p>${d.def || '—'}</p>`;
    if (phonetic) {
      // How the family reads: syllables with their tones, the component's own first.
      const bySyl = new Map();
      list.forEach((i) => {
        const syl = plain(reading[i]);
        (bySyl.get(syl) || bySyl.set(syl, []).get(syl)).push(i);
      });
      const sylls = [...bySyl.entries()].sort((a, b) => (b[0] === plain(own)) - (a[0] === plain(own)) || b[1].length - a[1].length);
      card.querySelector('.parts').innerHTML = `<h2>${t('readsAs')}</h2>` +
        sylls.map(([syl, l]) => `<div class="ety">${syl} · ${l.length}</div><div class="chips">` +
          l.map((i) => `<button class="chip go" data-go="${chars[i].c}"><span class="hz">${chars[i].c}</span>${tonePy(reading[i])}</button>`).join('') +
          `</div>`).join('');
    } else {
      const byLv = {};
      list.forEach((i) => (byLv[chars[i].level] ||= []).push(i));
      card.querySelector('.parts').innerHTML = `<h2>${t('nChars', { n: list.length, lv: levelText() })}</h2>` +
        Object.entries(byLv).map(([lv, l]) => `<div class="ety">HSK ${lv}</div><div class="chips">${l.map((i) => chip(chars[i].c)).join('')}</div>`).join('');
    }
    card.querySelector('.family').innerHTML = '';
    card.querySelector('.relations').innerHTML = '';
    card.querySelector('.examples').innerHTML = '';
    card.querySelector('.words').innerHTML = '';
    showWriter(r);
    card.scrollTop = 0;
  }

  function renderCard(i) {
    if (isNode(i)) { renderNodeCard(i); return; }
    const { c, level } = chars[i];
    const entries = ced.chars[c] || [];
    const d = dec[c] || {};
    card.querySelector('.big').textContent = c;
    card.querySelector('.level').textContent = `HSK ${level}${d.n ? ` · ${t('strokes', { n: d.n })}` : ''}`;
    card.querySelector('.readings').innerHTML = entries.length
      ? entries.slice(0, 3).map(([py]) => sayPy(py, c)).join('')
      : `<span>${d.py || ''}</span>`;

    const [first, ...others] = entries;
    card.querySelector('.meanings').innerHTML = `<h2>${t('meanings')}</h2>` +
      (first ? `<ol>${first[1].map((x) => `<li>${x}</li>`).join('')}</ol>` : `<p class="muted">${d.def || '—'}</p>`) +
      others.filter(([, defs]) => defs.length).map(([py, defs]) => `<div class="other">${py}: ${defs.slice(0, 2).join('; ')}</div>`).join('');

    const parts = [...(d.d || '')].filter((x) => !IDS.test(x) && x !== c);
    const e = d.e;
    let ety = '';
    if (e?.t === 'pictophonetic') ety = t('phon', { p: `<span class="hz">${e.p || '?'}</span>`, s: `<span class="hz">${e.s || '?'}</span>` }) + `${e.h ? ` (${e.h})` : ''}.`;
    else if (e?.h) ety = `${e.t === 'pictographic' ? t('picto') : t('ideo')}: ${e.h}.`;
    card.querySelector('.parts').innerHTML = `<h2>${t('composition')} <a class="why" href="introduzione/#caratteri">${t('what')}</a></h2><div class="chips">` +
      (d.r ? chip(d.r, ' <small>radicale</small>') : '') +
      parts.filter((x) => x !== d.r).map((x) => chip(x)).join('') + `</div>` +
      (ety ? `<div class="ety">${ety}</div>` : '');

    const p = familyOf.get(c);
    const fam = p ? families.get(p) : null;
    card.querySelector('.family').innerHTML = fam && fam.length > 1
      ? `<h2>${t('family', { p: `<span class="hz">${p}</span>` })}</h2><div class="chips">` +
        fam.filter((j) => j !== i).map((j) => chip(chars[j].c)).join('') + `</div>`
      : '';

    renderRelations(i);
    renderExamples(i);
    renderWords(i);
    showWriter(c);
    card.scrollTop = 0;
  }

  // Synonyms and antonyms of the character and of its words, those in the
  // chosen levels only: characters open their card, words can be listened to.
  const wordInfo = new Map(hsk.words.map((w) => [w.w, w]));
  const levelOf = (x) => (index.has(x) ? chars[index.get(x)].level : wordInfo.get(x)?.level ?? 9);
  function renderRelations(i) {
    const { c } = chars[i];
    relationsOf([c, ...(wordsOf.get(c) || []).filter((w) => levels.has(w.level) && w.w !== c).map((w) => w.w)]);
  }
  function relationsOf(own) {
    const el = card.querySelector('.relations');
    if (!relations) { el.innerHTML = ''; return; }
    const shown = (list) => list.filter((x) => levels.has(levelOf(x)));
    const item = (x) => (x.length === 1 && index.has(x) ? chip(x)
      : wordInfo.has(x) ? wordChip(wordInfo.get(x))
      : `<button class="chip say" data-word="${x}" data-py=""><span class="hz">${x}</span></button>`);
    const rows = own.map((x) => [x, ...(relations[x] || [[], []]).map(shown)])
      .filter(([, s, a]) => s.length || a.length).slice(0, 6);
    el.innerHTML = rows.length
      ? `<h2>${t('relations', { lv: levelText() })}</h2>` + rows.map(([x, s, a]) => `<div class="rel">` +
        `<span class="hz head">${x}</span>` +
        (s.length ? `<span class="kind">≈ ${t('syn')}</span><div class="chips">${s.map(item).join('')}</div>` : '') +
        (a.length ? `<span class="kind">↔ ${t('ant')}</span><div class="chips">${a.map(item).join('')}</div>` : '') +
        `</div>`).join('')
      : '';
  }

  // Example sentences up to the chosen level, a couple per level, the
  // character marked; Tatoeba sentences, linked to their page.
  function renderExamples(i) {
    const { c } = chars[i];
    examplesOf(c, sentences ? (sentences.c[c] || []).map((k) => sentences.s[k]) : []);
  }
  function examplesOf(c, found) {
    const el = card.querySelector('.examples');
    if (!sentences) { el.innerHTML = `<h2>${t('examples')}</h2><p class="muted">${t('loading')}</p>`; return; }
    const list = found.filter((x) => levels.has(x[3]));
    el.innerHTML = `<h2>${t('examplesLv', { lv: levelText() })}</h2>` + (list.length
      ? list.map(([id, zh, py, lv, it, en]) => `<div class="ex">` +
        `<button class="zh hz say" data-sentence="${attr(zh)}" data-py="${attr(py)}" aria-label="${t('listen')}">${zh.replaceAll(c, `<mark>${c}</mark>`)}</button>` +
        `<div class="py">${py}</div>` +
        `<div class="tr">${I18N.lang === 'en' ? en || `${it} <small>(it)</small>` : it || `${en} <small>(en)</small>`}</div>` +
        `<div class="lv">HSK ${lv} · <a href="https://tatoeba.org/${I18N.lang}/sentences/show/${id}" target="_blank" rel="noopener">Tatoeba #${id}</a></div>` +
        `</div>`).join('')
      : `<p class="muted">${t('noSentences')}</p>`);
  }

  // Words up to the chosen level, filterable by part of speech.
  function renderWords(i) {
    const { c } = chars[i];
    const all = (wordsOf.get(c) || []).filter((w) => levels.has(w.level) && w.w !== c);
    const tags = [...new Set(all.flatMap((w) => posTags(w.pos)))].filter((t) => POS_NAMES[t]);
    if (posFilter !== 'all' && !tags.includes(posFilter)) posFilter = 'all';
    const words = all.filter((w) => posFilter === 'all' || posTags(w.pos).includes(posFilter))
      .sort((a, b) => a.level - b.level || a.w.length - b.w.length).slice(0, 30);
    const filters = tags.length > 1
      ? `<div class="pos">${[['all', t('all')], ...tags.map((p) => [p, POS_NAMES[p]])]
        .map(([p, n]) => `<button data-pos="${p}" class="${p === posFilter ? 'on' : ''}">${p === 'all' ? '' : `<span class="hz">${p}</span> `}${n}</button>`).join('')}</div>`
      : '';
    card.querySelector('.words').innerHTML = `<h2>${t('words', { lv: levelText() })}</h2>` + filters + (words.length
      ? words.map((w) => {
        const info = ced.words[w.w];
        const gl = info?.d?.[0] || '';
        const cl = info?.cl ? ` · ${t('measure')} ${info.cl.map(([h, py]) => `<span class="hz">${h}</span> ${py}`).join(', ')}` : '';
        return `<div class="word"><button class="hz say" data-word="${w.w}" data-py="${w.py}" aria-label="${t('listen')} ${w.w}">${w.w}</button><span class="py">${w.py}</span><span class="gl">${gl}</span>` +
          `<button class="to" data-open="${wordId(w)}" aria-label="${t('openWord', { w: w.w })}">→</button>` +
          `<span class="lv">HSK ${w.level}${w.pos ? ` · ${w.pos}` : ''}${cl}</span></div>`;
      }).join('')
      : `<p class="muted">${t('noWords')}</p>`);
  }

  function select(i) {
    // In a galaxy a character needs its node's column up (or stands alone).
    if (galactic()) {
      const n = isNode(i) ? i : nodeFor(view, i);
      openNode(n, n < 0 ? i : -1);
    }
    selected = i;
    related = relatedTo(i);
    if (!narrowSearch()) highlight = new Set();
    renderCard(i);
    card.hidden = false;
    showResults();
    if (!flat && camera.radius > 34) camera.radius = 34;
    if (flat) { if (view === 'levels') moveTo(flatLevels()); else fit(); }
    if (tStart < 0) drawLines();
    history.replaceState(null, '', `#${encodeURIComponent(glyphs[i])}`);
  }

  function deselect() {
    if (lexicon === 'words') { selectWord(-1); return; }
    selected = -1;
    related = new Set();
    card.hidden = true;
    if (practicing()) setPractice(false);
    showResults();
    if (galactic() && (open >= 0 || lonely >= 0)) openNode(-1);
    else if (flat) moveTo(currentLayout());
    clearLines();
    history.replaceState(null, '', location.pathname);
  }

  card.addEventListener('click', (e) => {
    const say = e.target.closest('.say');
    if (say) {
      const d = say.dataset;
      if (d.read) Voice.reading(d.read, d.char);
      else if (d.word) Voice.word(d.word, d.py);
      else if (d.sentence) Voice.sentence(d.sentence, d.py);
      return;
    }
    const opens = e.target.closest('[data-open]');
    if (opens) { openWord(+opens.dataset.open); return; }
    const go = e.target.closest('[data-go]');
    if (go) {
      setLexicon('chars');
      select(index.has(go.dataset.go) ? index.get(go.dataset.go) : nodeOf[view].get(go.dataset.go));
    }
    const pf = e.target.closest('[data-pos]');
    if (pf && selected >= 0 && !isNode(selected)) { posFilter = pf.dataset.pos; renderWords(selected); }
    const w = e.target.closest('[data-writer]');
    if (w) {
      const act = w.dataset.writer;
      if (act === 'quiz') practicing() ? showWriter(writerChar, true) : setPractice(true);
      else if (act === 'done') setPractice(false);
      else playWriters();
    }
  });
  card.querySelector('.close').addEventListener('click', deselect);
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (practicing()) setPractice(false); else deselect();
  });

  // ---------- controls ----------

  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    const keep = selected >= 0 && !isNode(selected) ? selected : -1;
    selected = -1;
    setView(b.dataset.view);
    if (keep >= 0) select(keep);
    else { card.hidden = true; related = new Set(); }
  }));
  // Each level shows or hides on its own; at least one stays on.
  document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
    const lv = +b.dataset.level;
    if (levels.has(lv)) { if (levels.size > 1) levels.delete(lv); } else levels.add(lv);
    recount();
    document.querySelectorAll('[data-level]').forEach((x) => x.classList.toggle('on', levels.has(+x.dataset.level)));
    if (lexicon === 'words') refreshWords();
    else if (galactic() && open >= 0) moveTo(galaxyLayout());
    else if (flat && !galactic()) moveTo(currentLayout());
    if (selected >= 0) select(selected);
    runSearch(false);
  }));
  document.querySelectorAll('[data-level]').forEach((x) => x.classList.add('on'));
  document.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => {
    colorMode = b.dataset.color;
    document.querySelectorAll('[data-color]').forEach((x) => x.classList.toggle('on', x === b));
    setColors();
  }));

  // A character selects it; pinyin (tones optional) highlights every match
  // among the shown levels. Run again when the levels change.
  // Search by meaning: an English word or phrase, as a whole word (eat, eats,
  // eaten, eating), in the CC-CEDICT glosses of the characters and HSK words.
  // A gloss that is just the query ("to eat") ranks first, then main meanings.
  let found = { chars: [], words: [] };
  function byMeaning(q, singles = false) {
    const lq = q.toLowerCase().trim();
    const e = lq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const stem = e.length > 4 ? e.replace(/(e?s|ed|ing)$/, '') : e;
    // short words only take a plural: "he" is not "heed" nor "hen"
    const re = new RegExp(`\\b(${e}|${stem})(${lq.length <= 3 ? 's' : 's|es|d|ed|n|en|ing'})?\\b`, 'i');
    const rank = (defs) => {
      let best = -1;
      defs.forEach((d, k) => d.split(/;\s*/).forEach((seg) => {
        const g = seg.replace(/\([^)]*\)/g, '').trim().toLowerCase();
        if (!re.test(g) || /^surname /.test(g)) return;
        const r = (g === lq || g === `to ${lq}` ? 0 : 20) + k;
        if (best < 0 || r < best) best = r;
      }));
      return best;
    };
    const hits = [], words = [];
    chars.forEach(({ c }, i) => {
      if (!inLevel(i)) return;
      const r = rank((ced.chars[c] || []).flatMap(([, d]) => d));
      if (r >= 0) hits.push([r, i]);
    });
    for (const w of hsk.words) {
      if ((w.w.length < 2 && !singles) || !levels.has(w.level)) continue;
      const r = rank(ced.words[w.w]?.d || []);
      if (r >= 0) words.push([r, w]);
    }
    return {
      chars: hits.sort((a, b) => a[0] - b[0] || chars[a[1]].level - chars[b[1]].level).map(([, i]) => i),
      words: words.sort((a, b) => a[0] - b[0] || a[1].level - b[1].level).slice(0, 40).map(([, w]) => w),
    };
  }

  // Among the words: those written with it, read so, or meaning it.
  function searchWords(q) {
    const han = [...q].some((ch) => index.has(ch));
    const p = plain(q).replace(/[\s']+/g, ''), toneQ = /[1-5]$/.test(p) ? +p.slice(-1) : 0, base = toneQ ? p.slice(0, -1) : p;
    const hit = words.flatMap((w, k) => {
      if (!levels.has(w.level)) return [];
      if (han) return w.w.includes(q) ? [k] : [];
      return plain(w.py).replace(/[\s']+/g, '') === base && (!toneQ || tonesOf(w).includes(toneQ)) ? [k] : [];
    });
    const meant = !han && /^[a-z][a-z' -]+$/i.test(q) ? byMeaning(q, true).words.map(wordId) : [];
    return [...new Set([...hit, ...meant])];
  }

  function runSearch(pickChar = true) {
    const q = $('#search').value.trim();
    highlight = new Set();
    found = { chars: [], words: [] };
    if (lexicon === 'words') {
      wordHits = q ? searchWords(q) : null;
      if (pickChar && wordSel >= 0) selectWord(-1);
      renderWordList();
      if (pickChar) wordList.scrollTop = 0;
      return;
    }
    if (q) {
      const han = [...q].find((ch) => index.has(ch));
      if (han) { if (pickChar) select(index.get(han)); }
      else {
        const p = plain(q).replace(/\s+/g, '');
        const toneQ = /[1-5]$/.test(p) ? +p.slice(-1) : 0;
        const base = toneQ ? p.slice(0, -1) : p;
        chars.forEach((_, i) => {
          const ok = (ced.chars[chars[i].c] || []).some(([py]) => plain(py) === base && (!toneQ || toneOf(py) === toneQ));
          if (ok && inLevel(i)) highlight.add(i);
        });
        // and by meaning, from two letters on: its characters, and those of its words, light up too
        if (/^[a-z][a-z' -]+$/i.test(q)) {
          found = byMeaning(q);
          for (const i of found.chars) highlight.add(i);
          for (const w of found.words) for (const ch of w.w) if (index.has(ch) && inLevel(index.get(ch))) highlight.add(index.get(ch));
        }
      }
    }
    showResults();
  }
  $('#search').addEventListener('input', () => runSearch());

  // On phones the matches are too scattered to find in the cloud: the cloud
  // keeps only them, and they are listed in a column under the bar.
  const narrowSearch = () => canvas.clientWidth <= 700 && highlight.size > 0;
  const results = $('#results');
  const wordRow = (w) => `<button class="row wrow" data-open="${wordId(w)}"><span class="hz">${w.w}</span>` +
    `<span class="py">${w.py}</span><span class="gl">${gloss(w)}</span><span class="lv">HSK ${w.level}</span></button>`;
  // The list: on phones every match; on wider screens the matches by meaning,
  // whose words the cloud alone can't show.
  function showResults() {
    if (lexicon === 'words') { results.hidden = true; return; }
    const meaning = found.chars.length + found.words.length > 0;
    const narrow = canvas.clientWidth <= 700;
    const on = card.hidden && (narrowSearch() || meaning);
    results.hidden = !on;
    results.classList.toggle('side', !narrow);
    if (!on) return;
    const inWords = new Set(found.words.flatMap((w) => [...w.w]));
    const pinyin = [...highlight].filter((i) => !found.chars.includes(i) && !inWords.has(chars[i].c))
      .sort((a, b) => chars[a].level - chars[b].level || tone[a] - tone[b]);
    const list = meaning ? found.chars : pinyin;
    const charRow = (i) => {
      const gl = (ced.chars[chars[i].c]?.[0]?.[1] || [])[0] || '';
      return `<button class="row" data-go="${chars[i].c}"><span class="hz">${chars[i].c}</span>` +
        `<span class="py" style="color:${COLORS.tone[tone[i]]}">${reading[i]}</span>` +
        `<span class="gl">${gl}</span><span class="lv">HSK ${chars[i].level}</span></button>`;
    };
    results.style.top = `${$('#bar').offsetHeight + 4}px`;
    results.innerHTML = `<div class="rhead">${list.length} ${list.length === 1 ? t('char1') : t('charN')}` +
      `${meaning ? ` · ${found.words.length} ${found.words.length === 1 ? t('word1') : t('wordN')}` : ''} · ${levelText()}` +
      `<button data-clear aria-label="${t('clear')}">×</button></div>` +
      list.map(charRow).join('') +
      (found.words.length ? `<div class="rsub">${t('wordN')}</div>${found.words.map(wordRow).join('')}` : '') +
      (meaning && pinyin.length && narrow ? `<div class="rsub">pinyin</div>${pinyin.map(charRow).join('')}` : '');
  }
  results.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) { $('#search').value = ''; runSearch(); return; }
    const w = e.target.closest('[data-open]');
    if (w) { openWord(+w.dataset.open); return; }
    const go = e.target.closest('[data-go]');
    if (go) select(index.get(go.dataset.go));
  });
  window.addEventListener('resize', () => showResults());

  function applyLanguage() {
    I18N.apply(TEXT);
    document.title = t('title');
    $('#lang').textContent = t('lang');
    $('#lang').title = t('langName');
    card.querySelector('[data-writer="quiz"]').textContent = practicing() ? t('again') : t('practice');
    setColors();
    if (selected >= 0) renderCard(selected);
    if (wordSel >= 0) renderWordCard();
    showResults();
  }
  $('#lang').addEventListener('click', () => { I18N.set(I18N.other); applyLanguage(); });
  applyLanguage();

  $('#theme').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('hanzi-theme', theme); } catch (e) { /* private mode */ }
    COLORS = THEMES[theme];
    document.documentElement.dataset.theme = theme;
    setColors();
    drawLines();
    drawOrbits();
    if (selected >= 0) renderCard(selected);
    if (wordSel >= 0) renderWordCard();
  });

  document.querySelectorAll('[data-dim]').forEach((b) => b.addEventListener('click', () => {
    if ((b.dataset.dim === '2') !== flat) setFlat(b.dataset.dim === '2');
  }));
  window.addEventListener('resize', () => { if (lexicon === 'words') refreshWords(); else if (flat) moveTo(currentLayout()); });
  document.querySelectorAll('[data-lex]').forEach((b) => b.addEventListener('click', () => setLexicon(b.dataset.lex)));
  applyCamera();
  if (flat) { pos.set(currentLayout()); moveTo(currentLayout()); half = halfGoal; }

  setColors();
  $('#loading').classList.add('done');
  // ?vista=radicali|fonetica|livelli picks the view; #字 opens a character, or
  // in a galaxy view a radical / phonetic component. ?vista=parole shows the
  // words, and #词语 opens one.
  const VIEWS = { livelli: 'levels', radicali: 'radicals', fonetica: 'phonetic' };
  const vista = new URLSearchParams(location.search).get('vista');
  const wanted = VIEWS[vista];
  if (wanted && wanted !== view) setView(wanted);
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (vista === 'parole') {
    setLexicon('words');
    const k = words.findIndex((w) => w.w === fromHash);
    if (k >= 0) selectWord(k);
    return;
  }
  if (galactic() && nodeOf[view].has(fromHash)) select(nodeOf[view].get(fromHash));
  else if (index.has(fromHash)) select(index.get(fromHash));
}

main().catch((e) => {
  console.error(e);
  $('#loading').textContent = t('failed');
});
