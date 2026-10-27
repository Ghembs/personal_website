// Synonyms and antonyms of the HSK 1-4 words and characters, for the cards of
// the Chinese section (public/cinese/data/relations.json). Run build-hanzi.mjs
// first: it reads hsk.json and cedict.json.
//
//   node scripts/build-relations.mjs
//
// Sources (downloaded into data/raw, git-ignored):
//   - Chinese Open Wordnet (Francis Bond, Shan Wang; WordNet-style licence):
//     Chinese words grouped into the synsets of Princeton WordNet 3.0;
//   - Princeton WordNet 3.0 (WordNet licence): which synsets, and which English
//     words, are antonyms.
// Synonyms share a synset; antonyms sit in opposite synsets, or their main
// English glosses (CC-CEDICT) are WordNet antonyms (big / small: 大 / 小); when
// CC-CEDICT names the opposite itself, that one.
// WordNet is broad and these words are polysemous, so a relation is kept only
// when the synset (or gloss) is one of the main meanings of both words in
// CC-CEDICT, with the same part of speech, and an antonym both ways; at most
// four antonyms, strongest first.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data', 'raw');
const DATA = join(ROOT, 'public', 'cinese', 'data');
const SOURCES = {
  cow: 'https://raw.githubusercontent.com/omwn/omw-data/main/wns/cow/wn-data-cmn.tab',
  wn: 'https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz',
};

