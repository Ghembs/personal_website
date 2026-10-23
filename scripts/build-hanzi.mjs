// Builds the data for the Chinese section (public/cinese/data) and its font subset.
//
//   node scripts/build-hanzi.mjs [path/to/HSK-syllabus.pdf]
//
// Sources, each kept in its own output file because their licences differ:
//   - HSK syllabus (中外语言交流合作中心, 2025): characters and words of levels 1-4,
//     read with `pdftotext -raw` (poppler-utils). The PDF itself is not published.
//                                                         -> data/hsk.json
//   - CC-CEDICT (CC BY-SA 4.0): pinyin and meanings.      -> data/cedict.json
//   - Make Me a Hanzi dictionary.txt (LGPL-3.0): radical,
//     decomposition and etymology (phonetic / semantic).  -> data/decomp.json
//   - Noto Serif SC (OFL): subset to the characters used. -> fonts/hanzi.woff2
// Downloads are cached in data/raw (git-ignored).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'public', 'cinese', 'data');
const FONTS = join(ROOT, 'public', 'cinese', 'fonts');
const MAX_LEVEL = 4;

const SOURCES = {
  cedict: 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz',
  mmah: 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt',
  font: 'https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf',
};

// Characters the page itself writes, beyond the HSK data.
const UI_CHARS = '中文汉字级部首声旁义符词语笔顺拼音一二三四五六七八九十隧道符云山水';

const HAN = /[\u3400-\u9fff]/;

