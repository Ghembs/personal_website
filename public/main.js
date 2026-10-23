// Landing: three scenes, each on its own canvas — a Canvas2D tunnel (kaleido.js),
// ascii scenes (scenes.js) and an ink handscroll (shanshui.js) — and a p5 WEBGL
// pipeline (source -> ascii post-process) that carries every transition through
// a grid of characters. DOM links follow the scene in every mode.

// mix: tunnel (0) or another picture (1); shan: that picture is the handscroll
// rather than the ascii scene; invert: dark ink on light paper, for the ascii pass.
const MODES = [
  { name: 'tunnel', ascii: 0, mix: 0, shan: 0, invert: 0, color: 1, paper: [7, 7, 12], ink: [255, 255, 255], hl: [214, 212, 204] },
  { name: 'scene', ascii: 0, mix: 1, shan: 0, invert: 1, color: 1, paper: [247, 247, 247], ink: [83, 83, 83], hl: [32, 33, 36] },
  { name: 'shan shui', ascii: 0, mix: 1, shan: 1, invert: 1, color: 1, paper: [239, 233, 220], ink: [34, 32, 28], hl: [34, 32, 28] },
];
const SHAN = 2;

const GLYPHS = {
  ascii: { chars: ' .,:-=+*coxO#%@', square: false, font: '400 {s}px "JetBrains Mono", monospace' },
  hanzi: { chars: ' 丶一二十人大口日目田回国晶鬱', square: true,
           font: '400 {s}px "Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif' },
};

const TRANSITION = 4.5;      // seconds
const KALEIDO_DPR = 1.5;     // the tunnel canvas is larger than the screen: cap its density
const SNAP_SIZE = 1024;      // tunnel copy used as texture by the ascii pass

const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.3 : 1;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const smooth = (a, b, v) => ease(clamp01((v - a) / (b - a)));
const rand = (a, b) => a + Math.random() * (b - a);