async function cached(name, url) {
  const file = join(RAW, name);
  if (!existsSync(file)) {
    console.log(`downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

mkdirSync(RAW, { recursive: true });
const cowFile = await cached('wn-data-cmn.tab', SOURCES.cow);
const wnFile = await cached('WNdb-3.0.tar.gz', SOURCES.wn);
const wnData = (part) => execFileSync('tar', ['xzOf', wnFile, `dict/data.${part}`], { maxBuffer: 1 << 26 }).toString('latin1');

const hsk = JSON.parse(readFileSync(join(DATA, 'hsk.json'), 'utf8'));
const ced = JSON.parse(readFileSync(join(DATA, 'cedict.json'), 'utf8'));

// ---------- the HSK items, their glosses and parts of speech ----------

const level = new Map();
for (const w of hsk.words) level.set(w.w, Math.min(level.get(w.w) ?? 9, w.level));
for (const c of hsk.chars) level.set(c.c, Math.min(level.get(c.c) ?? 9, c.level));
const POS = new Map();
for (const w of hsk.words) for (const p of (w.pos || '').split(/[、（）()]/)) if (p) (POS.get(w.w) || POS.set(w.w, new Set()).get(w.w)).add(p);
const posOk = (a, b) => !POS.get(a) || !POS.get(b) || [...POS.get(a)].some((p) => POS.get(b).has(p));

// a word's glosses; a character's, from its first common reading (not a surname's)
const defs = (w) => ced.words[w]?.d || ((ced.chars[w] || []).find(([py]) => py === py.toLowerCase()) || ced.chars[w]?.[0])?.[1] || [];
const STOP = new Set('to a an the of in on at for with by from as or and be is sth sb one up out off into used bound form etc'.split(' '));
const words = (s) => s.toLowerCase().replace(/\([^)]*\)|\[[^\]]*\]|[^\x00-\x7f]+/g, '').match(/[a-z]+/g)?.filter((x) => !STOP.has(x)) || [];
const segments = (w, n) => defs(w).slice(0, n).flatMap((d) => d.split(/[;,]/));
// main meanings: the first glosses that are a single English word
const memo = new Map();
function heads(w, n) {
  const key = `${w}|${n}`;
  if (!memo.has(key)) {
    const first = segments(w, 1);
    const list = (first.length > 1 ? first : segments(w, n)).slice(0, n);
    // "to long for" is the verb long: v:long
    memo.set(key, new Set(list.map((d) => [/^\s*to /i.test(d) ? 'v:' : '', words(d)]).filter(([, t]) => t.length === 1).map(([v, t]) => v + t[0])));
  }
  return memo.get(key);
}
const meets = (a, b) => [...a].some((x) => b.has(x));

// ---------- WordNet: synsets, their English words, antonyms ----------

const lemmas = new Map();       // synset -> its English words
const anti = new Map();         // synset -> antonym synsets
const similar = new Map();      // adjective satellite -> its head
const enAnti = new Map();       // English word -> English antonyms
const add = (m, k, v) => (m.get(k) || m.set(k, new Set()).get(k)).add(v);
const pointers = [];
for (const [part, p] of [['adj', 'a'], ['adv', 'r'], ['noun', 'n'], ['verb', 'v']]) {
  for (const line of wnData(part).split('\n')) {
    if (!line || line.startsWith('  ')) continue;
    const t = line.split(' ');
    const wc = parseInt(t[3], 16);
    const id = `${t[0]}-${p}`;
    lemmas.set(id, Array.from({ length: wc }, (_, k) => t[4 + 2 * k].toLowerCase().replace(/\(.*/, '')));
    let i = 4 + 2 * wc;
    const pc = +t[i++];
    for (let k = 0; k < pc; k++, i += 4) {
      const [sym, off, pp, st] = t.slice(i, i + 4);
      const to = `${off}-${pp === 's' ? 'a' : pp}`;
      if (sym === '!') { add(anti, id, to); if (st !== '0000') pointers.push([id, parseInt(st.slice(0, 2), 16) - 1, to, parseInt(st.slice(2), 16) - 1]); }
      if (sym === '&') add(similar, id, to);
    }
  }
}
// English antonyms, verbs marked as in heads()
for (const [from, i, to, j] of pointers) {
  const v = from.endsWith('-v') ? 'v:' : '';
  add(enAnti, v + lemmas.get(from)[i], v + lemmas.get(to)[j]);
}
// synset words as heads() writes them
const enOf = (s) => new Set((lemmas.get(s) || []).map((x) => (s.endsWith('-v') ? 'v:' : '') + x));

// ---------- Chinese Open Wordnet ----------

const members = new Map();      // synset -> Chinese words
const synsetsOf = new Map();
for (const line of readFileSync(cowFile, 'utf8').split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const [s0, , l0] = line.split('\t');
  const s = s0.replace(/-s$/, '-a');
  // adjectives come as 高的
  const l = s.endsWith('-a') && l0.length > 1 && l0.endsWith('的') ? l0.slice(0, -1) : l0;
  add(members, s, l);
  add(synsetsOf, l, s);
}

// ---------- relations ----------

const byHead = new Map();
for (const w of level.keys()) for (const h of heads(w, 3)) add(byHead, h, w);
const inHsk = (w) => level.has(w);
const found = new Map();
for (const w of level.keys()) {
  const main = heads(w, 3), first = heads(w, 1);
  const syn = new Set(), score = new Map();
  const bump = (o, v) => score.set(o, (score.get(o) || 0) + v);
  for (const s of synsetsOf.get(w) || []) {
    const en = enOf(s);
    if (!meets(en, main)) continue;              // not one of w's main meanings
    for (const o of members.get(s)) if (o !== w && inHsk(o) && meets(en, heads(o, 3))) syn.add(o);
    for (const h of [s, ...(similar.get(s) || [])]) {
      for (const a of anti.get(h) || []) {
        const enA = enOf(a);
        for (const o of members.get(a) || []) if (o !== w && inHsk(o) && meets(enA, heads(o, 3))) bump(o, 2 + meets(enA, heads(o, 1)));
      }
    }
  }
  for (const h of main) {
    for (const e of enAnti.get(h) || []) {
      for (const o of byHead.get(e) || []) if (o !== w) bump(o, 1 + (first.has(h) && heads(o, 1).has(e)) * 2);
    }
  }
  found.set(w, { syn, score });
}
// CC-CEDICT sometimes names the opposite ("opposite: new 新"): then it is the antonym
const stated = (w) => defs(w).flatMap((d) => [...(d.match(/opposite:[^;]*/i)?.[0] || '').matchAll(/[\u3400-\u9fff]+/g)].map((m) => m[0])).filter(inHsk);
// otherwise an antonym has to hold both ways
const out = {};
for (const [w, { syn, score }] of found) {
  const told = stated(w);
  const back = (o) => found.get(o)?.score.get(w) || 0;
  // both ways, strong enough together; and not against what CC-CEDICT states for the other
  const ant = told.length ? told : [...score].filter(([o, sc]) => back(o) >= 1 && sc + back(o) >= 3 && posOk(w, o) && !syn.has(o)
    && (!stated(o).length || stated(o).includes(w)))
    .sort((a, b) => b[1] - a[1] || level.get(a[0]) - level.get(b[0])).slice(0, 4).map(([o]) => o);
  const s = [...syn].sort((a, b) => level.get(a) - level.get(b));
  if (s.length || ant.length) out[w] = [s, ant];
}
for (const w of level.keys()) if (!out[w] && stated(w).length) out[w] = [[], stated(w)];

writeFileSync(join(DATA, 'relations.json'), JSON.stringify(out));
const n = Object.values(out);
console.log(`relations for ${n.length} items: ${n.filter(([s]) => s.length).length} with synonyms, ${n.filter(([, a]) => a.length).length} with antonyms`);
