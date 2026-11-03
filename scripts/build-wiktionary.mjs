// Meanings from the English Wiktionary for the HSK 1-4 words and characters,
// for the cards of the Chinese section (public/cinese/data/wiktionary.json).
// Run build-hanzi.mjs first: it reads hsk.json and cedict.json.
//
//   node scripts/build-wiktionary.mjs
//
// Source: the Chinese entries of the English Wiktionary as extracted by
// Wiktextract (kaikki.org, CC BY-SA 4.0 and GFDL, like Wiktionary), 1.2 GB,
// downloaded into data/raw (git-ignored); the HSK entries are kept aside
// after the first run.
// Wiktionary keeps a Chinese word under its traditional spelling, each reading
// apart (長: cháng "long", zhǎng "to grow"), and a word's senses under its parts
// of speech. For each HSK word and character, and each of its readings, the
// senses of standard Mandarin today: no other varieties, nothing archaic,
// classical or obsolete, no surnames or variant forms.

import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'raw');
const DATA = join(ROOT, 'public', 'cinese', 'data');
const SOURCE = 'https://kaikki.org/dictionary/Chinese/kaikki.org-dictionary-Chinese.jsonl';
const FULL = join(RAW, 'kaikki-chinese.jsonl'), KEPT = join(RAW, 'kaikki-hsk.jsonl');

const hsk = JSON.parse(readFileSync(join(DATA, 'hsk.json'), 'utf8'));
const ced = JSON.parse(readFileSync(join(DATA, 'cedict.json'), 'utf8'));

const flat = (py) => py.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').replace(/[^a-z]/gi, '').toLowerCase();
const toneKey = (py) => py.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');

// ---------- traditional spellings, from CC-CEDICT ----------

const TONE_MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
function marks(s) {
  return s.split(' ').map((syl) => {
    const m = /^([a-zü:]+)([1-5])$/i.exec(syl);
    if (!m) return syl;
    const base = m[1].replace(/u:/gi, 'ü'), t = +m[2] - 1;
    if (t === 4) return base;
    const lower = base.toLowerCase();
    let i = lower.search(/[ae]/);
    if (i < 0) i = lower.indexOf('ou');
    if (i < 0) for (let k = lower.length - 1; k >= 0; k--) if ('aeiouü'.includes(lower[k])) { i = k; break; }
    return i < 0 ? base : base.slice(0, i) + TONE_MARKS[lower[i]][t] + base.slice(i + 1);
  }).join('');
}
// simplified -> [{ trad, py }]
const spellings = new Map();
for (const line of gunzipSync(readFileSync(join(RAW, 'cedict.txt.gz'))).toString().split('\n')) {
  const m = /^(\S+) (\S+) \[([^\]]+)\] \//.exec(line);
  if (!m) continue;
  (spellings.get(m[2]) || spellings.set(m[2], []).get(m[2])).push({ trad: m[1], py: marks(m[3]) });
}

// What to look up: every HSK word and character, under each spelling.
const items = [
  ...hsk.words.map((w) => ({ key: w.w, py: [w.py.split('/')[0]], word: true, w })),
  ...hsk.chars.map(({ c }) => ({ key: c, py: (ced.chars[c] || []).map(([py]) => py), word: false })),
];
const wanted = new Set();
for (const it of items) {
  wanted.add(it.key);
  for (const s of spellings.get(it.key) || []) wanted.add(s.trad);
}

// ---------- the entries, kept aside after the first run ----------

