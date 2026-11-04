// What each exercise remembers of each character and word, shared by all of
// them: a log of the answers, kept in this browser, and from it a spaced
// repetition schedule (Leitner boxes). Each exercise is a deck ('tones-listen',
// 'words-pinyin'…) and asks first for what is due, then for what is new.
//
// The log is the only thing written: [time in s, deck, item, grade], grade 0
// wrong, 1 almost, 2 right. The schedule is replayed from it on load, so two
// logs (another device, an export) merge by joining them, and a later sync
// with a server would only need to send the entries it lacks. It is kept by
// month ('cinese-log-2026-11'), so an answer rewrites a month, not the years.

const Progress = (() => {
  const PREFIX = 'cinese-log-';
  // how long a box waits before asking again, in seconds: a minute, ten, a day, then longer
  const STEPS = [60, 600, 86400, 3 * 86400, 7 * 86400, 16 * 86400, 35 * 86400, 90 * 86400, 180 * 86400];
  const LEARNED = 4;          // from a week on, an item counts as learned
  const now = () => Math.floor(Date.now() / 1000);
  const month = (s) => new Date(s * 1000).toISOString().slice(0, 7);
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  function monthKeys() {
    const keys = [];
    try { for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith(PREFIX)) keys.push(localStorage.key(i)); } catch (e) { /* private mode */ }
    return keys.sort();
  }
  const allEntries = () => monthKeys().flatMap((k) => read(k, [])).sort((a, b) => a[0] - b[0]);

  // deck -> item -> { box, due, seen, ok, last }
  const decks = new Map();
  function apply([time, deck, item, grade]) {
    if (!decks.has(deck)) decks.set(deck, new Map());
    const d = decks.get(deck);
    let s = d.get(item);
    if (!s) {
      // a first answer: right means already known (a day), else back in a minute
      s = { box: grade === 2 ? 2 : 0, due: 0, seen: 0, ok: 0, last: time };
      d.set(item, s);
    } else if (grade === 2) {
      // right when it was due moves it on; right before then keeps its box
      if (time >= s.due - 60) s.box = Math.min(s.box + 1, STEPS.length - 1);
    } else if (grade === 1) s.box = Math.max(0, s.box - 1);
    else s.box = 0;
    s.seen++;
    if (grade === 2) s.ok++;
    s.last = time;
    s.due = time + STEPS[s.box];
  }
  allEntries().forEach(apply);

  const pickOne = (xs) => xs[(Math.random() * xs.length) | 0];

  return {
    STEPS, LEARNED,

    // the next item of `items` for `deck`: one of the most overdue, at times a
    // new one instead, a new one when none is due, else one of the soonest due;
    // never one of `avoid` (the last asked) while there is another
    pick(deck, items, id, avoid = []) {
      const d = decks.get(deck) || new Map(), t = now();
      const free = items.filter((x) => !avoid.includes(id(x)));
      const list = free.length ? free : items;
      const due = [], fresh = [], later = [];
      for (const x of list) {
        const s = d.get(id(x));
        if (!s) fresh.push(x);
        else (s.due <= t ? due : later).push([s.due, x]);
      }
      due.sort((a, b) => a[0] - b[0]);
      if (due.length && (!fresh.length || Math.random() < 0.8)) return pickOne(due.slice(0, 6))[1];
      if (fresh.length) return pickOne(fresh);
      later.sort((a, b) => a[0] - b[0]);
      return pickOne(later.slice(0, 6))[1];
    },

    record(deck, item, grade) {
      const e = [now(), deck, item, grade];
      apply(e);
      const k = PREFIX + month(e[0]);
      return write(k, [...read(k, []), e]);
    },

    // of the items given (or of all those seen): how many seen, due now, learned
    summary(deck, ids) {
      const d = decks.get(deck) || new Map(), t = now();
      const states = ids ? ids.map((i) => d.get(i)).filter(Boolean) : [...d.values()];
      return {
        seen: states.length,
        due: states.filter((s) => s.due <= t).length,
        learned: states.filter((s) => s.box >= LEARNED).length,
        answers: states.reduce((n, s) => n + s.seen, 0),
      };
    },
    decks: () => [...decks.keys()],
    state: (deck, item) => decks.get(deck)?.get(item),

    // everything the exercises keep, for a file: the log, and their settings and counters
    exportData() {
      const keep = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (/^(toni|parole)-|^hanzi-theme$|^site-lang$/.test(k)) keep[k] = read(k, null);
        }
      } catch (e) { /* private mode */ }
      return { app: 'giulianogambacorta.com/cinese/esercizi', version: 1, saved: new Date().toISOString(), log: allEntries(), keep };
    },

    // a file of exportData: its log joined to this one (no answer twice); of the
    // counters, the one with more answers; settings stay as they are here
    importData(data) {
      if (!data || !Array.isArray(data.log)) throw new Error('not a progress file');
      const seen = new Set(allEntries().map((e) => JSON.stringify(e)));
      const added = data.log.filter((e) => Array.isArray(e) && e.length === 4 && typeof e[0] === 'number' &&
        typeof e[1] === 'string' && typeof e[2] === 'string' && [0, 1, 2].includes(e[3]) && !seen.has(JSON.stringify(e)));
      const byMonth = {};
      for (const e of added) (byMonth[PREFIX + month(e[0])] ||= []).push(e);
      for (const [k, es] of Object.entries(byMonth)) write(k, [...read(k, []), ...es].sort((a, b) => a[0] - b[0]));
      for (const [k, v] of Object.entries(data.keep || {})) {
        if (!/-stats$/.test(k) || !v || typeof v !== 'object') continue;
        const here = read(k, null), n = (st) => (st?.n ?? Object.values(st || {}).reduce((s, x) => s + (x?.n || 0), 0));
        if (!here || n(v) > n(here)) write(k, v);
      }
      decks.clear();
      allEntries().forEach(apply);
      return added.length;
    },
  };
})();
