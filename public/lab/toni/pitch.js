// Pitch contours of a spoken syllable, and which tone they look like.
//   - decode(): any audio the browser reads, as mono samples at 16 kHz;
//     resample(): the microphone's samples, the same;
//   - analyse(): the pitch of every 10 ms frame (YIN), the longest voiced
//     stretch, octave slips mended and smoothed, as semitones over 24 points;
//   - reference(): the same for a recorded syllable (voice.js's audio-cmn);
//   - classify(): the closest of the four tones of that syllable, by the shape
//     of the curve (dynamic time warping) and, once the voice is known, by how
//     high it sits in the speaker's own range.
// Everything runs in the browser: the voice never leaves it.

const Pitch = (() => {
  const SR = 16000;
  const HOP = 160, WIN = 480;            // 10 ms frames, 30 ms windows (a fourth tone falls fast)
  const FMIN = 70, FMAX = 500;
  const POINTS = 24;
  // weights of the classifier, tuned on audio-cmn's characters read by another voice
  const W = { way: 1, level: 0.35 };

  async function decode(buf) {
    const ctx = new OfflineAudioContext(1, SR, SR);
    const audio = await ctx.decodeAudioData(buf);
    // decodeAudioData resamples to the context's rate; mix down to mono
    const n = audio.length, out = new Float32Array(n);
    for (let ch = 0; ch < audio.numberOfChannels; ch++) {
      const d = audio.getChannelData(ch);
      for (let i = 0; i < n; i++) out[i] += d[i] / audio.numberOfChannels;
    }
    return out;
  }

  // samples recorded at another rate (the microphone's), at 16 kHz
  async function resample(x, rate) {
    if (rate === SR) return x;
    const ctx = new OfflineAudioContext(1, Math.ceil((x.length * SR) / rate), SR);
    const b = ctx.createBuffer(1, x.length, rate);
    b.copyToChannel(x, 0);
    const src = ctx.createBufferSource();
    src.buffer = b;
    src.connect(ctx.destination);
    src.start();
    return (await ctx.startRendering()).getChannelData(0);
  }

  // YIN (de Cheveigné & Kawahara 2002): the period where the cumulative mean
  // normalised difference first dips under a threshold; 0 when unvoiced.
  const TMIN = Math.floor(SR / FMAX), TMAX = Math.ceil(SR / FMIN);
  const d = new Float32Array(TMAX + 2);
  function yin(x, at) {
    let run = 0;
    d[0] = 1;
    for (let tau = 1; tau <= TMAX + 1; tau++) {
      let s = 0;
      for (let i = at; i < at + WIN; i++) { const v = x[i] - x[i + tau]; s += v * v; }
      run += s;
      d[tau] = run ? (s * tau) / run : 1;
    }
    // the first dip under 0.15; else the deepest, if periodic enough (a
    // falling voice turns creaky, and would be lost)
    let pick = -1, low = 0.42;
    for (let tau = TMIN; tau <= TMAX; tau++) {
      if (d[tau] < 0.15) {
        while (tau < TMAX && d[tau + 1] < d[tau]) tau++;
        pick = tau;
        break;
      }
      if (d[tau] < low && d[tau] <= d[tau - 1] && d[tau] <= d[tau + 1]) { low = d[tau]; pick = tau; }
    }
    if (pick < 0) return 0;
    const a = d[pick - 1], b = d[pick], c = d[pick + 1];
    const shift = (a - c) / (2 * (a - 2 * b + c)) || 0;
    return SR / (pick + Math.max(-1, Math.min(1, shift)));
  }

  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
  const st = (f) => 12 * Math.log2(f / 100);       // semitones above 100 Hz

  function analyse(x0) {
    // level the take: no offset, the loudest sample at 0.5 (a distant or quiet
    // microphone gives a faint signal, but its pitch is all there)
    let dc = 0, top = 0;
    for (const v of x0) dc += v / x0.length;
    for (const v of x0) top = Math.max(top, Math.abs(v - dc));
    if (top < 1e-4) return null;                         // nothing at all
    const x = x0.map((v) => ((v - dc) * 0.5) / top);
    // the frames: pitch and loudness
    const frames = [];
    for (let at = 0; at + WIN + TMAX + 2 <= x.length; at += HOP) {
      let e = 0;
      for (let i = at; i < at + WIN; i++) e += x[i] * x[i];
      frames.push({ f: 0, rms: Math.sqrt(e / WIN), at });
    }
    if (!frames.length) return null;
    // the voice against the room's own noise (its quietest frames)
    const loud = Math.max(...frames.map((fr) => fr.rms));
    const noise = [...frames.map((fr) => fr.rms)].sort((a, b) => a - b)[Math.floor(frames.length * 0.15)];
    if (loud < noise * 3) return null;                   // no voice above the noise
    const gate = Math.max(loud * 0.08, noise * 2);
    for (const fr of frames) if (fr.rms > gate) fr.f = yin(x, fr.at);
    // the longest voiced stretch, gaps of up to five frames bridged
    let best = [0, -1], start = -1, gap = 0;
    frames.forEach((fr, i) => {
      if (fr.f) {
        if (start < 0) start = i;
        gap = 0;
        if (i - start > best[1] - best[0]) best = [start, i];
      } else if (start >= 0 && ++gap > 5) { start = -1; gap = 0; }
    });
    let run = frames.slice(best[0], best[1] + 1);
    // without its quiet tails: as the voice fades, its pitch slumps
    const peak = Math.max(...run.map((fr) => fr.rms));
    const a0 = run.findIndex((fr) => fr.rms > peak * 0.2), a1 = run.length - [...run].reverse().findIndex((fr) => fr.rms > peak * 0.2);
    run = run.slice(a0, a1);
    // a fourth tone often ends creaky, where no pitch can be measured: what is
    // left of it may be short, but it still falls
    if (run.length > 20) run = run.slice(2, -2);           // onset and release wobble
    if (run.length < 8) return null;                     // under 80 ms: not a syllable
    // octave slips: a sudden jump from one frame to the next (a falling tone
    // glides down almost an octave, smoothly), then a median of five
    const med = median(run.filter((fr) => fr.f).map((fr) => fr.f));
    let prev = med;
    let f = run.map((fr) => {
      let v = fr.f || prev;
      while (v > prev * 1.7) v /= 2;
      while (v < prev * 0.6) v *= 2;
      prev = v;
      return v;
    });
    f = f.map((_, i) => median(f.slice(Math.max(0, i - 2), i + 3)));
    let semi = f.map(st);
    // and its slumps: a tone glides (a fourth falls a third of a semitone every
    // 10 ms), the voice giving out drops several at once
    // several at once: the first such jump in the last (or first) sixth cuts it
    const edge = Math.max(3, Math.round(semi.length / 6));
    for (let j = semi.length - edge; j < semi.length; j++) {
      if (j > 8 && Math.abs(semi[j] - semi[j - 1]) > 2.5) { semi = semi.slice(0, j); break; }
    }
    for (let j = edge; j > 0; j--) {
      if (semi.length - j > 8 && Math.abs(semi[j] - semi[j - 1]) > 2.5) { semi = semi.slice(j); break; }
    }
    // over a fixed number of points, whatever the length
    const contour = Array.from({ length: POINTS }, (_, k) => {
      const p = (k / (POINTS - 1)) * (semi.length - 1), i = Math.floor(p), r = p - i;
      return semi[i] * (1 - r) + (semi[i + 1] ?? semi[i]) * r;
    });
    const mean = contour.reduce((a, b) => a + b, 0) / POINTS;
    return { contour, mean, dur: (run.length * HOP) / SR };
  }

  // the recorded syllables of voice.js, analysed once
  const refs = new Map();
  function reference(name) {
    if (!refs.has(name)) {
      refs.set(name, fetch(new URL(`../../cinese/audio/syl/${name}.mp3`, document.baseURI))
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
        .then(decode).then(analyse).catch(() => null));
    }
    return refs.get(name);
  }

  // distance between two shapes (each about its own mean), warping time a little
  function dtw(a, b) {
    const n = a.length, band = 4, D = Array.from({ length: n + 1 }, () => new Float64Array(n + 1).fill(Infinity));
    D[0][0] = 0;
    for (let i = 1; i <= n; i++) {
      for (let j = Math.max(1, i - band); j <= Math.min(n, i + band); j++) {
        D[i][j] = Math.abs(a[i - 1] - b[j - 1]) + Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]);
      }
    }
    return D[n][n] / n;
  }
  const centred = (c, m) => c.map((v) => v - m);
  // where a curve goes overall: -1 falls, 0 level, 1 rises (a creaky fourth
  // tone leaves only the start of its fall: short, but clearly down)
  const way = (c) => { const dv = (c[c.length - 1] + c[c.length - 2]) / 2 - (c[0] + c[1]) / 2; return dv < -1.5 ? -1 : dv > 1.5 ? 1 : 0; };

  // user: analyse() of the speaker; models: { 1..4: analyse() of the syllable };
  // voice: the speaker's centre (mean of their recent syllables), or null.
  // Returns the tones by distance, closest first.
  function classify(user, models, voice) {
    const tones = Object.keys(models).filter((k) => models[k]).map(Number);
    const centre = tones.reduce((a, k) => a + models[k].mean, 0) / tones.length;
    const shape = centred(user.contour, user.mean);
    return tones.map((k) => {
      const m = models[k];
      let dist = dtw(shape, centred(m.contour, m.mean));
      if (way(user.contour) !== way(m.contour)) dist += W.way;
      // how high, against each speaker's own centre: tone 1 sits high, tone 3 low
      if (voice !== null) dist += W.level * Math.abs((user.mean - voice) - (m.mean - centre));
      return { tone: k, dist };
    }).sort((a, b) => a.dist - b.dist);
  }

  return { SR, POINTS, W, decode, resample, analyse, reference, classify };
})();