function sketch(p) {
  let srcShader, asciiShader, fb, kc, snap, kaleido, shan, shanSnap, scenes, sceneSnap;
  const shanEl = document.getElementById('shan');
  const sceneEl = document.getElementById('scene');
  let snapStale = true;
  let atlases = {};
  let glyphSet = 'ascii';
  let cellW = 9, cellH = 15;

  let T = 0;                 // scene time, slowed down on hover
  let rot = 0;               // cylinder rotation
  let timeScale = 1, targetScale = 1;

  let modeIndex = 0;
  let from = { ...MODES[0] }, to = MODES[0], transStart = -99;
  const cur = { ...MODES[0] };
  let nextSwitch = rand(14, 20);

  const nodes = [...document.querySelectorAll('#links .node')];
  const links = nodes.filter((el) => !el.classList.contains('title'));
  const titleEl = nodes.find((el) => el.classList.contains('title'));
  const hudButtons = [...document.querySelectorAll('#hud button')];
  let linkStyle = null;       // 'k' tunnel, 'a' ascii transition, 'g' ascii scene, 's' shan shui
  let asciiStyle = false;

  // ---------- setup ----------

  p.setup = () => {
    const density = Math.min(window.devicePixelRatio || 1, 2);
    p.pixelDensity(density);
    const c = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
    c.parent('stage');
    p.noStroke();
    srcShader = p.createShader(VERT, SOURCE_FRAG);
    asciiShader = p.createShader(VERT, ASCII_FRAG);
    // The source pass is only ever read at cell centres: density 1 is plenty.
    fb = p.createFramebuffer({ depth: false, density: 1 });

    // The tunnel is a plain 2D canvas, rotated by CSS. The ascii pass reads a
    // small copy of it (a p5.Image is only re-uploaded when marked modified).
    kc = document.createElement('canvas');
    kc.id = 'kaleido';
    document.getElementById('stage').insertBefore(kc, document.getElementById('links'));
    kaleido = new Kaleido(kc, links.map((el) => el.textContent.toUpperCase()));
    snap = p.createImage(SNAP_SIZE, SNAP_SIZE);
    shan = new Shanshui(shanEl, links.map((el) => (el.dataset.shan === 'seal' ? null : el.dataset.shan)));
    shan.resize(p.width, p.height, density);
    shanSnap = p.createImage(SNAP_SIZE, SNAP_SIZE);
    // Paint the first panels while nothing else is going on.
    (window.requestIdleCallback || setTimeout)(() => shan.update(0));
    kaleido.resize(p.width, p.height, Math.min(density, KALEIDO_DPR));
    scenes = new Scenes(sceneEl, links.map((el) => el.dataset.ascii), titleEl.dataset.ascii);
    scenes.resize(p.width, p.height, density);
    scenes.pick();
    sceneSnap = p.createImage(SNAP_SIZE, SNAP_SIZE);

    atlases.ascii = makeAtlas(GLYPHS.ascii);
    atlases.hanzi = makeAtlas(GLYPHS.hanzi);
    computeCells();
    initLinks();
    setStyle('k');
    kaleido.build();
    applyPalette();
    markHud();
    // #dino, #mare, #aereo open that scene directly.
    const direct = Scenes.indexOf(location.hash.slice(1));
    if (direct !== null) goTo(1, true, direct);
  };

  function makeAtlas({ chars, square, font }) {
    const list = [...chars];
    const gh = 64, gw = square ? 64 : 38;
    const g = p.createGraphics(gw * list.length, gh);
    g.pixelDensity(1);
    const ctx = g.drawingContext;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, g.width, g.height);
    ctx.fillStyle = '#fff';
    ctx.font = font.replace('{s}', Math.round(gh * (square ? 0.82 : 0.78)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    list.forEach((ch, i) => ctx.fillText(ch, (i + 0.5) * gw, gh * 0.54));
    return { g, n: list.length };
  }

  function computeCells() {
    const small = p.width < 600;
    if (GLYPHS[glyphSet].square) {
      cellH = small ? 14 : 18;
      cellW = cellH;
    } else {
      cellH = small ? 12 : 15;
      cellW = Math.round(cellH * 0.6);
    }
    // Make DOM monospace text land exactly on the shader's grid.
    const fs = Math.round(cellH * 0.82);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `700 ${fs}px "JetBrains Mono", monospace`;
    const adv = ctx.measureText('M').width;
    const root = document.documentElement.style;
    root.setProperty('--cell-fs', fs + 'px');
    root.setProperty('--cell-h', cellH + 'px');
    root.setProperty('--cell-ls', (cellW - adv) + 'px');
    if (asciiStyle) applyAsciiMetrics();
  }

  function applyAsciiMetrics() {
    for (const el of nodes) {
      el.style.fontSize = 'var(--cell-fs)';
      el.style.lineHeight = 'var(--cell-h)';
      el.style.letterSpacing = 'var(--cell-ls)';
      el._w = [...el.dataset.ascii].length * cellW;
      el._h = cellH;
    }
  }

  function applyPalette() {
    const pal = kaleido.palette;
    const root = document.documentElement.style;
    root.setProperty('--k-bg', pal.bg);
    root.setProperty('--k-ink', pal.inks[0]);
    root.setProperty('--k-ink2', pal.inks[1]);
  }

  // ---------- links ----------

  // Links are tiles of the tunnel (kaleido.links); the DOM element is only
  // an invisible hit area laid over its tile, and the label in ascii modes.
  function initLinks() {
    links.forEach((el) => {
      el.dataset.label = el.textContent;
      el.addEventListener('pointerenter', () => { el._hover = true; targetScale = 0.08; });
      el.addEventListener('pointerleave', () => { el._hover = false; targetScale = 1; });
    });
    titleEl.dataset.label = titleEl.textContent;
  }

  function setStyle(style) {
    linkStyle = style;
    asciiStyle = style === 'a';
    for (const el of nodes) {
      el.classList.toggle('a', style === 'a');
      el.classList.toggle('k', style === 'k');
      el.classList.toggle('s', style === 's');
      el.classList.toggle('g', style === 'g');
      el.style.width = el.style.height = '';
      if (style === 'a') {
        scramble(el);
      } else {
        el.textContent = el.dataset.label;
        el.style.fontSize = el.style.lineHeight = el.style.letterSpacing = '';
      }
    }
    if (style === 'a') applyAsciiMetrics();
    if (style === 'k') {
      for (const el of nodes) { el._w = el._kw = el.offsetWidth; el._h = el._kh = el.offsetHeight; }
      kaleido.coreRadius = Math.hypot(titleEl._w, titleEl._h) / 2 + 22;
      kaleido.titleLines = titleEl.dataset.label.toUpperCase().split(/\s+/);
      kaleido.titleSize = parseFloat(getComputedStyle(titleEl).fontSize);
      kaleido.dirty = true;
    }
    // In an ascii scene the scene writes title and labels itself: the DOM
    // links are transparent hit areas over them.
    titleEl.style.visibility = style === 'g' ? 'hidden' : '';
    if (style === 's') {
      // Title and seal are laid out by CSS, as an inscription; the seal sits below.
      for (const el of nodes) { el.style.transform = ''; el.style.opacity = '1'; el.style.visibility = 'visible'; }
      document.documentElement.style.setProperty('--title-h', `${titleEl.offsetHeight}px`);
    }
  }

  function scramble(el) {
    el._scrambleStart = performance.now();
  }

  const NOISE_CHARS = '#%@*+=-:01<>/\\|';
  function updateScramble(el, now) {
    if (el._scrambleStart == null) return;
    const target = el.dataset.ascii;
    const k = (now - el._scrambleStart) / 700;
    if (k >= 1) {
      el.textContent = target;
      el._scrambleStart = null;
      return;
    }
    const chars = [...target];
    const done = Math.floor(k * chars.length);
    el.textContent = chars
      .map((c, i) => (i < done || c === ' ' ? c : NOISE_CHARS[(Math.random() * NOISE_CHARS.length) | 0]))
      .join('');
  }

  // Hit areas laid over the painted elements; the seal is placed by CSS.
  function placeShanLinks() {
    const rects = shan.linkRects();
    links.forEach((el, i) => {
      if (el.dataset.shan === 'seal') return;
      const r = rects[i];
      el.style.visibility = r ? 'visible' : 'hidden';
      if (!r) return;
      el.style.width = `${r.w}px`;
      el.style.height = `${r.h}px`;
      el.style.transform = `translate(${r.x}px, ${r.y}px)`;
    });
  }

  function placeSceneLinks() {
    const spots = scenes.spots, cw = scenes.cellW, ch = scenes.cellH;
    let hover = -1;
    links.forEach((el, i) => {
      const r = spots[i];
      el.style.visibility = r ? 'visible' : 'hidden';
      el.style.opacity = '1';
      if (el._hover) hover = i;
      if (!r) return;
      el.style.width = `${r.len * cw}px`;
      el.style.height = `${ch}px`;
      el.style.transform = `translate(${r.col * cw}px, ${r.row * ch}px)`;
    });
    scenes.hover = hover;
  }

  function updateLinks() {
    if (linkStyle === 's') { placeShanLinks(); return; }
    if (linkStyle === 'g') { placeSceneLinks(); return; }
    const W = p.width, H = p.height;
    const flat = Math.max(cur.ascii, cur.mix);
    const now = performance.now();

    const shanRects = cur.shan > 0.001 ? shan.linkRects() : [];
    const spots = cur.mix > 0.001 ? scenes.spots : [];
    links.forEach((el, i) => {
      const tile = kaleido.links[i];
      // Redraw the (otherwise static) tunnel only when a link changes look.
      const hover = !!el._hover, flip = kaleido.flipFor(tile, rot);
      if (tile.hover !== hover || tile.flip !== flip) kaleido.dirty = true;
      tile.hover = hover;
      const g = kaleido.geometry(tile, rot);
      const deg = (g.angle * 180) / Math.PI;
      // Hidden behind the hexagon or the fog: not clickable either.
      const kOpacity = g.rm > kaleido.coreRadius * 1.05 && kaleido.alpha(tile.z) > 0.3 ? 1 : 0;
      const sx = g.width / (el._kw || 1), sy = g.height / (el._kh || 1);

      // Away from the tunnel, head for the link's place in the ascii scene, then
      // for its painted element in shan shui (the seal: top right).
      const sp = spots[i];
      const inScene = sp ? { x: (sp.col + sp.len / 2) * scenes.cellW, y: (sp.row + 0.5) * scenes.cellH } : null;
      const sr = shanRects[i];
      const inShan = sr ? { x: sr.x + sr.w / 2, y: sr.y + sr.h / 2 }
        : el.dataset.shan === 'seal' ? { x: W * 0.9, y: H * 0.5 } : null;
      let c = inScene || { x: g.x, y: g.y };
      if (inShan) c = { x: lerp(c.x, inShan.x, cur.shan), y: lerp(c.y, inShan.y, cur.shan) };
      // links with no place in the picture fade out on the way there
      const seen = lerp(inScene ? 1 : 0, inShan ? 1 : 0, cur.shan);

      place(el, lerp(g.x, c.x, cur.mix), lerp(g.y, c.y, cur.mix),
        deg * (1 - flat), lerp(sx, 1, flat), lerp(sy, 1, flat),
        lerp(kOpacity, seen, cur.mix));
      updateScramble(el, now);
    });
    place(titleEl, W / 2, H / 2, 0, 1, 1, 1);
    updateScramble(titleEl, now);
  }

  function place(el, x, y, deg, sx, sy, opacity) {
    const w = el._w || 0, h = el._h || 0;
    let tx = x - w / 2, ty = y - h / 2;
    if (asciiStyle) {
      tx = Math.round(tx / cellW) * cellW;
      ty = Math.round(ty / cellH) * cellH;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      el.style.transform = `translate(${tx}px, ${ty}px) rotate(${deg}deg) scale(${sx}, ${sy})`;
    }
    el.style.opacity = opacity.toFixed(3);
    el.style.visibility = opacity < 0.02 ? 'hidden' : 'visible';
  }

  // ---------- modes ----------

  function goTo(i, manual, scene) {
    if (i === modeIndex && p.millis() / 1000 - transStart > TRANSITION) return;
    // Back to the tunnel: a new structure, hidden by the ascii it comes out of.
    if (i === 0 && modeIndex !== 0) kaleido.build();
    // A new ascii scene each time; the page takes its colours.
    if (MODES[i].name === 'scene' && modeIndex !== i) {
      scenes.pick(scene);
      toastSoon = scenes.name;
    }
    from = { ...cur, paper: [...cur.paper], ink: [...cur.ink], hl: [...cur.hl] };
    to = MODES[i].name === 'scene' ? sceneLook() : MODES[i];
    modeIndex = i;
    transStart = p.millis() / 1000;
    nextSwitch = transStart + (manual ? 25 : rand(14, 22));
    markHud();
  }

  let toastSoon = null;
  function sceneLook() {
    const l = scenes.look;
    return { ...MODES[1], paper: l.paper, ink: l.ink, hl: l.hl, invert: l.light ? 1 : 0 };
  }

  function updateTransition(now) {
    const t = clamp01((now - transStart) / TRANSITION);
    const up = to.ascii > from.ascii, down = to.ascii < from.ascii;
    // Going towards ascii, the pixels lead; going back, the colours lead.
    let pa = ease(up ? seg(t, 0, 0.55) : down ? seg(t, 0.45, 1) : t);
    let po = ease(up ? seg(t, 0.45, 1) : down ? seg(t, 0, 0.55) : t);
    cur.ascii = lerp(from.ascii, to.ascii, pa);
    // Between two non-ascii scenes (tunnel <-> shan shui) dip through the ascii
    // grid and swap the picture while it is all characters.
    const swap = from.mix !== to.mix || from.shan !== to.shan;
    if (from.ascii < 0.5 && to.ascii < 0.5 && swap) {
      cur.ascii = t < 0.5 ? ease(seg(t, 0, 0.42)) : 1 - ease(seg(t, 0.58, 1));
      po = ease(seg(t, 0.46, 0.54));
    }
    cur.mix = lerp(from.mix, to.mix, po);
    cur.color = lerp(from.color, to.color, po);
    cur.shan = lerp(from.shan, to.shan, po);
    cur.invert = lerp(from.invert, to.invert, po);
    // In the scene the colours follow it (the dinosaur's night, a lightning flash).
    if (t >= 1 && modeIndex === 1) Object.assign(to, sceneLook());
    for (const k of ['paper', 'ink', 'hl']) cur[k] = from[k].map((v, j) => lerp(v, to[k][j], po));

    const want = cur.ascii > 0.5 ? 'a' : cur.shan > 0.5 ? 's' : cur.mix > 0.5 ? 'g' : 'k';
    if (want !== linkStyle) setStyle(want);

    const root = document.documentElement.style;
    root.setProperty('--paper', `rgb(${cur.paper.map(Math.round)})`);
    root.setProperty('--hl', `rgb(${cur.hl.map(Math.round)})`);
    document.body.dataset.look = cur.ascii > 0.5 ? 'ascii' : cur.shan > 0.5 ? 'shan' : cur.mix > 0.5 ? 'scene' : 'tunnel';
    document.body.style.background = `rgb(${cur.paper.map(Math.round)})`;

    // A dinosaur game in progress keeps the scene on screen.
    if (scenes.busy && modeIndex === 1) nextSwitch = Math.max(nextSwitch, now + 5);
    if (now > nextSwitch) {
      let i;
      do { i = (Math.random() * MODES.length) | 0; } while (i === modeIndex);
      goTo(i, false);
    }
  }

  function markHud() {
    hudButtons.forEach((b, i) => b.classList.toggle('on', i === modeIndex));
  }

  // ---------- draw ----------

  p.draw = () => {
    const dt = Math.min(p.deltaTime / 1000, 0.1);
    timeScale += (targetScale - timeScale) * Math.min(1, dt * 6);
    const sdt = dt * timeScale * motion;
    T += sdt;
    updateTransition(p.millis() / 1000);

    rot += sdt * kaleido.rotSpeed;
    updateLinks();

    // Pure modes show their own canvases: no WebGL work at all.
    const pureTunnel = cur.ascii < 0.001 && cur.mix < 0.001 && cur.shan < 0.001;
    const pureShan = cur.ascii < 0.001 && cur.shan > 0.999;
    const pureScene = cur.ascii < 0.001 && cur.mix > 0.999 && cur.shan < 0.001;
    const pure = pureTunnel || pureShan || pureScene;
    const sceneOn = cur.mix > 0.001 && cur.shan < 0.999;
    if (sceneOn) { scenes.update(sdt); scenes.render(); }
    if (cur.mix < 0.999 && cur.shan < 0.999) {
      kaleido.update(sdt);
      if (kaleido.dirty) {
        kaleido.draw(rot);
        snapStale = true;
      }
    }
    kc.style.transform = `translate(-50%, -50%) rotate(${rot}rad)`;
    if (cur.shan > 0.001) shan.update(sdt);
    kc.style.visibility = pureTunnel ? 'visible' : 'hidden';
    shanEl.style.visibility = pureShan ? 'visible' : 'hidden';
    sceneEl.style.visibility = pureScene ? 'visible' : 'hidden';
    if (pureScene && toastSoon) { toast(toastSoon); toastSoon = null; }
    p.canvas.style.visibility = pure ? 'hidden' : 'visible';

    if (!pure) {
      const res = [p.width, p.height];
      if (snapStale && cur.mix < 0.999) {
        snap.drawingContext.drawImage(kc, 0, 0, SNAP_SIZE, SNAP_SIZE);
        snap.setModified(true);
        snapStale = false;
      }
      if (cur.shan > 0.001) {
        shan.drawView(shanSnap.drawingContext, SNAP_SIZE, SNAP_SIZE);
        shanSnap.setModified(true);
      }
      if (sceneOn) {
        sceneSnap.drawingContext.drawImage(sceneEl, 0, 0, SNAP_SIZE, SNAP_SIZE);
        sceneSnap.setModified(true);
      }

      fb.begin();
      p.clear();
      p.shader(srcShader);
      setSourceUniforms(cur.mix, cur.shan);
      p.rect(0, 0, p.width, p.height);
      fb.end();

      const atlas = atlases[glyphSet];
      p.shader(asciiShader);
      asciiShader.setUniform('uSrc', fb);
      asciiShader.setUniform('uAtlas', atlas.g);
      asciiShader.setUniform('uRes', res);
      asciiShader.setUniform('uDensity', p.pixelDensity());
      asciiShader.setUniform('uCell', [cellW, cellH]);
      asciiShader.setUniform('uGlyphs', atlas.n);
      asciiShader.setUniform('uAscii', cur.ascii);
      asciiShader.setUniform('uColorMode', cur.color);
      asciiShader.setUniform('uInk', cur.ink.map((v) => v / 255));
      asciiShader.setUniform('uPaper', cur.paper.map((v) => v / 255));
      asciiShader.setUniform('uInvert', cur.invert);
      p.rect(0, 0, p.width, p.height);
    }
  };

  function setSourceUniforms(mix, shanAmount) {
    srcShader.setUniform('uRes', [p.width, p.height]);
    srcShader.setUniform('uDensity', fb.density);
    srcShader.setUniform('uTime', T);
    srcShader.setUniform('uMix', mix);
    srcShader.setUniform('uShan', shanAmount);
    srcShader.setUniform('uShanTex', shanSnap);
    srcShader.setUniform('uKaleido', snap);
    srcShader.setUniform('uKRot', rot);
    srcShader.setUniform('uKSize', 2 * kaleido.R);
    srcShader.setUniform('uSceneTex', sceneSnap);
  }

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    kaleido.resize(p.width, p.height, Math.min(p.pixelDensity(), KALEIDO_DPR));
    computeCells();
    shan.resize(p.width, p.height, p.pixelDensity());
    scenes.resize(p.width, p.height, p.pixelDensity());
    if (linkStyle === 'k') setStyle('k');
    kaleido.build();
  };

  // ---------- easter eggs & controls ----------

  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  hudButtons.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.mode, true)));

  // A click on the background: new inks in the tunnel; in an ascii scene the
  // dinosaur jumps, and the other scenes give way to the next one.
  function sceneAction() {
    if (scenes.action()) return;
    scenes.pick();
    Object.assign(to, sceneLook());
    toast(scenes.name);
  }
  const inScene = () => modeIndex === 1 && cur.ascii < 0.5 && cur.mix > 0.5;

  document.getElementById('stage').addEventListener('click', (e) => {
    if (e.target.closest('.node')) return;
    if (inScene()) { sceneAction(); return; }
    if (cur.mix > 0.5) return;
    const pal = kaleido.nextPalette();
    applyPalette();
    toast(`inchiostri: ${pal.name}`);
  });

  const boring = document.getElementById('boring');
  boring.querySelector('ul').innerHTML = links
    .map((el) => `<li><a href="${el.getAttribute('href')}">${el.dataset.label || el.textContent}</a></li>`)
    .join('');
  document.getElementById('boring-close').addEventListener('click', () => { boring.hidden = true; p.loop(); });

  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '3') goTo(+e.key - 1, true);
    // 八 bā sounds like 发 fā, to prosper: the luckiest key opens the handscroll.
    if (e.key === '8') { goTo(SHAN, true); toast('八 · 发'); }
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (inScene()) { sceneAction(); return; }
      if (e.key === 'ArrowUp') return;
      let i;
      do { i = (Math.random() * MODES.length) | 0; } while (i === modeIndex);
      goTo(i, true);
    }
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('nihao')) {
      glyphSet = glyphSet === 'ascii' ? 'hanzi' : 'ascii';
      scenes.hanzi = glyphSet === 'hanzi';
      computeCells();
      if (modeIndex !== 1) goTo(1, true);
      toast(glyphSet === 'hanzi' ? '你好！ 字符 → 汉字' : 'ascii, di nuovo');
    }
    if (e.key === 'v' && cur.mix < 0.5) {
      kaleido.setFlight(!kaleido.flight);
      toast(kaleido.flight ? 'volo: il tunnel ti viene incontro' : 'orbita: il tunnel gira su se stesso');
    }
    if (typed.endsWith('boring')) {
      boring.hidden = false;
      p.noLoop();
    }
  });

  console.log(
    '%c你好, curioso.%c\nProva a digitare "nihao" o "boring", o clicca sullo sfondo.',
    'font: 20px serif; color: #c33', 'font: 12px monospace'
  );
}

(async () => {
  try {
    await Promise.all([
      document.fonts.load('400 20px "JetBrains Mono"'),
      document.fonts.load('700 20px "JetBrains Mono"'),
      document.fonts.load('300 20px "Unbounded"'),
      document.fonts.load('600 20px "Space Grotesk"'),
    ]);
  } catch (e) { /* fall back to system fonts */ }
  new p5(sketch);
})();
