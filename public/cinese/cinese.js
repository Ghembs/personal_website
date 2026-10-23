// 汉字 HSK 1–4: the characters as one cloud of billboards (Babylon.js thin
// instances, a single draw call), arranged by level, radical or phonetic family.
// Data comes from scripts/build-hanzi.mjs (see data/ and the page footer).

const COLORS = {
  level: { 1: '#f3e6c8', 2: '#e8b15a', 3: '#d9644a', 4: '#7fb0c9' },
  tone: { 1: '#e8574a', 2: '#f0b34a', 3: '#6fbf73', 4: '#5d9de6', 5: '#a8a8a8' },
};
const LEVEL_NAMES = { 1: 'HSK 1', 2: 'HSK 2', 3: 'HSK 3', 4: 'HSK 4' };
const TONE_NAMES = { 1: '1° tono', 2: '2° tono', 3: '3° tono', 4: '4° tono', 5: 'neutro' };
const TONES = { āēīōūǖ: 1, áéíóúǘ: 2, ǎěǐǒǔǚ: 3, àèìòùǜ: 4 };
const IDS = /[⿰-⿻？]/;
const GLYPH = 1.1;            // world size of a character
const TRANSITION = 1.4;       // seconds

const $ = (s) => document.querySelector(s);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function toneOf(py) {
  for (const ch of py || '') for (const [marks, t] of Object.entries(TONES)) if (marks.includes(ch)) return t;
  return 5;
}
const plain = (py) => (py || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase();

// ---------- layouts ----------

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function sphere(k, n, r) {
  const y = 1 - (2 * (k + 0.5)) / n, s = Math.sqrt(1 - y * y), a = k * GOLDEN;
  return [Math.cos(a) * s * r, y * r, Math.sin(a) * s * r];
}

function ball(k, n, r) {
  const [x, y, z] = sphere(k, n, 1);
  const d = r * Math.cbrt((k + 0.5) / n);
  return [x * d, y * d, z * d];
}

// Concentric shells, HSK 1 inside.
function layoutLevels(chars) {
  const out = new Float32Array(chars.length * 3);
  const byLevel = {};
  chars.forEach((x, i) => (byLevel[x.level] ||= []).push(i));
  // Each shell is at least as wide as its count needs for an even density.
  let r = 0;
  for (const list of Object.keys(byLevel).sort().map((lv) => byLevel[lv])) {
    r = Math.max(r + 4, 0.55 * Math.sqrt(list.length));
    list.forEach((i, k) => out.set(sphere(k, list.length, r), i * 3));
  }
  return out;
}

// One ball per group, groups packed along a flat spiral, biggest first;
// `loose` members ring the whole thing.
function layoutGroups(chars, groups, loose = []) {
  const out = new Float32Array(chars.length * 3);
  const sorted = [...groups.values()].sort((a, b) => b.length - a.length);
  const placed = [];
  let t = 0;
  for (const g of sorted) {
    const r = 0.8 * Math.sqrt(g.length) + 0.7;
    let x, y, z;
    // a spiral that also climbs and dips, so the galaxy has some thickness
    for (;; t += 0.04) {
      x = Math.cos(t) * 0.8 * t;
      z = Math.sin(t) * 0.8 * t;
      y = Math.sin(t * 1.7) * Math.min(9, t * 0.45);
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y, p.z - z) > p.r + r + 0.6)) break;
    }
    placed.push({ x, y, z, r });
    g.forEach((i, k) => {
      const [dx, dy, dz] = g.length === 1 ? [0, 0, 0] : ball(k, g.length, r);
      out.set([x + dx, y + dy, z + dz], i * 3);
    });
  }
  const R = Math.max(...placed.map((p) => Math.hypot(p.x, p.z) + p.r), 10) + 6;
  loose.forEach((i, k) => {
    const a = (k / loose.length) * Math.PI * 2;
    const rr = R + 3 * Math.sin(k * 1.7);
    out.set([Math.cos(a) * rr, Math.sin(k * 0.9) * 3, Math.sin(a) * rr], i * 3);
  });
  // Fit everything in about the same radius as the level shells.
  let m = 0;
  for (let i = 0; i < out.length; i += 3) m = Math.max(m, Math.hypot(out[i], out[i + 1], out[i + 2]));
  const k = 24 / m;
  for (let i = 0; i < out.length; i++) out[i] *= k;
  return out;
}