async function cached(name, url) {
  const file = join(RAW, name);
  if (!existsSync(file)) {
    console.log(`downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFileSync(file);
}

// ---------- HSK syllabus ----------

const LEVEL_NAMES = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, '七—九': 7 };

function readHsk(pdf) {
  const text = execFileSync('pdftotext', ['-raw', pdf, '-'], { maxBuffer: 1 << 28 }).toString();

  // Characters: "HSK（一级）认读字" sections, entries "12. 字". Table-of-contents
  // lines carry the same titles followed by dots, and are skipped.
  const chars = [];
  const heads = [...text.matchAll(/HSK（(一|二|三|四|五|六|七—九)级）认读字(?!\.)/g)];
  heads.forEach((h, i) => {
    const level = LEVEL_NAMES[h[1]];
    if (level > MAX_LEVEL) return;
    const body = text.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : undefined);
    const seen = new Map();
    for (const m of body.matchAll(/(\d+)\.\s*([\u3400-\u9fff])/g)) seen.set(+m[1], m[2]);
    const n = Math.max(...seen.keys());
    if (seen.size !== n) throw new Error(`level ${level}: ${seen.size} characters parsed, numbered up to ${n}`);
    for (let k = 1; k <= n; k++) chars.push({ c: seen.get(k), level });
  });

  // Words: rows "序号 等级 词语 拼音 [词性]"; the level can read "1（4）" (a second
  // sense at a later level) and words carry a sense index ("本1").
  const words = [];
  const row = /^(\d+) (\d)(?:（\d）)?(?:-\d)? (\S+) (\S+)(?: (.+))?$/;
  for (const line of text.split('\n')) {
    const m = row.exec(line.trim());
    if (!m || +m[2] > MAX_LEVEL || !HAN.test(m[3])) continue;
    words.push({ w: m[3].replace(/\d+$/, ''), level: +m[2], py: m[4], pos: m[5] || '' });
  }
  return { chars, words };
}

// ---------- CC-CEDICT ----------

const TONE_MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };

// "lu:4" -> "lǜ", following the usual placement rules.
function syllable(s) {
  const m = /^([a-zü:]+)([1-5])$/i.exec(s);
  if (!m) return s;
  let [, base, tone] = m;
  base = base.replace(/u:/g, 'ü').replace(/U:/g, 'Ü');
  if (tone === '5') return base;
  const t = +tone - 1;
  const lower = base.toLowerCase();
  let i = lower.search(/[ae]/);
  if (i < 0) i = lower.indexOf('ou');
  if (i < 0) {
    for (let k = lower.length - 1; k >= 0; k--) if ('aeiouü'.includes(lower[k])) { i = k; break; }
  }
  if (i < 0) return base;
  const v = lower[i];
  const marked = TONE_MARKS[v][t];
  return base.slice(0, i) + (base[i] === v ? marked : marked.toUpperCase()) + base.slice(i + 1);
}

const toMarks = (py) => py.split(' ').map(syllable).join(' ');
const flat = (py) => py.toLowerCase().replace(/[\s’'·-]/g, '');

function readCedict(buf) {
  const map = new Map();
  for (const raw of gunzipSync(buf).toString().split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('#')) continue;
    const m = /^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/.exec(line);
    if (!m) continue;
    const [, , simp, py, defs] = m;
    if (!map.has(simp)) map.set(simp, []);
    map.get(simp).push({ py: toMarks(py), defs: defs.split('/') });
  }
  return map;
}

// Surname-only and variant entries go last, then proper nouns (capitalised
// pinyin, e.g. 青 Qīng for Qinghai): they rarely help a learner.
const minor = (e) => e.defs.every((d) => /^(surname|variant of|old variant|archaic variant|see )/i.test(d));

// ---------- build ----------

async function main() {
  mkdirSync(RAW, { recursive: true });
  mkdirSync(OUT, { recursive: true });
  mkdirSync(FONTS, { recursive: true });

  const pdf = process.argv[2] || readdirSync(ROOT).filter((f) => f.endsWith('.pdf')).map((f) => join(ROOT, f))[0];
  if (!pdf) throw new Error('pass the HSK syllabus PDF as argument');
  const hsk = readHsk(pdf);
  console.log(`HSK 1-${MAX_LEVEL}: ${hsk.chars.length} characters, ${hsk.words.length} words`);

  const cedict = readCedict(await cached('cedict.txt.gz', SOURCES.cedict));
  const mmah = new Map(
    (await cached('makemeahanzi-dictionary.txt', SOURCES.mmah)).toString().trim().split('\n')
      .map((l) => JSON.parse(l)).map((e) => [e.character, e]),
  );

  // CC-CEDICT: every reading of each character, main ones first; for words the
  // entry whose pinyin matches the syllabus, else the first one.
  const ced = { chars: {}, words: {} };
  // Readings are ranked by how many HSK words containing the character use them.
  const usage = (c, py) => hsk.words.filter((x) => x.w.includes(c) && x.py.toLowerCase().includes(py.toLowerCase())).length;
  for (const { c } of hsk.chars) {
    const entries = (cedict.get(c) || []).map((e) => ({ ...e, n: usage(c, e.py) }))
      .sort((a, b) => minor(a) - minor(b) || /^[A-Z]/.test(a.py) - /^[A-Z]/.test(b.py) || b.n - a.n);
    ced.chars[c] = entries.slice(0, 4).map((e) => [e.py, e.defs.filter((d) => !d.startsWith('CL:')).slice(0, 5)]);
  }
  let missing = 0;
  for (const { w, py } of hsk.words) {
    const entries = cedict.get(w) || [];
    // Among entries with the syllabus pinyin, the one with most senses is
    // usually the everyday word (大学 "university", not the Confucian classic).
    const same = entries.filter((x) => flat(x.py) === flat(py)).sort((a, b) => b.defs.length - a.defs.length);
    const e = same[0] || entries.find((x) => !minor(x)) || entries[0];
    if (!e) { missing++; continue; }
    // "CL:個|个[ge4],家[jia1]" -> measure words [["个", "gè"], ["家", "jiā"]]
    const cl = e.defs.filter((d) => d.startsWith('CL:'))
      .flatMap((d) => d.slice(3).split(','))
      .map((x) => /(?:[^|[]+\|)?([^|[]+)\[([^\]]+)\]/.exec(x)).filter(Boolean)
      .map((m) => [m[1], toMarks(m[2])]);
    ced.words[w] = { d: e.defs.filter((d) => !d.startsWith('CL:')).slice(0, 3), ...(cl.length ? { cl } : {}) };
  }
  const bare = Object.values(ced.chars).filter((e) => !e.length).length;
  console.log(`CC-CEDICT: ${Object.keys(ced.words).length} words found, ${missing} missing; ${bare} characters without entries`);

  // Make Me a Hanzi: the characters plus every component they mention, so that
  // radicals and phonetic components can be named too.
  const dec = {};
  const add = (c) => {
    const e = mmah.get(c);
    if (!e || dec[c]) return;
    dec[c] = {
      r: e.radical,
      d: e.decomposition,
      def: e.definition || '',
      py: (e.pinyin || []).join(', '),
      ...(e.etymology ? { e: { t: e.etymology.type, p: e.etymology.phonetic, s: e.etymology.semantic, h: e.etymology.hint } } : {}),
    };
  };
  for (const { c } of hsk.chars) add(c);
  for (const c of Object.keys(dec)) {
    const d = dec[c];
    [d.r, ...[...(d.d || '')].filter((x) => HAN.test(x)), d.e?.p, d.e?.s].filter(Boolean).forEach(add);
  }
  console.log(`Make Me a Hanzi: ${Object.keys(dec).length} entries`);

  writeFileSync(join(OUT, 'hsk.json'), JSON.stringify(hsk));
  writeFileSync(join(OUT, 'cedict.json'), JSON.stringify(ced));
  writeFileSync(join(OUT, 'decomp.json'), JSON.stringify(dec));

  // Font subset: every character the page can draw.
  const used = new Set(UI_CHARS);
  for (const { c } of hsk.chars) used.add(c);
  for (const { w } of hsk.words) for (const ch of w) if (HAN.test(ch)) used.add(ch);
  for (const c of Object.keys(dec)) used.add(c);
  const text = [...used].join('') + '0123456789·';
  const ttf = await cached('NotoSerifSC.ttf', SOURCES.font);
  const woff2 = await subsetFont(ttf, text, { targetFormat: 'woff2', variationAxes: { wght: 500 } });
  writeFileSync(join(FONTS, 'hanzi.woff2'), woff2);
  console.log(`font: ${used.size} glyphs, ${(woff2.length / 1024).toFixed(0)} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
