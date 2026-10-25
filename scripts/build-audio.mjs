// Builds the recordings for the Chinese section (public/cinese/audio) from
// audio-cmn (https://github.com/hugolpz/audio-cmn, CC BY-SA): every syllable,
// read by Chen Wang, and the HSK 2000 words and characters read by Yue Tan,
// of which only those the section uses are kept. Run build-hanzi.mjs first.
//
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/hugolpz/audio-cmn <dir>
//   git -C <dir> sparse-checkout set 24k-abr
//   node scripts/build-audio.mjs <dir>
//
// Writes audio/syl/<syllable><tone>.mp3 (ü as v: lv4), audio/w/<hanzi>.mp3 and
// audio/index.json: { syl: [...], w: [...], py: { text: pinyin } }, where py
// gives the pinyin of what the introduction pronounces and has no recording,
// so that voice.js can chain its syllables.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CINESE = join(ROOT, 'public', 'cinese');
const OUT = join(CINESE, 'audio');
const SRC = process.argv[2];
if (!SRC || !existsSync(join(SRC, '24k-abr'))) {
  console.error('usage: node scripts/build-audio.mjs <audio-cmn checkout with 24k-abr>');
  process.exit(1);
}

const json = (f) => JSON.parse(readFileSync(join(CINESE, 'data', f), 'utf8'));
const hsk = json('hsk.json'), ced = json('cedict.json'), dec = json('decomp.json');

// what the section pronounces: HSK words and characters, and the introduction's buttons
const intro = readFileSync(join(CINESE, 'introduzione', 'index.html'), 'utf8');
const sayTexts = [...new Set([...intro.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]))];
const wanted = new Set([...hsk.words.map((w) => w.w), ...hsk.chars.map((c) => c.c), ...sayTexts]);

for (const d of ['syl', 'w']) {
  rmSync(join(OUT, d), { recursive: true, force: true });
  mkdirSync(join(OUT, d), { recursive: true });
}
const syl = [];
for (const f of readdirSync(join(SRC, '24k-abr', 'syllabs')).sort()) {
  const m = f.match(/^cmn-([a-z_]+[1-4])\.mp3$/);
  if (!m) continue;
  // after j, q, x, y pinyin writes ü as u (one file is named jv4 for jù)
  const name = m[1].replace(/^([jqxy])v/, '$1u');
  copyFileSync(join(SRC, '24k-abr', 'syllabs', f), join(OUT, 'syl', `${name}.mp3`));
  syl.push(name);
}
const w = [];
for (const f of readdirSync(join(SRC, '24k-abr', 'hsk')).sort()) {
  const m = f.match(/^cmn-(.+)\.mp3$/);
  if (!m || !wanted.has(m[1])) continue;
  copyFileSync(join(SRC, '24k-abr', 'hsk', f), join(OUT, 'w', `${m[1]}.mp3`));
  w.push(m[1]);
}

// The pinyin of the introduction's texts without a recording: an HSK word's,
// else each character's first reading.
const recorded = new Set(w);
const wordPy = new Map(hsk.words.map((x) => [x.w, x.py]));
const charPy = (c) => ced.chars[c]?.[0]?.[0] || dec[c]?.py?.split(',')[0] || null;
const py = {};
for (const text of sayTexts) {
  if (recorded.has(text)) continue;
  const p = wordPy.get(text) || [...text].map(charPy);
  if (Array.isArray(p) ? p.every(Boolean) : p) py[text] = Array.isArray(p) ? p.join(' ') : p;
  else console.warn(`no pinyin for ${text}`);
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify({ syl, w, py }));
const words = hsk.words.filter((x) => recorded.has(x.w)).length, chars = hsk.chars.filter((x) => recorded.has(x.c)).length;
console.log(`${syl.length} syllables, ${w.length} recordings (HSK words ${words}/${hsk.words.length}, characters ${chars}/${hsk.chars.length}), ${Object.keys(py).length} introduction texts chained`);
