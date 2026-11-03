// Checks the examples of the grammar page (public/cinese/grammatica/livelli.js):
// each one uses only words and characters up to its HSK level (and the names
// allowed below),
// and its pinyin has a syllable for each character, one of that character's
// readings (tones aside: tone changes and neutral tones are written as spoken).
//
//   node scripts/check-grammar.mjs

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'public', 'cinese', 'data');
const hsk = JSON.parse(readFileSync(join(DATA, 'hsk.json'), 'utf8'));
const ced = JSON.parse(readFileSync(join(DATA, 'cedict.json'), 'utf8'));
const ctx = {};
vm.runInNewContext(`${readFileSync(join(ROOT, 'public', 'cinese', 'grammatica', 'livelli.js'), 'utf8')}; this.G = GRAMMAR;`, ctx);

const NAMES = new Set(['王', '北京']);
const HAN = /[㐀-鿿〇]/;
const flat = (py) => py.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();

// every syllable some HSK character is read with
const SYLLABLES = new Set(Object.values(ced.chars).flatMap((e) => e.map(([r]) => flat(r).replace(/[^a-z]/g, ''))).concat(['r']));

let problems = 0;
for (const [lv, items] of Object.entries(ctx.G)) {
  // the level's words, and its characters (a few, like 没, are no word of their own)
  const words = new Set([...hsk.words.filter((w) => w.level <= +lv).map((w) => w.w),
    ...hsk.chars.filter((c) => c.level <= +lv).map((c) => c.c), ...NAMES]);
  const longest = Math.max(...[...words].map((w) => w.length));
  for (const it of items) {
    for (const [zh, py] of it.ex) {
      // forward maximum matching on the level's words
      const text = [...zh].filter((c) => HAN.test(c)).join('');
      const out = [];
      for (let i = 0; i < text.length;) {
        let n = Math.min(longest, text.length - i);
        while (n > 1 && !words.has(text.slice(i, i + n))) n--;
        const w = text.slice(i, i + n);
        if (!words.has(w) && w !== '〇') out.push(w);
        i += n;
      }
      // the syllables, against each character's readings
      const sylls = py.toLowerCase().replace(/[^\p{L}\s'’-]/gu, ' ').split(/[\s'’-]+/).filter(Boolean)
        .flatMap((s) => splitSyllables(flat(s)));
      const chars = [...text];
      const bad = [];
      if (sylls.length !== chars.length) bad.push(`${sylls.length} syllables for ${chars.length} characters`);
      else chars.forEach((c, i) => {
        const ok = c === '〇' ? sylls[i] === 'ling' : (ced.chars[c] || []).some(([r]) => flat(r).replace(/[^a-z]/g, '') === sylls[i]);
        if (!ok && !NAMES.has(c)) bad.push(`${c} ${sylls[i]}`);
      });
      if (out.length || bad.length) {
        problems++;
        console.log(`HSK ${lv} · ${it.t.it}: ${zh}${out.length ? `  beyond the level: ${out.join(' ')}` : ''}${bad.length ? `  pinyin: ${bad.join(', ')}` : ''}`);
      }
    }
  }
}
console.log(problems ? `${problems} examples to look at` : 'all examples fit their level');

// "xuexi" -> ["xue", "xi"]: the fewest syllables of standard pinyin that spell it
function splitSyllables(s) {
  const best = [[]];
  for (let i = 1; i <= s.length; i++) {
    best[i] = null;
    for (let n = 1; n <= 6 && n <= i; n++) {
      const prev = best[i - n], part = s.slice(i - n, i);
      if (prev && SYLLABLES.has(part) && (!best[i] || best[i].length > prev.length + 1)) best[i] = [...prev, part];
    }
  }
  return best[s.length] || [s];
}
