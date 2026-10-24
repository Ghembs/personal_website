// ASCII scenes: a character grid drawn straight onto a 2D canvas. Every scene
// is composed from a recipe of catalogue elements (scene-catalog.js): the home
// page draws random recipes, the lab's composer lets you pick. Every cell has a
// colour and optionally a "material" (scenery, as opposed to text): with the
// 你好 easter egg scenery cells are written with hanzi chosen for their shape
// and weight, one per ascii mark (- 一, | 丨, / 丿, o 口, # 田). Sprites that must move smoothly (a jump, a bird) are "floats",
// drawn at fractional positions over the grid.
// Links are labels on objects of the scene; `spots` tells main.js where they
// are. Two landmarks keep a link for themselves: the Duomo of Florence shows
// only STF, the Oriental Pearl tower of Shanghai only 中文; elsewhere those
// links may appear on any carrier.

const Scenes = (() => {
  const ease = (t) => t * t * (3 - 2 * t);
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

  // Every drawing and palette comes from the catalogue (scene-catalog.js).
  const {
    CLOUDS, SUN, DUSK_SUN, MOON, DUOMO, PEARL, ICONS, DINO, DINO_LEGS, DINO_AIR, BIOMES, OBST, TREES, PTERO, PROPS, FAR, BOAT, BUOY, FISH, CHEST, MINIPLANE, GROUND, BLADES, GENERIC, PLANE, BALLOON, KITE, LOCO, WAGON, STATION, TUNNEL_IN, TUNNEL_OUT, SEA_PALETTES, PLANE_PALETTES, TRAIN_PALETTES,
  } = SceneCatalog.parts;

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

  // Width of a link label, in cells: a word, or an icon's widest row.
  const labelWidth = (s, i) => { const l = s.labels[i]; return l == null ? 0 : Array.isArray(l) ? widthOf(l) : len(l); };

  // A link label drawn in the grid, inverted when hovered; records its spot.
  // Icons (several rows) stand on row y, growing upwards.
  function label(g, s, x, y, i, fg) {
    if (i == null || i < 0) return;
    const lab = s.labels[i], lines = Array.isArray(lab) ? lab : [lab], n = labelWidth(s, i);
    x = Math.round(x); y = Math.round(y) - lines.length + 1;
    if (x + n < 0 || x >= g.cols || y + lines.length <= 0 || y >= g.rows) return;
    lines.forEach((line, r) => {
      if (s.hover === i) { g.fillBg(x, y + r, n, s.hlBg); g.text(x, y + r, line, 0); }
      else g.text(x, y + r, line, fg);
    });
    if (x >= 0 && x + n <= g.cols && y >= 0) s.spots[i] = { col: x, row: y, len: n, h: lines.length };
  }
  // A label centred on x.
  const labelC = (g, s, x, y, i, fg) => label(g, s, x - (labelWidth(s, i) >> 1), y, i, fg);

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

  // ---------- the scene ----------
  // Every scene is composed from a recipe:
  //   { land, time, weather, picks: ['cat.id', ...], speed, density, roam, game }
  // Each catalogue category has its place: sky (clouds, sun, moon, stars,
  // flyers), far layer (landmarks), middle layer (trees, buildings, logo
  // boards), ground (obstacles, props, signs) or water (sea, or a river when a
  // boat or fish come to a land), and each vehicle in its slot. With links
  // (the home page), objects of the scene carry them: signs, buoys, chests,
  // flyers with banners, fish, wagons, stations, balloons, kites, buildings,
  // and the landmarks their own. With `game`, the dinosaur is playable; with
  // `roam`, it walks from one land into the next.

  const ITEM = new Map(SceneCatalog.categories.flatMap((c) => c.items.map((it) => [`${c.id}.${it.id}`, { cat: c.id, ...it }])));
  const catOf = (k) => ITEM.get(k)?.cat;
  // the fixed order of palette keys: C indexes into it
  const PAL_KEYS = ['bg', 'fg', 'dim', 'hl', 'accent', 'green', 'skyTop', 'skyLow', 'soil', 'soilDeep', 'wave', 'foam', 'deep', 'under', 'gold'];
  const C = Object.fromEntries(PAL_KEYS.map((k, i) => [k, i]));
  const complete = (p) => {
    const q = {
      bg: p.bg, fg: p.fg, dim: p.dim, hl: p.hl || p.fg, accent: p.accent, green: p.green || p.dim,
      skyTop: p.skyTop || mixHex(p.bg, p.dim, 0.35), skyLow: p.skyLow || p.bg,
      soil: p.soil || mixHex(p.bg, p.green || p.dim, 0.25), soilDeep: p.soilDeep || mixHex(p.soil || p.bg, p.fg, 0.18),
      wave: p.wave || mixHex(p.fg, '#2f7ea3', 0.7), foam: p.foam || mixHex(p.bg, '#6fb3cf', 0.6),
      deep: p.deep || mixHex(p.fg, '#123a52', 0.6), under: p.under || mixHex(p.bg, '#5ea3c1', 0.5),
      gold: p.gold || p.sun || '#e2a03a',
    };
    return Object.fromEntries(PAL_KEYS.map((k) => [k, q[k]]));
  };
  const BIOME_LANDS = ['desert', 'jungle', 'volcano', 'ice'];
  const LANDS = {
    desert: { far: 'mesa' }, jungle: { far: 'hills' }, volcano: { far: 'volcano' }, ice: { far: 'peaks' },
    countryside: {
      far: 'hills', trees: ['oak', 'cypressL', 'pineL', 'treeR'], ground: ".,'.,`", props: ['grass', 'flowers', 'stones', 'pebbles'],
      obstacles: ['rock', 'log'], palettes: { day: PLANE_PALETTES.day, night: PLANE_PALETTES.night, dusk: PLANE_PALETTES.dusk },
    },
    sea: { sea: true, trees: [], obstacles: [], palettes: { day: SEA_PALETTES.day, night: SEA_PALETTES.night } },
  };
  for (const k of BIOME_LANDS) {
    const b = BIOMES[k];
    Object.assign(LANDS[k], { trees: b.trees, ground: b.ground, props: b.props, obstacles: b.obstacles, palettes: b.palettes });
  }
  const treeLines = (id) => TREES[id] || GROUND[id]?.lines;
  const GREY = complete({ bg: '#9aa3a8', fg: '#1d262b', dim: '#5d6b73', hl: '#10171b', accent: '#c4553f', green: '#4c5d55', skyTop: '#6f7b82', skyLow: '#a7b0b4', soil: '#8a908c', soilDeep: '#6c726e' });
  const SNOWY = complete({ bg: '#eef2f5', fg: '#3b4a57', dim: '#a9b8c4', hl: '#16222c', accent: '#c8553d', green: '#6f8f86', skyTop: '#cfd9e1', skyLow: '#f2f5f7', soil: '#f4f7f9', soilDeep: '#dfe7ed' });

  // the palette of a land at a time, under a weather
  function landPalette(land, time, weather) {
    const P = LANDS[land].palettes, day = complete(P.day), night = complete(P.night);
    let p = day;
    if (time === 'night') p = night;
    else if (time === 'dusk') {
      if (P.dusk) p = complete(P.dusk);
      else {
        const d = mixPalette(day, night, 0.3);
        p = { ...d, skyTop: mixHex(d.skyTop, '#e98d6b', 0.45), skyLow: mixHex(d.skyLow, '#f6c79a', 0.5), bg: mixHex(d.bg, '#f2c9a6', 0.35) };
      }
    }
    if (weather === 'rain') p = land === 'sea' && time !== 'night' ? complete(SEA_PALETTES.storm) : mixPalette(p, time === 'night' ? mixPalette(GREY, night, 0.6) : GREY, 0.6);
    if (weather === 'snow') p = mixPalette(p, time === 'night' ? mixPalette(SNOWY, night, 0.7) : SNOWY, 0.55);
    return p;
  }

  const SLOT = {
    'vehicles.dino': 'walk', 'vehicles.train': 'rails', 'vehicles.boat': 'water',
    'vehicles.plane': 'fly', 'vehicles.miniplane': 'flyer', 'vehicles.balloon': 'drift', 'vehicles.kite': 'kite',
  };
  const DINO_FEET = [7, 12];       // columns of the dinosaur the feet span
  const STATION_W = widthOf(STATION);

  // ---------- recipes for the home page ----------

  const PRESETS = {
    dino: () => ({ land: pick(BIOME_LANDS), picks: ['vehicles.dino', 'animals.ptero'] }),
    mare: () => ({ land: 'sea', picks: ['vehicles.boat', 'animals.gull', 'animals.fish'] }),
    aereo: () => ({ land: 'countryside', picks: ['vehicles.plane', 'vehicles.balloon', 'buildings.house', 'buildings.church', 'buildings.mill', 'trees.cypressL', 'trees.oak'] }),
    treno: () => ({ land: 'countryside', picks: ['vehicles.train', 'buildings.house', 'buildings.castle', 'trees.cypressL', 'trees.oak', 'trees.pineL'] }),
  };
  const someOf = (cat, n) => {
    const items = SceneCatalog.categories.find((c) => c.id === cat).items.map((it) => `${cat}.${it.id}`);
    return [...items].sort(() => Math.random() - 0.5).slice(0, n);
  };
  // A random recipe from the catalogue, sensible enough: each land with its
  // likely hero, a few things to see, landmarks now and then.
  function randomRecipe(preset) {
    const base = preset ? PRESETS[preset]() : {};
    const land = base.land || pick(['desert', 'jungle', 'volcano', 'ice', 'countryside', 'countryside', 'sea', 'sea']);
    const picks = new Set(base.picks || []);
    if (!preset) {
      const hero = land === 'sea' ? 'vehicles.boat'
        : land === 'countryside' ? pick(['vehicles.plane', 'vehicles.train', 'vehicles.train', 'vehicles.dino', 'vehicles.balloon'])
          : pick(['vehicles.dino', 'vehicles.dino', 'vehicles.train', 'vehicles.plane']);
      picks.add(hero);
      if (land === 'sea') { picks.add('animals.gull'); picks.add('animals.fish'); if (Math.random() < 0.4) picks.add('vehicles.miniplane'); }
      else if (land !== 'countryside') picks.add('animals.ptero');
      if (land === 'countryside') someOf('buildings', 2 + ((Math.random() * 3) | 0)).filter((k) => k !== 'buildings.station').forEach((k) => picks.add(k));
      if (Math.random() < 0.3) picks.add(pick(['vehicles.balloon', 'vehicles.kite']));
    }
    if (Math.random() < 0.55) picks.add(pick(['landmarks.duomo', 'landmarks.pearl']));
    if (Math.random() < 0.25) picks.add(pick(['landmarks.duomo', 'landmarks.pearl']));
    const time = pick(['day', 'day', 'dusk', 'night']);
    const weather = Math.random() < 0.22 ? (land === 'ice' ? 'snow' : land === 'desert' || land === 'volcano' ? null : land === 'jungle' ? 'rain' : pick(['rain', 'rain', 'snow'])) : null;
    return { land, time, weather, picks: [...picks], speed: 1, density: 1, roam: picks.has('vehicles.dino') && BIOME_LANDS.includes(land), game: true, preset };
  }

  // ---------- the scene itself ----------

  const scene = {
    init(s) {
      const r = s.recipe;
      const of = (cat) => r.picks.filter((k) => catOf(k) === cat);
      const lines = (k) => ITEM.get(k).lines;
      s.land = LANDS[r.land] ? r.land : 'countryside';
      s.time = r.time || 'day';
      s.weather = r.weather || null;
      s.speed0 = 10 * (r.speed ?? 1);
      s.speed = s.speed0;
      s.dens = r.density || 1;
      s.links = s.labels.length > 0;
      s.pickLink = picker(s);
      // pools; a land brings its own trees, props and obstacles when none are picked
      s.pickedMid = [...of('trees'), ...of('buildings').filter((k) => k !== 'buildings.station')]
        .map((k) => ({ lines: lines(k), green: catOf(k) === 'trees' }));
      s.logos = of('logos').map(lines);
      s.farPool = of('landmarks').map((k) => ({ lines: lines(k), lm: k.endsWith('duomo') ? 'stf' : 'zh' }));
      s.pickedObst = of('obstacles').map((k) => ({ id: k.split('.')[1] }));
      s.pickedProps = of('ground').map(lines);
      const cl = of('sky').filter((k) => k.includes('cloud')).map(lines);
      s.cloudPool = cl.length ? cl : CLOUDS;
      const has = (k) => r.picks.includes(k);
      s.sunOverride = has('sky.sun') ? 'sun' : has('sky.moon') ? 'moon' : null;
      s.starsPicked = has('sky.stars');
      s.flyKinds = [...(has('animals.ptero') ? ['ptero'] : []), ...(has('animals.gull') ? ['gull'] : []), ...(has('vehicles.miniplane') ? ['mini'] : [])];
      s.fishOn = has('animals.fish');
      s.heroes = r.picks.filter((k) => SLOT[k]).map((k) => ({ k, slot: SLOT[k], i: -2 }));
      s.walker = s.heroes.some((h) => h.slot === 'walk');
      s.rails = s.heroes.some((h) => h.slot === 'rails');
      s.stationsOn = s.rails || has('buildings.station');
      Object.assign(s, {
        off: 0, flash: 0, nextFlash: 4, y: 0, vy: 0, held: false, buffer: -1,
        game: false, over: false, score: 0, hi: 0, nightMix: s.time === 'night' ? 1 : 0, nightGoal: null,
        clouds: [], mid: [], far: [], obst: [], props: [], signs: [], buoys: [], chests: [], flyers: [], fish: [], bubbles: [],
        stations: [], tunnels: [], poles: [],
        nextMid: 0, nextFar: 30, nextObst: 60, nextProp: 0, nextSign: 25, nextBuoy: 25, nextChest: 30,
        nextStation: 90, nextTunnel: 240, nextPole: 5, nextRoam: 700 + Math.random() * 400,
        palFrom: null, palT: 1, banner: -1, bannerAt: -99,
        wagons: [{ i: -1 }, { i: -2 }, { i: -1 }, { i: -2 }],
      });
      try { s.hi = +localStorage.getItem('dino-hi') || 0; } catch (e) { /* private mode */ }
      this.setLand(s, s.land);
      const nClouds = Math.round(5 * s.dens) + (s.weather ? 5 : 0);
      for (let k = 0; k < nClouds; k++) s.clouds.push({ x: Math.random() * 300, y: Math.random(), k: (Math.random() * s.cloudPool.length) | 0, z: Math.random() });
      if (s.links && LANDS[s.land].sea) s.flyers.push({ kind: 'gull', x: s.cols * 0.55, y: 5, v: rnd(4, 7), i: s.pickLink([]) });
      for (let k = 0; k < (this.water(s) && (s.fishOn || LANDS[s.land].sea) ? 4 : 0); k++) {
        const v = (Math.random() < 0.5 ? 1 : -1) * rnd(2, 5);
        s.fish.push({ x: Math.random() * s.cols, y: Math.random(), v, k: (v > 0 ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0), i: -1 });
      }
    },
    // the land's own pools, refreshed when the dinosaur roams into another land
    setLand(s, land) {
      const L = LANDS[land];
      s.land = land;
      s.midPool = s.pickedMid.length ? s.pickedMid : (L.trees || []).map((id) => ({ lines: treeLines(id), green: true })).filter((m) => m.lines);
      s.propPool = s.pickedProps.length ? s.pickedProps : (L.props || []).map((id) => PROPS[id]);
      const ob = s.pickedObst.length ? s.pickedObst.map((o) => o.id) : s.walker ? L.obstacles || [] : [];
      s.obstPool = ob.map((id) => OBST[id]).filter(Boolean);
    },
    water: (s) => LANDS[s.land].sea || s.heroes.some((h) => h.slot === 'water') || s.fishOn,
    horizon: (s) => Math.round(s.rows * (s.portrait ? 0.62 : 0.7)),
    surface: (s) => Math.round(s.rows * (s.portrait ? 0.42 : 0.5)),
    // the line things stand on: the ground, or the sea's surface
    base(s) { return LANDS[s.land].sea ? this.surface(s) : this.horizon(s); },
    live: (s) => [s.banner, ...s.mid, ...s.far, ...s.signs, ...s.buoys, ...s.chests, ...s.flyers, ...s.fish, ...s.stations, ...s.heroes, ...s.wagons]
      .map((o) => (typeof o === 'number' ? o : o.i)).filter((i) => i >= 0),

    // ---------- the game ----------
    action(s) {
      if (!s.walker || !s.recipe.game) return false;
      if (!s.game || s.over) {
        Object.assign(s, { game: true, over: false, score: 0, speed: s.speed0 * 1.3, obst: [], nextObst: s.off + s.cols * 0.7 });
      }
      s.held = true;
      if (s.y <= 0.01) this.jump(s); else s.buffer = s.t;
      return true;
    },
    release(s) { s.held = false; },
    jump(s) { s.vy = 32; s.y = 0.01; s.buffer = -1; },
    busy: (s) => s.game && !s.over,

    update(s, dt) {
      if (s.over) return;
      const d = s.dens, B = this.base(s), sea = LANDS[s.land].sea, dx = this.walkerX(s);
      s.off += s.speed * dt;
      if (s.game) {
        s.score += dt * s.speed * 0.8;
        s.speed = s.speed0 * 1.3 * (1 + 0.1 * Math.floor(s.score / 1000));
        s.nightGoal = Math.floor(s.score / 700) % 2;
      }
      if (s.nightGoal !== null) s.nightMix += (s.nightGoal - s.nightMix) * Math.min(1, dt * 1.5);
      // the dinosaur: jump physics, the demo's own jumps, collisions in a game
      if (s.walker) {
        if (s.y > 0 || s.vy > 0) {
          const gr = s.vy > 0 && s.held ? 45 : 90;
          s.vy -= gr * dt;
          s.y = Math.max(0, s.y + s.vy * dt);
          if (s.y === 0) { s.vy = 0; if (s.buffer > 0 && s.t - s.buffer < 0.15) this.jump(s); }
        }
        const next = s.obst.find((o) => o.x + o.w - s.off > dx + DINO_FEET[0]);
        if (next && !s.game && s.y === 0) {
          const gap = next.x + next.w / 2 - s.off - (dx + (DINO_FEET[0] + DINO_FEET[1]) / 2);
          if (gap > 0 && gap < 0.71 * s.speed) { s.held = true; this.jump(s); }
        }
        if (!s.game && s.vy < 0) s.held = false;
        if (s.game) {
          for (const o of s.obst) {
            const ox = o.x - s.off;
            if (ox + 1 < dx + DINO_FEET[1] && ox + o.w - 1 > dx + DINO_FEET[0] && s.y < o.h - 0.4) {
              s.over = true;
              s.hi = Math.max(s.hi, Math.floor(s.score));
              try { localStorage.setItem('dino-hi', s.hi); } catch (e) { /* private mode */ }
            }
          }
        }
      }
      // roaming: a new land every so often, its colours fading in
      if (s.recipe.roam && BIOME_LANDS.includes(s.land) && s.off > s.nextRoam) {
        s.palFrom = this.palette(s);
        s.palT = 0;
        this.setLand(s, pick(BIOME_LANDS.filter((b) => b !== s.land)));
        s.nextRoam = s.off + 700 + Math.random() * 400;
      }
      s.palT = Math.min(1, s.palT + dt / 2.5);

      const fill = (list, nextKey, speed, make, gap) => {
        while (s[nextKey] < s.off * speed + s.cols + 30) {
          const o = make();
          if (o) list.push({ x: s[nextKey], ...o });
          s[nextKey] += gap(o);
        }
        for (let k = list.length - 1; k >= 0; k--) if (list[k].x - s.off * speed < -70) list.splice(k, 1);
      };
      if (s.midPool.length || s.logos.length) {
        fill(s.mid, 'nextMid', 0.4, () => {
          if (s.logos.length && Math.random() < 0.12) return { lines: pick(s.logos), logo: true, i: -1 };
          const m = pick(s.midPool);
          return { lines: m.lines, green: m.green, i: s.links && Math.random() < (m.green ? 0.2 : 0.35) ? -2 : -1 };
        }, (o) => (widthOf(o.lines) + rnd(3, 18)) / d);
      }
      if (s.farPool.length) {
        fill(s.far, 'nextFar', 0.12, () => {
          const f = pick(s.farPool);
          if (s.far.some((o) => o.lm === f.lm && o.x - s.off * 0.12 > -60)) return null;
          return { ...f, i: s.links ? s.special[f.lm] ?? -1 : -1 };
        }, (o) => (o ? widthOf(o.lines) : 0) + rnd(60, 180) / d);
      }
      if (s.obstPool.length) {
        fill(s.obst, 'nextObst', 1, () => { const o = pick(s.obstPool); return { ...o }; },
          (o) => o.w + rnd(24, 60) / d + s.speed * 0.9);
      }
      if (!sea && s.propPool.length) fill(s.props, 'nextProp', 1.4, () => ({ lines: pick(s.propPool), depth: Math.random() }), () => rnd(5, 16) / d);
      if (s.links && !sea && !s.rails) {
        fill(s.signs, 'nextSign', 1, () => {
          if (s.obst.some((o) => Math.abs(o.x - s.nextSign) < 16)) return null;
          return { i: -2 };
        }, () => rnd(60, 110));
      }
      if (s.links && this.water(s)) fill(s.buoys, 'nextBuoy', 1, () => ({ i: -2 }), () => rnd(45, 80));
      if (s.links && sea) fill(s.chests, 'nextChest', 0.6, () => ({ i: -2 }), () => rnd(70, 130));
      if (s.rails) {
        fill(s.stations, 'nextStation', 1, () => ({ i: -2 }), () => rnd(260, 420));
        fill(s.tunnels, 'nextTunnel', 1, () => (s.stations.some((st) => Math.abs(st.x - s.nextTunnel) < 80) ? null : { w: rnd(40, 70) }), () => rnd(280, 460));
        fill(s.poles, 'nextPole', 1.3, () => ({}), () => 34);
      } else if (s.stationsOn) fill(s.stations, 'nextStation', 0.4, () => ({ i: -2 }), () => rnd(160, 300));
      // flyers cross the sky; in the home, some with a banner or a sign
      if (s.flyKinds.length && Math.random() < dt * 0.25 * d && s.flyers.length < 2 + Math.round(2 * d)) {
        const kind = pick(s.flyKinds);
        s.flyers.push({ kind, x: s.cols + 8, y: 2 + Math.random() * Math.max(1, B * 0.5), v: rnd(4, 9), i: s.links && Math.random() < 0.6 ? s.pickLink(this.live(s)) : -1 });
      }
      for (const f of s.flyers) f.x -= (f.v + s.speed * 0.2) * dt;
      s.flyers = s.flyers.filter((f) => f.x > -30);
      // fish, some trailing a label
      if (this.water(s) && (s.fishOn || sea)) {
        if (s.fish.length < Math.round(5 * d) && Math.random() < dt * 1.5) {
          const right = Math.random() < 0.5;
          s.fish.push({ x: right ? -20 : s.cols + 20, y: Math.random(), v: (right ? 1 : -1) * rnd(2, 5), k: (right ? 0 : 1) + (Math.random() < 0.3 ? 2 : 0),
            i: s.links && Math.random() < 0.3 ? s.pickLink(this.live(s)) : -1 });
        }
        for (const f of s.fish) f.x += (f.v - s.speed * 0.2) * dt;
        s.fish = s.fish.filter((f) => f.x > -30 && f.x < s.cols + 30);
      }
      if (sea) {
        if (Math.random() < dt * 2) s.bubbles.push({ x: Math.random() * s.cols, y: s.rows - 2 });
        for (const b of s.bubbles) { b.y -= dt * 3; b.x += Math.sin(s.t * 3 + b.y) * dt; }
        s.bubbles = s.bubbles.filter((b) => b.y > B + 3);
      }
      // links: landmarks on stage reserve theirs; carriers get theirs as they enter
      if (s.links) {
        s.reserved = new Set(s.far.filter((o) => o.i >= 0).map((o) => o.i));
        const enter = (list, speed) => {
          for (const o of list) {
            if (o.i === -2 && o.x - s.off * speed < s.cols + 2) o.i = s.pickLink(this.live(s));
            else if (o.i >= 0 && s.reserved.has(o.i) && !o.lm) o.i = s.pickLink(this.live(s));
          }
        };
        enter(s.mid, 0.4); enter(s.signs, 1); enter(s.buoys, 1); enter(s.chests, 0.6); enter(s.stations, s.rails ? 1 : 0.4);
        // travellers already on stage give up a link a landmark now reserves
        for (const o of [...s.flyers, ...s.fish]) if (o.i >= 0 && s.reserved.has(o.i)) o.i = -1;
        for (const h of s.heroes) if ((h.slot === 'drift' || h.slot === 'kite') && (h.i === -2 || s.reserved.has(h.i))) h.i = s.pickLink(this.live(s));
        if (s.rails) for (const w of s.wagons) if (w.i === -2 || (w.i >= 0 && s.reserved.has(w.i))) w.i = s.pickLink(this.live(s));
        if (s.heroes.some((h) => h.slot === 'fly') && (s.t - s.bannerAt > 7 || s.reserved.has(s.banner))) {
          s.bannerAt = s.t; s.banner = -1; s.banner = s.pickLink(this.live(s));
        }
      }
      if (s.weather === 'rain') {
        s.flash = Math.max(0, s.flash - dt * 6);
        if ((s.nextFlash -= dt) < 0) { s.flash = 1; s.nextFlash = 5 + Math.random() * 8; }
      }
    },

    palette(s) {
      let p = landPalette(s.land, s.time, s.weather);
      if (s.nightMix > 0.001 && s.time !== 'night') p = mixPalette(p, landPalette(s.land, 'night', s.weather), s.nightMix);
      if (s.palT < 1 && s.palFrom) p = mixPalette(s.palFrom, p, ease(s.palT));
      return s.flash > 0 ? mixPalette(p, { ...p, bg: '#f4f7f9', skyTop: '#dde6ea', skyLow: '#f4f7f9' }, s.flash) : p;
    },
    walkerX: (s) => (s.portrait ? 1 : Math.round(s.cols * 0.07)),

    draw(g, s) {
      const pal = this.palette(s), sea = LANDS[s.land].sea, B = this.base(s);
      const night = s.time === 'night' || s.nightMix > 0.5;
      const tags = [];
      const tag = (x, y, i, fg = C.hl, centred = true) => { if (i >= 0) tags.push([x, y, i, fg, centred]); };
      // sky and ground
      g.gradient(0, B + 1, pal.skyTop, pal.skyLow);
      if (sea) g.gradient(B + 2, g.rows, pal.deep, mixHex(pal.deep, '#000000', 0.3));
      else g.gradient(B + 1, g.rows, pal.soil, pal.soilDeep);
      if (night || s.starsPicked) stars(g, s, B - 4, C.dim);
      const sun = s.sunOverride || (s.weather ? null : night ? 'moon' : s.time === 'dusk' ? 'dusk' : 'sun');
      if (sun === 'sun') g.sprite(g.cols - 16, 2, SUN, C.gold, M.sun);
      else if (sun === 'moon') g.sprite(g.cols - 14, 2, MOON, C.gold, M.moon);
      else if (sun === 'dusk') g.sprite(g.cols - 14, Math.round(B * 0.45), DUSK_SUN, C.accent, M.sun);
      const span = g.cols + 40;
      for (const c of s.clouds) {
        g.sprite(wrap(c.x - s.off * (0.1 + c.z * 0.2), span) - 20, 2 + c.y * Math.max(1, B * 0.4), s.cloudPool[c.k % s.cloudPool.length], s.weather ? C.fg : C.dim, M.cloud);
      }
      if (s.weather) {
        const snow = s.weather === 'snow', sp = snow ? 4 : 14;
        for (let x = 0; x < g.cols; x++) for (let y = 3; y < B; y++) {
          const h = hash(x + Math.floor(s.t * sp) * (snow ? 1 : 3), y - Math.floor(s.t * sp));
          if (h < (snow ? 0.022 : 0.035)) g.put(x + (snow ? Math.round(Math.sin(s.t + y) * 0.6) : 0), y, snow ? (h < 0.01 ? '*' : '.') : '/', C.dim, snow ? M.snow : M.rain);
        }
      }
      // far silhouettes and landmarks
      const far = FAR[LANDS[s.land].far];
      if (far) for (let x = 0; x < g.cols; x++) {
        const w = x + s.off * 0.1, h = far(w), dh = far(w + 1) - h;
        if (h <= 0) continue;
        g.put(x, B - 1 - h - (dh > 0 ? 1 : 0), dh > 0 ? '/' : dh < 0 ? '\\' : '_', C.dim, s.land === 'ice' ? M.snow : M.hill);
        if (s.land === 'volcano' && h >= 9 && far(w - 1) >= 9 && far(w + 2) < 9) {
          for (let k = 1; k < 8; k++) {
            const sx = x - 3 + Math.round(Math.sin(s.t * 0.8 + k) * k * 0.5);
            if (hash(k, Math.floor(s.t * 3)) < 0.75) g.put(sx, B - 11 - k, k < 3 ? '*' : 'o', k < 3 ? C.accent : C.dim, k < 3 ? M.fire : M.smoke);
          }
        }
      }
      for (const o of s.far) {
        const x = Math.round(o.x - s.off * 0.12), top = B - o.lines.length;
        g.sprite(x, top, o.lines, C.dim, o.lm === 'stf' ? M.duomo : M.pearl, true);
        tag(x + (widthOf(o.lines) >> 1), top - 1, o.i);
      }
      // middle layer: trees, buildings (windows lit at night), logos on boards, stations away from rails
      for (const o of s.mid) {
        const x = Math.round(o.x - s.off * 0.4), top = B - o.lines.length - (o.logo ? 2 : 0);
        if (x > g.cols + 2 || x + widthOf(o.lines) < -2) continue;
        g.sprite(x, top, o.lines, o.green ? C.green : C.fg, o.green ? M.tree : M.house, !o.green);
        if (o.logo) { const mx = x + (widthOf(o.lines) >> 1); g.put(mx, B - 1, '|', C.fg, M.wood); g.put(mx, B - 2, '|', C.fg, M.wood); }
        if (night && !o.green) o.lines.forEach((line, r) => [...line].forEach((ch, k) => { if (ch === '[' && hash(o.x | 0, r * 31 + k) < 0.7) g.put(x + k + 1, top + r, '#', C.gold, M.light); }));
        tag(x + (widthOf(o.lines) >> 1), top - 1, o.i);
      }
      if (!s.rails) for (const st of s.stations) {
        const x = Math.round(st.x - s.off * 0.4);
        g.sprite(x, B - STATION.length, STATION, C.fg, M.station, true);
        tag(x + (STATION_W >> 1), B - STATION.length + 2, st.i);
      }
      // the water, or the ground
      if (sea) {
        for (let x = 0; x < g.cols; x++) {
          const w = x + s.off, v = Math.sin(w * 0.18 + s.t * 1.6) + 0.5 * Math.sin(w * 0.07 - s.t * 0.9) * (s.weather === 'rain' ? 2 : 1);
          if (v > 1.05) g.put(x, B - 1, '^', C.foam, M.foam);
          g.put(x, B, v > 0.3 ? '~' : '-', C.wave, M.wave);
          const h1 = hash(Math.floor(w), 5);
          if (h1 < 0.55) g.put(x, B + 1, h1 < 0.25 ? '~' : '-', C.foam, M.wave);
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
        for (const c of s.chests) {
          const x = Math.round(c.x - s.off * 0.6);
          g.sprite(x, g.rows - 3, CHEST, C.gold, M.chest);
          g.put(x + 3, g.rows - 4, '|', C.under);
          tag(x + 3, g.rows - 5, c.i, C.foam);
        }
      } else {
        const tex = LANDS[s.land].ground || '.,';
        for (let x = 0; x < g.cols; x++) g.put(x, B, hash(Math.floor(x + s.off), 7) < 0.05 ? '-' : '_', C.fg, M.sand);
        for (let y = B + 1; y < g.rows; y++) {
          const dd = (y - B) / Math.max(1, g.rows - B);
          for (let x = 0; x < g.cols; x++) {
            const w = Math.floor(x + s.off * (1 + dd * 0.8));
            if (hash(w, y * 7 + 3) < (0.07 + dd * 0.17) * Math.min(1.5, s.dens)) g.put(x, y, tex[Math.floor(hash(w, y) * tex.length)], hash(w, y * 7 + 3) < 0.02 ? C.fg : C.dim, M.sand);
          }
        }
        for (const p of s.props) {
          const x = Math.round(p.x - s.off * 1.4), y = B + 2 + Math.round(p.depth * Math.max(0, g.rows - B - 4));
          g.sprite(x, y - p.lines.length + 1, p.lines, p.lines === PROPS.crack ? C.accent : p.depth > 0.5 ? C.fg : C.green, M.sand);
        }
        // a river for a boat or fish in a land
        if (this.water(s)) {
          const r0 = B + 2, r1 = Math.min(g.rows - 1, B + 5);
          for (let y = r0; y <= r1; y++) for (let x = 0; x < g.cols; x++) g.put(x, y, (x + y + Math.floor(s.off * 0.6)) % 4 ? '~' : '-', C.wave, M.river);
        }
      }
      const waterTop = sea ? B + 3 : B + 2, waterBottom = sea ? g.rows - 2 : Math.min(g.rows - 1, B + 5);
      for (const f of s.fish) {
        const y = waterTop + f.y * Math.max(0, waterBottom - waterTop), right = f.v > 0;
        if (f.i >= 0) {
          g.float(f.x, y, [right ? '><(((°>' : '<°)))><'], C.foam, M.fish);
          const n = labelWidth(s, f.i);
          if (right) { g.text(Math.round(f.x) - 2, Math.round(y), '~~', C.under, M.rope); tag(Math.round(f.x) - 3 - n, y, f.i, C.foam, false); }
          else { g.text(Math.round(f.x) + 7, Math.round(y), '~~', C.under, M.rope); tag(Math.round(f.x) + 9, y, f.i, C.foam, false); }
        } else g.float(f.x, y, [FISH[f.k]], C.foam, M.fish);
      }
      // buoys ride the surface (sea or river)
      for (const b of s.buoys) {
        const x = Math.round(b.x - s.off), line = sea ? B : B + 2;
        const bob = Math.sin(b.x * 0.18 + s.t * 1.6) > 0.6 ? -1 : 0;
        g.sprite(x - 3, line - 2 + bob, BUOY, C.accent, M.buoy, true);
        g.put(x, line - 3 + bob, '|', C.fg);
        tag(x, line - 4 + bob, b.i);
      }
      // obstacles; lava sinks into the ground and bubbles
      for (const o of s.obst) {
        const x = Math.round(o.x - s.off);
        if (o.pool) {
          const lines = o.lines.map((l, r) => (r === 1 ? [...l].map((ch, k) => (ch === '~' && hash(k + Math.floor(s.t * 4), x) < 0.2 ? (hash(k, Math.floor(s.t * 3)) < 0.5 ? '*' : 'o') : ch)).join('') : l));
          g.sprite(x, B, lines, C.accent, M.fire, true);
          for (let k = 0; k < 2; k++) if (hash(x + k, Math.floor(s.t * 5)) < 0.4) g.put(x + 3 + k * 4 + Math.round(Math.sin(s.t * 3 + k)), B - 1 - k, k ? '.' : '*', C.accent, M.fire);
        } else g.sprite(x, B - o.lines.length + 1, o.lines, o.mat === 'fire' ? C.accent : C.fg, M[o.mat] || M.rock);
      }
      for (const o of s.signs) {
        const x = Math.round(o.x - s.off), n = labelWidth(s, o.i);
        if (o.i < 0) continue;
        g.put(x + (n >> 1), B - 1, '|', C.fg, M.wood);
        g.put(x + (n >> 1), B - 2, '|', C.fg, M.wood);
        tag(x, B - 3, o.i, C.hl, false);
      }
      // the railway: poles and wires, rails, stations, the train, tunnels over it
      if (s.rails) {
        for (const p of s.poles) {
          const x = Math.round(p.x - s.off * 1.3);
          for (let y = B - 11; y < B + 2; y++) g.put(x, y, '|', C.fg, M.wood);
          g.text(x - 1, B - 11, '-+-', C.fg, M.wood);
        }
        for (let x = 0; x < g.cols; x++) {
          const u = wrap(x + s.off * 1.3, 34) / 34;
          g.put(x, B - 11 + Math.round(Math.sin(u * Math.PI) * 1.2), '-', C.dim, M.rope);
          g.put(x, B, '=', C.fg, M.rail);
          if (!sea) g.put(x, B + 1, Math.floor(x + s.off) % 3 ? '_' : '|', C.dim, M.rail);
        }
        for (const st of s.stations) {
          const x = Math.round(st.x - s.off);
          g.sprite(x, B - STATION.length, STATION, C.fg, M.station);
          tag(x + 11, B - STATION.length + 2, st.i);
        }
      }
      // vehicles
      let walkX = this.walkerX(s);
      for (const h of s.heroes) {
        if (h.slot === 'walk') {
          const top = B - DINO.length - 1 - s.y;
          g.float(walkX, top, DINO, C.fg, M.dino, true);
          g.float(walkX, top + DINO.length, s.y > 0.2 ? DINO_AIR : DINO_LEGS[Math.floor(s.off / 1.6) % 2], C.fg, M.dino, true);
          walkX += widthOf(DINO) + 6;
        } else if (h.slot === 'rails') {
          const top = B - LOCO.length, lx = s.portrait ? g.cols - widthOf(LOCO) - 1 : Math.min(g.cols - widthOf(LOCO) - 1, Math.round(g.cols * 0.66));
          g.sprite(lx, top, LOCO, C.accent, M.train, true);
          const inTunnel = s.tunnels.some((t) => lx + 18 > t.x - s.off && lx < t.x + t.w - s.off);
          if (!inTunnel) for (let k = 1; k < 5; k++) g.put(lx + 7 - k * 2, top - k, k % 2 ? 'o' : 'O', C.dim, M.smoke);
          let wx = lx;
          s.wagons.forEach((w, k) => {
            wx -= widthOf(WAGON) + 1;
            g.sprite(wx, top + 2, WAGON, k % 2 ? C.fg : C.accent, M.train, true);
            g.put(wx + widthOf(WAGON), top + 3, '=', C.fg, M.train);
            if (night) [2, 6, 10, 14, 18].forEach((c) => g.text(wx + c, top + 3, '[]', C.gold, M.light));
            tag(wx + 11, top + 3, w.i);
          });
        } else if (h.slot === 'water') {
          const line = sea ? B : B + 2, bx = Math.round(g.cols * (s.portrait ? 0.2 : 0.32));
          const bob = Math.sin(s.t * 1.6 + bx * 0.18) > 0.5 ? -1 : 0;
          g.sprite(bx, line - BOAT.length + 2 + bob, BOAT.slice(0, 4), C.fg, M.sail, true);
          g.sprite(bx, line - BOAT.length + 6 + bob, BOAT.slice(4), C.fg, M.boat, true);
          if (night) [0, 1, 2].forEach((k) => g.put(bx + 4 + k * 3, line + bob, 'o', C.gold, M.light));
        } else if (h.slot === 'fly') {
          const px = Math.round(g.cols * (s.portrait ? 0.42 : 0.56)), py = Math.round(B * 0.36) + Math.sin(s.t * 0.9) * 0.6, ry = Math.round(py) + 2;
          if (s.banner >= 0) {
            const n = labelWidth(s, s.banner), rope = 6, bx = px + 2 - rope - n - 2;
            for (let k = 0; k < rope; k++) g.put(px + 2 - rope + k, ry, (k + Math.floor(s.t * 6)) % 2 ? '~' : '-', C.dim, M.rope);
            g.put(bx, ry, '|', C.fg);
            tag(bx + 1, ry, s.banner, C.hl, false);
            g.put(bx + n + 1, ry, '|', C.fg);
          }
          g.float(px, py, PLANE, C.fg, M.plane, true);
          if (Math.floor(s.t * 2) % 2) g.put(px + 23, ry, '*', C.accent, M.light);
        } else if (h.slot === 'drift') {
          const x = g.cols * 0.76 + Math.sin(s.t * 0.3) * 6, y = Math.max(1, B * 0.12) + Math.sin(s.t * 0.5) * 1.5;
          g.float(x, y, BALLOON, C.accent, M.balloon, true);
          tag(Math.round(x) + 4, Math.round(y) + BALLOON.length, h.i);
        } else if (h.slot === 'kite') {
          const x = Math.round(g.cols * 0.86), y = Math.round(B * 0.3 + Math.sin(s.t) * 1.5);
          g.sprite(x, y, KITE, C.accent, M.balloon);
          for (let r = 1; r < B - y - 6; r++) g.put(x + 3 + Math.round(r * 0.3), y + 6 + r, ':', C.dim, M.rope);
          tag(x + 2, y - 1, h.i);
        }
      }
      for (const t of s.tunnels) {
        const x0 = Math.round(t.x - s.off), x1 = Math.round(t.x + t.w - s.off);
        for (let x = Math.max(0, x0); x < Math.min(g.cols, x1); x++) {
          const h = 9 + Math.round(3 * Math.sin((x + s.off) * 0.08));
          for (let y = B - h; y <= B + 1; y++) g.put(x, y, hash(Math.floor(x + s.off), y) < 0.3 ? '.' : ' ', C.dim, M.rock);
          g.put(x, B - h - 1, '^', C.dim, M.rock);
        }
        g.sprite(x0 - 1, B - 6, TUNNEL_IN, C.dim, M.rock);
        g.sprite(x1 - 4, B - 6, TUNNEL_OUT, C.dim, M.rock);
      }
      for (const f of s.flyers) {
        const x = Math.round(f.x), y = Math.round(f.y);
        if (f.kind === 'ptero') g.float(f.x, f.y, PTERO[Math.floor(s.t * 4) % 2], C.fg, M.ptero);
        else if (f.kind === 'gull') g.float(f.x, f.y, [Math.sin(s.t * 5 + f.v) > 0 ? '~v~' : '-v-'], C.fg, M.gull);
        else g.sprite(x, y, MINIPLANE, C.fg, M.plane);
        if (f.i < 0) continue;
        if (f.kind === 'gull') { g.put(x + 1, y + 1, '|', C.dim, M.rope); tag(x + 1, y + 2, f.i); }
        else {
          const off = f.kind === 'ptero' ? 7 : 5;
          for (let k = 1; k <= 3; k++) g.put(x + off + k, y + 1, '~', C.dim, M.rope);
          tag(x + off + 4, y + 1, f.i, C.hl, false);
        }
      }
      // labels last, over everything
      for (const [x, y, i, fg, centred] of tags) (centred ? labelC : label)(g, s, x, y, i, fg);
      if (s.title) title(g, s, C.fg);
      if (s.walker && s.recipe.game) {
        const pad = (v) => String(Math.floor(v)).padStart(5, '0');
        const sc = `HI ${pad(s.hi)}  ${pad(s.score)}`;
        if (s.game) g.text(g.cols - sc.length - 2, 1, sc, C.fg);
        else g.text(2, 3, s.touch ? s.str.tap : s.str.space, C.dim);
        if (s.over) {
          const msg = 'G A M E   O V E R';
          g.text(Math.round((g.cols - msg.length) / 2), Math.round(B * 0.4), msg, C.fg);
          const sub = s.touch ? s.str.tapAgain : s.str.spaceAgain;
          g.text(Math.round((g.cols - len(sub)) / 2), Math.round(B * 0.4) + 2, sub, C.dim);
        }
      }
    },
  };

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
      this.s = null;
    }

    static icon(name) { return ICONS[name]; }
    // the presets the home page answers to in its URL (#dino, #mare, #aereo, #treno)
    static indexOf(slug) { return PRESETS[slug] ? slug : null; }
    // the home's random recipe, for the lab's [ random ]
    static random() { return randomRecipe(); }
    get scenario() { return scene; }
    get slug() { return this.s?.recipe.preset || ''; }
    get recipe() { return this.s?.recipe; }

    // A short name for the scene on show: its land and its hero.
    describe(lang) {
      const r = this.s?.recipe;
      if (!r) return '';
      const name = (k) => ITEM.get(k)?.name[lang];
      const hero = r.picks.find((k) => SLOT[k] && SLOT[k] !== 'flyer');
      return [name(`lands.${r.land}`), hero && name(hero)].filter(Boolean).join(' · ').toLowerCase();
    }

    // Labels and strings for the current language.
    setText(labels, titleText, str) {
      this.labels = labels;
      this.titleText = titleText;
      Object.assign(this.str, str);
      if (this.s) Object.assign(this.s, { labels, title: titleText, str: this.str });
    }

    // cellH, if given, fixes the size of a character cell (in css px).
    resize(w, h, dpr, cellH) {
      this.w = w; this.h = h; this.dpr = Math.min(dpr, 2);
      this.cellH = cellH || (w < 600 ? 13 : 15);
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

    // A random scene for the home page, or one of its presets.
    pick(preset) {
      this.compose(randomRecipe(preset));
      return scene;
    }

    // A scene from a recipe (the lab's composer, or the home's random ones).
    compose(recipe) {
      this.s = { ...this.fresh(), recipe: { picks: [], ...recipe } };
      scene.init(this.s);
    }

    fresh() {
      return {
        t: 0, cols: this.grid.cols, rows: this.grid.rows, portrait: this.h > this.w * 1.1,
        labels: this.labels, title: this.titleText, str: this.str, spots: [], hover: -1, hlBg: 3,
        special: this.special, reserved: new Set(),
        touch: matchMedia('(pointer: coarse)').matches,
      };
    }

    // The grid as plain text, one line per row.
    asText() {
      const g = this.grid, out = [];
      for (let y = 0; y < g.rows; y++) out.push(String.fromCodePoint(...g.ch.subarray(y * g.cols, (y + 1) * g.cols)).replace(/\s+$/, ''));
      return out.join('\n').replace(/\n+$/, '');
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