if (!existsSync(KEPT)) {
  if (!existsSync(FULL)) throw new Error(`download ${SOURCE} into ${FULL} first (1.2 GB)`);
  const out = [];
  for await (const line of createInterface({ input: createReadStream(FULL) })) {
    // any "word" may be a related one's: read the entry when one is wanted
    if (![...line.matchAll(/"word": "([^"]+)"/g)].some((m) => wanted.has(m[1]))) continue;
    if (wanted.has(JSON.parse(line).word)) out.push(line);
  }
  mkdirSync(RAW, { recursive: true });
  writeFileSync(KEPT, `${out.join('\n')}\n`);
}
const byWord = new Map();
for (const line of readFileSync(KEPT, 'utf8').split('\n')) {
  if (!line) continue;
  const e = JSON.parse(line);
  if (e.lang_code !== 'zh') continue;
  (byWord.get(e.word) || byWord.set(e.word, []).get(e.word)).push(e);
}
console.log(`Wiktionary: ${byWord.size} of ${wanted.size} spellings found`);

// ---------- the senses of a reading ----------

// Parts of speech as the syllabus names them; a character's senses have none.
const POS = { noun: '名', verb: '动', adj: '形', adv: '副', classifier: '量', pron: '代', conj: '连', prep: '介',
  postp: '介', num: '数', particle: '助', intj: '叹', det: '代', phrase: '', character: '' };
// Not for a learner of today's standard Mandarin: other varieties and places
// (capitalised tags: Cantonese, Hokkien, Taiwan…), old or bookish senses,
// variant spellings and empty ones.
const SKIP = new Set(['no-gloss', 'alt-of', 'form-of', 'alternative', 'abbreviation', 'obsolete', 'archaic', 'historical',
  'dated', 'rare', 'literary', 'dialectal', 'regional', 'empty-gloss', 'pronunciation-spelling', 'vulgar', 'offensive', 'contraction', 'name']);
// A sense shared by Mandarin and other varieties lists them all: Mandarin is
// enough (Taiwan's too: 著 is how Taiwan writes the particle 着).
const PLACES_OK = new Set(['Mandarin', 'Mainland-China', 'Standard-Chinese']);
const MANDARIN = new Set(['Mandarin', 'Taiwanese-Mandarin']);
const usable = (sense) => {
  const tags = sense.tags || [], mandarin = tags.some((t) => MANDARIN.has(t));
  return sense.glosses?.length && !/\bsurname\b/i.test(sense.glosses.at(-1)) && !tags.some((t) =>
    SKIP.has(t) || t.startsWith('error') || (/^[A-Z]/.test(t) && !PLACES_OK.has(t) && !mandarin));
};
// the measure words are listed apart (CC-CEDICT's), and in Wiktionary's carry
// codes for the varieties using them
const tidy = (g) => g.replace(/\s*\(Classifier:[^)]*\)/g, '').trim();
// "cháng (chang²)" -> "cháng"
const readingsOf = (e) => (e.sounds || []).filter((x) => x.tags?.includes('Mandarin') && x.tags.includes('Pinyin') && x.zh_pron)
  .map((x) => toneKey(x.zh_pron.split(' (')[0]));

const PER_POS = 8;
// Senses of the entries of these spellings read so, by part of speech in
// Wiktionary's order; `loose`: if none is read with exactly these tones, any
// read with these syllables (a word's neutral tones are not always marked alike).
function senses(spelt, py, loose) {
  const entries = spelt.flatMap((x) => byWord.get(x) || []).filter((e) => e.pos in POS);
  let mine = entries.filter((e) => readingsOf(e).includes(toneKey(py)));
  if (!mine.length && loose) mine = entries.filter((e) => readingsOf(e).some((r) => flat(r) === flat(py)));
  const groups = new Map();
  for (const e of mine) {
    const list = groups.get(POS[e.pos]) || groups.set(POS[e.pos], []).get(POS[e.pos]);
    for (const sense of e.senses || []) {
      const g = usable(sense) && tidy(sense.glosses.at(-1));
      if (g && !list.includes(g) && list.length < PER_POS) list.push(g);
    }
  }
  return [...groups].filter(([, l]) => l.length);
}

const homographs = new Map();
for (const w of hsk.words) homographs.set(w.w, (homographs.get(w.w) || 0) + 1);
const spelt = (key, py) => [...new Set([key, ...(spellings.get(key) || []).filter((s) => flat(s.py) === flat(py)).map((s) => s.trad)])];
const out = { w: {}, c: {} };
let words = 0, chars = 0;
for (const it of items) {
  if (it.word) {
    const g = senses(spelt(it.key, it.py[0]), it.py[0], homographs.get(it.key) === 1);
    if (g.length) { out.w[`${it.key}|${it.w.py}`] = g; words++; }
  } else {
    const per = {};
    for (const py of it.py) {
      const g = senses(spelt(it.key, py), py, false);
      if (g.length) per[py] = g;
    }
    if (Object.keys(per).length) { out.c[it.key] = per; chars++; }
  }
}
writeFileSync(join(DATA, 'wiktionary.json'), JSON.stringify(out));
console.log(`senses for ${words}/${hsk.words.length} words and ${chars}/${hsk.chars.length} characters, ` +
  `${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
