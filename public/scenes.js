// ASCII scenes: a character grid drawn straight onto a 2D canvas, with a few
// procedural scenarios (a dinosaur walking through changing lands, a boat at
// sea, a plane over the countryside, a train). Every cell has a character, a
// colour and optionally a "material" (scenery, as opposed to text): with the
// 你好 easter egg scenery cells are written with hanzi chosen for their shape
// and weight, one per ascii mark (- 一, | 丨, / 丿, o 口, # 田). Sprites that must move smoothly (a jump, a bird) are "floats",
// drawn at fractional positions over the grid.
// Links are labels on objects of the scene; `spots` tells main.js where they
// are. Two landmarks keep a link for themselves: the Duomo of Florence shows
// only STF, the Oriental Pearl tower of Shanghai only 中文; elsewhere those
// links may appear on any carrier.

const Scenes = (() => {
  const MATERIALS = [
    'sand', 'dino', 'cactus', 'cloud', 'sun', 'moon', 'star', 'wave', 'foam', 'fish', 'weed', 'bubble', 'boat', 'sail',
    'gull', 'buoy', 'rain', 'plane', 'balloon', 'field', 'hill', 'tree', 'house', 'ptero', 'rope', 'river', 'light', 'rock',
    'snow', 'fire', 'smoke', 'train', 'rail', 'bridge', 'station', 'duomo', 'pearl', 'mill', 'castle', 'fence', 'chest',
    'leaf', 'ice', 'wood', 'sky', 'soil',
  ];
  // 你好: a hanzi of similar shape and weight for each ascii mark.
  const SHAPES = {
    '.': '丶', ',': '丶', "'": '丶', '`': '丶', '°': '丶', '"': '丷', '-': '一', '_': '一', '=': '二', '~': '乙',
    '^': '人', '|': '丨', '!': '丨', '/': '丿', '\\': '乀', 'o': '口', 'O': '回', '0': '回', '*': '米', '#': '田',
    '+': '十', ':': '冫', ';': '冫', '(': '厂', ')': '了', '[': '匚', ']': '彐', '<': '乂', '>': '乂', 'x': '乂',
    'X': '乂', 'v': '丷', 'V': '丷', 'Y': '丫', '$': '金', '%': '冖', '{': '彡', '}': '彡', '&': '丷',
  };
  const shape = (cp) => SHAPES[String.fromCodePoint(cp)] || '田';
  const MATS = [null, ...MATERIALS];
  const M = Object.fromEntries(MATS.map((k, i) => [k, i]));

  const hash = (a, b = 0) => {
    let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const rnd = (a, b) => a + Math.random() * (b - a);
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
  // Sprites are written as raw multi-line strings; the first newline is dropped.
  const art = (t) => t.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
  const widthOf = (lines) => Math.max(...lines.map((l) => [...l].length));
  const wrap = (x, span) => ((x % span) + span) % span;
  const len = (str) => [...str].length;

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
      this.floats = [];
    }
    clear() { this.ch.fill(32); this.fg.fill(0); this.mat.fill(0); this.bg.fill(0); this.bands = []; this.floats = []; }
    put(x, y, c, fg, mat = 0) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
      const i = y * this.cols + x;
      this.ch[i] = c.codePointAt(0); this.fg[i] = fg; this.mat[i] = mat;
    }
    text(x, y, str, fg, mat = 0) { [...str].forEach((c, k) => this.put(x + k, y, c, fg, mat)); }
    // Spaces are transparent, except between the first and last character of
    // a row when `solid` (hulls, houses, balloons hide what is behind them).
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
    // A sprite drawn at a fractional position, over everything; with `solid`
    // the cells it covers are blanked in the grid first.
    float(x, y, lines, fg, mat = 0, solid = false) {
      if (solid) {
        lines.forEach((line, r) => {
          const chars = [...line];
          const a = chars.findIndex((c) => c !== ' ');
          if (a < 0) return;
          const b = chars.length - 1 - [...chars].reverse().findIndex((c) => c !== ' ');
          for (let k = a; k <= b; k++) for (const dy of [0, 1]) this.put(Math.round(x) + k, Math.floor(y) + r + dy, ' ', fg, 0);
        });
      }
      this.floats.push({ x, y, lines, fg, mat });
    }
    fillBg(x, y, w, colour) {
      for (let k = 0; k < w; k++) {
        const cx = Math.round(x) + k, cy = Math.round(y);
        if (cx >= 0 && cy >= 0 && cx < this.cols && cy < this.rows) this.bg[cy * this.cols + cx] = colour;
      }
    }
    band(r0, r1, colour) { this.bands.push([r0, r1, colour]); }
    // A vertical gradient from colour a (row r0) to b (row r1), one band per row.
    gradient(r0, r1, a, b) {
      for (let y = r0; y < r1; y++) this.bands.push([y, y + 1, mixHex(a, b, (y - r0) / Math.max(1, r1 - r0 - 1))]);
    }
  }

  // ---------- shared pieces ----------

  const CLOUDS = [
    ['   .--.', '.-(    ).', '(___.____)'],
    ['  .-~~-.', ' (      )-.', '(____.____)'],
    ['   _', ' _( )_', '(_____)'],
    ['       .--.', '  .-~~(    )-.', ' (            )', "  '-.______.-'"],
  ];
  const SUN = ['  \\ | /', '-- ( ) --', '  / | \\'];
  const DUSK_SUN = [' .--.', '(    )', " '--'"];
  const MOON = [' .-.', '(  (', " '-'"];

  // Landmarks.
  const DUOMO = art(String.raw`
                        |
                       /^\
                      (___)
                      |||||                       _
                  .-'"""""""'-.                  |+|
               .-'   |   |   |  '-.              |=|
             .'      |   |   |     '.            |#|
            /        |   |   |       \           |=|
           /_________|___|___|________\          |#|
          |____________________________|         |=|
          | /\  /\  /\  /\  /\  /\  /\ |         |#|
     _____|/__\/__\/__\/__\/__\/__\/__\|_____    |=|
    |  /\  |                            |  /\ |  |#|
    | /  \ |  ||    ||    ||    ||    ||| /  \|  |=|
    |/____\|  ||    ||    ||    ||    |||/____\| |#|
    |______|__||____||____||____||____|||______|_|=|_ `);
  const PEARL = art(String.raw`
            |
            |
            |
           (o)
           | |
           | |
           | |
          .---.
         (     )
          '---'
          || ||
          || ||
         .-----.
        /       \
       (    O    )
        \       /
         '-----'
        /|| || ||\
       / || || || \
      (  || || ||  )
     /   || || ||   \
    /____||_||_||____\ `);

  // Picks the link for a carrier entering the stage: never one reserved by a
  // landmark, never one already shown (the carrier then goes without, -1),
  // and among the others the one shown least recently.
  function picker(s) {
    const last = new Array(s.labels.length).fill(-1e9);
    return (busy = []) => {
      let best = -1, score = Infinity;
      for (let i = 0; i < s.labels.length; i++) {
        if (s.reserved.has(i) || busy.includes(i)) continue;
        if (last[i] < score) { score = last[i]; best = i; }
      }
      if (best >= 0) last[best] = s.t;
      return best;
    };
  }

  // A link label drawn in the grid, inverted when hovered; records its spot.
  function label(g, s, x, y, i, fg) {
    if (i == null || i < 0) return;
    const txt = s.labels[i], n = len(txt);
    x = Math.round(x); y = Math.round(y);
    if (x + n < 0 || x >= g.cols || y < 0 || y >= g.rows) return;
    if (s.hover === i) { g.fillBg(x, y, n, s.hlBg); g.text(x, y, txt, 0); }
    else g.text(x, y, txt, fg);
    if (x >= 0 && x + n <= g.cols) s.spots[i] = { col: x, row: y, len: n };
  }
  // A label centred on x.
  const labelC = (g, s, x, y, i, fg) => label(g, s, x - (len(s.labels[i] ?? '') >> 1), y, i, fg);

  function title(g, s, fg, x = 2, y = 1) { g.text(x, y, s.title, fg); }

  function stars(g, s, rows, fg) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        const h = hash(x, y + 999);
        if (h < 0.012) g.put(x, y, hash(x, y) < 0.3 + 0.25 * Math.sin(s.t * 2 + h * 900) ? '*' : '.', fg, M.star);
      }
    }
  }

  function clouds(g, s, list, speed, fg, top, depth) {
    const span = g.cols + 30;
    for (const c of list) g.sprite(wrap(c.x - s.off * speed, span) - 15, top + c.y * depth, CLOUDS[c.k], fg, M.cloud);
  }

  // ---------- scenario: the dinosaur ----------

  const DINO = art(String.raw`
              ______
             / o    \
             |   ____|
             |  |__
 \          /   |_,
  \________/    |
   \            /
    \__      __/`);
  const DINO_LEGS = [
    ['      |  \\  |', '     _|   \\_|_'],
    ['      /  |  /', '     /_   |_/_'],
  ];
  const DINO_AIR = ['      |   |', '     _|  _|'];
  const DINO_FEET = [7, 12];       // columns of the sprite the feet span
  const BASE_SPEED = 13;

  // Each land: two palettes (day, night) with sky and ground gradients, a far
  // silhouette, its trees and its obstacles. The dinosaur walks from one land
  // into the next every few hundred metres.
  const BIOMES = {
    desert: {
      palettes: {
        day: { bg: '#f6efe2', fg: '#5a4c3c', dim: '#c2b29b', hl: '#2a2117', accent: '#b4683d', green: '#7f8f52', skyTop: '#f2dcc0', skyLow: '#fbf5ea', soil: '#ead8bb', soilDeep: '#dcc39c' },
        night: { bg: '#221d27', fg: '#d9cdbb', dim: '#5d5466', hl: '#ffffff', accent: '#d98d5f', green: '#6f7d4c', skyTop: '#0f0d1c', skyLow: '#2e2433', soil: '#2a2420', soilDeep: '#1c1714' },
      },
      far: 'mesa', trees: ['saguaroL', 'saguaro', 'joshuaL', 'joshua'], obstacles: ['cactusS', 'cactusL', 'cactusD', 'rock'],
    },
    jungle: {
      palettes: {
        day: { bg: '#eef4e6', fg: '#334a2c', dim: '#a9bf9a', hl: '#162212', accent: '#c46a3a', green: '#4f8a3c', skyTop: '#cfe6d4', skyLow: '#f2f7ea', soil: '#c9dbb3', soilDeep: '#a9c492' },
        night: { bg: '#121c16', fg: '#cfe0c6', dim: '#3d5a45', hl: '#ffffff', accent: '#d9874f', green: '#4f8a52', skyTop: '#07110d', skyLow: '#16261d', soil: '#14211a', soilDeep: '#0c1610' },
      },
      far: 'hills', trees: ['palmL', 'palm', 'canopyL', 'canopy', 'fern'], obstacles: ['log', 'rock', 'fern', 'logL'],
    },
    volcano: {
      palettes: {
        day: { bg: '#efe4df', fg: '#3c3335', dim: '#b6a7a3', hl: '#1c1617', accent: '#d2502e', green: '#6d6a4c', skyTop: '#d9b8a8', skyLow: '#f4e8e2', soil: '#cbb8b0', soilDeep: '#a8928a' },
        night: { bg: '#1a1213', fg: '#e3d3cf', dim: '#5c4446', hl: '#ffffff', accent: '#ff6a3a', green: '#5f5a44', skyTop: '#2a0c08', skyLow: '#3a1d1a', soil: '#24191a', soilDeep: '#160f10' },
      },
      far: 'volcano', trees: ['deadL', 'dead', 'fern'], obstacles: ['rock', 'rockL', 'lava'],
    },
    ice: {
      palettes: {
        day: { bg: '#eef3f7', fg: '#344a5c', dim: '#b3c4d1', hl: '#16222c', accent: '#c8553d', green: '#4d7f6e', skyTop: '#c6dcec', skyLow: '#f3f7fa', soil: '#f7fafc', soilDeep: '#d8e4ec' },
        night: { bg: '#0f1622', fg: '#d6e4ee', dim: '#3f5469', hl: '#ffffff', accent: '#e07a5a', green: '#4a7a6a', skyTop: '#050a14', skyLow: '#182436', soil: '#26364a', soilDeep: '#18222f' },
      },
      far: 'peaks', trees: ['pineXL', 'pineL', 'pine'], obstacles: ['ice', 'snowman', 'rock', 'iceL'],
    },
  };

  const OBST = {
    cactusS: { lines: art(String.raw`
  _
 | |
_| |_
 | |`), mat: 'cactus' },
    cactusL: { lines: art(String.raw`
   _
  | | _
_ | || |
| || |_/
\_   |
  |  |`), mat: 'cactus' },
    cactusD: { lines: art(String.raw`
  _  _
 | || |
_| || |_
 |    |`), mat: 'cactus' },
    rock: { lines: art(String.raw`
  .--.
 /    \
(______)`), mat: 'rock' },
    rockL: { lines: art(String.raw`
  .----._
 /       \
(_________)`), mat: 'rock' },
    log: { lines: art(String.raw`
 ______
(______)`), mat: 'wood' },
    logL: { lines: art(String.raw`
 ________
(________)`), mat: 'wood' },
    fern: { lines: art(String.raw`
\ | /
 \|/
--+--`), mat: 'leaf' },
    lava: { lines: ['~~~~~~~~~'], mat: 'fire', flat: true },
    ice: { lines: art(String.raw`
 ____
|    |
|____|`), mat: 'ice' },
    iceL: { lines: art(String.raw`
 ____ __
|    |  |
|____|__|`), mat: 'ice' },
    snowman: { lines: art(String.raw`
  _
 (_)
(   )
(___)`), mat: 'snow' },
  };
  for (const o of Object.values(OBST)) { o.w = widthOf(o.lines); o.h = o.flat ? 1 : o.lines.length; }

  const TREES = {
    saguaro: art(String.raw`
     _
  _ | |
 | || | _
 | || || |
  \_   _/
    | |
    | |`),
    saguaroL: art(String.raw`
        _
       | |
   _   | |
  | |  | |   _
  | |  | |  | |
  | |__| |__| |
   \___   ___/
       | |
       | |
       | |
       | |`),
    joshua: art(String.raw`
 \|/   \|/
  \     /
   \ | /
    \|/
     |
     |`),
    joshuaL: art(String.raw`
 \\|//     \\|//
  \|/  \|/  \|/
   \    |    /
    \   |   /
     \__|__/
        |
        |
        |
       /|\ `),
    palm: art(String.raw`
  __\ | /__
 /   \|/   \
      |
      |
      |
      |`),
    palmL: art(String.raw`
     __ _.--._ __
   .'  \  |  /  '.
  /   .-\ | /-.   \
       ' \|/ '
          |
          (
           )
          (
           )
          (
           )`),
    fern: art(String.raw`
 \  |  /
  \ | /
 --\|/--
    |`),
    canopy: art(String.raw`
   .-ooOOoo-.
  (oOoOoOoOoo)
   '-oOOOoo-'
      | |
      | |
      | |`),
    canopyL: art(String.raw`
       .-~~~~~~-.
    .-(  oO  oO  )-.
   (  oOo  Oo  oOo  )
  (  Oo  oOOo  oO  oo)
    '-(  oO  oO  )-'
       '-.____.-'
           ||
           ||
           ||
          /||\ `),
    dead: art(String.raw`
 \  /
  \/ /
   \/
   |
   |`),
    deadL: art(String.raw`
   \   |   /
    \  |  /_
  \_ \ | / _/
    \_\|/_/
       |
       |
       |
      /|\ `),
    pine: art(String.raw`
    ^
   /*\
  /***\
 /*****\
    |`),
    pineL: art(String.raw`
     ^
    /*\
   /***\
  /*****\
 /*******\
     |
     |`),
    pineXL: art(String.raw`
       ^
      /*\
     /***\
    /*****\
     /***\
    /*****\
   /*******\
    /*****\
   /*******\
  /*********\
      |||
      |||`),
  };
  const PTERO = [[' \\   /', '--\\_/~<'], [' _   _', '--\\_/~<']];

  const FAR = {
    mesa: (x) => (Math.sin(x * 0.02) > 0.3 ? 5 : Math.sin(x * 0.02) > -0.2 ? 2 : 0) + (Math.sin(x * 0.07) > 0.8 ? 1 : 0),
    hills: (x) => Math.round(3 + 2 * Math.sin(x * 0.03) + Math.sin(x * 0.11)),
    peaks: (x) => Math.round(Math.max(0, 7 - Math.abs(((x * 0.15) % 14) - 7)) + Math.sin(x * 0.05) * 1.5),
    volcano: (x) => { const d = Math.abs(wrap(x, 160) - 80); return d < 6 ? 9 : Math.max(0, Math.round(9 - (d - 6) * 0.35)); },
  };

  const dino = {
    slug: 'dino',
    init(s) {
      const first = pick(Object.keys(BIOMES));
      Object.assign(s, {
        off: 0, speed: BASE_SPEED, y: 0, vy: 0, held: false, buffer: -1, game: false, over: false, score: 0, night: 0,
        obstacles: [], trees: [], signs: [], pteros: [], clouds: [], far: [], nextObs: 40, nextTree: 0, nextSign: 20, nextFar: 60, hi: 0,
        zones: [{ x: -1e9, b: first }], palFrom: first, palTo: first, palT: 1, level: 0,
      });
      try { s.hi = +localStorage.getItem('dino-hi') || 0; } catch (e) { /* private mode */ }
      s.pickLink = picker(s);
      for (let k = 0; k < 6; k++) s.clouds.push({ x: Math.random() * s.cols * 1.5, y: Math.random(), k: (Math.random() * 4) | 0 });
    },
    // the land at a ground position
    biomeAt(s, x) {
      let b = s.zones[0].b;
      for (const z of s.zones) if (z.x <= x) b = z.b;
      return b;
    },
    ground: (s) => Math.round(s.rows * (s.portrait ? 0.66 : 0.74)),
    dinoX: (s) => (s.portrait ? 1 : 8),
    live: (s) => [...s.trees, ...s.signs, ...s.pteros].map((o) => o.i).filter((i) => i >= 0),
    action(s) {
      if (!s.game || s.over) {
        Object.assign(s, { game: true, over: false, score: 0, level: 0, speed: BASE_SPEED, obstacles: [], nextObs: s.off + s.cols * 0.7 });
      }
      s.held = true;
      if (s.y <= 0.01) this.jump(s); else s.buffer = s.t;
      return true;
    },
    release(s) { s.held = false; },
    // A jump reaches about 11 rows and lasts 1.2 s with the key held, half
    // that with a tap; the window above a 6-row cactus is 0.8 s.
    jump(s) { s.vy = 32; s.y = 0.01; s.buffer = -1; },
    busy: (s) => s.game && !s.over,
    update(s, dt) {
      if (s.over) return;
      const dx = this.dinoX(s);
      s.off += s.speed * dt;
      if (s.game) {
        s.score += dt * s.speed * 0.8;
        // a little faster every 1000 points
        s.level = Math.floor(s.score / 1000);
        s.speed = BASE_SPEED * (1 + 0.1 * s.level);
      }
      if (s.y > 0 || s.vy > 0) {
        const g = s.vy > 0 && s.held ? 45 : 90;
        s.vy -= g * dt;
        s.y = Math.max(0, s.y + s.vy * dt);
        if (s.y === 0) { s.vy = 0; if (s.buffer > 0 && s.t - s.buffer < 0.15) this.jump(s); }
      }
      // lands ahead: a new one every 700-1100 columns
      while (s.zones[s.zones.length - 1].x < s.off + s.cols * 3) {
        const last = s.zones[s.zones.length - 1];
        const next = pick(Object.keys(BIOMES).filter((b) => b !== last.b));
        s.zones.push({ x: Math.max(last.x, s.off + s.cols) + rnd(700, 1100), b: next });
      }
      s.zones = s.zones.filter((z, k) => k === s.zones.length - 1 || s.zones[k + 1].x > s.off - s.cols);
      const here = this.biomeAt(s, s.off + dx + 10);
      if (here !== s.palTo) { s.palFrom = s.palTo; s.palTo = here; s.palT = 0; }
      s.palT = Math.min(1, s.palT + dt / 2.5);
      // obstacles and signs from one spawner, so they never overlap
      const ahead = s.off + s.cols + 15;
      while (Math.min(s.nextObs, s.nextSign) < ahead) {
        if (s.nextObs <= s.nextSign) {
          const k = pick(BIOMES[this.biomeAt(s, s.nextObs)].obstacles);
          s.obstacles.push({ x: s.nextObs, k, ...OBST[k] });
          s.nextObs += OBST[k].w + 20 + Math.random() * 38 + s.speed * 0.9;
          if (Math.abs(s.nextSign - s.nextObs) < 16) s.nextSign = s.nextObs + 16;
        } else {
          const i = s.pickLink(this.live(s));
          if (i >= 0) s.signs.push({ x: s.nextSign, i });
          s.nextSign += 60 + Math.random() * 50;
          if (Math.abs(s.nextObs - s.nextSign) < 16) s.nextObs = s.nextSign + 16;
        }
      }
      // trees on a slower layer, a third of them with a sign
      while (s.nextTree < s.off * 0.4 + s.cols + 20) {
        const b = this.biomeAt(s, s.off + (s.nextTree - s.off * 0.4));
        const k = pick(BIOMES[b].trees);
        s.trees.push({ x: s.nextTree, k, i: Math.random() < 0.35 ? s.pickLink(this.live(s)) : -1 });
        s.nextTree += widthOf(TREES[k]) + 4 + Math.random() * 22;
      }
      // now and then a landmark far away, keeping its link for itself
      while (s.nextFar < s.off * 0.15 + s.cols + 50) {
        if (Math.random() < 0.5) {
          const k = pick(['duomo', 'pearl']), lm = k === 'duomo' ? 'stf' : 'zh';
          if (s.special[lm] >= 0) s.far.push({ x: s.nextFar, k, i: s.special[lm] });
        }
        s.nextFar += rnd(220, 420);
      }
      s.far = s.far.filter((o) => o.x - s.off * 0.15 > -60);
      s.reserved = new Set(s.far.map((o) => o.i));
      for (const list of [s.trees, s.signs, s.pteros]) for (const o of list) if (s.reserved.has(o.i)) o.i = s.pickLink(this.live(s));
      const G = this.ground(s);
      if (Math.random() < dt * 0.07 && s.pteros.length < 2) {
        const banner = Math.random() < 0.6;
        s.pteros.push({ x: s.cols + 6, y: 3 + Math.random() * Math.max(1, G - 22), v: rnd(4, 8), i: banner ? s.pickLink(this.live(s)) : -1 });
      }
      s.obstacles = s.obstacles.filter((o) => o.x - s.off > -14);
      s.signs = s.signs.filter((o) => o.x - s.off > -20 && o.i >= 0);
      s.trees = s.trees.filter((o) => o.x - s.off * 0.4 > -30);
      for (const p of s.pteros) p.x -= p.v * dt;
      s.pteros = s.pteros.filter((p) => p.x > -30);
      // the demo jumps by itself, timed so the apex sits over the obstacle
      const front = dx + DINO_FEET[1];
      const next = s.obstacles.find((o) => o.x + o.w - s.off > dx + DINO_FEET[0]);
      if (next && !s.game && s.y === 0) {
        const d = next.x + next.w / 2 - s.off - (dx + (DINO_FEET[0] + DINO_FEET[1]) / 2);
        if (d > 0 && d < 0.71 * s.speed) { s.held = true; this.jump(s); }
      }
      if (!s.game && s.vy < 0) s.held = false;
      if (s.game) {
        for (const o of s.obstacles) {
          const ox = o.x - s.off;
          if (ox + 1 < front && ox + o.w - 1 > dx + DINO_FEET[0] && s.y < o.h - 0.4) {
            s.over = true;
            s.hi = Math.max(s.hi, Math.floor(s.score));
            try { localStorage.setItem('dino-hi', s.hi); } catch (e) { /* private mode */ }
          }
        }
      }
      const phase = s.game ? Math.floor(s.score / 700) : Math.floor(s.t / 45);
      s.night += ((phase % 2) - s.night) * Math.min(1, dt * 1.5);
    },
    palette(s) {
      const at = (b) => mixPalette(BIOMES[b].palettes.day, BIOMES[b].palettes.night, s.night);
      return s.palT >= 1 ? at(s.palTo) : mixPalette(at(s.palFrom), at(s.palTo), ease(s.palT));
    },
    draw(g, s) {
      const G = this.ground(s), dx = this.dinoX(s);
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, green: 5 };
      const pal = this.palette(s);
      g.gradient(0, G + 1, pal.skyTop, pal.skyLow);
      g.gradient(G + 1, g.rows, pal.soil, pal.soilDeep);
      if (s.night > 0.5) { stars(g, s, G - 12, C.dim); g.sprite(g.cols - 14, 3, MOON, C.accent, M.moon); }
      clouds(g, s, s.clouds, 0.15, C.dim, 3, Math.max(1, G - 26));
      // far silhouettes: each column shows the land it stands in
      for (let x = 0; x < g.cols; x++) {
        const b = BIOMES[this.biomeAt(s, s.off + x)];
        const far = FAR[b.far], w = x + s.off * 0.1, h = far(w), dh = far(w + 1) - h;
        if (h <= 0) continue;
        g.put(x, G - 1 - h - (dh > 0 ? 1 : 0), dh > 0 ? '/' : dh < 0 ? '\\' : '_', C.dim, b.far === 'peaks' ? M.snow : M.hill);
        if (b.far === 'volcano' && h >= 9 && far(w - 1) >= 9 && far(w + 2) < 9) {
          for (let k = 1; k < 8; k++) {
            const sx = x - 3 + Math.round(Math.sin(s.t * 0.8 + k) * k * 0.5);
            if (hash(k, Math.floor(s.t * 3)) < 0.75) g.put(sx, G - 11 - k, k < 3 ? '*' : 'o', k < 3 ? C.accent : C.dim, k < 3 ? M.fire : M.smoke);
          }
        }
      }
      for (const o of s.far) {
        const lines = o.k === 'duomo' ? DUOMO : PEARL, x = Math.round(o.x - s.off * 0.15), top = G - lines.length;
        g.sprite(x, top, lines, C.dim, M[o.k], true);
        labelC(g, s, x + (widthOf(lines) >> 1), top - 1, o.i, C.hl);
      }
      for (const t of s.trees) {
        const lines = TREES[t.k], x = Math.round(t.x - s.off * 0.4), top = G - lines.length;
        g.sprite(x, top, lines, t.i >= 0 ? C.fg : C.green, M.tree);
        if (t.i >= 0) labelC(g, s, x + (widthOf(lines) >> 1), top - 1, t.i, C.hl);
      }
      for (const p of s.pteros) {
        g.float(p.x, p.y, PTERO[Math.floor(s.t * 4) % 2], C.fg, M.ptero);
        if (p.i >= 0) {
          for (let k = 1; k <= 3; k++) g.put(Math.round(p.x) + 6 + k, Math.round(p.y) + 1, '~', C.dim, M.rope);
          label(g, s, Math.round(p.x) + 10, Math.round(p.y) + 1, p.i, C.hl);
        }
      }
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off);
        g.put(x, G, hash(w, 7) < 0.05 ? '-' : '_', C.fg, M.sand);
        for (let y = 1; y <= 5; y++) {
          const h = hash(w, y);
          if (h < 0.09 / y) g.put(x, G + y, h < 0.02 ? "'" : h < 0.045 ? '.' : ',', C.dim, M.sand);
        }
      }
      for (const o of s.signs) {
        const x = Math.round(o.x - s.off), n = len(s.labels[o.i]);
        g.put(x + (n >> 1), G - 1, '|', C.fg, M.wood);
        g.put(x + (n >> 1), G - 2, '|', C.fg, M.wood);
        label(g, s, x, G - 3, o.i, C.hl);
      }
      for (const o of s.obstacles) g.sprite(o.x - s.off, G - o.h + (o.flat ? 0 : 1), o.lines, o.mat === 'fire' ? C.accent : C.fg, M[o.mat]);
      // the dinosaur, drawn at its exact height
      const top = G - DINO.length - 1 - s.y;
      g.float(dx, top, DINO, C.fg, M.dino, true);
      g.float(dx, top + DINO.length, s.y > 0.2 ? DINO_AIR : DINO_LEGS[Math.floor(s.off / 1.6) % 2], C.fg, M.dino, true);
      title(g, s, C.fg);
      const pad = (v) => String(Math.floor(v)).padStart(5, '0');
      const sc = `HI ${pad(s.hi)}  ${pad(s.score)}`;
      if (s.game) g.text(g.cols - sc.length - 2, 1, sc, C.fg);
      else g.text(2, 3, s.touch ? s.str.tap : s.str.space, C.dim);
      if (s.over) {
        const msg = 'G A M E   O V E R';
        g.text(Math.round((g.cols - msg.length) / 2), Math.round(G * 0.4), msg, C.fg);
        const sub = s.touch ? s.str.tapAgain : s.str.spaceAgain;
        g.text(Math.round((g.cols - len(sub)) / 2), Math.round(G * 0.4) + 2, sub, C.dim);
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
  const CHEST = [' ____', '[_$__]'];
  const MINIPLANE = ['_|_', '=[_]>'];

  const sea = {
    slug: 'mare',
    palettes: {
      day: { bg: '#dbe9ef', fg: '#22323a', dim: '#8ba5b2', hl: '#152229', accent: '#c4553f', wave: '#2f7ea3', foam: '#6fb3cf', deep: '#123a52', under: '#5ea3c1', sun: '#e2a03a', lite: '#cfe6f0' },
      night: { bg: '#0b1523', fg: '#d6e2e9', dim: '#4e6475', hl: '#ffffff', accent: '#e06a4f', wave: '#3f84ad', foam: '#7cb6d2', deep: '#050d16', under: '#2d6c8c', sun: '#ece5c6', lite: '#cfe6f0' },
      storm: { bg: '#9aa7ae', fg: '#1d262b', dim: '#5d6b73', hl: '#10171b', accent: '#c4553f', wave: '#2c5f78', foam: '#d6e3e8', deep: '#0e2635', under: '#3e7891', sun: '#9aa7ae', lite: '#d6e3e8' },
    },
    init(s) {
      s.time = pick(['day', 'day', 'night', 'storm']);
      Object.assign(s, {
        off: 0, speed: 6, buoys: [], nextBuoy: 25, flash: 0, nextFlash: 4,
        clouds: [], gulls: [], fish: [], bubbles: [], carriers: [], chests: [], nextChest: 30,
      });
      s.pickLink = picker(s);
      for (let k = 0; k < 5; k++) s.clouds.push({ x: Math.random() * s.cols * 1.5, y: Math.random(), k: (Math.random() * 3) | 0 });
      for (let k = 0; k < 3; k++) s.gulls.push({ x: Math.random() * s.cols, y: 3 + Math.random() * 6, p: Math.random() * 9 });
      const S = this.surface(s);
      for (let k = 0; k < 4; k++) {
        const v = (Math.random() < 0.5 ? 1 : -1) * rnd(2, 6);
        s.fish.push({ x: Math.random() * s.cols, y: S + 4 + Math.random() * (s.rows - S - 7), v, k: (v > 0 ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0) });
      }
      // a gull with a sign is already on its way
      s.carriers.push({ kind: 'gull', x: s.cols * 0.55, y: 5, v: rnd(4, 7), i: s.pickLink([]) });
    },
    action() { return false; },
    surface: (s) => Math.round(s.rows * (s.portrait ? 0.34 : 0.5)),
    swell: (s, x, t) => Math.sin(x * 0.18 + t * 1.6) + 0.5 * Math.sin(x * 0.07 - t * 0.9) * (s.time === 'storm' ? 2 : 1),
    live: (s) => [...s.buoys, ...s.carriers, ...s.chests].map((o) => o.i),
    update(s, dt) {
      s.off += s.speed * dt;
      const S = this.surface(s);
      while (s.nextBuoy < s.off + s.cols + 10) { s.buoys.push({ x: s.nextBuoy, i: s.pickLink(this.live(s)) }); s.nextBuoy += 45 + Math.random() * 35; }
      while (s.nextChest < s.off * 0.6 + s.cols + 10) { s.chests.push({ x: s.nextChest, i: s.pickLink(this.live(s)) }); s.nextChest += 70 + Math.random() * 60; }
      s.buoys = s.buoys.filter((b) => b.x - s.off > -20);
      s.chests = s.chests.filter((b) => b.x - s.off * 0.6 > -20);
      // carriers that travel on their own: a gull with a sign, a small plane
      // towing a banner, a fish trailing a label
      const kinds = s.carriers.map((c) => c.kind);
      if (Math.random() < dt * 0.25 && !kinds.includes('gull')) {
        s.carriers.push({ kind: 'gull', x: -12, y: 4 + Math.random() * Math.max(1, S - 14), v: rnd(4, 7), i: s.pickLink(this.live(s)) });
      }
      if (Math.random() < dt * 0.12 && !kinds.includes('plane') && s.time !== 'storm') {
        s.carriers.push({ kind: 'plane', x: s.cols + 4, y: 2 + Math.random() * 3, v: -rnd(9, 13), i: s.pickLink(this.live(s)) });
      }
      if (Math.random() < dt * 0.3 && kinds.filter((k) => k === 'fish').length < 2) {
        const right = Math.random() < 0.5;
        s.carriers.push({ kind: 'fish', x: right ? -20 : s.cols + 20, y: S + 5 + Math.random() * Math.max(1, s.rows - S - 9), v: (right ? 1 : -1) * rnd(3, 5), i: s.pickLink(this.live(s)) });
      }
      s.carriers = s.carriers.filter((c) => c.i >= 0);
      for (const c of s.carriers) {
        c.x += (c.v - (c.kind === 'fish' ? s.speed * 0.3 : 0)) * dt;
        if (c.kind === 'gull') c.y += Math.sin(s.t * 1.3 + c.v) * dt * 0.8;
      }
      s.carriers = s.carriers.filter((c) => c.x > -35 && c.x < s.cols + 35);
      if (Math.random() < dt * 0.8 && s.fish.length < 4 + Math.floor((s.cols * (s.rows - S)) / 500)) {
        const left = Math.random() < 0.5;
        s.fish.push({ x: left ? -6 : s.cols + 6, y: S + 4 + Math.random() * (s.rows - S - 7), v: (left ? 1 : -1) * rnd(2, 6), k: (left ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0) });
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
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, wave: 5, foam: 6, deep: 7, under: 8, sun: 9, lite: 10 };
      g.band(S + 2, g.rows, C.deep);
      if (s.time === 'night') { stars(g, s, S - 2, C.dim); g.sprite(g.cols - 16, 2, MOON, C.sun, M.moon); }
      else if (s.time === 'day') g.sprite(g.cols - 18, 1, SUN, C.sun, M.sun);
      clouds(g, s, s.clouds, 0.3, s.time === 'storm' ? C.fg : C.dim, 2, Math.max(1, S * 0.35));
      if (s.time === 'storm') {
        for (let x = 0; x < g.cols; x++) for (let y = 4; y < S; y++) {
          if (hash(x + Math.floor(s.t * 14) * 3, y - Math.floor(s.t * 14)) < 0.035) g.put(x, y, '/', C.dim, M.rain);
        }
      }
      for (const q of s.gulls) g.float(q.x, q.y + Math.sin(s.t + q.p), [Math.sin(s.t * 5 + q.p) > 0 ? '~v~' : '-v-'], C.fg, M.gull);
      for (let x = 0; x < g.cols; x++) {
        const w = x + s.off, v = this.swell(s, w, s.t);
        if (v > 1.05) g.put(x, S - 1, '^', C.foam, M.foam);
        g.put(x, S, v > 0.3 ? '~' : '-', C.wave, M.wave);
        const h1 = hash(Math.floor(w), 5);
        if (h1 < 0.55) g.put(x, S + 1, h1 < 0.25 ? '~' : '-', C.foam, M.wave);
      }
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off * 0.6);
        if (hash(w, 11) < 0.06) {
          const tall = 1 + Math.floor(hash(w, 12) * 4);
          for (let k = 0; k < tall; k++) g.put(x + (Math.sin(s.t * 1.5 + k + w) > 0 ? 0 : 1), g.rows - 2 - k, k % 2 ? ')' : '(', C.under, M.weed);
        }
        if (hash(w, 13) < 0.3) g.put(x, g.rows - 1, '.', C.under, M.sand);
      }
      for (const b of s.bubbles) g.put(b.x, b.y, 'o', C.under, M.bubble);
      for (const f of s.fish) g.float(f.x, f.y, [FISH[f.k]], C.foam, M.fish);
      const tags = [];
      for (const c of s.chests) {
        const x = Math.round(c.x - s.off * 0.6);
        g.sprite(x, g.rows - 3, CHEST, C.sun, M.chest);
        g.put(x + 3, g.rows - 4, '|', C.under);
        tags.push([x + 3, g.rows - 5, c.i, C.lite, true]);
      }
      for (const b of s.buoys) {
        const x = Math.round(b.x - s.off), bob = this.swell(s, b.x, s.t) > 0.6 ? -1 : 0;
        g.sprite(x - 3, S - 2 + bob, BUOY, C.accent, M.buoy, true);
        g.put(x, S - 3 + bob, '|', C.fg);
        tags.push([x, S - 4 + bob, b.i, C.hl, true]);
      }
      const bx = Math.round(g.cols * (s.portrait ? 0.2 : 0.3));
      const bob = this.swell(s, bx + s.off + 7, s.t) > 0.5 ? -1 : 0;
      g.sprite(bx, S - BOAT.length + 2 + bob, BOAT.slice(0, 4), C.fg, M.sail, true);
      g.sprite(bx, S - BOAT.length + 6 + bob, BOAT.slice(4), C.fg, M.boat, true);
      if (s.time === 'night') [0, 1, 2].forEach((k) => g.put(bx + 4 + k * 3, S + bob, 'o', C.sun, M.light));
      for (const c of s.carriers) {
        const x = Math.round(c.x), y = Math.round(c.y), n = len(s.labels[c.i] ?? '');
        if (c.kind === 'gull') {
          g.float(c.x, c.y, [Math.sin(s.t * 5) > 0 ? '~v~' : '-v-'], C.fg, M.gull);
          g.put(x + 1, y + 1, '|', C.dim, M.rope);
          tags.push([x + 1, y + 2, c.i, C.hl, true]);
        } else if (c.kind === 'plane') {
          g.sprite(x, y, MINIPLANE, C.fg, M.plane);
          for (let k = 1; k <= 3; k++) g.put(x + 5 + k, y + 1, '~', C.dim, M.rope);
          tags.push([x + 9, y + 1, c.i, C.hl, false]);
        } else {
          const right = c.v > 0;
          g.float(c.x, c.y, [right ? '><(((°>' : '<°)))><'], C.foam, M.fish);
          if (right) { g.text(x - 2, y, '~~', C.under, M.rope); tags.push([x - 3 - n, y, c.i, C.lite, false]); }
          else { g.text(x + 7, y, '~~', C.under, M.rope); tags.push([x + 9, y, c.i, C.lite, false]); }
        }
      }
      // labels last: a carrier passing behind the boat keeps its link readable
      for (const [x, y, i, fg, centred] of tags) (centred ? labelC : label)(g, s, x, y, i, fg);
      title(g, s, C.fg);
    },
  };

  // ---------- the countryside (plane and train share it) ----------

  const GROUND = {
    house: { lines: art(String.raw`
    __
   /  \__
  /      \
 /________\
 | []  [] |
 |   __   |
 |__|  |__|`), mat: 'house' },
    tower: { lines: art(String.raw`
   ___
  /___\
  |[]|
  |  |
  |__|`), mat: 'house' },
    church: { lines: art(String.raw`
     +
    /_\
    | |
   _|_|_
  /     \
 /_______\
 |  ___  |
 | |   | |
 |_|___|_|`), mat: 'house' },
    castle: { lines: art(String.raw`
  |>
  |
 []_[]_[]
 |      |
 |  __  |
 |_|  |_|`), mat: 'castle' },
    factory: { lines: art(String.raw`
       []
       ||
 /|/|/|||
 |  [] ||
 |_____||`), mat: 'house', smoke: [7, -1] },
    mill: { lines: art(String.raw`
   /|\
  / | \
 /__|__\ `), mat: 'mill', blades: true },
    treeR: { lines: art(String.raw`
  .oOo.
 (oOoOo)
  'oOo'
    |`), mat: 'tree', green: true },
    pine: { lines: art(String.raw`
   ^
  /*\
 /***\
   |`), mat: 'tree', green: true },
    cypress: { lines: art(String.raw`
  ()
 (  )
 (  )
 (  )
  ||`), mat: 'tree', green: true },
    oak: { lines: art(String.raw`
     .-~~~-.
  .-(  oOo  )-.
 (  oOo  oOo  )
  '-(  oOo  )-'
     '-._.-'
       | |
       | |`), mat: 'tree', green: true },
    cypressL: { lines: art(String.raw`
   /\
  (  )
 (    )
 (    )
 (    )
  (  )
  (  )
   ||
   ||`), mat: 'tree', green: true },
    pineL: { lines: art(String.raw`
     ^
    /*\
   /***\
    /*\
   /***\
  /*****\
 /*******\
    |||`), mat: 'tree', green: true },
    duomo: { lines: DUOMO, mat: 'duomo', landmark: 'stf' },
    pearl: { lines: PEARL, mat: 'pearl', landmark: 'zh' },
  };
  for (const o of Object.values(GROUND)) o.w = widthOf(o.lines);
  const BLADES = [
    [' \\   /', '  \\ /', '   o', '  / \\', ' /   \\'],
    ['   |', '   |', '---o---', '   |', '   |'],
  ];
  const GENERIC = ['house', 'house', 'tower', 'church', 'castle', 'factory', 'mill', 'treeR', 'oak', 'oak', 'pineL', 'cypress', 'cypressL', 'cypressL'];

  // Spawns an object of a ground layer: landmarks now and then, one of each at most.
  // A carrier gets i = -2 until settleLinks picks its link.
  function spawnGround(s, list, at, opts) {
    let k = pick(GENERIC);
    if (Math.random() < opts.landmarkChance) {
      const want = pick(['duomo', 'pearl']);
      if (!list.some((o) => o.k === want) && s.special[GROUND[want].landmark] >= 0) k = want;
    }
    const o = GROUND[k];
    const carrier = o.landmark ? s.special[o.landmark] : !o.green && Math.random() < opts.carrierChance ? -2 : -1;
    list.push({ x: at, k, i: carrier });
    return at + o.w + rnd(opts.gap[0], opts.gap[1]);
  }

  // Landmarks coming on stage reserve their link; generic carriers take theirs
  // from the picker as they enter the screen, and give up one a landmark
  // now reserves. lists: [[objects, parallax speed], ...]
  function settleLinks(s, lists, live) {
    s.reserved = new Set();
    for (const [list] of lists) for (const o of list) {
      const lm = GROUND[o.k]?.landmark;
      if (lm && s.special[lm] >= 0) s.reserved.add(s.special[lm]);
    }
    for (const [list, speed] of lists) for (const o of list) {
      if (GROUND[o.k]?.landmark) continue;
      const entering = o.x - s.off * speed < s.cols + 2;
      if ((o.i === -2 && entering) || (o.i >= 0 && s.reserved.has(o.i))) o.i = s.pickLink(live());
    }
  }

  function drawGround(g, s, list, speed, base, C, night) {
    for (const o of list) {
      const def = GROUND[o.k], x = Math.round(o.x - s.off * speed), top = base - def.lines.length + 1;
      if (x > g.cols + 2 || x + def.w < -2) continue;
      g.sprite(x, top, def.lines, def.green ? C.green : C.fg, M[def.mat], !def.green);
      if (def.blades) g.sprite(x, top - 5, BLADES[Math.floor(s.t * 2 + o.x) % 2], C.fg, M.mill);
      if (def.smoke) for (let k = 1; k < 5; k++) g.put(x + def.smoke[0] + Math.round(Math.sin(s.t + k) * k * 0.4), top + def.smoke[1] - k, 'o', C.dim, M.smoke);
      if (night && !def.green) {
        def.lines.forEach((line, r) => [...line].forEach((ch, k) => { if (ch === '[' && hash(o.x | 0, r * 31 + k) < 0.7) g.put(x + k + 1, top + r, '#', C.gold, M.light); }));
      }
      if (o.i >= 0) labelC(g, s, x + (def.w >> 1), top - (def.blades ? 6 : 1), o.i, C.hl);
    }
  }

  // ---------- scenario: the plane ----------

  const PLANE = [
    '   __',
    '   \\ \\_____________',
    '   [==  o o o o o   \\___',
    '   /_/_____________ ___/',
    '        \\_\\',
  ];
  const BALLOON = ['  .-~~-.', ' /      \\', '|        |', ' \\      /', "  '.__.'", '   \\  /', '    []'];
  const KITE = ['  /\\', ' /  \\', ' \\  /', '  \\/', '   }', '   {'];

  const plane = {
    slug: 'aereo',
    palettes: {
      day: { bg: '#d9e8f2', fg: '#2a3340', dim: '#93a9b9', hl: '#18202a', accent: '#c4553f', gold: '#d99a2b', cloud: '#7f97a8', green: '#4f7f46', field: '#a39a45', soil: '#cbd9c2' },
      dusk: { bg: '#f2d4bd', fg: '#3a2b34', dim: '#c39a8e', hl: '#24171e', accent: '#b5443a', gold: '#d98a2f', cloud: '#cc9f92', green: '#5e5a4a', field: '#a8755a', soil: '#e6c3ab' },
      night: { bg: '#0c1120', fg: '#d6dde6', dim: '#46536b', hl: '#ffffff', accent: '#d86a50', gold: '#e8c36a', cloud: '#4f5d76', green: '#2f4a3a', field: '#4a4f34', soil: '#141c2a' },
    },
    init(s) {
      s.time = pick(['day', 'day', 'dusk', 'night']);
      Object.assign(s, { off: 0, speed: 10, clouds: [], balloons: [], kites: [], ground: [], near: [], nextG: -10, nextN: 0, nextBalloon: 25, banner: -1, bannerAt: -99 });
      s.pickLink = picker(s);
      for (let k = 0; k < 12; k++) s.clouds.push({ x: Math.random() * 200, y: Math.random(), k: (Math.random() * 4) | 0, z: k % 3 });
    },
    action() { return false; },
    horizon: (s) => Math.round(s.rows * (s.portrait ? 0.5 : 0.56)),
    live: (s) => [s.banner, ...s.balloons.map((b) => b.i), ...s.kites.map((b) => b.i), ...s.ground.map((o) => o.i)].filter((i) => i >= 0),
    update(s, dt) {
      s.off += s.speed * dt;
      while (s.nextG < s.off * 0.45 + s.cols + 40) s.nextG = spawnGround(s, s.ground, s.nextG, { landmarkChance: 0.14, carrierChance: 0.35, gap: [4, 16] });
      while (s.nextN < s.off * 0.9 + s.cols + 20) { s.near.push({ x: s.nextN, k: pick(['oak', 'pineL', 'cypressL', 'treeR']) }); s.nextN += rnd(14, 40); }
      s.ground = s.ground.filter((o) => o.x - s.off * 0.45 > -40);
      s.near = s.near.filter((o) => o.x - s.off * 0.9 > -12);
      settleLinks(s, [[s.ground, 0.45]], () => this.live(s));
      if (s.t - s.bannerAt > 7 || s.reserved.has(s.banner)) { s.bannerAt = s.t; s.banner = -1; s.banner = s.pickLink(this.live(s)); }
      while (s.nextBalloon < s.off * 0.4 + s.cols + 10) {
        s.balloons.push({ at: s.nextBalloon, across: Math.random(), i: -2 });
        s.nextBalloon += rnd(40, 70);
      }
      s.balloons = s.balloons.filter((b) => b.at - s.off * 0.4 > -20);
      for (const b of s.balloons) {
        const entering = b.at - s.off * 0.4 < s.cols + 2;
        if ((b.i === -2 && entering) || s.reserved.has(b.i)) b.i = s.pickLink(this.live(s));
      }
      if (Math.random() < dt * 0.08 && !s.kites.length) {
        const i = s.pickLink(this.live(s));
        if (i >= 0) s.kites.push({ x: s.off * 0.45 + s.cols + 2, i });
      }
      s.kites = s.kites.filter((k) => k.x - s.off * 0.45 > -20);
      for (const k of s.kites) if (s.reserved.has(k.i)) k.i = s.pickLink(this.live(s));
    },
    palette(s) { return this.palettes[s.time]; },
    draw(g, s) {
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, gold: 5, cloud: 6, green: 7, field: 8, soil: 9 };
      const H = this.horizon(s), Gm = H + Math.round((g.rows - H) * 0.45);
      g.band(H + 1, g.rows, C.soil);
      if (s.time === 'night') stars(g, s, H - 2, C.dim);
      else g.sprite(g.cols - 16, 2, s.time === 'dusk' ? DUSK_SUN : SUN, C.gold, M.sun);
      const layer = (z) => s.clouds.filter((c) => c.z === z).forEach((c) => {
        const k = [0.25, 0.6, 1.6][z], span = g.cols + 30;
        g.sprite(wrap(c.x * 3 - s.off * k, span) - 15, 2 + c.y * Math.max(1, H - 14), CLOUDS[c.k], z === 2 ? C.fg : C.cloud, M.cloud, z === 2);
      });
      layer(0); layer(1);
      const hAt = (u) => Math.round(1.5 + 1.5 * Math.sin(u * 0.04) + Math.sin(u * 0.11));
      for (let x = 0; x < g.cols; x++) {
        const w = x + s.off * 0.15, h = hAt(w), dh = hAt(w + 1) - h;
        g.put(x, H - h - (dh > 0 ? 1 : 0), dh > 0 ? '/' : dh < 0 ? '\\' : '_', C.dim, M.hill);
      }
      // fields: the deeper the row, the faster it slides
      for (let y = H + 1; y < g.rows; y++) {
        const depth = (y - H) / (g.rows - H), sp = 0.15 + depth * 0.85;
        for (let x = 0; x < g.cols; x++) {
          const w = Math.floor(x + s.off * sp), patch = hash(Math.floor(w / 12), Math.floor(y / 3));
          if (hash(w, y) < 0.16 + depth * 0.1) g.put(x, y, patch < 0.4 ? ',' : patch < 0.75 ? '.' : "'", patch < 0.5 ? C.green : C.field, M.field);
        }
      }
      const road = g.rows - 2;
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off * 0.9);
        g.put(x, road, '=', C.dim, M.fence);
        g.put(x, road - 1, w % 4 === 0 ? '|' : '-', w % 4 === 0 ? C.fg : C.dim, M.fence);
      }
      drawGround(g, s, s.ground, 0.45, Gm, C, s.time === 'night');
      for (const o of s.near) {
        const def = GROUND[o.k];
        g.sprite(Math.round(o.x - s.off * 0.9), road - def.lines.length - 1, def.lines, C.green, M.tree);
      }
      for (const k of s.kites) {
        const x = Math.round(k.x - s.off * 0.45), y = Math.round(Gm - 16 + Math.sin(s.t) * 1.5);
        g.sprite(x, y, KITE, C.accent, M.balloon);
        for (let r = 1; r < Gm - y - 6; r++) g.put(x + 3 + Math.round(r * 0.3), y + 6 + r, ':', C.dim, M.rope);
        labelC(g, s, x + 2, y - 1, k.i, C.hl);
      }
      for (const b of s.balloons) {
        const x = Math.round(b.at - s.off * 0.4), band = Math.round(H * 0.42);
        const y = b.across < 0.5 ? Math.round(2 + b.across * 2 * Math.max(0, band - 12)) : Math.round(band + 6 + (b.across - 0.5) * 2 * Math.max(0, H - band - 17));
        g.sprite(x, y, BALLOON, C.accent, M.balloon, true);
        labelC(g, s, x + 4, y + BALLOON.length, b.i, C.hl);
      }
      // the plane and its banner
      const px = Math.round(g.cols * (s.portrait ? 0.42 : 0.58));
      const py = Math.round(H * 0.42) + Math.sin(s.t * 0.9) * 0.6, ry = Math.round(py) + 2;
      if (s.banner >= 0) {
        const n = len(s.labels[s.banner]), rope = 6, bx = px + 2 - rope - n - 2;
        for (let k = 0; k < rope; k++) g.put(px + 2 - rope + k, ry, (k + Math.floor(s.t * 6)) % 2 ? '~' : '-', C.dim, M.rope);
        g.put(bx, ry, '|', C.fg);
        label(g, s, bx + 1, ry, s.banner, C.hl);
        g.put(bx + n + 1, ry, '|', C.fg);
      }
      g.float(px, py, PLANE, C.fg, M.plane, true);
      if (Math.floor(s.t * 2) % 2) g.put(px + 23, ry, '*', C.accent, M.light);
      layer(2);
      title(g, s, C.fg);
    },
  };

  // ---------- scenario: the train ----------

  const LOCO = art(String.raw`
       ____
  ____|[] |______
 |  ____________ \__
 | |  ||  ||  | |   \
 |_|__||__||__|_|___/
   (O)(O)    (O)(O)`);
  const WAGON = art(String.raw`
 ______________________
| []  []  []  []  []  |
|_____________________|
  (O)(O)        (O)(O)`);
  const STATION = art(String.raw`
 _____________________
/_____________________\
  |                 |
  |                 |
__|_________________|__`);
  const TUNNEL_IN = ['  ___', ' /', '/', '|', '|', '|', '|'];
  const TUNNEL_OUT = ['___', '   \\', '    \\', '    |', '    |', '    |', '    |'];

  const train = {
    slug: 'treno',
    palettes: {
      day: { bg: '#e6edf0', fg: '#2c333b', dim: '#9aa8b3', hl: '#171c22', accent: '#b8463a', gold: '#d89a2c', cloud: '#8a9fae', green: '#4f7a48', field: '#a5a052', soil: '#d3dccb', rock: '#6f6a64' },
      dusk: { bg: '#f0d2c0', fg: '#3b2b31', dim: '#c79e94', hl: '#23161c', accent: '#a83f37', gold: '#d98a2f', cloud: '#cfa296', green: '#5f5b4a', field: '#a8765a', soil: '#e7c6b2', rock: '#6a5458' },
      night: { bg: '#0d1220', fg: '#d5dce5', dim: '#45526a', hl: '#ffffff', accent: '#d8664d', gold: '#ffd27a', cloud: '#4c5a72', green: '#2c4636', field: '#454a33', soil: '#121a26', rock: '#3a3f4c' },
    },
    init(s) {
      s.time = pick(['day', 'day', 'dusk', 'night']);
      Object.assign(s, {
        off: 0, speed: 18, clouds: [], skyline: [], mid: [], poles: [], stations: [], tunnels: [], bridges: [],
        nextSky: -20, nextMid: 0, nextPole: 5, nextStation: 120, nextTunnel: 220, nextBridge: 90, wagons: [],
      });
      s.pickLink = picker(s);
      for (let k = 0; k < 8; k++) s.clouds.push({ x: Math.random() * 200, y: Math.random(), k: (Math.random() * 4) | 0 });
    },
    action() { return false; },
    rails: (s) => Math.round(s.rows * (s.portrait ? 0.62 : 0.7)),
    live: (s) => [...s.skyline, ...s.stations, ...s.wagons].map((o) => o.i).filter((i) => i >= 0),
    update(s, dt) {
      s.off += s.speed * dt;
      // the far layer: landmarks and towns
      while (s.nextSky < s.off * 0.12 + s.cols + 40) s.nextSky = spawnGround(s, s.skyline, s.nextSky, { landmarkChance: 0.3, carrierChance: 0.25, gap: [6, 22] });
      s.skyline = s.skyline.filter((o) => o.x - s.off * 0.12 > -40);
      while (s.nextMid < s.off * 0.35 + s.cols + 20) { s.mid.push({ x: s.nextMid, k: pick(['oak', 'cypressL', 'pineL', 'house', 'treeR', 'cypress']) }); s.nextMid += rnd(6, 20); }
      s.mid = s.mid.filter((o) => o.x - s.off * 0.35 > -20);
      while (s.nextPole < s.off * 1.3 + s.cols + 10) { s.poles.push({ x: s.nextPole }); s.nextPole += 34; }
      s.poles = s.poles.filter((p) => p.x - s.off * 1.3 > -5);
      const ahead = s.off + s.cols + 40;
      while (s.nextStation < ahead) { s.stations.push({ x: s.nextStation, i: -2 }); s.nextStation += rnd(260, 420); }
      while (s.nextTunnel < ahead) {
        if (!s.stations.some((st) => Math.abs(st.x - s.nextTunnel) < 80)) s.tunnels.push({ x: s.nextTunnel, w: rnd(40, 70) });
        s.nextTunnel += rnd(280, 460);
      }
      while (s.nextBridge < ahead) {
        const free = !s.tunnels.some((t) => Math.abs(t.x - s.nextBridge) < 100) && !s.stations.some((t) => Math.abs(t.x - s.nextBridge) < 60);
        if (free) s.bridges.push({ x: s.nextBridge, w: rnd(30, 50) });
        s.nextBridge += rnd(200, 320);
      }
      for (const k of ['stations', 'tunnels', 'bridges']) s[k] = s[k].filter((o) => o.x + (o.w || 30) - s.off > -10);
      settleLinks(s, [[s.skyline, 0.12], [s.stations, 1]], () => this.live(s));
      // two of the wagons carry a board
      if (!s.wagons.length) s.wagons = [{ i: -1 }, { i: -2 }, { i: -1 }, { i: -2 }];
      for (const w of s.wagons) if (w.i === -2 || (w.i >= 0 && s.reserved.has(w.i))) w.i = s.pickLink(this.live(s));
    },
    palette(s) { return this.palettes[s.time]; },
    draw(g, s) {
      const C = { fg: 1, dim: 2, hl: 3, accent: 4, gold: 5, cloud: 6, green: 7, field: 8, soil: 9, rock: 10 };
      const R = this.rails(s), night = s.time === 'night', skyBase = R - 13;
      g.band(R + 1, g.rows, C.soil);
      if (night) stars(g, s, skyBase - 6, C.dim);
      else g.sprite(g.cols - 16, 2, s.time === 'dusk' ? DUSK_SUN : SUN, C.gold, M.sun);
      clouds(g, s, s.clouds, 0.08, C.cloud, 2, Math.max(1, skyBase - 24));
      // far skyline on its own horizon
      for (let x = 0; x < g.cols; x++) g.put(x, skyBase + 1, '_', C.dim, M.hill);
      drawGround(g, s, s.skyline, 0.12, skyBase, { ...C, fg: C.dim, green: C.dim }, night);
      // middle layer: hills with trees and houses
      for (let x = 0; x < g.cols; x++) {
        const w = x + s.off * 0.35;
        const h = Math.round(1 + Math.sin(w * 0.05) + 0.6 * Math.sin(w * 0.13));
        for (let y = skyBase + 2; y < R - 6; y++) if (hash(Math.floor(w), y) < 0.12) g.put(x, y, ',', C.field, M.field);
        g.put(x, R - 6 - h, h > 1 ? '^' : '_', C.green, M.hill);
      }
      for (const o of s.mid) {
        const def = GROUND[o.k];
        g.sprite(Math.round(o.x - s.off * 0.35), R - 6 - def.lines.length, def.lines, def.green ? C.green : C.fg, M[def.mat], !def.green);
      }
      for (const p of s.poles) {
        const x = Math.round(p.x - s.off * 1.3);
        for (let y = R - 11; y < R + 2; y++) g.put(x, y, '|', C.fg, M.wood);
        g.text(x - 1, R - 11, '-+-', C.fg, M.wood);
      }
      for (let x = 0; x < g.cols; x++) {
        const u = wrap(x + s.off * 1.3, 34) / 34;
        g.put(x, R - 11 + Math.round(Math.sin(u * Math.PI) * 1.2), '-', C.dim, M.rope);
      }
      // rails, sleepers, bridges over a river
      for (let x = 0; x < g.cols; x++) {
        const w = Math.floor(x + s.off);
        const onBridge = s.bridges.some((b) => w >= b.x && w < b.x + b.w);
        g.put(x, R, '=', C.fg, M.rail);
        g.put(x, R + 1, w % 3 ? '_' : '|', C.dim, M.rail);
        if (onBridge) {
          g.put(x, R + 2, (w % 6) < 3 ? '\\' : '/', C.fg, M.bridge);
          for (let y = R + 4; y < g.rows; y++) g.put(x, y, (x + y + Math.floor(s.t * 3)) % 3 ? '~' : '-', C.cloud, M.river);
        } else {
          for (let y = R + 2; y < g.rows; y++) if (hash(w, y) < 0.18) g.put(x, y, hash(w, y + 3) < 0.5 ? '.' : ',', C.green, M.field);
        }
      }
      for (const b of s.bridges) {
        const x = Math.round(b.x - s.off);
        for (const e of [x, x + Math.round(b.w)]) for (let y = R + 1; y < g.rows; y++) g.put(e, y, '#', C.fg, M.bridge);
      }
      for (const st of s.stations) {
        const x = Math.round(st.x - s.off);
        g.sprite(x, R - STATION.length, STATION, C.fg, M.station);
        labelC(g, s, x + 11, R - STATION.length + 2, st.i, C.hl);
      }
      // the train
      const lx = s.portrait ? g.cols - widthOf(LOCO) - 1 : Math.round(g.cols * 0.68), top = R - LOCO.length;
      g.sprite(lx, top, LOCO, C.accent, M.train, true);
      const inTunnel = s.tunnels.some((t) => lx + 18 > t.x - s.off && lx < t.x + t.w - s.off);
      if (!inTunnel) for (let k = 1; k < 5; k++) g.put(lx + 7 - k * 2, top - k, k % 2 ? 'o' : 'O', C.dim, M.smoke);
      let wx = lx;
      s.wagons.forEach((w, k) => {
        wx -= widthOf(WAGON) + 1;
        g.sprite(wx, top + 2, WAGON, k % 2 ? C.fg : C.accent, M.train, true);
        g.put(wx + widthOf(WAGON), top + 3, '=', C.fg, M.train);
        if (night) [2, 6, 10, 14, 18].forEach((c) => g.text(wx + c, top + 3, '[]', C.gold, M.light));
        if (w.i >= 0) labelC(g, s, wx + 11, top + 3, w.i, C.hl);
      });
      // tunnels swallow the train: a rock mass drawn over it
      for (const t of s.tunnels) {
        const x0 = Math.round(t.x - s.off), x1 = Math.round(t.x + t.w - s.off);
        for (let x = Math.max(0, x0); x < Math.min(g.cols, x1); x++) {
          const h = 9 + Math.round(3 * Math.sin((x + s.off) * 0.08));
          for (let y = R - h; y <= R + 1; y++) g.put(x, y, hash(Math.floor(x + s.off), y) < 0.3 ? '.' : ' ', C.rock, M.rock);
          g.put(x, R - h - 1, '^', C.rock, M.rock);
        }
        g.sprite(x0 - 1, R - 6, TUNNEL_IN, C.rock, M.rock);
        g.sprite(x1 - 4, R - 6, TUNNEL_OUT, C.rock, M.rock);
      }
      title(g, s, C.fg);
    },
  };

  const SCENARIOS = [dino, sea, plane, train];

  // ---------- the scene player ----------

  return class Scenes {
    constructor(canvas, labels, titleText, special = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.grid = new Grid();
      this.labels = labels;
      this.titleText = titleText;
      this.special = { stf: special.stf ?? -1, zh: special.zh ?? -1 };
      this.str = { space: 'press space to play', tap: 'tap to play', spaceAgain: 'space to start again', tapAgain: 'tap to start again' };
      this.hanzi = false;
      this.index = -1;
      this.s = null;
    }

    static indexOf(slug) { const i = SCENARIOS.findIndex((x) => x.slug === slug); return i < 0 ? null : i; }
    get scenario() { return SCENARIOS[this.index]; }
    get slug() { return this.scenario?.slug || ''; }

    // Labels and strings for the current language.
    setText(labels, titleText, str) {
      this.labels = labels;
      this.titleText = titleText;
      Object.assign(this.str, str);
      if (this.s) Object.assign(this.s, { labels, title: titleText, str: this.str });
    }

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
        labels: this.labels, title: this.titleText, str: this.str, spots: [], hover: -1, hlBg: 3,
        special: this.special, reserved: new Set(),
        touch: matchMedia('(pointer: coarse)').matches,
      };
      this.scenario.init(this.s);
      return this.scenario;
    }

    // Space or a tap: the dinosaur jumps; elsewhere it means "next scene".
    action() { return this.scenario.action(this.s); }
    release() { this.scenario.release?.(this.s); }
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
      for (const [r0, r1, k] of g.bands) { c.fillStyle = typeof k === 'string' ? k : colours[k]; c.fillRect(0, r0 * cellH, this.w, (r1 - r0) * cellH + 1); }
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
      for (const f of g.floats) {
        if (this.hanzi && f.mat) continue;
        c.fillStyle = colours[f.fg];
        f.lines.forEach((line, r) => this.textAt(line, f.x, f.y + r));
      }
      if (this.hanzi) this.renderHanzi(colours);
    }

    textAt(str, x, y) {
      const { ctx: c, cellW, cellH } = this;
      if (this.spacing !== null) { c.fillText(str, x * cellW, (y + 0.55) * cellH); return; }
      [...str].forEach((ch, k) => { if (ch !== ' ') c.fillText(ch, (x + k) * cellW, (y + 0.55) * cellH); });
    }

    // 你好: scenery cells are written with hanzi of matching shape, one every
    // two cells along a run, so that shapes keep their width.
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
          c.fillText(shape(g.ch[i]), (x + 1) * cellW, (y + 0.55) * cellH);
        }
      }
      for (const f of g.floats) {
        if (!f.mat) continue;
        c.fillStyle = colours[f.fg];
        f.lines.forEach((line, r) => {
          let start = -1;
          [...line].forEach((ch, k) => {
            if (ch === ' ') { start = -1; return; }
            if (start < 0) start = k;
            if ((k - start) % 2) return;
            c.fillText(shape(ch.codePointAt(0)), (f.x + k + 1) * cellW, (f.y + r + 0.55) * cellH);
          });
        });
      }
      c.textAlign = 'left';
    }
  };
})();