// ---------- page ----------

async function main() {
  const [hsk, ced, dec] = await Promise.all(['hsk', 'cedict', 'decomp'].map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
  const chars = hsk.chars;
  const N = chars.length;
  const index = new Map(chars.map((x, i) => [x.c, i]));
  const reading = chars.map(({ c }) => ced.chars[c]?.[0]?.[0] || dec[c]?.py || '');
  const tone = reading.map(toneOf);

  const wordsOf = new Map();
  for (const w of hsk.words) for (const ch of new Set(w.w)) if (index.has(ch)) (wordsOf.get(ch) || wordsOf.set(ch, []).get(ch)).push(w);

  // Radical groups.
  const radicals = new Map();
  chars.forEach(({ c }, i) => {
    const r = dec[c]?.r || '?';
    (radicals.get(r) || radicals.set(r, []).get(r)).push(i);
  });

  // Phonetic families: characters sharing a phonetic component, plus that
  // component itself when it is an HSK character (青 with 请 清 情 晴).
  const phon = new Map();
  chars.forEach(({ c }) => {
    const e = dec[c]?.e;
    if (e?.t === 'pictophonetic' && e.p) (phon.get(e.p) || phon.set(e.p, new Set()).get(e.p)).add(c);
  });
  for (const [p, set] of phon) if (index.has(p)) set.add(p);
  const familyOf = new Map();
  [...phon.entries()].filter(([, s]) => s.size > 1).sort((a, b) => b[1].size - a[1].size)
    .forEach(([p, s]) => s.forEach((c) => { if (!familyOf.has(c)) familyOf.set(c, p); }));
  const families = new Map();
  const loose = [];
  chars.forEach(({ c }, i) => {
    const p = familyOf.get(c);
    if (p) (families.get(p) || families.set(p, []).get(p)).push(i);
    else loose.push(i);
  });
  for (const [p, list] of families) if (list.length < 2) { families.delete(p); loose.push(...list); }

  const LAYOUTS = {
    levels: layoutLevels(chars),
    radicals: layoutGroups(chars, radicals),
    phonetic: layoutGroups(chars, families, loose),
  };

  // ---------- Babylon ----------

  const canvas = $('#scene');
  const engine = new BABYLON.Engine(canvas, true, { stencil: false, antialias: true }, false);
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.35, 58, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 6;
  camera.upperRadiusLimit = 140;
  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.004;
  camera.minZ = 0.3;
  camera.useAutoRotationBehavior = true;
  camera.autoRotationBehavior.idleRotationSpeed = 0.04;
  camera.autoRotationBehavior.idleRotationWaitTime = 4000;

  // Glyph atlas, drawn with the subset font.
  await document.fonts.load('80px HanziSerif');
  const COLS = Math.ceil(Math.sqrt(N)), CS = 96;
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasCanvas.height = COLS * CS;
  const g = atlasCanvas.getContext('2d');
  g.font = `${CS * 0.8}px HanziSerif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  chars.forEach(({ c }, i) => g.fillText(c, (i % COLS) * CS + CS / 2, Math.floor(i / COLS) * CS + CS * 0.54));
  const atlas = new BABYLON.DynamicTexture('atlas', atlasCanvas, scene, true);
  atlas.hasAlpha = true;
  atlas.anisotropicFilteringLevel = 4;
  atlas.update();

  BABYLON.Effect.ShadersStore.glyphVertexShader = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec2 cell;
    attribute vec4 tint;
    #include<instancesDeclaration>
    uniform mat4 view;
    uniform mat4 viewProjection;
    uniform vec2 cellSize;
    uniform vec3 eye;
    uniform vec2 fog;
    varying vec2 vUV;
    varying vec4 vTint;
    void main(void) {
      #include<instancesVertex>
      vec3 center = finalWorld[3].xyz;
      float s = length(finalWorld[0].xyz);
      vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
      vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
      gl_Position = viewProjection * vec4(center + (right * position.x + up * position.y) * s, 1.0);
      vUV = (cell + uv) * cellSize;
      float d = distance(eye, center);
      // fade with distance, and right in front of the camera
      vTint = vec4(tint.rgb, tint.a * (1.0 - 0.8 * smoothstep(fog.x, fog.y, d)) * smoothstep(1.5, 7.0, d));
    }`;
  BABYLON.Effect.ShadersStore.glyphFragmentShader = `
    precision highp float;
    varying vec2 vUV;
    varying vec4 vTint;
    uniform sampler2D atlas;
    void main(void) {
      float a = texture2D(atlas, vUV).a * vTint.a;
      if (a < 0.01) discard;
      gl_FragColor = vec4(vTint.rgb, a);
    }`;
  const mat = new BABYLON.ShaderMaterial('glyph', scene, { vertex: 'glyph', fragment: 'glyph' }, {
    attributes: ['position', 'uv', 'cell', 'tint'],
    uniforms: ['world', 'view', 'viewProjection', 'cellSize', 'eye', 'fog'],
    samplers: ['atlas'],
    needAlphaBlending: true,
  });
  mat.setTexture('atlas', atlas);
  mat.setVector2('cellSize', new BABYLON.Vector2(1 / COLS, 1 / COLS));
  mat.backFaceCulling = false;
  mat.disableDepthWrite = true;

  const mesh = BABYLON.MeshBuilder.CreatePlane('glyphs', { size: 1 }, scene);
  mesh.material = mat;
  mesh.alwaysSelectAsActiveMesh = true;   // instances spread far from the plane's bounds
  mesh.isPickable = false;

  const matrices = new Float32Array(N * 16);
  const cells = new Float32Array(N * 2);
  const tints = new Float32Array(N * 4);
  chars.forEach((_, i) => {
    // atlas rows counted from the bottom: the texture is flipped on upload
    cells.set([i % COLS, COLS - 1 - Math.floor(i / COLS)], i * 2);
    matrices.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], i * 16);
  });
  mesh.thinInstanceSetBuffer('matrix', matrices, 16, false);
  mesh.thinInstanceSetBuffer('cell', cells, 2, true);
  mesh.thinInstanceSetBuffer('tint', tints, 4, false);

  // ---------- state ----------

  const pos = new Float32Array(LAYOUTS.levels);
  let from = new Float32Array(pos), to = LAYOUTS.levels, tStart = -1;
  const scale = new Float32Array(N).fill(0);
  const alpha = new Float32Array(N).fill(0);
  let view = 'levels', colorMode = 'level', maxLevel = 4;
  let selected = -1, hovered = -1;
  let related = new Set(), highlight = new Set();
  let lines = null;
  const target = BABYLON.Vector3.Zero();

  function setColors() {
    chars.forEach((x, i) => {
      const [r, g2, b] = hex(colorMode === 'level' ? COLORS.level[x.level] : COLORS.tone[tone[i]]);
      tints.set([r, g2, b], i * 4);
    });
    const names = colorMode === 'level' ? LEVEL_NAMES : TONE_NAMES;
    $('#legend').innerHTML = Object.entries(names)
      .map(([k, n]) => `<span style="--c:${COLORS[colorMode][k]}">${n}</span>`).join('');
  }

  function setView(v) {
    view = v;
    from = new Float32Array(pos);
    to = LAYOUTS[v];
    tStart = performance.now() / 1000;
    clearLines();
    document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  }

  const visible = (i) => chars[i].level <= maxLevel;

  // Who is linked to the selection in the current view.
  function relatedTo(i) {
    const c = chars[i].c, out = new Set();
    if (view === 'radicals') radicals.get(dec[c]?.r || '?').forEach((j) => out.add(j));
    else if (view === 'phonetic') {
      const p = familyOf.get(c);
      if (p) families.get(p)?.forEach((j) => out.add(j));
    } else {
      for (const w of wordsOf.get(c) || []) if (w.level <= maxLevel) for (const ch of w.w) if (index.has(ch)) out.add(index.get(ch));
    }
    out.delete(i);
    return out;
  }

  function clearLines() {
    lines?.dispose();
    lines = null;
  }

  function drawLines() {
    clearLines();
    if (selected < 0 || !related.size) return;
    const p = (i) => new BABYLON.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
    const list = [...related].filter(visible).map((j) => [p(selected), p(j)]);
    if (!list.length) return;
    lines = BABYLON.MeshBuilder.CreateLineSystem('rel', { lines: list }, scene);
    lines.color = new BABYLON.Color3(0.94, 0.9, 0.82);
    lines.alpha = 0.22;
    lines.isPickable = false;
  }

  // ---------- frame ----------

  scene.onBeforeRenderObservable.add(() => {
    const now = performance.now() / 1000;
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.1);
    if (tStart >= 0) {
      const t = Math.min(1, (now - tStart) / TRANSITION), e = ease(t);
      for (let k = 0; k < pos.length; k++) pos[k] = from[k] + (to[k] - from[k]) * e;
      if (t >= 1) { tStart = -1; drawLines(); }
    }
    const focus = selected >= 0 || highlight.size > 0;
    const k = 1 - Math.exp(-dt * 8);
    for (let i = 0; i < N; i++) {
      let s = 1, a = 1;
      if (!visible(i)) { s = 0.55; a = 0.07; }
      else if (i === selected) { s = 2.4; }
      else if (related.has(i) || highlight.has(i)) { s = 1.35; }
      else if (focus) { a = 0.32; }
      if (i === hovered && visible(i)) s *= 1.3;
      scale[i] += (s - scale[i]) * k;
      alpha[i] += (a - alpha[i]) * k;
      const sc = scale[i] * GLYPH;
      const m = i * 16;
      matrices[m] = sc; matrices[m + 5] = sc; matrices[m + 10] = sc;
      matrices[m + 12] = pos[i * 3]; matrices[m + 13] = pos[i * 3 + 1]; matrices[m + 14] = pos[i * 3 + 2];
      tints[i * 4 + 3] = alpha[i];
    }
    mesh.thinInstanceBufferUpdated('matrix');
    mesh.thinInstanceBufferUpdated('tint');

    if (selected >= 0) target.set(pos[selected * 3], pos[selected * 3 + 1], pos[selected * 3 + 2]);
    else target.set(0, 0, 0);
    BABYLON.Vector3.LerpToRef(camera.target, target, 1 - Math.exp(-dt * 3), camera.target);
    // On narrow screens the card is a bottom sheet: keep the selection above it.
    const lift = selected >= 0 && canvas.clientWidth <= 700 ? camera.radius * 0.17 : 0;
    camera.targetScreenOffset.y += (lift - camera.targetScreenOffset.y) * (1 - Math.exp(-dt * 3));
    mat.setVector3('eye', camera.position);
    mat.setVector2('fog', new BABYLON.Vector2(camera.radius * 0.7, camera.radius * 2));
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());

  // ---------- picking: project the centres, nearest one under the pointer ----------

  const tmp = new BABYLON.Vector3();
  function pickAt(x, y) {
    const vp = scene.getTransformMatrix(), vm = camera.getViewMatrix();
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const focal = H / 2 / Math.tan(camera.fov / 2);
    let best = -1, bestD = Infinity;
    for (let i = 0; i < N; i++) {
      if (!visible(i)) continue;
      tmp.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      const zv = BABYLON.Vector3.TransformCoordinates(tmp, vm).z;
      if (zv <= camera.minZ) continue;
      const p = BABYLON.Vector3.TransformCoordinates(tmp, vp);
      const sx = ((p.x + 1) / 2) * W, sy = ((1 - p.y) / 2) * H;
      const r = Math.max(10, (scale[i] * GLYPH * focal) / zv * 0.55);
      const d = Math.hypot(sx - x, sy - y);
      if (d < r && d / r + zv * 0.002 < bestD) { bestD = d / r + zv * 0.002; best = i; }
    }
    return best;
  }

  const hoverEl = $('#hover');
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    const i = pickAt(e.offsetX, e.offsetY);
    if (i >= 0) select(i); else deselect();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    hovered = pickAt(e.offsetX, e.offsetY);
    canvas.style.cursor = hovered >= 0 ? 'pointer' : 'grab';
    hoverEl.hidden = hovered < 0;
    if (hovered >= 0) {
      hoverEl.innerHTML = `<span class="hz">${chars[hovered].c}</span> ${reading[hovered]}`;
      hoverEl.style.left = `${e.clientX}px`;
      hoverEl.style.top = `${e.clientY}px`;
    }
  });
  canvas.addEventListener('pointerleave', () => { hovered = -1; hoverEl.hidden = true; });

  // ---------- card ----------

  const card = $('#card');
  let writer = null;

  const chip = (c, extra = '') => {
    const d = dec[c], go = index.has(c);
    const py = go ? reading[index.get(c)] : d?.py?.split(',')[0] || '';
    const def = (d?.def || '').split(/[;,]/)[0];
    return `<${go ? 'button' : 'span'} class="chip${go ? ' go' : ''}" ${go ? `data-go="${c}"` : ''}>` +
      `<span class="hz">${c}</span>${py ? `<small>${py}</small>` : ''}${def ? ` ${def}` : ''}${extra}</${go ? 'button' : 'span'}>`;
  };

  function renderCard(i) {
    const { c, level } = chars[i];
    const entries = ced.chars[c] || [];
    const d = dec[c] || {};
    card.querySelector('.big').textContent = c;
    card.querySelector('.level').textContent = `HSK ${level}`;
    card.querySelector('.readings').innerHTML = entries.length
      ? entries.slice(0, 3).map(([py]) => `<span style="color:${COLORS.tone[toneOf(py)]}">${py}</span>`).join('')
      : `<span>${d.py || ''}</span>`;

    const [first, ...others] = entries;
    card.querySelector('.meanings').innerHTML = `<h2>Significati</h2>` +
      (first ? `<ol>${first[1].map((x) => `<li>${x}</li>`).join('')}</ol>` : `<p class="muted">${d.def || '—'}</p>`) +
      others.filter(([, defs]) => defs.length).map(([py, defs]) => `<div class="other">${py}: ${defs.slice(0, 2).join('; ')}</div>`).join('');

    const parts = [...(d.d || '')].filter((x) => !IDS.test(x) && x !== c);
    const e = d.e;
    let ety = '';
    if (e?.t === 'pictophonetic') ety = `Fonetico <span class="hz">${e.p || '?'}</span>, semantico <span class="hz">${e.s || '?'}</span>${e.h ? ` (${e.h})` : ''}.`;
    else if (e?.h) ety = `${e.t === 'pictographic' ? 'Pittogramma' : 'Ideogramma'}: ${e.h}.`;
    card.querySelector('.parts').innerHTML = `<h2>Composizione</h2><div class="chips">` +
      (d.r ? chip(d.r, ' <small>radicale</small>') : '') +
      parts.filter((x) => x !== d.r).map((x) => chip(x)).join('') + `</div>` +
      (ety ? `<div class="ety">${ety}</div>` : '');

    const p = familyOf.get(c);
    const fam = p ? families.get(p) : null;
    card.querySelector('.family').innerHTML = fam && fam.length > 1
      ? `<h2>Famiglia fonetica di <span class="hz">${p}</span></h2><div class="chips">` +
        fam.filter((j) => j !== i).map((j) => chip(chars[j].c)).join('') + `</div>`
      : '';

    const words = (wordsOf.get(c) || []).filter((w) => w.level <= maxLevel && w.w !== c)
      .sort((a, b) => a.level - b.level || a.w.length - b.w.length).slice(0, 30);
    card.querySelector('.words').innerHTML = `<h2>Parole fino a HSK ${maxLevel}</h2>` + (words.length
      ? words.map((w) => {
        const info = ced.words[w.w];
        const gl = info?.d?.[0] || '';
        const cl = info?.cl ? ` · classificatore ${info.cl.map(([h, py]) => `<span class="hz">${h}</span> ${py}`).join(', ')}` : '';
        return `<div class="word"><span class="hz">${w.w}</span><span class="py">${w.py}</span><span class="gl">${gl}</span>` +
          `<span class="lv">HSK ${w.level}${w.pos ? ` · ${w.pos}` : ''}${cl}</span></div>`;
      }).join('')
      : `<p class="muted">Nessuna parola fino a questo livello.</p>`);

    const el = $('#writer');
    el.innerHTML = '';
    writer = window.HanziWriter ? HanziWriter.create(el, c, {
      width: 96, height: 96, padding: 6,
      strokeColor: '#efe6d2', radicalColor: '#c8503c', outlineColor: 'rgba(239,230,210,0.15)',
      highlightColor: '#e8b15a', drawingColor: '#efe6d2',
      showCharacter: false, strokeAnimationSpeed: 1.3, delayBetweenStrokes: 140,
    }) : null;
    writer?.animateCharacter();
    card.scrollTop = 0;
  }

  function select(i) {
    selected = i;
    related = relatedTo(i);
    highlight = new Set();
    renderCard(i);
    card.hidden = false;
    if (camera.radius > 34) camera.radius = 34;
    if (tStart < 0) drawLines();
    history.replaceState(null, '', `#${encodeURIComponent(chars[i].c)}`);
  }

  function deselect() {
    selected = -1;
    related = new Set();
    card.hidden = true;
    clearLines();
    history.replaceState(null, '', location.pathname);
  }

  card.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) select(index.get(go.dataset.go));
    const w = e.target.closest('[data-writer]');
    if (w && writer) w.dataset.writer === 'quiz' ? writer.quiz() : writer.animateCharacter();
  });
  card.querySelector('.close').addEventListener('click', deselect);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') deselect(); });

  // ---------- controls ----------

  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    setView(b.dataset.view);
    if (selected >= 0) related = relatedTo(selected);
  }));
  document.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
    maxLevel = +b.dataset.level;
    document.querySelectorAll('[data-level]').forEach((x) => x.classList.toggle('on', +x.dataset.level <= maxLevel));
    if (selected >= 0) { related = relatedTo(selected); renderCard(selected); drawLines(); }
  }));
  document.querySelectorAll('[data-level]').forEach((x) => x.classList.add('on'));
  document.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => {
    colorMode = b.dataset.color;
    document.querySelectorAll('[data-color]').forEach((x) => x.classList.toggle('on', x === b));
    setColors();
    mesh.thinInstanceBufferUpdated('tint');
  }));

  // A character selects it; pinyin (tones optional) highlights every match.
  $('#search').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    highlight = new Set();
    if (!q) return;
    const han = [...q].find((ch) => index.has(ch));
    if (han) { select(index.get(han)); return; }
    const p = plain(q).replace(/\s+/g, '');
    const toneQ = /[1-5]$/.test(p) ? +p.slice(-1) : 0;
    const base = toneQ ? p.slice(0, -1) : p;
    chars.forEach((_, i) => {
      const ok = (ced.chars[chars[i].c] || []).some(([py]) => plain(py) === base && (!toneQ || toneOf(py) === toneQ));
      if (ok && visible(i)) highlight.add(i);
    });
  });

  setColors();
  $('#loading').classList.add('done');
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (index.has(fromHash)) select(index.get(fromHash));
}

main().catch((e) => {
  console.error(e);
  $('#loading').textContent = 'Qualcosa è andato storto nel caricamento.';
});
