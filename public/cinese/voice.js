// Pronunciation for the Chinese pages, the same on every device: native
// recordings from audio-cmn (CC BY-SA; syllables read by Chen Wang, words and
// characters by Yue Tan), built into ./audio by scripts/build-audio.mjs.
//   - a reading plays its syllable;
//   - a word plays its recording, or else its syllables one after another,
//     with the tone changes of speech (3+3, 不, 一);
//   - a sentence uses the device's speech synthesis when it has a Chinese
//     voice, its chained syllables otherwise.
// The neutral tone has no recordings: its syllable is played lighter and quicker.

const Voice = (() => {
  const BASE = new URL('audio/', document.currentScript.src).href;
  let index = null;
  const ready = fetch(`${BASE}index.json`).then((r) => r.json())
    .then((j) => { index = { syl: new Set(j.syl), w: new Set(j.w), py: j.py }; })
    .catch(() => { index = { syl: new Set(), w: new Set(), py: {} }; });

  // ---------- pinyin ----------

  const MARKS = { ā: 'a1', á: 'a2', ǎ: 'a3', à: 'a4', ē: 'e1', é: 'e2', ě: 'e3', è: 'e4', ī: 'i1', í: 'i2', ǐ: 'i3', ì: 'i4',
    ō: 'o1', ó: 'o2', ǒ: 'o3', ò: 'o4', ū: 'u1', ú: 'u2', ǔ: 'u3', ù: 'u4', ǖ: 'v1', ǘ: 'v2', ǚ: 'v3', ǜ: 'v4', ü: 'v0' };
  let bases = null;     // syllables without their tone, as recorded
  const MAX = 6;

  // 'nǐhǎo' -> ['ni3', 'hao3'], 'bàba' -> ['ba4', 'ba0'], 'nǎr' -> ['na3', 'er0']; null when it doesn't parse
  function split(py) {
    bases ||= new Set([...index.syl].map((s) => s.slice(0, -1)));
    const letters = [], tones = [];
    for (const ch of py.normalize('NFC').toLowerCase()) {
      if (MARKS[ch]) { letters.push(MARKS[ch][0]); tones.push(+MARKS[ch][1]); }
      else if (/[a-z]/.test(ch)) { letters.push(ch); tones.push(0); }
      else if (letters.length && letters[letters.length - 1] !== '|') { letters.push('|'); tones.push(0); }
    }
    const s = letters.join('');
    // the fewest syllables that cover the letters; a lone r after a syllable is erhua
    const best = new Array(s.length + 1).fill(null);
    best[0] = [];
    for (let i = 0; i < s.length; i++) {
      if (!best[i]) continue;
      if (s[i] === '|') { if (!best[i + 1] || best[i + 1].length > best[i].length) best[i + 1] = best[i]; continue; }
      for (let n = 1; n <= MAX && i + n <= s.length; n++) {
        const part = s.slice(i, i + n);
        const ok = bases.has(part) || (part === 'r' && best[i].length);
        if (ok && (!best[i + n] || best[i + n].length > best[i].length + 1)) best[i + n] = [...best[i], [i, i + n]];
      }
    }
    if (!best[s.length]) return null;
    return best[s.length].map(([a, b]) => {
      const part = s.slice(a, b);
      if (part === 'r') return 'er0';
      return part + (tones.slice(a, b).find((x) => x) || 0);
    });
  }

  // tone changes of connected speech; chars (the hanzi, when known) for 不 and 一
  function sandhi(sylls, chars = '') {
    const t = sylls.map((s) => +s.slice(-1)), c = [...chars.replace(/[^㐀-鿿]/g, '')];
    const same = c.length === t.length;
    for (let i = 0; i < t.length - 1; i++) {
      if (same && c[i] === '不' && t[i] === 4 && t[i + 1] === 4) t[i] = 2;
      else if (same && c[i] === '一' && t[i] === 1 && t[i + 1]) t[i] = t[i + 1] === 4 ? 2 : 4;
      else if (t[i] === 3 && t[i + 1] === 3) t[i] = 2;
    }
    return sylls.map((s, i) => s.slice(0, -1) + t[i]);
  }

  // ---------- playing ----------

  let current = null;      // what is playing: a token, its audio elements
  function stop() {
    if (current) for (const a of current.audio) a.pause();
    current = null;
    window.speechSynthesis?.cancel();
  }
  function play(token, url, { volume = 1, rate = 1 } = {}) {
    return new Promise((resolve) => {
      if (current !== token) { resolve(); return; }
      const a = new Audio(url);
      a.volume = volume;
      a.playbackRate = rate;
      token.audio.push(a);
      a.onended = a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
  }
  const start = () => { stop(); current = { audio: [] }; return current; };

  async function chain(sylls) {
    const token = start();
    for (const s of sylls) {
      const neutral = s.endsWith('0'), name = neutral ? `${s.slice(0, -1)}1` : s;
      if (!index.syl.has(name)) continue;
      // the neutral tone: its syllable, lighter and quicker
      await play(token, `${BASE}syl/${name}.mp3`, neutral ? { volume: 0.55, rate: 1.3 } : {});
    }
  }

  // ---------- the device's voice, for sentences ----------

  const synth = window.speechSynthesis;
  let voice = null;
  const listeners = [];
  function findVoice() {
    const voices = synth ? synth.getVoices() : [];
    voice = voices.find((v) => /^zh[-_](CN|Hans)/i.test(v.lang)) || voices.find((v) => /^zh/i.test(v.lang)) || null;
    listeners.forEach((f) => f(!!voice));
  }
  if (synth) {
    findVoice();
    synth.addEventListener?.('voiceschanged', findVoice);
  }

  return {
    ready,
    get hasVoice() { return !!voice; },
    onVoice(f) { listeners.push(f); f(!!voice); },
    stop,

    // a reading of a character ('mǎ'); its own recording stands in for a neutral tone
    async reading(py, char) {
      await ready;
      const [s] = split(py) || [];
      if (!s) return;
      if (s.endsWith('0') && char && index.w.has(char)) { await play(start(), `${BASE}w/${encodeURIComponent(char)}.mp3`); return; }
      await chain([s]);
    },

    // a syllable by name ('ma3'), and whether it was recorded
    has: (name) => !!index?.syl.has(name),
    async syllable(name) { await ready; if (index.syl.has(name)) await chain([name]); },
    // 'mǎ' -> 'ma3' (the first syllable of a pinyin)
    async name(py) { await ready; return split(py)?.[0] || null; },

    // a word or a character, with its pinyin when the page knows it
    async word(text, py) {
      await ready;
      if (index.w.has(text)) { await play(start(), `${BASE}w/${encodeURIComponent(text)}.mp3`); return; }
      const sylls = split(py || index.py[text] || '');
      if (sylls) await chain(sandhi(sylls, text));
    },

    // a sentence: the device's voice if it speaks Chinese, the syllables otherwise
    async sentence(text, py) {
      await ready;
      if (voice) {
        stop();
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.75;
        synth.speak(u);
        return;
      }
      const sylls = py && split(py);
      if (sylls) await chain(sandhi(sylls, text));
    },

    // for checking: what a pinyin becomes
    syllables: async (py, chars) => { await ready; const s = split(py); return s && sandhi(s, chars); },
  };
})();
