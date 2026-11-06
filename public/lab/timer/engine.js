// The timer's engine: everything that is not drawn. Plans (their shape,
// checks, links, storage), the workout they make (a list of segments), the
// run's clock with its events, the beeps scheduled on the audio clock, the
// voice and the screen's wake lock. No DOM here: a view listens to a run and
// draws it, so a skin, however far it goes, never touches this file.
const Engine = (() => {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Section colours, by index (a plan keeps the index).
  const PALETTE = ['#ff4f6d', '#2fd38a', '#2f8cff', '#ff9a2f', '#a463ff', '#ffd23f', '#ff6fd0', '#36e2ff'];
  const PREP = '#ffd23f';
  const REST = '#9fb4c8';
  const MAX_DUR = 99 * 60 + 59;

  // ---- durations ---------------------------------------------------------

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
  };

  // "40" forty seconds, "90" ninety, "130" or "1:30" or "1m30" a minute and a
  // half (as on a microwave: past two digits, the last two are seconds).
  // null when it can't be read.
  function parseDur(str) {
    const s = String(str).trim().toLowerCase().replace(/[.,'′]/g, ':').replace(/\s+/g, '');
    if (!s) return 0;
    let m = s.match(/^(\d{1,3}):(\d{0,2})$/);
    if (m) return clamp(+m[1] * 60 + +(m[2] || 0), 0, MAX_DUR);
    m = s.match(/^(?:(\d{1,3})m(?:in)?)?(?:(\d{1,4})s?)?$/);
    if (m && (m[1] || m[2]) && /[ms]/.test(s)) return clamp(+(m[1] || 0) * 60 + +(m[2] || 0), 0, MAX_DUR);
    if (/^\d{1,4}$/.test(s)) return clamp(s.length <= 2 ? +s : +s.slice(0, -2) * 60 + +s.slice(-2), 0, MAX_DUR);
    return null;
  }

  // ---- plans -------------------------------------------------------------
  // { name, prep, pause, blocks: [{ sections: [{ label, dur, c }], rounds, rest }] }

  // a plan read from storage or from a link is checked field by field
  function sanitize(p) {
    if (!p || typeof p !== 'object' || !Array.isArray(p.blocks)) return null;
    const num = (v, a, b, d) => (Number.isFinite(+v) ? clamp(Math.round(+v), a, b) : d);
    const str = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
    const blocks = p.blocks.slice(0, 20).map((b) => ({
      sections: (Array.isArray(b?.sections) ? b.sections : []).slice(0, 30)
        .map((s) => ({ label: str(s?.label, 40), dur: num(s?.dur, 0, MAX_DUR, 0), c: num(s?.c, 0, PALETTE.length - 1, 0) })),
      rounds: num(b?.rounds, 1, 99, 1),
      rest: num(b?.rest, 0, MAX_DUR, 0),
    })).filter((b) => b.sections.length);
    if (!blocks.length) return null;
    return { name: str(p.name, 60), prep: num(p.prep, 0, MAX_DUR, 0), pause: num(p.pause, 0, MAX_DUR, 0), blocks };
  }

  // links: the plan, compact, as base64url of its JSON
  function encode(p) {
    const c = { n: p.name, p: p.prep, z: p.pause, b: p.blocks.map((b) => ({ g: b.rounds, r: b.rest, s: b.sections.map((s) => [s.label, s.dur, s.c]) })) };
    let bin = '';
    new TextEncoder().encode(JSON.stringify(c)).forEach((x) => { bin += String.fromCharCode(x); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(h) {
    try {
      const bin = atob(h.replace(/-/g, '+').replace(/_/g, '/'));
      const c = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
      return sanitize({ name: c.n, prep: c.p, pause: c.z, blocks: (c.b || []).map((b) => ({ rounds: b.g, rest: b.r, sections: (b.s || []).map(([label, dur, cc]) => ({ label, dur, c: cc })) })) });
    } catch (e) { return null; }
  }

  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode, full */ } },
  };

  function blockLen(b) {
    const per = b.sections.reduce((a, s) => a + s.dur, 0);
    return { per, all: per ? b.rounds * per + (b.rounds - 1) * b.rest : 0 };
  }

  // The workout as a list of segments, each with its colour, its place, and
  // the playlist row it plays (`row`). `L` names what the plan doesn't:
  // { prep, rest, pause, section(n) }.
  function timeline(p, L) {
    const segs = [];
    const B = p.blocks.map((b, bi) => ({ b, bi })).filter(({ b }) => blockLen(b).per > 0);
    if (!B.length) return segs;
    if (p.prep > 0) segs.push({ kind: 'prep', label: L.prep, dur: p.prep, color: PREP, row: 'prep' });
    B.forEach(({ b, bi }, k) => {
      const where = { block: k, nb: B.length, nr: b.rounds };
      for (let g = 0; g < b.rounds; g++) {
        b.sections.forEach((s, si) => {
          if (s.dur > 0) segs.push({ kind: 'work', label: s.label.trim() || L.section(si + 1), dur: s.dur, color: PALETTE[s.c], round: g, row: `s-${bi}-${si}`, ...where });
        });
        if (g < b.rounds - 1 && b.rest > 0) segs.push({ kind: 'rest', label: L.rest, dur: b.rest, color: REST, round: g, row: `r-${bi}`, ...where });
      }
      if (k < B.length - 1 && p.pause > 0) segs.push({ kind: 'rest', label: L.pause, dur: p.pause, color: REST, round: b.rounds - 1, row: `p-${B[k + 1].bi}`, ...where });
    });
    return segs;
  }
  const total = (segs) => segs.reduce((a, s) => a + s.dur, 0);

  // ---- sound ---------------------------------------------------------------
  // Beeps are scheduled on the audio clock for the whole run at once, so they
  // stay on time when the tab is in the background and timers are throttled.

  const Sound = (() => {
    let ctx = null, beeps = [];
    function ready() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function beep(at, freq, len, vol = 0.22) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.012);
      g.gain.setValueAtTime(vol, Math.max(at + 0.012, at + len - 0.05));
      g.gain.linearRampToValueAtTime(0, at + len);
      o.connect(g).connect(ctx.destination);
      o.start(at);
      o.stop(at + len + 0.02);
      beeps.push(o);
    }
    function cancel() {
      beeps.forEach((o) => { try { o.stop(); } catch (e) { /* not started */ } o.disconnect(); });
      beeps = [];
    }
    // three short beeps before each change, a high one into work, a low one
    // into rest, a chord at the end
    function schedule(segs, bounds, e) {
      cancel();
      if (!ctx) return;
      const now = ctx.currentTime + 0.03, at = (x) => now + (x - e);
      segs.forEach((s, i) => {
        const start = bounds[i], end = bounds[i + 1];
        for (let k = 3; k >= 1; k--) if (end - k > start + 0.5 && end - k >= e) beep(at(end - k), 660, 0.11);
        if (end < e - 0.05) return;
        const nx = segs[i + 1];
        if (!nx) [0, 0.18, 0.36].forEach((d, j) => beep(at(end + d), [784, 988, 1319][j], j === 2 ? 0.7 : 0.16));
        else if (nx.kind === 'work') beep(at(end), 1046, 0.5, 0.26);
        else beep(at(end), 523, 0.6);
      });
    }
    const go = (kind) => { if (ctx) beep(ctx.currentTime + 0.03, kind === 'work' ? 1046 : 523, 0.35); };
    const chord = () => { if (ctx) [0, 0.18, 0.36].forEach((d, j) => beep(ctx.currentTime + 0.03 + d, [784, 988, 1319][j], j === 2 ? 0.7 : 0.16)); };
    return { ready, schedule, cancel, go, chord };
  })();

  function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    speechSynthesis.speak(u);
  }
  const hush = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

  // the screen stays on while a workout runs
  let lock = null;
  async function keepAwake(on) {
    try {
      if (on && !lock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      } else if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { /* not allowed, not supported */ }
  }

  // ---- the run -------------------------------------------------------------------
  // A run plays segments. It keeps its clock (elapsed seconds), moves on by
  // itself a few times a second, and tells its listeners:
  //   'enter'  (i)  a segment begins while running
  //   'state'  ()   played, paused, sought, stopped
  //   'finish' ()   the last segment ended
  // `opts.sound()` says whether to beep, read when the beeps are scheduled.

  function createRun(segs, opts = {}) {
    const bounds = [0];
    segs.forEach((s) => bounds.push(bounds[bounds.length - 1] + s.dur));
    const listeners = { enter: [], state: [], finish: [] };
    const emit = (ev, ...a) => listeners[ev].forEach((f) => f(...a));
    const now = () => performance.now();
    let base = 0, t0 = now(), timer = 0;
    const run = {
      segs, bounds, total: bounds[bounds.length - 1],
      on: false, done: false, idx: -1,
      elapsed: () => (run.on ? base + (now() - t0) / 1000 : base),
      indexAt(e) {
        let i = 0;
        while (i < segs.length - 1 && bounds[i + 1] <= e) i++;
        return i;
      },
      // what is playing now: the segment, its index, the seconds into it and left
      now() {
        const e = run.elapsed(), i = run.indexAt(e);
        return { e, i, seg: segs[i], into: e - bounds[i], left: bounds[i + 1] - e };
      },
      listen(ev, f) { listeners[ev].push(f); return run; },
      // move on: called by the run itself, and by a view on each frame
      update() {
        if (run.done) return;
        const e = run.elapsed();
        if (e >= run.total) { finish(true); return; }
        const i = run.indexAt(e);
        if (i !== run.idx) { run.idx = i; if (run.on) emit('enter', i); }
      },
      play() {
        if (run.done || run.on) return;
        t0 = now();
        run.on = true;
        Sound.ready();
        if (base === 0 && opts.sound?.()) Sound.go(segs[0].kind);
        reschedule();
        keepAwake(true);
        clearInterval(timer);
        timer = setInterval(run.update, 250);
        run.update();
        emit('state');
      },
      pause() {
        if (!run.on) return;
        base = run.elapsed();
        run.on = false;
        clearInterval(timer);
        Sound.cancel();
        hush();
        emit('state');
      },
      seek(e) {
        run.done = false;
        base = clamp(e, 0, run.total);
        t0 = now();
        if (base >= run.total) { finish(); return; }
        reschedule();
        run.update();
        emit('state');
      },
      skip() { const i = run.indexAt(run.elapsed()); if (i >= segs.length - 1) finish(); else run.seek(bounds[i + 1]); },
      back() { const e = run.elapsed(), i = run.indexAt(e); run.seek(e - bounds[i] > 2 || i === 0 ? bounds[i] : bounds[i - 1]); },
      stop() {
        clearInterval(timer);
        run.on = false;
        Sound.cancel();
        hush();
        keepAwake(false);
        emit('state');
      },
      // sound switched on or off while running
      resound() { reschedule(); },
      wake() { if (run.on) { keepAwake(true); run.update(); } },
    };
    function reschedule() {
      if (run.on && opts.sound?.()) Sound.schedule(segs, bounds, run.elapsed()); else Sound.cancel();
    }
    // at the natural end the chord already scheduled plays out; skipped to
    // the end, the queue is dropped and the chord played now
    function finish(natural) {
      clearInterval(timer);
      base = run.total;
      const was = run.on;
      run.on = false;
      run.done = true;
      if (!natural) { Sound.cancel(); if (was && opts.sound?.()) Sound.chord(); }
      keepAwake(false);
      emit('finish');
      emit('state');
    }
    return run;
  }

  return { clamp, PALETTE, PREP, REST, MAX_DUR, fmt, parseDur, sanitize, encode, decode, store, blockLen, timeline, total, createRun, speak };
})();
