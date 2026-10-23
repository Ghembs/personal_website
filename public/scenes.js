// ASCII scenes: a character grid drawn straight onto a 2D canvas, with a few
// procedural scenarios (a dinosaur in the desert, a boat at sea, a plane in the
// sky). Every cell has a character, a colour and optionally a "material": with
// the 你好 easter egg each material is written with its own hanzi instead
// (水 for the sea, 云 for clouds, 龙 for the dinosaur).
// Links are labels inside the scene; `spots` tells main.js where they are.

const Scenes = (() => {
  const HANZI = {
    sand: '沙', dino: '龙', cactus: '刺', cloud: '云', sun: '日', moon: '月', star: '星',
    wave: '水', foam: '浪', fish: '鱼', weed: '草', bubble: '泡', boat: '舟', sail: '帆',
    gull: '鸟', buoy: '标', rain: '雨', plane: '机', balloon: '球', field: '田', hill: '山',
    tree: '木', house: '屋', ptero: '翼', rope: '绳', river: '河', light: '光',
  };
  const MATS = [null, ...Object.keys(HANZI)];
  const M = Object.fromEntries(MATS.map((k, i) => [k, i]));

  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const mixHex = (a, b, t) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t));
    return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };
  const mixPalette = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, mixHex(a[k], b[k], t)]));
  const luma = (h) => {
    const n = parseInt(h.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  };
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };

  // ---------- the grid ----------

  class Grid {
    resize(cols, rows) {
      this.cols = cols; this.rows = rows;
      const n = cols * rows;
      this.ch = new Uint32Array(n);
      this.fg = new Uint8Array(n);
      this.mat = new Uint8Array(n);
      this.bg = new Uint8Array(n);
      this.bands = [];
    }
    clear() { this.ch.fill(32); this.fg.fill(0); this.mat.fill(0); this.bg.fill(0); this.bands = []; }
    put(x, y, c, fg, mat = 0) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
      const i = y * this.cols + x;
      this.ch[i] = c.codePointAt(0); this.fg[i] = fg; this.mat[i] = mat;
    }
    text(x, y, str, fg, mat = 0) { [...str].forEach((c, k) => this.put(x + k, y, c, fg, mat)); }
    // Multi-line drawing; spaces are transparent, except between the first and
    // last character of a row when `solid` (hulls, balloons hide what is behind).
    sprite(x, y, lines, fg, mat = 0, solid = false) {
      lines.forEach((line, r) => {
        const chars = [...line];
        const a = solid ? chars.findIndex((c) => c !== ' ') : 0;
        const b = solid ? chars.length - 1 - [...chars].reverse().findIndex((c) => c !== ' ') : chars.length - 1;
        chars.forEach((c, k) => {
          if (c !== ' ') this.put(x + k, y + r, c, fg, mat);
          else if (solid && k > a && k < b) this.put(x + k, y + r, ' ', fg, 0);
        });
      });
    }
    fillBg(x, y, w, colour) {
      for (let k = 0; k < w; k++) {
        const cx = Math.round(x) + k, cy = Math.round(y);
        if (cx >= 0 && cy >= 0 && cx < this.cols && cy < this.rows) this.bg[cy * this.cols + cx] = colour;
      }
    }
    band(r0, r1, colour) { this.bands.push([r0, r1, colour]); }
  }

  // ---------- shared pieces ----------

  const CLOUDS = [
    ['   .--.', '.-(    ).', '(___.____)'],
    ['  .-~~-.', ' (      )-.', '(____.____)'],
    ['   _', ' _( )_', '(_____)'],
  ];

  // Labels cycle through the links, one per new carrier (sign, buoy, balloon).
  function linkQueue(n) {
    let k = (Math.random() * n) | 0;
    return () => (k = (k + 1) % n);
  }

  // A link label drawn in the grid, inverted when hovered; returns its spot.
  function label(g, s, x, y, i, fg) {
    const txt = s.labels[i], len = [...txt].length;
    x = Math.round(x); y = Math.round(y);
    if (x + len < 0 || x >= g.cols || y < 0 || y >= g.rows) return;
    if (s.hover === i) { g.fillBg(x, y, len, fg); g.text(x, y, txt, 0); }
    else g.text(x, y, txt, fg);
    if (x >= 0 && x + len <= g.cols) s.spots[i] = { col: x, row: y, len };
  }

  function title(g, s, fg, x = 2, y = 1) { g.text(x, y, s.title, fg); }

  function stars(g, s, rows, fg) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        const h = hash(x, y + 999);
        if (h < 0.012) g.put(x, y, hash(x, y) < 0.3 + 0.25 * Math.sin(s.t * 2 + h * 900) ? '*' : '.', fg, M.star);
      }
    }
  }

  // ---------- scenario: the dinosaur ----------

  const DINO = [
    '           ____',
    '          / o  \\',
    '          |  ___|',
    ' \\       _/  |_',
    '  \\_____/    | `',
    '   \\        /',
    "    `-.  .-'",
  ];
  const DINO_LEGS = [['      | \\', '     _|  \\_'], ['      / |', '    _/  _|']];
  const CACTI = [
    { lines: ['  _', ' | |', '_| |_', ' | |'], w: 5, h: 4 },
    { lines: ['   _', '  | | _', '_ | || |', '| || |_/', '\\_   |', '  |  |'], w: 8, h: 6 },
    { lines: ['  _  _', ' | || |', '_| || |_', ' |    |'], w: 8, h: 4 },
  ];
  const PTERO = [[' \\   /', '--\\_/~<'], [' _   _', '--\\_/~<']];

  const dino = {
    name: 'il dinosauro',
    palettes: {
      day: { bg: '#f7f7f7', fg: '#535353', dim: '#b8b8b8', hl: '#202124', accent: '#535353' },
      night: { bg: '#202124', fg: '#d6d7d9', dim: '#5b5f66', hl: '#ffffff', accent: '#e8eaed' },
    },
    init(s) {
      Object.assign(s, { off: 0, speed: 12, h: 0, vy: 0, game: false, over: false, score: 0, night: 0, nightGoal: 0,
        obstacles: [], signs: [], clouds: [], pteros: [], nextObs: 30, nextSign: 18, nextLink: linkQueue(s.labels.length),
        hi: 0 });
      try { s.hi = +localStorage.getItem('dino-hi') || 0; } catch (e) { /* private mode */ }
      for (let k = 0; k < 6; k++) s.clouds.push({ x: Math.random() * s.cols * 1.5, y: 2 + Math.random() * 6, k: (Math.random() * 3) | 0 });
    },
    ground: (s) => Math.round(s.rows * (s.portrait ? 0.62 : 0.72)),
    dinoX: (s) => (s.portrait ? 2 : 8),
    action(s) {
      if (!s.game || s.over) {
        Object.assign(s, { game: true, over: false, score: 0, speed: 12, obstacles: [], nextObs: s.off + s.cols * 0.6 });
        try { s.hi = +localStorage.getItem('dino-hi') || 0; } catch (e) { /* private mode */ }
      }
      if (s.h <= 0) s.vy = 26;
      return true;
    },
    busy: (s) => s.game && !s.over,
    update(s, dt) {
      if (s.over) return;
      const g = this.ground(s), dx = this.dinoX(s);
      s.off += s.speed * dt;
      if (s.game) { s.speed = Math.min(28, s.speed + dt * 0.18); s.score += dt * s.speed * 0.8; }
      // jump
      if (s.h > 0 || s.vy > 0) { s.vy -= 40 * dt; s.h = Math.max(0, s.h + s.vy * dt); if (s.h === 0) s.vy = 0; }
      // spawn
      const ahead = s.off + s.cols + 10;
      // cacti and signs come from one spawner, so they never overlap
      while (Math.min(s.nextObs, s.nextSign) < ahead) {
        if (s.nextObs <= s.nextSign) {
          s.obstacles.push({ x: s.nextObs, ...pick(CACTI) });
          s.nextObs += 22 + Math.random() * 40 + s.speed;
          if (Math.abs(s.nextSign - s.nextObs) < 14) s.nextSign = s.nextObs + 14;
        } else {
          s.signs.push({ x: s.nextSign, i: s.nextLink() });
          s.nextSign += 30 + Math.random() * 25;
          if (Math.abs(s.nextObs - s.nextSign) < 14) s.nextObs = s.nextSign + 14;
        }
      }
      if (Math.random() < dt * 0.08 && s.pteros.length < 2) s.pteros.push({ x: s.off + s.cols + 5, y: 3 + Math.random() * (g - 14) });
      s.obstacles = s.obstacles.filter((o) => o.x - s.off > -12);
      s.signs = s.signs.filter((o) => o.x - s.off > -20);
      s.pteros = s.pteros.filter((p) => p.x - s.off > -10);
      for (const p of s.pteros) p.x += s.speed * 0.25 * dt;
      // the demo jumps by itself, timed so the apex is over the cactus
      const next = s.obstacles.find((o) => o.x + o.w / 2 - s.off > dx + 9);
      if (next && !s.game && s.h === 0) {
        const d = next.x + next.w / 2 - s.off - (dx + 9);
        if (d < 0.65 * s.speed) s.vy = 26;
      }
      if (s.game) {
        for (const o of s.obstacles) {
          const ox = o.x - s.off;
          if (ox + 1 < dx + 12 && ox + o.w - 1 > dx + 6 && s.h < o.h - 0.5) {
            s.over = true;
            s.hi = Math.max(s.hi, Math.floor(s.score));
            try { localStorage.setItem('dino-hi', s.hi); } catch (e) { /* private mode */ }
          }
        }
      }
      // night falls every 700 points in the game, every 45 s in the demo
      const phase = s.game ? Math.floor(s.score / 700) : Math.floor(s.t / 45);
      s.nightGoal = phase % 2;
      s.night += (s.nightGoal - s.night) * Math.min(1, dt * 1.5);
    },
    palette(s) { return mixPalette(this.palettes.day, this.palettes.night, s.night); },
    draw(g, s) {
      const G = this.ground(s), dx = this.dinoX(s);
      const C = { fg: 1, dim: 2, hl: 3, accent: 4 };
      if (s.night > 0.5) {
        stars(g, s, G - 8, C.dim);
        g.sprite(g.cols - 14, 3, [' .-.', '(  (', " `-'"], C.accent, M.moon);
      }
      for (const c of s.clouds) {
        const x = ((c.x - s.off * 0.2) % (g.cols + 20) + g.cols + 20) % (g.cols + 20) - 12;
        g.sprite(x, c.y + 3, CLOUDS[c.k], C.dim, M.cloud);
      }
      for (const p of s.pteros) g.sprite(p.x - s.off, p.y, PTERO[Math.floor(s.t * 4) % 2], C.fg, M.ptero);
      // ground: a line with pebbles and bumps below it
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off);
        g.put(x, G, hash(w, 7) < 0.04 ? '-' : '_', C.fg, M.sand);
        for (let y = 1; y <= 3; y++) {
          const h = hash(w, y);
          if (h < 0.07) g.put(x, G + y, h < 0.02 ? '`' : h < 0.045 ? '.' : ',', C.dim, M.sand);
        }
      }
      for (const o of s.signs) {
        const x = Math.round(o.x - s.off);
        const len = [...s.labels[o.i]].length;
        g.put(x + (len >> 1), G - 1, '|', C.fg);
        g.put(x + (len >> 1), G - 2, '|', C.fg);
        label(g, s, x, G - 3, o.i, C.hl);
      }
      for (const o of s.obstacles) g.sprite(o.x - s.off, G - o.h + 1, o.lines, C.fg, M.cactus);
      const top = G - DINO.length - 1 - Math.round(s.h);
      g.sprite(dx, top, DINO, C.fg, M.dino);
      g.sprite(dx, top + DINO.length, s.h > 0 ? DINO_LEGS[0] : DINO_LEGS[Math.floor(s.off / 1.5) % 2], C.fg, M.dino);
      // title, score, hint
      title(g, s, C.fg);
      const pad = (v) => String(Math.floor(v)).padStart(5, '0');
      const sc = `HI ${pad(s.hi)}  ${pad(s.score)}`;
      if (s.game) g.text(g.cols - sc.length - 2, 1, sc, C.fg);
      else g.text(2, 3, s.touch ? 'tocca per giocare' : 'premi spazio per giocare', C.dim);
      if (s.over) {
        const msg = 'G A M E   O V E R';
        g.text(Math.round((g.cols - msg.length) / 2), Math.round(G * 0.45), msg, C.fg);
        const sub = s.touch ? 'tocca per ricominciare' : 'spazio per ricominciare';
        g.text(Math.round((g.cols - sub.length) / 2), Math.round(G * 0.45) + 2, sub, C.dim);
      }
    },
  };

  // ---------- scenario: the boat at sea ----------

  const BOAT = [
    '       |\\',
    '       | \\',
    '       |  \\',
    '       |___\\',
    '  _____|_____',
    '  \\ o  o  o /',
    '   \\_______/',
  ];
  const BUOY = ['  _|_', ' (___)'];
  const FISH = ['><>', '<><', '><((°>', '<°))><'];

  const sea = {
    name: 'il mare',
    palettes: {
      day: { bg: '#dbe9ef', fg: '#22323a', dim: '#8ba5b2', hl: '#152229', accent: '#c4553f', wave: '#2f7ea3', foam: '#6fb3cf', deep: '#123a52', under: '#5ea3c1', sun: '#e2a03a' },
      night: { bg: '#0b1523', fg: '#d6e2e9', dim: '#4e6475', hl: '#ffffff', accent: '#e06a4f', wave: '#3f84ad', foam: '#7cb6d2', deep: '#050d16', under: '#2d6c8c', sun: '#ece5c6' },
      storm: { bg: '#9aa7ae', fg: '#1d262b', dim: '#5d6b73', hl: '#10171b', accent: '#c4553f', wave: '#2c5f78', foam: '#d6e3e8', deep: '#0e2635', under: '#3e7891', sun: '#9aa7ae' },
    },
    init(s) {
      s.time = pick(['day', 'day', 'night', 'storm']);
      Object.assign(s, { off: 0, speed: 6, buoys: [], nextBuoy: 20, nextLink: linkQueue(s.labels.length), flash: 0, nextFlash: 4,
        clouds: [], gulls: [], fish: [], bubbles: [] });
      for (let k = 0; k < 5; k++) s.clouds.push({ x: Math.random() * s.cols * 1.5, y: 1 + Math.random() * 5, k: (Math.random() * 3) | 0 });
      for (let k = 0; k < 3; k++) s.gulls.push({ x: Math.random() * s.cols, y: 3 + Math.random() * 6, p: Math.random() * 9 });
      const S = this.surface(s);
      for (let k = 0; k < 4; k++) {
        const v = (Math.random() < 0.5 ? 1 : -1) * (2 + Math.random() * 4);
        s.fish.push({ x: Math.random() * s.cols, y: S + 4 + Math.random() * (s.rows - S - 7), v, k: (v > 0 ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0) });
      }
    },
    action() { return false; },
    surface: (s) => Math.round(s.rows * (s.portrait ? 0.34 : 0.5)),
    swell: (s, x, t) => Math.sin(x * 0.18 + t * 1.6) + 0.5 * Math.sin(x * 0.07 - t * 0.9) * (s.time === 'storm' ? 2 : 1),
    update(s, dt) {
      s.off += s.speed * dt;
      const ahead = s.off + s.cols + 10;
      while (s.nextBuoy < ahead) { s.buoys.push({ x: s.nextBuoy, i: s.nextLink() }); s.nextBuoy += 32 + Math.random() * 20; }
      s.buoys = s.buoys.filter((b) => b.x - s.off > -20);
      const S = this.surface(s);
      if (Math.random() < dt * 0.8 && s.fish.length < 4 + Math.floor((s.cols * (s.rows - S)) / 500)) {
        const left = Math.random() < 0.5;
        s.fish.push({ x: left ? -6 : s.cols + 6, y: S + 4 + Math.random() * (s.rows - S - 7), v: (left ? 1 : -1) * (2 + Math.random() * 4), k: (left ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0) });
      }
      for (const f of s.fish) f.x += (f.v - s.speed * 0.3) * dt;
      s.fish = s.fish.filter((f) => f.x > -10 && f.x < s.cols + 10);
      if (Math.random() < dt * 2) s.bubbles.push({ x: Math.random() * s.cols, y: s.rows - 2 });
      for (const b of s.bubbles) { b.y -= dt * 3; b.x += Math.sin(s.t * 3 + b.y) * dt; }
      s.bubbles = s.bubbles.filter((b) => b.y > S + 3);
      for (const q of s.gulls) { q.x += dt * 3; if (q.x > s.cols + 4) q.x = -4; }
      if (s.time === 'storm') {
        s.flash = Math.max(0, s.flash - dt * 6);
        if ((s.nextFlash -= dt) < 0) { s.flash = 1; s.nextFlash = 5 + Math.random() * 7; }
      }
    },
    palette(s) {
      const p = this.palettes[s.time];
      return s.flash > 0 ? mixPalette(p, { ...p, bg: '#f4f7f9', deep: '#5d7d8e' }, s.flash) : p;
    },
    draw(g, s) {
      const S = this.surface(s);
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, wave: 5, foam: 6, deep: 7, under: 8, sun: 9 };
      g.band(S + 2, g.rows, C.deep);
      if (s.time === 'night') {
        stars(g, s, S - 2, C.dim);
        g.sprite(g.cols - 16, 2, [' .-.', '(  (', " `-'"], C.sun, M.moon);
      } else if (s.time === 'day') {
        g.sprite(g.cols - 18, 1, ['  \\ | /', '-- ( ) --', '  / | \\'], C.sun, M.sun);
      }
      for (const c of s.clouds) {
        const x = ((c.x - s.off * 0.3) % (g.cols + 20) + g.cols + 20) % (g.cols + 20) - 12;
        g.sprite(x, c.y + 2, CLOUDS[c.k], s.time === 'storm' ? C.fg : C.dim, M.cloud);
      }
      if (s.time === 'storm') {
        for (let x = 0; x < g.cols; x++) for (let y = 4; y < S; y++) {
          if (hash(x + Math.floor(s.t * 14) * 3, y - Math.floor(s.t * 14)) < 0.035) g.put(x, y, '/', C.dim, M.rain);
        }
      }
      for (const q of s.gulls) g.text(q.x, q.y + Math.round(Math.sin(s.t + q.p)), Math.sin(s.t * 5 + q.p) > 0 ? '~v~' : '-v-', C.fg, M.gull);
      // the surface: crests, the waterline, and a fading foam band below it
      for (let x = 0; x < g.cols; x++) {
        const w = x + s.off, v = this.swell(s, w, s.t);
        if (v > 1.05) g.put(x, S - 1, '^', C.foam, M.foam);
        g.put(x, S, v > 0.3 ? '~' : '-', C.wave, M.wave);
        const h1 = hash(Math.floor(w), 5);
        if (h1 < 0.55) g.put(x, S + 1, h1 < 0.25 ? '~' : '-', C.foam, M.wave);
      }
      // under water
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off * 0.6);
        if (hash(w, 11) < 0.06) {
          const tall = 1 + Math.floor(hash(w, 12) * 4);
          for (let k = 0; k < tall; k++) g.put(x + (Math.sin(s.t * 1.5 + k + w) > 0 ? 0 : 1), g.rows - 2 - k, k % 2 ? ')' : '(', C.under, M.weed);
        }
        if (hash(w, 13) < 0.3) g.put(x, g.rows - 1, '.', C.under, M.sand);
      }
      for (const b of s.bubbles) g.put(b.x, b.y, 'o', C.under, M.bubble);
      for (const f of s.fish) g.text(f.x, f.y, FISH[f.k], C.foam, M.fish);
      // buoys carry the links; they ride the swell
      const tags = [];
      for (const b of s.buoys) {
        const x = Math.round(b.x - s.off), bob = this.swell(s, b.x, s.t) > 0.6 ? -1 : 0;
        const len = [...s.labels[b.i]].length, mid = x + (len >> 1);
        g.sprite(mid - 3, S - 2 + bob, BUOY, C.accent, M.buoy, true);
        g.put(mid, S - 3 + bob, '|', C.fg);
        tags.push([x, S - 4 + bob, b.i]);
      }
      // the boat, its portholes lit at night
      const bx = Math.round(g.cols * (s.portrait ? 0.2 : 0.3));
      const bob = this.swell(s, bx + s.off + 7, s.t) > 0.5 ? -1 : 0;
      g.sprite(bx, S - BOAT.length + 2 + bob, BOAT.slice(0, 4), C.fg, M.sail, true);
      g.sprite(bx, S - BOAT.length + 6 + bob, BOAT.slice(4), C.fg, M.boat, true);
      if (s.time === 'night') [0, 1, 2].forEach((k) => g.put(bx + 4 + k * 3, S + bob, 'o', C.sun, M.light));
      // labels last: a buoy passing behind the boat keeps its link readable
      for (const [x, y, i] of tags) label(g, s, x, y, i, C.hl);
      title(g, s, C.fg);
    },
  };

  // ---------- scenario: the plane ----------

  const PLANE = [
    '   __',
    '   \\ \\_____________',
    '   [==  o o o o o   \\___',
    '   /_/_____________ ___/',
    '        \\_\\',
  ];
  const PLANE_TOP = [
    '      .',
    '     /_\\',
    '     | |',
    '_____| |_____',
    "'----.   .----'",
    '     | |',
    '    _|_|_',
  ];
  const BALLOON = ['  .-~~-.', ' /      \\', '|        |', ' \\      /', "  '.__.'", '   \\  /', '    []'];
  const BALLOON_TOP = [' .--.', '(    )', " '--'"];

  const plane = {
    name: "l'aereo",
    palettes: {
      day: { bg: '#d9e8f2', fg: '#2a3340', dim: '#93a9b9', hl: '#18202a', accent: '#c4553f', gold: '#d99a2b', cloud: '#7f97a8', ground: '#5f8a55', field: '#a9a24c' },
      dusk: { bg: '#f2d4bd', fg: '#3a2b34', dim: '#c39a8e', hl: '#24171e', accent: '#b5443a', gold: '#d98a2f', cloud: '#cc9f92', ground: '#6b5262', field: '#a8755a' },
      night: { bg: '#0c1120', fg: '#d6dde6', dim: '#46536b', hl: '#ffffff', accent: '#d86a50', gold: '#e8c36a', cloud: '#4f5d76', ground: '#2b4636', field: '#4a4f34' },
    },
    init(s) {
      s.time = pick(['day', 'day', 'dusk', 'night']);
      Object.assign(s, { off: 0, speed: 10, clouds: [], balloons: [], nextBalloon: 25, nextLink: linkQueue(s.labels.length), banner: 0, bannerAt: 0 });
      s.banner = s.nextLink();
      for (let k = 0; k < 14; k++) s.clouds.push({ x: Math.random() * 200, y: Math.random(), k: (Math.random() * 3) | 0, z: k % 3 });
    },
    action() { return false; },
    update(s, dt) {
      s.off += s.speed * dt;
      if (s.t - s.bannerAt > 7) { s.banner = s.nextLink(); s.bannerAt = s.t; }
      const span = s.portrait ? s.rows : s.cols;
      const ahead = s.off * 0.4 + span + 10;
      while (s.nextBalloon < ahead) {
        let i = s.nextLink();
        if (i === s.banner) i = s.nextLink();
        s.balloons.push({ at: s.nextBalloon, across: 0.15 + Math.random() * 0.7, i });
        s.nextBalloon += 30 + Math.random() * 30;
      }
      s.balloons = s.balloons.filter((b) => b.at - s.off * 0.4 > -20);
    },
    palette(s) { return this.palettes[s.time]; },
    draw(g, s) { (s.portrait ? this.drawTop : this.drawSide).call(this, g, s); },

    // side view: the plane tows the banner through layers of clouds
    drawSide(g, s) {
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, gold: 5, cloud: 6, ground: 7, field: 8 };
      if (s.time === 'night') stars(g, s, g.rows - 5, C.dim);
      if (s.time !== 'night') g.sprite(g.cols - 16, 2, s.time === 'dusk' ? ['  .--.', ' (    )', "  '--'"] : ['  \\ | /', '-- ( ) --', '  / | \\'], C.gold, M.sun);
      const layer = (z) => s.clouds.filter((c) => c.z === z).forEach((c) => {
        const k = [0.25, 0.6, 1.6][z], span = g.cols + 30;
        const x = ((c.x * 3 - s.off * k) % span + span) % span - 15;
        g.sprite(x, 2 + c.y * (g.rows - 12), CLOUDS[c.k], z === 2 ? C.fg : C.cloud, M.cloud, z === 2);
      });
      layer(0); layer(1);
      // hills far below, with trees and houses
      for (let x = 0; x < g.cols; x++) {
        const w = x + s.off * 0.25;
        const hAt = (u) => Math.round(1.5 + 1.5 * Math.sin(u * 0.05) + Math.sin(u * 0.13));
        const h = hAt(w), dh = hAt(w + 1) - h;
        const top = g.rows - 1 - h;
        g.put(x, top - (dh > 0 ? 1 : 0), dh > 0 ? '/' : dh < 0 ? '\\' : '_', C.ground, M.hill);
        for (let y = top + 1; y < g.rows; y++) if (hash(Math.floor(w), y) < 0.35) g.put(x, y, '.', C.field, M.field);
        const f = hash(Math.floor(w), 3);
        if (f < 0.03) g.put(x, top - 1, 'Y', C.ground, M.tree);
        else if (f < 0.04) g.text(x, top - 1, '[]', C.fg, M.house);
      }
      for (const b of s.balloons) {
        const x = Math.round(b.at - s.off * 0.4);
        // above or below the plane's band, never across it
        const band = Math.round(g.rows * 0.36), up = b.across < 0.5;
        const y = up ? Math.round(3 + (b.across * 2) * Math.max(0, band - 14)) : Math.round(band + 8 + (b.across - 0.5) * 2 * Math.max(0, g.rows - band - 22));
        g.sprite(x, y, BALLOON, C.accent, M.balloon, true);
        label(g, s, x + 4 - ([...s.labels[b.i]].length >> 1), y + BALLOON.length, b.i, C.hl);
      }
      const px = Math.round(g.cols * 0.58), py = Math.round(g.rows * 0.36) + (Math.sin(s.t * 0.9) > 0.6 ? 1 : 0);
      // the banner, trailing on a rope from the tail
      const txt = s.labels[s.banner], len = [...txt].length;
      const rope = 6, bx = px + 2 - rope - len - 2;
      for (let k = 0; k < rope; k++) g.put(px + 2 - rope + k, py + 2, (k + Math.floor(s.t * 6)) % 2 ? '~' : '-', C.dim, M.rope);
      g.put(bx, py + 2, '|', C.fg);
      label(g, s, bx + 1, py + 2, s.banner, C.hl);
      g.put(bx + len + 1, py + 2, '|', C.fg);
      g.sprite(px, py, PLANE, C.fg, M.plane, true);
      if (Math.floor(s.t * 2) % 2) g.put(px + 23, py + 2, '*', C.accent, M.light);
      layer(2);
      title(g, s, C.fg);
    },

    // top view, for tall screens: the land slides down under the plane
    drawTop(g, s) {
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, gold: 5, cloud: 6, ground: 7, field: 8 };
      const o = s.off * 0.4;
      for (let y = 0; y < g.rows; y++) {
        const w = Math.floor(y - o);
        for (let x = 0; x < g.cols; x++) {
          const fx = Math.floor(x / 9), fy = Math.floor(w / 6);
          const h = hash(fx, fy);
          // fields as sparse textures, one per patch, so the plane stands out
          const c = h < 0.3 ? ',' : h < 0.55 ? '.' : h < 0.7 ? "'" : ' ';
          if (c !== ' ' && hash(x, w) < 0.22) g.put(x, y, c, h < 0.45 ? C.ground : C.field, M.field);
          // field edges: a hedge now and then
          if (w % 6 === 0 && hash(fx, fy + 77) < 0.4 && x % 2 === 0) g.put(x, y, '-', C.ground, M.field);
        }
        // a river winding down the screen
        const rx = Math.round(g.cols * 0.3 + Math.sin(w * 0.08) * g.cols * 0.18);
        g.text(rx, y, '~~~', C.dim, M.river);
      }
      for (const c of s.clouds) {
        const span = g.rows + 20, k = [0.5, 0.9, 1.8][c.z];
        const y = ((s.off * k - c.x * 2) % span + span) % span - 10;
        g.sprite(Math.round(c.y * (g.cols - 10)), y, CLOUDS[c.k], c.z === 2 ? C.fg : C.cloud, M.cloud, c.z === 2);
      }
      for (const b of s.balloons) {
        const y = Math.round(g.rows - (b.at - s.off * 0.4)), x = Math.round(1 + b.across * (g.cols - 10));
        g.sprite(x, y, BALLOON_TOP, C.accent, M.balloon, true);
        label(g, s, x + 3 - ([...s.labels[b.i]].length >> 1), y + 3, b.i, C.hl);
      }
      const px = Math.round(g.cols / 2) - 7, py = Math.round(g.rows * 0.42);
      g.sprite(px, py, PLANE_TOP, C.fg, M.plane, true);
      for (let k = 1; k <= 4; k++) g.put(px + 7, py + 6 + k, (k + Math.floor(s.t * 6)) % 2 ? '|' : ':', C.dim, M.rope);
      const len = [...s.labels[s.banner]].length;
      label(g, s, px + 7 - (len >> 1), py + 11, s.banner, C.hl);
      title(g, s, C.fg);
    },
  };

  const SCENARIOS = [dino, sea, plane];
  const SLUGS = ['dino', 'mare', 'aereo'];

  // ---------- the scene player ----------

  return class Scenes {
    constructor(canvas, labels, titleText) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.grid = new Grid();
      this.labels = labels;
      this.titleText = titleText;
      this.hanzi = false;
      this.index = -1;
      this.s = null;
    }

    get scenario() { return SCENARIOS[this.index]; }
    static indexOf(slug) { const i = SLUGS.indexOf(slug); return i < 0 ? null : i; }
    get name() { return this.scenario?.name || ''; }

    resize(w, h, dpr) {
      this.w = w; this.h = h; this.dpr = Math.min(dpr, 2);
      this.cellH = w < 600 ? 13 : 15;
      this.cellW = Math.round(this.cellH * 0.6);
      this.canvas.width = Math.ceil(w * this.dpr);
      this.canvas.height = Math.ceil(h * this.dpr);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.grid.resize(Math.ceil(w / this.cellW), Math.ceil(h / this.cellH));
      const c = this.ctx;
      this.fs = Math.round(this.cellH * 0.82);
      c.font = `400 ${this.fs}px "JetBrains Mono", monospace`;
      this.spacing = 'letterSpacing' in c ? this.cellW - c.measureText('M').width : null;
      if (this.s) Object.assign(this.s, { cols: this.grid.cols, rows: this.grid.rows, portrait: h > w * 1.1 });
    }

    // A new scenario, different from the last one when possible.
    pick(index) {
      let i = index ?? (Math.random() * SCENARIOS.length) | 0;
      if (index == null && SCENARIOS.length > 1) while (i === this.index) i = (Math.random() * SCENARIOS.length) | 0;
      this.index = i;
      this.s = {
        t: 0, cols: this.grid.cols, rows: this.grid.rows, portrait: this.h > this.w * 1.1,
        labels: this.labels, title: this.titleText, spots: [], hover: -1,
        touch: matchMedia('(pointer: coarse)').matches,
      };
      this.scenario.init(this.s);
      return this.scenario;
    }

    // Space or a tap: the dinosaur jumps; elsewhere it means "next scene".
    action() { return this.scenario.action(this.s); }
    get busy() { return !!this.scenario?.busy?.(this.s); }
    set hover(i) { if (this.s) this.s.hover = i; }
    get spots() { return this.s?.spots || []; }

    palette() { return this.scenario.palette(this.s); }
    // The colours main.js takes for the page and the ascii pass.
    get look() {
      const p = this.palette();
      return { paper: rgb(p.bg), ink: rgb(p.fg), hl: rgb(p.hl), light: luma(p.bg) > 0.5 };
    }

    update(dt) {
      if (!this.s) return;
      this.s.t += dt;
      this.scenario.update(this.s, dt);
    }

    render() {
      const { grid: g, ctx: c, s, cellW, cellH, dpr } = this;
      if (!s) return;
      g.clear();
      s.spots = [];
      this.scenario.draw(g, s);
      const pal = this.palette();
      const colours = [pal.bg, ...Object.values(pal).slice(1)];
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = pal.bg;
      c.fillRect(0, 0, this.w, this.h);
      for (const [r0, r1, k] of g.bands) { c.fillStyle = colours[k]; c.fillRect(0, r0 * cellH, this.w, (r1 - r0) * cellH); }
      for (let i = 0; i < g.bg.length; i++) {
        if (!g.bg[i]) continue;
        c.fillStyle = colours[g.bg[i]];
        c.fillRect((i % g.cols) * cellW, Math.floor(i / g.cols) * cellH, cellW, cellH);
      }
      c.textBaseline = 'middle';
      c.font = `400 ${this.fs}px "JetBrains Mono", monospace`;
      if (this.spacing !== null) c.letterSpacing = `${this.spacing}px`;
      // Runs of one colour per row: a few hundred fillText calls per frame.
      for (let y = 0; y < g.rows; y++) {
        let run = '', x0 = 0, col = -1, gap = '';
        const flush = () => { if (run) { c.fillStyle = colours[col]; this.textAt(run, x0, y); } run = ''; gap = ''; };
        for (let x = 0; x < g.cols; x++) {
          const i = y * g.cols + x;
          const ch = g.ch[i];
          const asHanzi = this.hanzi && g.mat[i];
          if (ch === 32 || asHanzi) { if (run) gap += ' '; if (asHanzi) flush(); continue; }
          if (g.fg[i] !== col || !run) { flush(); col = g.fg[i]; x0 = x; run = String.fromCodePoint(ch); continue; }
          run += gap + String.fromCodePoint(ch);
          gap = '';
        }
        flush();
      }
      if (this.hanzi) this.renderHanzi(colours);
    }

    textAt(str, x, y) {
      const { ctx: c, cellW, cellH } = this;
      if (this.spacing !== null) { c.fillText(str, x * cellW, (y + 0.55) * cellH); return; }
      [...str].forEach((ch, k) => { if (ch !== ' ') c.fillText(ch, (x + k) * cellW, (y + 0.55) * cellH); });
    }

    // 你好: material cells are written with their hanzi, one every two cells
    // along a run, so that shapes keep their width.
    renderHanzi(colours) {
      const { grid: g, ctx: c, cellW, cellH } = this;
      c.letterSpacing = '0px';
      c.font = `${Math.round(cellH * 1.05)}px "Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
      c.textAlign = 'center';
      for (let y = 0; y < g.rows; y++) {
        let start = -1;
        for (let x = 0; x < g.cols; x++) {
          const i = y * g.cols + x, m = g.mat[i];
          if (!m || g.ch[i] === 32) { start = -1; continue; }
          if (start < 0 || g.mat[i - 1] !== m) start = x;
          if ((x - start) % 2) continue;
          c.fillStyle = colours[g.fg[i]];
          c.fillText(HANZI[MATS[m]], (x + 1) * cellW, (y + 0.55) * cellH);
        }
      }
      c.textAlign = 'left';
    }
  };
})();
