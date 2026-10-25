// Shan shui (山水): an endless ink-landscape handscroll.
// The drawing algorithms (brush stroke, layered mountains, plateaus, texture
// strokes, feet, the eight trees, water, boat hull, the original's buildings,
// pylon and robed figures) are ported to Canvas2D, and simplified, from
// LingDong-'s shan-shui-inf (MIT, https://github.com/LingDong-/shan-shui-inf).
// The houses, village, pavilion, hill pagoda, bridge, wanderer, birds and the
// far ridges are new, simpler drawings. The catalogue at the end lists them all
// for the lab's painter.
//
// Unlike the original, which rebuilds a huge SVG on every scroll, the scroll is
// cut into panels: each panel is painted once (ink on a white layer, multiplied
// onto paper) into its own canvas, and the panels slide by CSS transform.
// Elements are planned per panel with seeded randomness, so an element that
// straddles two panels is drawn identically in both.
//
// Links live on painted elements (a pavilion, a pagoda, a walker, a boat, birds);
// the 中文 link is the red seal, drawn by CSS.

const Shanshui = (() => {
  const WORLD_H = 800;      // world height, the original's
  const PW = 800;           // panel width in world units
  const SPEED = 22;         // world units per second
  const MAX_DPR = 1.5;
  const LINK_CYCLE = 2;     // world link elements are spread over this many panels
  const ROLES = ['pavilion', 'pagoda', 'walker', 'boat', 'birds'];
  const ROLE_KEY = { pavilion: 'buildings.pavilion', pagoda: 'buildings.pagoda', walker: 'figures.walker', boat: 'water.boat', birds: 'figures.birds' };

  // ---------- randomness ----------

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let R = Math.random;   // random source of the element being drawn

  const normRand = (m, M) => m + R() * (M - m);
  const randChoice = (arr) => arr[Math.floor(arr.length * R())];
  function wtrand(f) {
    for (;;) { const x = R(); if (R() < f(x)) return x; }
  }
  const randGaussian = () => wtrand((x) => Math.exp(-24 * (x - 0.5) ** 2)) * 2 - 1;

  // ---------- noise (p5-style Perlin, as in the original) ----------

  const PERLIN_SIZE = 4095, YWRAPB = 4, YWRAP = 1 << YWRAPB, ZWRAPB = 8, ZWRAP = 1 << ZWRAPB;
  let perlin = null;
  const scos = (i) => 0.5 * (1 - Math.cos(i * Math.PI));

  function noiseSeed(seed) {
    let z = seed >>> 0;
    perlin = new Float64Array(PERLIN_SIZE + 1);
    for (let i = 0; i <= PERLIN_SIZE; i++) {
      z = (1664525 * z + 1013904223) % 4294967296;
      perlin[i] = z / 4294967296;
    }
  }

  function noise(x, y = 0, z = 0) {
    x = Math.abs(x); y = Math.abs(y); z = Math.abs(z);
    let xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    let xf = x - xi, yf = y - yi, zf = z - zi;
    let r = 0, ampl = 0.5;
    for (let o = 0; o < 4; o++) {
      let of = xi + (yi << YWRAPB) + (zi << ZWRAPB);
      const rxf = scos(xf), ryf = scos(yf);
      let n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
      let n2 = perlin[(of + YWRAP) & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);
      of += ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
      let n3 = perlin[(of + YWRAP) & PERLIN_SIZE];
      n3 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);
      n1 += scos(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= 0.5;
      xi <<= 1; xf *= 2; yi <<= 1; yf *= 2; zi <<= 1; zf *= 2;
      if (xf >= 1) { xi++; xf--; }
      if (yf >= 1) { yi++; yf--; }
      if (zf >= 1) { zi++; zf--; }
    }
    return r;
  }

  function loopNoise(ns) {
    const dif = ns[ns.length - 1] - ns[0];
    let lo = 100, hi = -100;
    for (let i = 0; i < ns.length; i++) {
      ns[i] += (dif * (ns.length - 1 - i)) / (ns.length - 1);
      lo = Math.min(lo, ns[i]); hi = Math.max(hi, ns[i]);
    }
    for (let i = 0; i < ns.length; i++) ns[i] = (ns[i] - lo) / (hi - lo || 1);
  }

  const grey = (a) => `rgba(100,100,100,${a.toFixed(3)})`;

  // ---------- primitives ----------

  function path(c, pts) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  }

  function fillPoly(c, pts, fill) {
    if (pts.length < 2) return;
    path(c, pts);
    c.fillStyle = fill;
    c.fill();
  }

  function polyline(c, pts, col, wid) {
    if (pts.length < 2) return;
    path(c, pts);
    c.lineWidth = wid;
    c.strokeStyle = col;
    c.stroke();
  }

  // The original's polyline: a fill, an outline, or both.
  function poly(c, pts, { fil = null, str = fil, wid = 0 } = {}) {
    if (fil) fillPoly(c, pts, fil);
    if (str && wid > 0) polyline(c, pts, str, wid);
  }

  const midPt = (...pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  // Subdivides a polyline, reso points per segment (the last point is kept as is).
  function div(pts, reso) {
    const out = [], tl = (pts.length - 1) * reso;
    for (let i = 0; i < tl; i++) {
      const a = pts[Math.floor(i / reso)], b = pts[Math.ceil(i / reso)], p = (i % reso) / reso;
      out.push([a[0] * (1 - p) + b[0] * p, a[1] * (1 - p) + b[1] * p]);
    }
    if (pts.length) out.push(pts[pts.length - 1]);
    return out;
  }

  // A smooth curve through the midpoints of a polyline (rational quadratic Béziers).
  function bezmh(P, w = 1) {
    if (P.length === 2) P = [P[0], midPt(P[0], P[1]), P[1]];
    const out = [];
    for (let j = 0; j < P.length - 2; j++) {
      const p0 = j === 0 ? P[j] : midPt(P[j], P[j + 1]);
      const p1 = P[j + 1];
      const p2 = j === P.length - 3 ? P[j + 2] : midPt(P[j + 1], P[j + 2]);
      const pl = 20;
      for (let i = 0; i < pl + (j === P.length - 3); i++) {
        const t = i / pl, u = (1 - t) ** 2 + 2 * t * (1 - t) * w + t * t;
        out.push([((1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * p1[0] * w + t * t * p2[0]) / u,
          ((1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * p1[1] * w + t * t * p2[1]) / u]);
      }
    }
    return out;
  }

  // Records drawing calls to replay them later: the original builds bark and
  // twigs before the trunk but paints them over it.
  const METHODS = new Set(['beginPath', 'moveTo', 'lineTo', 'closePath', 'fill', 'stroke', 'arc', 'save', 'restore', 'translate']);
  function recorder() {
    const ops = [];
    return new Proxy({}, {
      get: (_, k) => (k === 'replay'
        ? (c) => { for (const [m, a] of ops) { if (m === '=') c[a[0]] = a[1]; else c[m](...a); } }
        : METHODS.has(k) ? (...a) => { ops.push([k, a]); } : undefined),
      set: (_, k, v) => { ops.push(['=', [k, v]]); return true; },
    });
  }

  // The brush stroke: a polyline swollen by fun() along its length, with noise.
  function stroke(c, pts, { wid = 2, col = 'rgba(200,200,200,0.9)', noi = 0.5, out = 1,
    fun = (x) => Math.sin(x * Math.PI) } = {}) {
    if (pts.length < 3) return;
    const v0 = [], v1 = [];
    const n0 = R() * 10;
    for (let i = 1; i < pts.length - 1; i++) {
      let w = wid * fun(i / pts.length);
      w = w * (1 - noi) + w * noi * noise(i * 0.5, n0);
      const a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
      const a2 = Math.atan2(pts[i][1] - pts[i + 1][1], pts[i][0] - pts[i + 1][0]);
      let a = (a1 + a2) / 2;
      if (a < a2) a += Math.PI;
      v0.push([pts[i][0] + w * Math.cos(a), pts[i][1] + w * Math.sin(a)]);
      v1.push([pts[i][0] - w * Math.cos(a), pts[i][1] - w * Math.sin(a)]);
    }
    const poly = [pts[0], ...v0, pts[pts.length - 1], ...v1.reverse(), pts[0]];
    path(c, poly);
    c.fillStyle = col;
    c.fill();
    if (out > 0) {
      c.lineWidth = out;
      c.strokeStyle = col;
      c.stroke();
    }
  }

  function blob(c, x, y, { col = 'rgba(200,200,200,0.9)', ...o } = {}) {
    fillPoly(c, blobPts(x, y, o), col);
  }
  function blobPts(x, y, { len = 20, wid = 5, ang = 0, noi = 0.5,
    fun = (x) => (x <= 1 ? Math.pow(Math.sin(x * Math.PI), 0.5) : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5)) } = {}) {
    const reso = 20, la = [];
    for (let i = 0; i <= reso; i++) {
      const p = (i / reso) * 2;
      const xo = len / 2 - Math.abs(p - 1) * len;
      const yo = (fun(p) * wid) / 2;
      la.push([Math.hypot(xo, yo), Math.atan2(yo, xo)]);
    }
    const ns = [], n0 = R() * 10;
    for (let i = 0; i <= reso; i++) ns.push(noise(i * 0.05, n0));
    loopNoise(ns);
    return la.map(([l, a], i) => {
      const k = ns[i] * noi + (1 - noi);
      return [x + Math.cos(a + ang) * l * k, y + Math.sin(a + ang) * l * k];
    });
  }

  // Texture strokes laid between the contour layers of a shape.
  function texture(c, ptlist, { tex = 400, wid = 1.5, len = 0.2, sha = 0,
    noi = (x) => 30 / x,
    col = () => grey(R() * 0.3),
    dis = () => (R() > 0.5 ? (1 / 3) * R() : 2 / 3 + (1 / 3) * R()) } = {}) {
    const rows = ptlist.length, cols = ptlist[0].length;
    const list = [];
    for (let i = 0; i < tex; i++) {
      const mid = (dis() * cols) | 0;
      const hlen = Math.floor(R() * (cols * len));
      const start = Math.min(Math.max(mid - hlen, 0), cols);
      const end = Math.min(Math.max(mid + hlen, 0), cols);
      const layer = (i / tex) * (rows - 1);
      const lf = Math.floor(layer), lc = Math.ceil(layer), p = layer - lf;
      const line = [];
      for (let j = start; j < end; j++) {
        const x = ptlist[lf][j][0] * p + ptlist[lc][j][0] * (1 - p);
        const y = ptlist[lf][j][1] * p + ptlist[lc][j][1] * (1 - p);
        const n = noi(layer + 1);
        line.push([x + n * (noise(x, j * 0.5) - 0.5), y + n * (noise(y, j * 0.5) - 0.5)]);
      }
      list.push(line);
    }
    if (sha) {
      for (let j = 0; j < list.length; j += 2) stroke(c, list[j], { col: 'rgba(100,100,100,0.1)', wid: sha });
    }
    for (let j = sha; j < list.length; j += 1 + sha) stroke(c, list[j], { col: col(j / list.length), wid });
  }

  // ---------- vegetation ----------

  function tree01(c, x, y, { hei = 50, wid = 3, a = 0.5 } = {}) {
    const reso = 10, ns = [];
    for (let i = 0; i < reso; i++) ns.push([noise(i * 0.5), noise(i * 0.5, 0.5)]);
    const l1 = [], l2 = [];
    for (let i = 0; i < reso; i++) {
      const nx = x, ny = y - (i * hei) / reso;
      if (i >= reso / 4) {
        for (let j = 0; j < (reso - i) / 5; j++) {
          blob(c, nx + (R() - 0.5) * wid * 1.2 * (reso - i), ny + (R() - 0.5) * wid, {
            len: R() * 20 * (reso - i) * 0.2 + 10,
            wid: R() * 6 + 3,
            ang: ((R() - 0.5) * Math.PI) / 6,
            col: grey(Math.min(1, R() * 0.2 + a)),
          });
        }
      }
      l1.push([nx + (ns[i][0] - 0.5) * wid - wid / 2, ny]);
      l2.push([nx + (ns[i][1] - 0.5) * wid + wid / 2, ny]);
    }
    polyline(c, l1, grey(a), 1.5);
    polyline(c, l2, grey(a), 1.5);
  }

  function tree02(c, x, y, { hei = 16, wid = 8, clu = 5, a = 0.5 } = {}) {
    for (let i = 0; i < clu; i++) {
      blob(c, x + randGaussian() * clu * 4, y + randGaussian() * clu * 4, {
        ang: Math.PI / 2,
        fun: (x) => (x <= 1 ? Math.pow(Math.sin(x * Math.PI) * x, 0.5) : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5)),
        wid: R() * wid * 0.75 + wid * 0.5,
        len: R() * hei * 0.75 + hei * 0.5,
        col: grey(a),
      });
    }
  }

  // Trees 03-08 of the original. 03 and 07 are slender trees clad in blobs of
  // leaves (07 dark, shaded in patches); 04, 05, 06 and 08 grow a trunk with
  // limbs (branch), bark (barkify) and twigs (twig).
  const leafFun = (x) => (x <= 1 ? Math.pow(Math.sin(x * Math.PI) * x, 0.5) : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5));

  function tree03(c, x, y, { hei = 50, wid = 5, ben = () => 0, a = 0.5 } = {}) {
    const reso = 10, ns = [];
    for (let i = 0; i < reso; i++) ns.push([noise(i * 0.5), noise(i * 0.5, 0.5)]);
    const leaves = recorder(), l1 = [], l2 = [];
    for (let i = 0; i < reso; i++) {
      const nx = x + ben(i / reso) * 100, ny = y - (i * hei) / reso;
      if (i >= reso / 5) {
        for (let j = 0; j < (reso - i) * 2; j++) {
          const ox = R() * wid * 2 * (Math.log(50 * ((reso - i) / reso) + 1) / 3.95);
          blob(leaves, nx + ox * randChoice([-1, 1]), ny + (R() - 0.5) * wid * 2, {
            len: ox * 2, wid: R() * 6 + 3, ang: ((R() - 0.5) * Math.PI) / 6, col: grey(Math.min(1, R() * 0.2 + a)),
          });
        }
      }
      l1.push([nx + (((ns[i][0] - 0.5) * wid - wid / 2) * (reso - i)) / reso, ny]);
      l2.push([nx + (((ns[i][1] - 0.5) * wid + wid / 2) * (reso - i)) / reso, ny]);
    }
    poly(c, l1.concat(l2.reverse()), { fil: '#fff', str: grey(a), wid: 1.5 });
    leaves.replay(c);
  }

  // A bent limb from the origin: its two outlines.
  function branch({ hei = 300, wid = 6, ang = 0, det = 10, ben = Math.PI * 0.2 } = {}) {
    const tl0 = [[0, 0]];
    let nx = 0, ny = 0, a0 = 0;
    for (let i = 0; i < 3; i++) {
      a0 += (ben / 2 + (R() * ben) / 2) * randChoice([-1, 1]);
      nx += (Math.cos(a0) * hei) / 3;
      ny -= (Math.sin(a0) * hei) / 3;
      tl0.push([nx, ny]);
    }
    const ta = Math.atan2(tl0[tl0.length - 1][1], tl0[tl0.length - 1][0]);
    const tlist = tl0.map(([px, py]) => {
      const a = Math.atan2(py, px), d = Math.hypot(px, py);
      return [d * Math.cos(a - ta + ang), d * Math.sin(a - ta + ang)];
    });
    const t1 = [], t2 = [], tl = (tlist.length - 1) * det;
    let lx = 0, ly = 0;
    for (let i = 0; i < tl; i++) {
      const pa = tlist[Math.floor(i / det)], pb = tlist[Math.ceil(i / det)], p = (i % det) / det;
      const qx = pa[0] * (1 - p) + pb[0] * p, qy = pa[1] * (1 - p) + pb[1] * p;
      const an = Math.atan2(qy - ly, qx - lx);
      const woff = ((noise(i * 0.3) - 0.5) * wid * hei) / 80;
      const b = p === 0 ? R() * wid : 0;
      const nw = wid * (((tl - i) / tl) * 0.5 + 0.5);
      t1.push([qx + Math.cos(an + Math.PI / 2) * (nw + woff + b), qy + Math.sin(an + Math.PI / 2) * (nw + woff + b)]);
      t2.push([qx + Math.cos(an - Math.PI / 2) * (nw - woff + b), qy + Math.sin(an - Math.PI / 2) * (nw - woff + b)]);
      lx = qx; ly = qy;
    }
    return [t1, t2];
  }

  function twig(c, tx, ty, dep, { dir = 1, sca = 1, wid = 1, ang = 0, lea = [true, 12] } = {}) {
    const tw = [], tl = 10, hs = R() * 0.5 + 0.5;
    const a0 = ((R() * Math.PI) / 6) * dir + ang;
    for (let i = 0; i < tl; i++) {
      const mx = dir * (-1 / Math.pow(i / tl + 1, 5) + 1) * 50 * sca * hs, my = -i * 5 * sca;
      const a = Math.atan2(my, mx), d = Math.hypot(mx, my);
      const nx = Math.cos(a + a0) * d, ny = Math.sin(a + a0) * d;
      tw.push([nx + tx, ny + ty]);
      if ((i === ((tl / 3) | 0) || i === (((tl * 2) / 3) | 0)) && dep > 0) {
        twig(c, nx + tx, ny + ty, dep - 1, { ang, sca: sca * 0.8, wid, dir: dir * randChoice([-1, 1]), lea });
      }
      if (i === tl - 1 && lea[0]) {
        for (let j = 0; j < 5; j++) {
          const dj = (j - 2.5) * 5;
          blob(c, nx + tx + Math.cos(ang) * dj * wid, ny + ty + (Math.sin(ang) * dj - lea[1] / (dep + 1)) * wid, {
            wid: (6 + 3 * R()) * wid, len: (15 + 12 * R()) * wid,
            ang: ang / 2 + Math.PI / 2 + Math.PI * 0.2 * (R() - 0.5),
            col: grey(Math.min(1, 0.5 + dep * 0.2)), fun: leafFun,
          });
        }
      }
    }
    stroke(c, tw, { wid: 1, fun: (x) => Math.cos((x * Math.PI) / 2), col: grey(0.5) });
  }

  // Bark: knots and short marks along a trunk, and its broken outline.
  function barkify(c, x, y, tr) {
    for (let i = 2; i < tr[0].length - 1; i++) {
      const a0 = Math.atan2(tr[0][i][1] - tr[0][i - 1][1], tr[0][i][0] - tr[0][i - 1][0]);
      const a1 = Math.atan2(tr[1][i][1] - tr[1][i - 1][1], tr[1][i][0] - tr[1][i - 1][0]);
      const p = R();
      const nx = tr[0][i][0] * (1 - p) + tr[1][i][0] * p, ny = tr[0][i][1] * (1 - p) + tr[1][i][1] * p;
      if (R() < 0.2) {
        blob(c, nx + x, ny + y, { noi: 1, len: 15, wid: 6 - Math.abs(p - 0.5) * 10, ang: (a0 + a1) / 2, col: grey(0.6) });
      } else {
        // a bark mark: the outline of a thin blob, wavering
        const pts = blobPts(nx + x, ny + y, { len: 10 + 10 * R(), wid: 5 - Math.abs(p - 0.5) * 10, ang: (a0 + a1) / 2 });
        const fr = R();
        stroke(c, pts, { wid: 0.8, noi: 0, col: grey(0.4), out: 0, fun: (v) => Math.sin((v + fr) * Math.PI * 3) });
      }
      if (R() < 0.05) {
        const jl = R() * 2 + 2, [qx, qy, qa] = randChoice([[tr[0][i][0], tr[0][i][1], a0], [tr[1][i][0], tr[1][i][1], a1]]);
        for (let j = 0; j < jl; j++) {
          blob(c, qx + x + Math.cos(qa) * (j - jl / 2) * 4, qy + y + Math.sin(qa) * (j - jl / 2) * 4,
            { wid: 4, len: 4 + 6 * R(), ang: a0 + Math.PI / 2, col: grey(0.6) });
        }
      }
    }
    const outline = tr[0].concat(tr[1].slice().reverse()), runs = [[]];
    for (const pt of outline) { if (R() < 0.5) runs.push([]); else runs[runs.length - 1].push(pt); }
    runs.forEach((run, i) => {
      const pts = div(run, 4).map((v, j) => [
        v[0] + (noise(i, j * 0.1, 1) - 0.5) * (15 + 5 * randGaussian()) + x,
        v[1] + (noise(i, j * 0.1, 2) - 0.5) * (15 + 5 * randGaussian()) + y]);
      stroke(c, pts, { wid: 1.5, col: grey(0.7), out: 0 });
    });
  }

  // The trunk's fill and its shaded edge, then what grew on it.
  function trunk(c, x, y, outline, a, ...over) {
    poly(c, outline.map(([px, py]) => [px + x, py + y]), { fil: '#fff' });
    stroke(c, outline.slice(1, -1).map(([px, py]) => [px + x, py + y]),
      { col: grey(a + R() * 0.1), wid: 2.5, fun: () => Math.sin(1), noi: 0.9, out: 0 });
    for (const r of over) r.replay(c);
  }

  // A big tree: trunk, a few limbs, twigs with leaves.
  function tree04(c, x, y, { hei = 300, wid = 6 } = {}) {
    const tx = recorder(), tw = recorder();
    let tr = branch({ hei, wid, ang: -Math.PI / 2 });
    barkify(tx, x, y, tr);
    tr = tr[0].concat(tr[1].reverse());
    let out = [];
    for (let i = 0; i < tr.length; i++) {
      if ((i >= tr.length * 0.3 && i <= tr.length * 0.7 && R() < 0.1) || i === tr.length / 2 - 1) {
        const ba = Math.PI * 0.2 - Math.PI * 1.4 * (i > tr.length / 2);
        const br = branch({ hei: hei * (R() + 1) * 0.3, wid: wid * 0.5, ang: ba });
        br[0].splice(0, 1); br[1].splice(0, 1);
        const off = (v) => [v[0] + tr[i][0], v[1] + tr[i][1]];
        barkify(tx, x, y, [br[0].map(off), br[1].map(off)]);
        for (let j = 0; j < br[0].length; j++) {
          if (R() < 0.2 || j === br[0].length - 1) {
            twig(tw, br[0][j][0] + tr[i][0] + x, br[0][j][1] + tr[i][1] + y, 1, {
              wid: hei / 300, ang: ba > -Math.PI / 2 ? ba : ba + Math.PI, sca: (0.5 * hei) / 300, dir: ba > -Math.PI / 2 ? 1 : -1,
            });
          }
        }
        out = out.concat(br[0].concat(br[1].reverse()).map(off));
      } else out.push(tr[i]);
    }
    trunk(c, x, y, out, 0.4, tx, tw);
  }

  // A pine: a straight trunk, level branches, tufts of needles.
  function tree05(c, x, y, { hei = 300, wid = 5 } = {}) {
    const tx = recorder(), tw = recorder();
    let tr = branch({ hei, wid, ang: -Math.PI / 2, ben: 0 });
    barkify(tx, x, y, tr);
    tr = tr[0].concat(tr[1].reverse());
    let out = [];
    for (let i = 0; i < tr.length; i++) {
      const p = Math.abs(i - tr.length * 0.5) / (tr.length * 0.5);
      if ((i >= tr.length * 0.2 && i <= tr.length * 0.8 && i % 3 === 0 && R() > p) || i === tr.length / 2 - 1) {
        const bar = R() * 0.2;
        const ba = -bar * Math.PI - (1 - bar * 2) * Math.PI * (i > tr.length / 2);
        const br = branch({ hei: hei * (0.3 * p - R() * 0.05), wid: wid * 0.5, ang: ba, ben: 0.5 });
        br[0].splice(0, 1); br[1].splice(0, 1);
        for (let j = 0; j < br[0].length; j++) {
          if (j % 20 === 0 || j === br[0].length - 1) {
            twig(tw, br[0][j][0] + tr[i][0] + x, br[0][j][1] + tr[i][1] + y, 0, {
              wid: hei / 300, ang: ba > -Math.PI / 2 ? ba : ba + Math.PI, sca: (0.2 * hei) / 300, dir: ba > -Math.PI / 2 ? 1 : -1, lea: [true, 5],
            });
          }
        }
        out = out.concat(br[0].concat(br[1].reverse()).map((v) => [v[0] + tr[i][0], v[1] + tr[i][1]]));
      } else out.push(tr[i]);
    }
    trunk(c, x, y, out, 0.4, tx, tw);
  }

  // A bare tree: limbs forking three times, leafless twigs.
  function tree06(c, x, y, { hei = 100, wid = 6 } = {}) {
    const tx = recorder(), tw = recorder();
    const frac = (xoff, yoff, dep, { hei = 300, wid = 5, ang = 0, ben = Math.PI * 0.2 }) => {
      let tr = branch({ hei, wid, ang, ben, det: hei / 20 });
      barkify(tx, xoff, yoff, tr);
      tr = tr[0].concat(tr[1].reverse());
      let out = [];
      for (let i = 0; i < tr.length; i++) {
        if (((R() < 0.025 && i >= tr.length * 0.2 && i <= tr.length * 0.8) || i === ((tr.length / 2) | 0) - 1 || i === ((tr.length / 2) | 0) + 1) && dep > 0) {
          const bar = 0.02 + R() * 0.08;
          const ba = bar * Math.PI - bar * 2 * Math.PI * (i > tr.length / 2);
          const br = frac(tr[i][0] + xoff, tr[i][1] + yoff, dep - 1, { hei: hei * (0.7 + R() * 0.2), wid: wid * 0.6, ang: ang + ba, ben: 0.55 });
          for (const b of br) {
            if (R() < 0.03) twig(tw, b[0] + tr[i][0] + xoff, b[1] + tr[i][1] + yoff, 2, { ang: ba * (R() * 0.5 + 0.75), sca: 0.3, dir: ba > 0 ? 1 : -1, lea: [false, 0] });
          }
          out = out.concat(br.map((v) => [v[0] + tr[i][0], v[1] + tr[i][1]]));
        } else out.push(tr[i]);
      }
      return out;
    };
    trunk(c, x, y, frac(x, y, 3, { hei, wid, ang: -Math.PI / 2, ben: 0 }), 0.4, tx, tw);
  }

  // A dark slender tree, its leaves shaded in small patches (the original
  // triangulates them; here they are cut into fans, then quartered down to size).
  function tree07(c, x, y, { hei = 60, wid = 4, ben = (v) => Math.sqrt(v) * 0.2 } = {}) {
    const reso = 10, ns = [];
    for (let i = 0; i < reso; i++) ns.push([noise(i * 0.5), noise(i * 0.5, 0.5)]);
    const tris = [], leaves = [], l1 = [], l2 = [];
    const split = (t) => {
      const [p, q, r] = t;
      if (Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2 <= 50) { tris.push(t); return; }
      const pq = midPt(p, q), qr = midPt(q, r), rp = midPt(r, p);
      split([p, pq, rp]); split([pq, q, qr]); split([rp, qr, r]); split([pq, qr, rp]);
    };
    for (let i = 0; i < reso; i++) {
      const nx = x + ben(i / reso) * 100, ny = y - (i * hei) / reso;
      if (i >= reso / 4) {
        leaves.push(blobPts(nx + (R() - 0.5) * wid * 1.2 * (reso - i) * 0.5, ny + (R() - 0.5) * wid * 0.5, {
          len: R() * 50 + 20, wid: R() * 12 + 12, ang: (-R() * Math.PI) / 6,
          fun: (v) => (v <= 1 ? 2.75 * v * Math.pow(1 - v, 1 / 1.8) : 2.75 * (v - 2) * Math.pow(v - 1, 1 / 1.8)),
        }));
      }
      l1.push([nx + (ns[i][0] - 0.5) * wid - wid / 2, ny]);
      l2.push([nx + (ns[i][1] - 0.5) * wid + wid / 2, ny]);
    }
    for (let i = 0; i < reso - 1; i++) { split([l1[i], l1[i + 1], l2[i + 1]]); split([l1[i], l2[i + 1], l2[i]]); }
    for (const pts of leaves) {
      const m = midPt(...pts);
      for (let k = 0; k < pts.length - 1; k++) split([m, pts[k], pts[k + 1]]);
    }
    for (const t of tris) {
      const m = midPt(...t), v = (noise(m[0] * 0.02, m[1] * 0.02) * 200 + 50) | 0, col = `rgba(${v},${v},${v},0.8)`;
      poly(c, t, { fil: col, str: col, wid: 0.5 });
    }
  }

  // A thin crooked tree, its crown a tangle of forking twigs.
  function tree08(c, x, y, { hei = 80, wid = 1 } = {}) {
    const tw = recorder();
    const ang = normRand(-1, 1) * Math.PI * 0.2;
    let tr = branch({ hei, wid, ang: -Math.PI / 2 + ang, ben: Math.PI * 0.2, det: hei / 20 });
    tr = tr[0].concat(tr[1].reverse());
    const frac = (xoff, yoff, dep, { ang = -Math.PI / 2, len = 15, ben = 0 }) => {
      const fun = dep === 0 ? (v) => Math.cos(0.5 * Math.PI * v) : () => 1;
      const ept = [xoff + Math.cos(ang) * len, yoff + Math.sin(ang) * len];
      const bfun = randChoice([(v) => Math.sin(v * Math.PI), (v) => -Math.sin(v * Math.PI)]);
      const pts = div([[xoff, yoff], [xoff + len, yoff]], 10).map((p) => [...p]);
      for (let i = 0; i < pts.length; i++) pts[i][1] += bfun(i / pts.length) * 2;
      for (const p of pts) {
        const d = distance(p, [xoff, yoff]), a = Math.atan2(p[1] - yoff, p[0] - xoff);
        p[0] = xoff + d * Math.cos(a + ang); p[1] = yoff + d * Math.sin(a + ang);
      }
      stroke(tw, pts, { fun, wid: 0.8, col: grey(0.5) });
      if (dep !== 0) {
        const nben = ben + randChoice([-1, 1]) * Math.PI * 0.001 * dep * dep;
        if (R() < 0.5) {
          frac(ept[0], ept[1], dep - 1, { ang: ang + ben + Math.PI * randChoice([normRand(-1, 0.5), normRand(0.5, 1)]) * 0.2, len: len * normRand(0.8, 0.9), ben: nben });
          frac(ept[0], ept[1], dep - 1, { ang: ang + ben + Math.PI * randChoice([normRand(-1, -0.5), normRand(0.5, 1)]) * 0.2, len: len * normRand(0.8, 0.9), ben: nben });
        } else frac(ept[0], ept[1], dep - 1, { ang: ang + ben, len: len * normRand(0.8, 0.9), ben: nben });
      }
    };
    for (let i = 0; i < tr.length; i++) {
      if (R() < 0.2) frac(x + tr[i][0], y + tr[i][1], Math.floor(4 * R()), { ang: -Math.PI / 2 - ang * R() });
      else if (i === Math.floor(tr.length / 2)) frac(x + tr[i][0], y + tr[i][1], 3, { ang: -Math.PI / 2 + ang });
    }
    trunk(c, x, y, tr, 0.6, tw);
  }

  // ---------- mountains ----------

  function foot(c, ptlist, xof) {
    const ft = [];
    const span = 10;
    let ni = 0;
    for (let i = 0; i < ptlist.length - 2; i++) {
      if (i !== ni) continue;
      ni = Math.min(ni + randChoice([1, 2]), ptlist.length - 1);
      const a = [], b = [];
      const row = ptlist[i], n = row.length;
      for (let j = 0; j < Math.min(n / 8, 10); j++) {
        a.push([row[j][0] + noise(j * 0.1, i) * 10, row[j][1]]);
        b.push([row[n - 1 - j][0] - noise(j * 0.1, i) * 10, row[n - 1 - j][1]]);
      }
      a.reverse(); b.reverse();
      for (let j = 0; j < span; j++) {
        const p = j / span;
        const x1 = row[0][0] * (1 - p) + ptlist[ni][0][0] * p;
        let y1 = row[0][1] * (1 - p) + ptlist[ni][0][1] * p;
        const x2 = row[n - 1][0] * (1 - p) + ptlist[ni][n - 1][0] * p;
        let y2 = row[n - 1][1] * (1 - p) + ptlist[ni][n - 1][1] * p;
        const vib = -1.7 * (p - 1) * Math.pow(p, 1 / 5);
        y1 += vib * 5 + noise(xof * 0.05, i) * 5;
        y2 += vib * 5 + noise(xof * 0.05, i) * 5;
        a.push([x1, y1]); b.push([x2, y2]);
      }
      ft.push(a, b);
    }
    for (const f of ft) fillPoly(c, f, '#fff');
    for (const f of ft) stroke(c, f, { col: grey(0.1 + R() * 0.1), wid: 1 });
  }

  // What grows and stands on it comes in densities (1 is the home's; the
  // buildings are the original's, off unless asked for).
  function mountain(c, xoff, yoff, seed, { hei = 300, wid = 500, tex = 200, veg = true,
    shrubs = 1, saplings = 1, leafy = 0, halls = 0, gazebos = 0, towers = 0, pylons = 0 } = {}) {
    const ptlist = [];
    const reso = [10, 50];
    let hoff = 0;
    for (let j = 0; j < reso[0]; j++) {
      hoff += (R() * yoff) / 100;
      const row = [];
      for (let i = 0; i < reso[1]; i++) {
        const x = (i / reso[1] - 0.5) * Math.PI;
        const y = Math.cos(x) * noise(x + 10, j * 0.15, seed);
        const p = 1 - j / reso[0];
        row.push([(x / Math.PI) * wid * p, -y * hei * p + hoff]);
      }
      ptlist.push(row);
    }

    c.save();
    c.translate(xoff, yoff);
    const vegetate = (draw, grow, proof = () => true) => {
      const list = [];
      for (let i = 0; i < ptlist.length; i++)
        for (let j = 0; j < ptlist[i].length; j++)
          if (grow(i, j)) list.push(ptlist[i][j]);
      for (let i = 0; i < list.length; i++) if (proof(list, i)) draw(list[i][0], list[i][1]);
    };
    const leafA = (x, y, base) => noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + base;

    // rim
    vegetate((x, y) => tree02(c, x, y - 5, { a: leafA(x, y, 0.5), clu: 2 }),
      (i, j) => { const ns = noise(j * 0.1, seed); return i === 0 && ns ** 3 < 0.1 * shrubs && Math.abs(ptlist[i][j][1]) / hei > 0.2; });

    fillPoly(c, ptlist[0].concat([[0, reso[0] * 4]]), '#fff');
    stroke(c, ptlist[0], { col: 'rgba(100,100,100,0.3)', noi: 1, wid: 3 });
    foot(c, ptlist, xoff);
    texture(c, ptlist, { tex, sha: randChoice([0, 0, 0, 0, 5]) });

    // top
    vegetate((x, y) => tree02(c, x, y, { a: leafA(x, y, 0.5) }),
      (i, j) => { const ns = noise(i * 0.1, j * 0.1, seed + 2); return ns ** 3 < 0.13 * shrubs && Math.abs(ptlist[i][j][1]) / hei > 0.5; });

    if (veg) {
      // middle
      vegetate((x, y) => {
        let ht = ((hei + y) / hei) * 70;
        ht = ht * 0.3 + R() * ht * 0.7;
        tree01(c, x, y, { hei: ht, wid: R() * 3 + 1, a: leafA(x, y, 0.3) });
      }, (i, j) => {
        const ns = noise(i * 0.2, j * 0.05, seed);
        return j % 2 && ns ** 4 < 0.018 * saplings && Math.abs(ptlist[i][j][1]) / hei < 0.3;
      }, (list, i) => {
        let n = 0;
        for (let j = 0; j < list.length; j++) {
          if (i !== j && (list[i][0] - list[j][0]) ** 2 + (list[i][1] - list[j][1]) ** 2 < 900) n++;
          if (n > 2) return true;
        }
        return false;
      });
      // bottom: taller trees at the mountain's sides
      vegetate((x, y) => {
        let ht = ((hei + y) / hei) * 110;
        ht = ht * 0.5 + R() * ht * 0.5;
        tree01(c, x, y, { hei: ht, wid: R() * 4 + 2, a: leafA(x, y, 0.3) });
      }, (i, j) => {
        const ns = noise(i * 0.2, j * 0.05, seed);
        return (j === 0 || j === ptlist[i].length - 1) && ns ** 4 < 0.018 * saplings;
      });
      // the original's bottom: leafy trees, gently bent
      if (leafy > 0) {
        vegetate((x, y) => {
          let ht = ((hei + y) / hei) * 120;
          ht = ht * 0.5 + R() * ht * 0.5;
          const bc = R() * 0.1;
          tree03(c, x, y, { hei: ht, ben: (v) => v * bc, a: leafA(x, y, 0.3) });
        }, (i, j) => {
          const ns = noise(i * 0.2, j * 0.05, seed + 5);
          return (j === 0 || j === ptlist[i].length - 1) && ns ** 4 < 0.012 * leafy;
        });
      }
    }
    // houses and gazebos at the feet, pylons, a pagoda on the summit
    if (halls + gazebos > 0) {
      vegetate((x, y) => {
        if (R() * (halls + gazebos) < halls) hall(c, x, y, { wid: normRand(40, 70), sto: randChoice([1, 2, 2, 3]), rot: R(), sty: randChoice([1, 2, 3]) });
        else gazebo(c, x, y, { sto: randChoice([1, 1, 1, 2, 2]) });
      }, (i, j) => {
        const ns = noise(i * 0.2, j * 0.05, seed + 10);
        return i !== 0 && (j === 1 || j === ptlist[i].length - 2) && ns ** 4 < 0.0055 * (halls + gazebos);
      });
    }
    if (pylons > 0) {
      vegetate((x, y) => pylon(c, x, y), (i, j) => {
        const ns = noise(i * 0.2, j * 0.05, seed + 20 * Math.PI);
        return i % 2 === 0 && (j === 1 || j === ptlist[i].length - 2) && ns ** 4 < 0.002 * pylons;
      });
    }
    if (towers > 0 && R() < 0.35 * towers) {
      const top = ptlist[1][ptlist[1].length >> 1];
      tallPagoda(c, top[0], top[1], { sto: randChoice([5, 7]), wid: 40 + R() * 20 });
    }
    c.restore();
  }

  // A plateau: a mountain cut flat at the top, a white terrace on it. Returns
  // the terrace's bounds (world units) for what grows there, or null.
  function flatMount(c, xoff, yoff, seed, { hei = 40 + R() * 400, wid = 400 + R() * 200, tex = 80, cho = 0.5 } = {}) {
    const ptlist = [], flat = [], reso = [5, 50];
    let hoff = 0;
    for (let j = 0; j < reso[0]; j++) {
      hoff += (R() * yoff) / 100;
      const row = [], fl = [];
      for (let i = 0; i < reso[1]; i++) {
        const x = (i / reso[1] - 0.5) * Math.PI;
        const y = (Math.cos(x * 2) + 1) * noise(x + 10, j * 0.1, seed);
        const p = 1 - (j / reso[0]) * 0.6;
        const nx = (x / Math.PI) * wid * p;
        let ny = -y * hei * p + hoff;
        if (ny < -100 * cho + hoff) {
          ny = -100 * cho + hoff;
          if (fl.length % 2 === 0) fl.push([nx, ny]);
        } else if (fl.length % 2 === 1) fl.push(row[row.length - 1]);
        row.push([nx, ny]);
      }
      ptlist.push(row);
      flat.push(fl);
    }
    c.save();
    c.translate(xoff, yoff);
    fillPoly(c, ptlist[0].concat([[0, reso[0] * 4]]), '#fff');
    stroke(c, ptlist[0], { col: grey(0.3), noi: 1, wid: 3 });
    texture(c, ptlist, { tex, wid: 2, dis: () => (R() > 0.5 ? 0.1 + 0.4 * R() : 0.9 - 0.4 * R()) });
    const g1 = [], g2 = [];
    for (let i = 0; i < flat.length; i += 2) {
      if (flat[i].length >= 2) { g1.push(flat[i][0]); g2.push(flat[i][flat[i].length - 1]); }
    }
    if (!g1.length) { c.restore(); return null; }
    let wb = [g1[0][0], g2[0][0]];
    for (let i = 0; i < 3; i++) {
      const p = 0.8 - i * 0.2;
      g1.unshift([wb[0] * p, g1[0][1] - 5]);
      g2.unshift([wb[1] * p, g2[0][1] - 5]);
    }
    wb = [g1[g1.length - 1][0], g2[g2.length - 1][0]];
    for (let i = 0; i < 3; i++) {
      const p = 0.6 - i * i * 0.1;
      g1.push([wb[0] * p, g1[g1.length - 1][1] + 1]);
      g2.push([wb[1] * p, g2[g2.length - 1][1] + 1]);
    }
    const d = 5, d1 = div(g1, d), d2 = div(g2, d);
    const gr = d1.reverse().concat(d2.concat([d1[0]]));
    for (let i = 0; i < gr.length; i++) {
      const v = (1 - Math.abs((i % d) - d / 2) / (d / 2)) * 0.12;
      gr[i][0] *= 1 - v + noise(gr[i][1] * 0.5) * v;
    }
    fillPoly(c, gr, '#fff');
    stroke(c, gr, { wid: 3, col: grey(0.2) });
    c.restore();
    const xs = gr.map((p) => p[0]), ys = gr.map((p) => p[1]);
    return { xmin: Math.min(...xs) + xoff, xmax: Math.max(...xs) + xoff, ymin: Math.min(...ys) + yoff, ymax: Math.max(...ys) + yoff };
  }

  // What grows on a plateau (bd: its bounds). `kind` is the original's choice:
  // 0 boulders, 1 a pine wood, 2 big trees among rocks, 3 bare trees, 4 a row of
  // dark trees; there are always shrubs, sometimes crooked trees, rarely a lodge.
  function flatDec(c, bd, { kind = randChoice([0, 0, 1, 2, 3, 4]), crooked = true, shrubs = true, lodge = R() < 0.2 } = {}) {
    const mid = (bd.ymin + bd.ymax) / 2;
    const boulder = (x, y, big) => rock(c, x, y, big ? { wid: 50 + R() * 20, hei: 40 + R() * 20 } : { wid: 10 + R() * 20, hei: 10 + R() * 20 });
    for (let j = 0; j < R() * 5; j++) boulder(normRand(bd.xmin, bd.xmax), mid + normRand(-10, 10) + 10, false);
    if (crooked) {
      for (let j = 0; j < randChoice([0, 0, 1, 2]); j++) {
        const xr = normRand(bd.xmin, bd.xmax), yr = mid + normRand(-5, 5) + 20;
        for (let k = 0; k < 2 + R() * 3; k++) tree08(c, xr + Math.min(Math.max(normRand(-30, 30), bd.xmin), bd.xmax), yr, { hei: 60 + R() * 40 });
      }
    }
    const span = () => {
      const pmin = R() * 0.5, pmax = R() * 0.5 + 0.5;
      return [bd.xmin * (1 - pmin) + bd.xmax * pmin, bd.xmin * (1 - pmax) + bd.xmax * pmax];
    };
    if (kind === 0) {
      for (let j = 0; j < R() * 3; j++) boulder(normRand(bd.xmin, bd.xmax), mid + normRand(-5, 5) + 20, true);
    } else if (kind === 1) {
      const [x0, x1] = span();
      for (let x = x0; x < x1; x += 30) tree05(c, x + 20 * normRand(-1, 1), mid + 20, { hei: 100 + R() * 200 });
      for (let j = 0; j < R() * 4; j++) boulder(normRand(bd.xmin, bd.xmax), mid + normRand(-5, 5) + 20, true);
    } else if (kind === 2) {
      for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) {
        const xr = normRand(bd.xmin, bd.xmax);
        tree04(c, xr, mid + 20);
        for (let j = 0; j < R() * 2; j++) boulder(Math.max(bd.xmin, Math.min(bd.xmax, xr + normRand(-50, 50))), mid + normRand(-5, 5) + 20, true);
      }
    } else if (kind === 3) {
      for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) tree06(c, normRand(bd.xmin, bd.xmax), mid, { hei: 60 + R() * 60 });
    } else if (kind === 4) {
      const [x0, x1] = span();
      for (let x = x0; x < x1; x += 20) tree07(c, x + 20 * normRand(-1, 1), mid + normRand(-1, 1), { hei: normRand(40, 80) });
    }
    if (shrubs) for (let i = 0; i < 50 * R(); i++) tree02(c, normRand(bd.xmin, bd.xmax), normRand(bd.ymin, bd.ymax));
    if (lodge && kind !== 4) lodgeHall(c, normRand(bd.xmin, bd.xmax), mid + 20, { wid: normRand(160, 200), hei: normRand(80, 100), per: R() });
  }

  // Distant ridges: one continuous silhouette per layer, washed into mist.
  function farRidge(c, x0, x1, base, hei, freq, layer, tone) {
    const pts = [];
    for (let x = x0 - 20; x <= x1 + 20; x += 6) {
      const n = noise(x * freq, layer * 7.3) * (0.55 + 0.45 * noise(x * freq * 0.25, layer * 3.1 + 40));
      pts.push([x, base - hei * n]);
    }
    pts.push([x1 + 20, base + 90], [x0 - 20, base + 90]);
    const g = c.createLinearGradient(0, base - hei, 0, base + 60);
    g.addColorStop(0, `rgba(${tone},${tone},${tone},1)`);
    g.addColorStop(0.65, `rgba(${tone + 25},${tone + 25},${tone + 25},0.9)`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    fillPoly(c, pts, g);
  }

  // ---------- water and boats ----------

  function water(c, xoff, yoff, { hei = 2, len = 800, clu = 10 } = {}) {
    let yk = 0;
    for (let i = 0; i < clu; i++) {
      const xk = (R() - 0.5) * (len / 8);
      yk += R() * 5;
      const lk = len / 4 + R() * (len / 4);
      const line = [];
      for (let j = -lk; j < lk; j += 5) line.push([xoff + j + xk, yoff + Math.sin(j * 0.2) * hei * noise(j * 0.1) - 20 + yk]);
      if (i) stroke(c, line, { col: grey(0.15 + R() * 0.25), wid: 1 });
    }
  }

  function figure(c, x, y, { sca = 1, dir = 1, staff = true, seated = false } = {}) {
    const col = 'rgba(70,70,70,0.85)';
    const s = sca;
    const hip = seated ? y - 5 * s : y - 10 * s;
    if (!seated) {
      stroke(c, [[x, hip], [x - 1.5 * s * dir, y - 5 * s], [x - 3 * s * dir, y]], { wid: 1.3 * s, col, fun: () => 1 });
      stroke(c, [[x, hip], [x + 2 * s * dir, y - 5 * s], [x + 3.5 * s * dir, y]], { wid: 1.3 * s, col, fun: () => 1 });
    }
    // robe
    fillPoly(c, [[x - 3 * s, y - 18 * s], [x + 3 * s, y - 18 * s], [x + 5.5 * s, hip + 1 * s], [x - 5.5 * s, hip + 1 * s]], 'rgba(90,90,90,0.75)');
    // head and conical hat
    c.beginPath();
    c.arc(x, y - 20 * s, 2.2 * s, 0, Math.PI * 2);
    c.fillStyle = col;
    c.fill();
    fillPoly(c, [[x - 6 * s, y - 21 * s], [x + 6 * s, y - 21 * s], [x, y - 25.5 * s]], 'rgba(80,80,80,0.9)');
    if (staff) stroke(c, [[x + 4 * s * dir, y - 19 * s], [x + 5 * s * dir, y - 9 * s], [x + 6 * s * dir, y]], { wid: 0.7 * s, col, fun: () => 1 });
  }

  // A fishing boat; `poler` puts the original's boatman on it instead, standing
  // under a straw hat with a punting pole.
  function boat(c, x, y, { len = 120, sca = 1, fli = false, poler = false } = {}) {
    const dir = fli ? -1 : 1;
    if (poler) {
      man(c, x + 20 * sca * dir, y, { ite: staff, hat: strawHat, sca: 0.5 * sca, fli: !fli, len: [0, 30, 20, 30, 10, 30, 30, 30, 30] });
    } else {
      figure(c, x + 22 * sca * dir, y + 2 * sca, { sca: 0.55 * sca, dir: -dir, staff: false, seated: true });
      // the fishing pole
      stroke(c, [[x + 24 * sca * dir, y - 8 * sca], [x + 55 * sca * dir, y - 30 * sca], [x + 85 * sca * dir, y - 42 * sca]], { wid: 0.6, col: 'rgba(80,80,80,0.8)', fun: () => 1 });
    }
    const f1 = (x) => Math.pow(Math.sin(x * Math.PI), 0.5) * 7 * sca;
    const f2 = (x) => Math.pow(Math.sin(x * Math.PI), 0.5) * 10 * sca;
    const p1 = [], p2 = [];
    for (let i = 0; i < len * sca; i += 5 * sca) {
      p1.push([x + i * dir, y + f1(i / len)]);
      p2.push([x + i * dir, y + f2(i / len)]);
    }
    const hull = p1.concat(p2.reverse());
    fillPoly(c, hull, '#fff');
    stroke(c, hull, { wid: 1, fun: (x) => Math.sin(x * Math.PI * 2), col: grey(0.4) });
  }

  // ---------- buildings ----------

  // Thatched / tiled roof: the original's hut, apex at (xoff, yoff).
  function roof(c, xoff, yoff, { hei = 20, wid = 70, tex = 120 } = {}) {
    const reso = [10, 10], ptlist = [];
    for (let i = 0; i < reso[0]; i++) {
      const row = [], heir = hei + hei * 0.2 * R();
      for (let j = 0; j < reso[1]; j++) {
        row.push([xoff + wid * (i / (reso[0] - 1) - 0.5) * Math.pow(j / (reso[1] - 1), 0.7), yoff + heir * (j / (reso[1] - 1))]);
      }
      ptlist.push(row);
    }
    fillPoly(c, ptlist[0].slice(0, -1).concat(ptlist[ptlist.length - 1].slice(0, -1).reverse()), '#fff');
    polyline(c, ptlist[0], grey(0.35), 1.6);
    polyline(c, ptlist[ptlist.length - 1], grey(0.35), 1.6);
    texture(c, ptlist, {
      tex, wid: 1, len: 0.25,
      col: () => `rgba(120,120,120,${(0.3 + R() * 0.3).toFixed(3)})`,
      dis: () => wtrand((a) => a * a),
      noi: () => 4,
    });
  }

  function body(c, x, top, bottom, w) {
    fillPoly(c, [[x - w / 2, top], [x + w / 2, top], [x + w / 2, bottom], [x - w / 2, bottom]], '#fff');
    for (const px of [x - w / 2, x + w / 2]) stroke(c, [[px, top], [px, (top + bottom) / 2], [px, bottom]], { wid: 1, col: grey(0.55), fun: () => 1 });
    stroke(c, [[x - w / 2, bottom], [x, bottom + 0.5], [x + w / 2, bottom]], { wid: 0.9, col: grey(0.45), fun: () => 1 });
  }

  function mound(c, x, y, w, h) {
    const rows = [];
    for (let j = 0; j < 4; j++) {
      const row = [], p = 1 - j * 0.22;
      for (let i = 0; i <= 24; i++) {
        const t = i / 24 - 0.5;
        row.push([x + t * w * p, y - h * p * Math.cos(t * Math.PI) * (0.75 + 0.25 * noise(i * 0.3, j, x * 0.01))]);
      }
      rows.push(row);
    }
    fillPoly(c, rows[0].concat([[x + w / 2, y + 6], [x - w / 2, y + 6]]), '#fff');
    stroke(c, rows[0], { col: 'rgba(100,100,100,0.35)', noi: 1, wid: 2.2 });
    texture(c, rows, { tex: 40, wid: 1.2, noi: () => 3 });
  }

  // Building styles are picked with the element's own seeded randomness,
  // so a building is the same in both panels it may straddle.

  function platform(c, x, y, w) {
    fillPoly(c, [[x - w / 2, y - 5], [x + w / 2, y - 5], [x + w / 2 + 3, y], [x - w / 2 - 3, y]], '#fff');
    stroke(c, [[x - w / 2 - 3, y], [x, y + 0.5], [x + w / 2 + 3, y]], { wid: 1.1, col: grey(0.5), fun: () => 1 });
    stroke(c, [[x - w / 2, y - 5], [x, y - 5], [x + w / 2, y - 5]], { wid: 0.7, col: grey(0.35), fun: () => 1 });
  }

  function posts(c, xs, top, bottom) {
    for (const px of xs) stroke(c, [[px, bottom], [px, (top + bottom) / 2], [px, top]], { wid: 1.3, col: grey(0.6), fun: () => 1 });
  }

  function rail(c, x, y, w) {
    stroke(c, [[x - w / 2, y], [x, y + 0.3], [x + w / 2, y]], { wid: 0.8, col: grey(0.45), fun: () => 1 });
    for (let px = x - w / 2; px <= x + w / 2 + 0.1; px += w / 6) {
      stroke(c, [[px, y], [px, y + 2.5], [px, y + 5]], { wid: 0.6, col: grey(0.4), fun: () => 1 });
    }
  }

  // Pointed roof with a finial: for hexagonal pavilions and pagoda tops.
  function spire(c, x, y, h) {
    stroke(c, [[x, y], [x, y - h * 0.5], [x, y - h]], { wid: 1.1, col: grey(0.6), fun: () => 1 });
    for (let i = 1; i <= 2; i++) {
      c.beginPath();
      c.arc(x, y - h * (0.3 + i * 0.22), 1.6 - i * 0.3, 0, Math.PI * 2);
      c.fillStyle = grey(0.6);
      c.fill();
    }
  }

  function pavilion(c, x, y, { wid = 50 } = {}) {
    const style = (R() * 3) | 0;            // 0 single roof, 1 double eaves, 2 pointed hexagonal
    const ph = wid * (0.5 + R() * 0.15), rh = wid * 0.38;
    platform(c, x, y, wid * 1.2);
    const n = style === 2 ? 3 : 2;
    posts(c, Array.from({ length: n }, (_, i) => x - wid * 0.38 + (i * wid * 0.76) / (n - 1)), y - 5 - ph, y - 5);
    if (R() < 0.6) rail(c, x, y - 5 - ph * 0.35, wid * 0.8);
    const top = y - 5 - ph;
    if (style === 2) {
      roof(c, x, top - rh * 1.4, { hei: rh * 1.4, wid: wid * 1.35 });
      spire(c, x, top - rh * 1.4, wid * 0.35);
    } else {
      roof(c, x, top - rh, { hei: rh, wid: wid * 1.5 });
      if (style === 1) {
        body(c, x, top - rh - wid * 0.22, top - rh * 0.4, wid * 0.55);
        roof(c, x, top - rh - wid * 0.22 - rh * 0.75, { hei: rh * 0.75, wid: wid * 1.05, tex: 80 });
      }
    }
  }

  function pagoda(c, x, y, { wid = 36, sto = 4 } = {}) {
    const flare = 1.45 + R() * 0.35, taper = 0.09 + R() * 0.06;
    mound(c, x, y + 4, wid * (2.8 + R() * 1.2), wid * (0.45 + R() * 0.25));
    let bottom = y + 4 - wid * 0.5;
    platform(c, x, bottom + 3, wid * 1.1);
    for (let k = 0; k < sto; k++) {
      const w = wid * (1 - k * taper), bh = wid * (k ? 0.36 : 0.5), rh = wid * 0.26;
      body(c, x, bottom - bh, bottom, w * 0.78);
      if (k === 0) stroke(c, [[x, bottom], [x, bottom - bh * 0.35], [x, bottom - bh * 0.6]], { wid: 2.2, col: grey(0.5), fun: () => 1 });
      roof(c, x, bottom - bh - rh, { hei: rh, wid: w * flare, tex: 80 });
      bottom -= bh + rh * 0.55;
    }
    spire(c, x, bottom + 2, wid * (0.5 + R() * 0.4));
  }

  // A dwelling: one or two storeys, tiled or thatched roof, windows or a door.
  function house(c, x, y, { wid = 40 } = {}) {
    const thatch = R() < 0.4, two = !thatch && R() < 0.4;
    const bh = wid * (thatch ? 0.32 : 0.45);
    platform(c, x, y, wid * 1.05);
    body(c, x, y - 5 - bh, y - 5, wid * 0.85);
    // door or a row of windows
    if (R() < 0.5) {
      fillPoly(c, [[x - wid * 0.08, y - 5], [x + wid * 0.08, y - 5], [x + wid * 0.08, y - 5 - bh * 0.6], [x - wid * 0.08, y - 5 - bh * 0.6]], grey(0.35));
    } else {
      for (let i = -1; i <= 1; i++) {
        stroke(c, [[x + i * wid * 0.25 - 3, y - 5 - bh * 0.55], [x + i * wid * 0.25, y - 5 - bh * 0.55], [x + i * wid * 0.25 + 3, y - 5 - bh * 0.55]], { wid: 1.6, col: grey(0.35), fun: () => 1 });
      }
    }
    let top = y - 5 - bh;
    if (two) {
      const rh = wid * 0.2;
      roof(c, x, top - rh, { hei: rh, wid: wid * 1.25, tex: 70 });
      rail(c, x, top - rh * 0.2, wid * 0.8);
      const bh2 = wid * 0.32;
      body(c, x, top - rh * 0.45 - bh2, top - rh * 0.45, wid * 0.65);
      top = top - rh * 0.45 - bh2;
    }
    const rh = wid * (thatch ? 0.5 : 0.3);
    roof(c, x, top - rh, { hei: rh, wid: wid * (thatch ? 1.3 : 1.45), tex: thatch ? 160 : 110 });
  }

  // Two to four houses huddled at the foot of a hill, with a tree or two.
  function village(c, x, y) {
    const n = 2 + ((R() * 3) | 0);
    const spots = Array.from({ length: n }, () => [x + (R() - 0.5) * 90, y + (R() - 0.5) * 24]).sort((a, b) => a[1] - b[1]);
    for (const [hx, hy] of spots) {
      if (R() < 0.45) tree01(c, hx + (R() - 0.5) * 50, hy - 2, { hei: 40 + R() * 40, wid: 2 + R() * 2, a: 0.35 });
      house(c, hx, hy, { wid: 26 + R() * 18 });
    }
  }

  // An arched footbridge over the water.
  function bridge(c, x, y, { len = 90 } = {}) {
    const h = len * (0.12 + R() * 0.1), steps = 16;
    const deck = [], under = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, bx = x - len / 2 + t * len;
      deck.push([bx, y - Math.sin(t * Math.PI) * h]);
      under.push([bx, y + 3 - Math.sin(t * Math.PI) * h * 0.8]);
    }
    fillPoly(c, deck.concat(under.slice().reverse()), '#fff');
    stroke(c, deck, { wid: 1.6, col: grey(0.55), fun: () => 1 });
    stroke(c, under, { wid: 1, col: grey(0.4), fun: () => 1 });
    const top = deck.map(([bx, by]) => [bx, by - 6]);
    stroke(c, top, { wid: 0.8, col: grey(0.45), fun: () => 1 });
    for (let i = 1; i < steps; i += 3) stroke(c, [deck[i], [deck[i][0], deck[i][1] - 3], top[i]], { wid: 0.6, col: grey(0.4), fun: () => 1 });
    water(c, x, y + 26, { len: len * 2.2, clu: 5 });
  }

  // Shore rocks: small textured mounds, darker than the hills.
  function rock(c, x, y, { wid = 30, hei = 20 } = {}) {
    const rows = [];
    for (let j = 0; j < 5; j++) {
      const row = [], p = 1 - j * 0.18;
      for (let i = 0; i <= 16; i++) {
        const t = i / 16 - 0.5;
        row.push([x + t * wid * p, y - hei * p * Math.pow(Math.cos(t * Math.PI), 0.6) * (0.6 + 0.4 * noise(i * 0.4, j * 0.3, x * 0.02))]);
      }
      rows.push(row);
    }
    fillPoly(c, rows[0].concat([[x + wid / 2, y + 3], [x - wid / 2, y + 3]]), '#fff');
    stroke(c, rows[0], { col: 'rgba(100,100,100,0.5)', noi: 1, wid: 1.8 });
    texture(c, rows, { tex: 35, wid: 1.4, sha: 2, noi: () => 2, col: () => grey(0.25 + R() * 0.3) });
  }

  // ---------- the original's buildings ----------
  // Drawn in a slight perspective: `rot` is where the front corner falls,
  // `per` how far the base dips towards it.

  const at = (xoff, yoff) => ([x, y]) => [x + xoff, y + yoff];

  // A wall block; dec() adds window frames.
  function box(c, xoff, yoff, { hei = 20, wid = 120, rot = 0.7, per = 4, tra = true, bot = true, wei = 3, dec = () => [] } = {}) {
    const mid = -wid * 0.5 + wid * rot, bmid = -wid * 0.5 + wid * (1 - rot);
    const pl = [div([[-wid * 0.5, -hei], [-wid * 0.5, 0]], 5), div([[wid * 0.5, -hei], [wid * 0.5, 0]], 5)];
    if (bot) pl.push(div([[-wid * 0.5, 0], [mid, per]], 5), div([[wid * 0.5, 0], [mid, per]], 5));
    pl.push(div([[mid, -hei], [mid, per]], 5));
    if (tra) {
      if (bot) pl.push(div([[-wid * 0.5, 0], [bmid, -per]], 5), div([[wid * 0.5, 0], [bmid, -per]], 5));
      pl.push(div([[bmid, -hei], [bmid, -per]], 5));
    }
    const surf = (rot < 0.5) * 2 - 1;
    pl.push(...dec({ pul: [surf * wid * 0.5, -hei], pur: [mid, -hei + per], pdl: [surf * wid * 0.5, 0], pdr: [mid, per] }));
    const g = at(xoff, yoff);
    if (!tra) fillPoly(c, [[-wid * 0.5, -hei], [wid * 0.5, -hei], [wid * 0.5, 0], [mid, per], [-wid * 0.5, 0]].map(g), '#fff');
    for (const l of pl) stroke(c, l.map(g), { col: grey(0.4), noi: 1, wid: wei, fun: () => 1 });
  }

  // Window frames on a wall face: 1 -| |-, 2 ||||, 3 |##|.
  function deco(style, { pul = [0, 0], pur = [0, 100], pdl = [100, 0], pdr = [100, 100], hsp = [1, 3], vsp = [1, 2] } = {}) {
    const out = [];
    const dl = div([pul, pdl], vsp[1]), dr = div([pur, pdr], vsp[1]), du = div([pul, pur], hsp[1]), dd = div([pdl, pdr], hsp[1]);
    if (style === 1 || style === 3) {
      const mlu = du[hsp[0]], mru = du[du.length - 1 - hsp[0]], mld = dd[hsp[0]], mrd = dd[du.length - 1 - hsp[0]];
      for (let i = vsp[0]; i < dl.length - vsp[0]; i += vsp[0]) {
        const mml = div([mlu, mld], vsp[1])[i], mmr = div([mru, mrd], vsp[1])[i];
        if (style === 1) out.push(div([mml, dl[i]], 5), div([mmr, dr[i]], 5));
        else out.push(div([mml, mmr], 5), div([div([mlu, mru], vsp[1])[i], div([mld, mrd], vsp[1])[i]], 5));
      }
      out.push(div([mlu, mld], 5), div([mru, mrd], 5));
    } else if (style === 2) {
      for (let i = hsp[0]; i < du.length - hsp[0]; i += hsp[0]) out.push(div([du[i], dd[i]], 5));
    }
    return out;
  }

  // A balustrade: the front (fro) and/or back (tra) rails, wobbly posts between.
  function railing(c, xoff, yoff, seed, { hei = 20, wid = 180, rot = 0.7, per = 4, seg = 4, wei = 1, tra = true, fro = true } = {}) {
    const mid = -wid * 0.5 + wid * rot, bmid = -wid * 0.5 + wid * (1 - rot);
    const pl = [];
    if (fro) pl.push(div([[-wid * 0.5, 0], [mid, per]], seg), div([[mid, per], [wid * 0.5, 0]], seg));
    if (tra) pl.push(div([[-wid * 0.5, 0], [bmid, -per]], seg), div([[bmid, -per], [wid * 0.5, 0]], seg));
    if (fro) pl.push(div([[-wid * 0.5, -hei], [mid, -hei + per]], seg), div([[mid, -hei + per], [wid * 0.5, -hei]], seg));
    if (tra) pl.push(div([[-wid * 0.5, -hei], [bmid, -hei - per]], seg), div([[bmid, -hei - per], [wid * 0.5, -hei]], seg));
    if (tra) {
      // a gap in the back rail
      const open = Math.floor(R() * pl.length);
      pl[open] = pl[open].slice(0, -2);
    }
    const g = at(xoff, yoff), n = pl.length;
    for (let i = 0; i < n / 2; i++) {
      const k = (n / 2 + i) % n;
      for (let j = 0; j < pl[i].length; j++) {
        const b = pl[k][j % pl[k].length];
        pl[i][j][1] += (noise(i, j * 0.5, seed) - 0.5) * hei;
        b[1] += (noise(i + 0.5, j * 0.5, seed) - 0.5) * hei;
        const ln = div([pl[i][j], b], 2);
        ln[0][0] += (R() - 0.5) * hei * 0.5;
        poly(c, ln.map(g), { str: grey(0.5), wid: 2 });
      }
    }
    for (const l of pl) stroke(c, l.map(g), { col: grey(0.5), noi: 0.5, wid: wei, fun: () => 1 });
  }

  // A hipped roof in perspective, its ridge at height hei.
  function eaves(c, xoff, yoff, { hei = 20, wid = 120, rot = 0.7, per = 4, cor = 5, wei = 3 } = {}) {
    const opf = (pts) => (rot < 0.5 ? pts.map(([x, y]) => [-x, y]) : pts);
    const rr = rot < 0.5 ? 1 - rot : rot;
    const mid = -wid * 0.5 + wid * rr, quat = (mid + wid * 0.5) * 0.5 - mid;
    const pl = [
      [[-wid * 0.5 + quat, -hei - per / 2], [-wid * 0.5 + quat * 0.5, -hei / 2 - per / 4], [-wid * 0.5 - cor, 0]],
      [[mid + quat, -hei], [(mid + quat + wid * 0.5) / 2, -hei / 2], [wid * 0.5 + cor, 0]],
      [[mid + quat, -hei], [mid + quat / 2, -hei / 2 + per / 2], [mid + cor, per]],
      [[-wid * 0.5 - cor, 0], [mid + cor, per]],
      [[wid * 0.5 + cor, 0], [mid + cor, per]],
      [[-wid * 0.5 + quat, -hei - per / 2], [mid + quat, -hei]],
    ].map((l) => div(opf(l), 5));
    const g = at(xoff, yoff);
    fillPoly(c, opf([[-wid * 0.5, 0], [-wid * 0.5 + quat, -hei - per / 2], [mid + quat, -hei], [wid * 0.5, 0], [mid, per]]).map(g), '#fff');
    for (const l of pl) stroke(c, l.map(g), { col: grey(0.4), noi: 1, wid: wei, fun: () => 1 });
  }

  // A pointed pagoda roof with sid ridges.
  function pagroof(c, xoff, yoff, { hei = 20, wid = 120, per = 4, cor = 10, sid = 4, wei = 3 } = {}) {
    const pl = [], po = [[0, -hei]];
    for (let i = 0; i < sid; i++) {
      const t = i / (sid - 1) - 0.5;
      const fx = wid * t, fy = per * (1 - Math.abs(t) * 2), fxx = (wid + cor) * t;
      if (i > 0) pl.push([pl[pl.length - 1][2], [fxx, fy]]);
      pl.push([[0, -hei], [fx * 0.5, (-hei + fy) * 0.5], [fxx, fy]]);
      po.push([fxx, fy]);
    }
    const g = at(xoff, yoff);
    fillPoly(c, po.map(g), '#fff');
    for (const l of pl) stroke(c, div(l, 5).map(g), { col: grey(0.4), noi: 1, wid: wei, fun: () => 1 });
  }

  // arch01: a thatched hall on a terrace, a balustrade, people at the rail.
  function lodgeHall(c, xoff, yoff, { hei = 70, wid = 180, per = 5 } = {}) {
    const seed = R(), p = 0.4 + R() * 0.2, h0 = hei * p, h1 = hei * (1 - p);
    roof(c, xoff, yoff - hei, { hei: h0, wid, tex: 300 });
    box(c, xoff, yoff, { hei: h1, wid: (wid * 2) / 3, per, bot: false });
    railing(c, xoff, yoff, seed, { tra: true, fro: false, hei: 10, wid, per: per * 2, seg: (3 + R() * 3) | 0 });
    const n = randChoice([0, 1, 1, 2]);
    if (n === 1) man(c, xoff + normRand(-wid / 3, wid / 3), yoff, { fli: randChoice([true, false]), sca: 0.42 });
    if (n === 2) {
      man(c, xoff + normRand(-wid / 4, -wid / 5), yoff, { fli: false, sca: 0.42 });
      man(c, xoff + normRand(wid / 5, wid / 4), yoff, { fli: true, sca: 0.42 });
    }
    railing(c, xoff, yoff, seed, { tra: false, fro: true, hei: 10, wid, per: per * 2, seg: (3 + R() * 3) | 0 });
  }

  // arch02: a house of sto storeys, each under its own roof, windows framed (sty).
  function hall(c, xoff, yoff, { hei = 10, wid = 50, rot = 0.3, per = 5, sto = 3, sty = 1, rai = false } = {}) {
    let hoff = 0;
    for (let i = 0; i < sto; i++) {
      box(c, xoff, yoff - hoff, {
        tra: false, hei, wid: wid * 0.85 ** i, rot, wei: 1.5, per,
        dec: (a) => deco(sty, { ...a, hsp: [[], [1, 5], [1, 5], [1, 4]][sty], vsp: [[], [1, 2], [1, 2], [1, 3]][sty] }),
      });
      if (rai) railing(c, xoff, yoff - hoff, i * 0.2, { wid: wid * 0.85 ** i * 1.1, hei: hei / 2, per, rot, wei: 0.5, tra: false });
      eaves(c, xoff, yoff - hoff - hei, { hei, wid: wid * 0.9 ** i, rot, wei: 1.5, per });
      hoff += hei * 1.5;
    }
  }

  // arch03: a tall pagoda of five or seven storeys, for mountain tops.
  function tallPagoda(c, xoff, yoff, { hei = 10, wid = 50, rot = 0.7, per = 5, sto = 7 } = {}) {
    let hoff = 0;
    for (let i = 0; i < sto; i++) {
      box(c, xoff, yoff - hoff, {
        tra: false, hei, wid: wid * 0.85 ** i, rot, wei: 1.5, per: per / 2,
        dec: (a) => deco(1, { ...a, hsp: [1, 4], vsp: [1, 2] }),
      });
      railing(c, xoff, yoff - hoff, i * 0.2, { seg: 5, wid: wid * 0.85 ** i * 1.1, hei: hei / 2, per: per / 2, rot, wei: 0.5, tra: false });
      pagroof(c, xoff, yoff - hoff - hei, { hei: hei * 1.5, wid: wid * 0.9 ** i, wei: 1.5, per });
      hoff += hei * 1.5;
    }
  }

  // arch04: an open gazebo of one or two storeys.
  function gazebo(c, xoff, yoff, { hei = 15, wid = 30, rot = 0.7, per = 5, sto = 2 } = {}) {
    let hoff = 0;
    for (let i = 0; i < sto; i++) {
      box(c, xoff, yoff - hoff, { tra: true, hei, wid: wid * 0.85 ** i, rot, wei: 1.5, per: per / 2 });
      railing(c, xoff, yoff - hoff, i * 0.2, { seg: 3, wid: wid * 0.85 ** i * 1.2, hei: hei / 3, per: per / 2, rot, wei: 0.5, tra: true });
      pagroof(c, xoff, yoff - hoff - hei, { hei, wid: wid * 0.9 ** i, wei: 1.5, per });
      hoff += hei * 1.2;
    }
  }

  // The original's joke among the pavilions: a power line pylon.
  function pylon(c, xoff, yoff, { hei = 100, wid = 20 } = {}) {
    const g = at(xoff, yoff);
    const q = (pl) => stroke(c, div(pl, 5).map(g), { wid: 1, fun: () => 0.5, col: grey(0.4) });
    const p00 = [-wid * 0.05, -hei], p01 = [wid * 0.05, -hei], p10 = [-wid * 0.1, -hei * 0.9], p11 = [wid * 0.1, -hei * 0.9];
    const p20 = [-wid * 0.2, -hei * 0.5], p21 = [wid * 0.2, -hei * 0.5], p30 = [-wid * 0.5, 0], p31 = [wid * 0.5, 0];
    for (const [bx, by] of [[0.7, -0.85], [1, -0.675], [0.7, -0.5]]) {
      q([[-bx * wid, by * hei], [bx * wid, by * hei]]);
      q([[-bx * wid, by * hei], [0, (by - 0.05) * hei]]);
      q([[bx * wid, by * hei], [0, (by - 0.05) * hei]]);
      q([[-bx * wid, by * hei], [-bx * wid, (by + 0.1) * hei]]);
      q([[bx * wid, by * hei], [bx * wid, (by + 0.1) * hei]]);
    }
    const l0 = div([p00, p10, p20, p30], 5), l1 = div([p01, p11, p21, p31], 5);
    for (let i = 0; i < l0.length - 1; i++) { q([l0[i], l1[i + 1]]); q([l1[i], l0[i + 1]]); }
    q([p00, p01]); q([p10, p11]); q([p20, p21]); q([p00, p10, p20, p30]); q([p01, p11, p21, p31]);
  }

  // ---------- the original's figures ----------
  // A robed figure on a skeleton of nine joints:
  //      2
  //    1/
  // 7/  | \_ 6
  // 8| 0 \ 5
  //      /3
  //     4

  // a polyline widened by wfun along its length: its two sides
  function expand(pts, wfun) {
    const v0 = [], v1 = [];
    for (let i = 1; i < pts.length - 1; i++) {
      const w = wfun(i / pts.length);
      const a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
      const a2 = Math.atan2(pts[i][1] - pts[i + 1][1], pts[i][0] - pts[i + 1][0]);
      let a = (a1 + a2) / 2;
      if (a < a2) a += Math.PI;
      v0.push([pts[i][0] + w * Math.cos(a), pts[i][1] + w * Math.sin(a)]);
      v1.push([pts[i][0] - w * Math.cos(a), pts[i][1] - w * Math.sin(a)]);
    }
    const l = pts.length - 1;
    const a0 = Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) - Math.PI / 2;
    const a1 = Math.atan2(pts[l][1] - pts[l - 1][1], pts[l][0] - pts[l - 1][0]) - Math.PI / 2;
    const w0 = wfun(0), w1 = wfun(1);
    v0.unshift([pts[0][0] + w0 * Math.cos(a0), pts[0][1] + w0 * Math.sin(a0)]);
    v1.unshift([pts[0][0] - w0 * Math.cos(a0), pts[0][1] - w0 * Math.sin(a0)]);
    v0.push([pts[l][0] + w1 * Math.cos(a1), pts[l][1] + w1 * Math.sin(a1)]);
    v1.push([pts[l][0] - w1 * Math.cos(a1), pts[l][1] - w1 * Math.sin(a1)]);
    return [v0, v1];
  }

  // a shape drawn in the frame of the segment p0-p1 (a head, a hand)
  function tranpoly(p0, p1, pts) {
    const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) - Math.PI / 2, scl = distance(p0, p1);
    return pts.map(([vx, vy]) => {
      const d = Math.hypot(vx, vy), a = Math.atan2(vy, -vx);
      return [p0[0] + d * scl * Math.cos(ang + a), p0[1] + d * scl * Math.sin(ang + a)];
    });
  }
  const flipX = (pts) => pts.map(([x, y]) => [-x, y]);

  // hat01: a scholar's cap with a ribbon trailing behind
  function capHat(c, p0, p1, { fli = false } = {}) {
    const seed = R(), f = fli ? flipX : (v) => v;
    poly(c, tranpoly(p0, p1, f([[-0.3, 0.5], [0.3, 0.8], [0.2, 1], [0, 1.1], [-0.3, 1.15], [-0.55, 1], [-0.65, 0.5]])), { fil: grey(0.8) });
    const rib = [];
    for (let i = 0; i < 10; i++) rib.push([-0.3 - noise(i * 0.2, seed) * i * 0.1, 0.5 - i * 0.3]);
    poly(c, tranpoly(p0, p1, f(rib)), { str: grey(0.8), wid: 1 });
  }

  // hat02: a wide straw hat
  function strawHat(c, p0, p1, { fli = false } = {}) {
    const f = fli ? flipX : (v) => v;
    poly(c, tranpoly(p0, p1, f([[-0.3, 0.5], [-1.1, 0.5], [-1.2, 0.6], [-1.1, 0.7], [-0.3, 0.8], [0.3, 0.8], [1.0, 0.7], [1.3, 0.6], [1.2, 0.5], [0.3, 0.5]])), { fil: grey(0.8) });
  }

  // stick01: a walking staff (or a fishing pole) held between the hands
  function staff(c, p0, p1, { fli = false } = {}) {
    const seed = R(), f = fli ? flipX : (v) => v, l = 12, pts = [];
    for (let i = 0; i < l; i++) pts.push([-noise(i * 0.1, seed) * 0.1 * Math.sin((i / l) * Math.PI) * 5, i * 0.3]);
    poly(c, tranpoly(p0, p1, f(pts)), { str: grey(0.5), wid: 1 });
  }

  const JOINT_PARENT = [-1, 0, 1, 0, 3, 1, 5, 1, 7];
  const joints = (i) => (i < 0 ? [] : [...joints(JOINT_PARENT[i]), i]);

  // man: a figure in a robe, feet at (xoff, yoff); `ite` is what it holds.
  function man(c, xoff, yoff, { sca = 0.5, hat = capHat, ite = null, fli = true, ang = null, len = [0, 30, 20, 30, 30, 30, 30, 30, 30] } = {}) {
    ang = ang || [0, -Math.PI / 2, normRand(0, 0), (Math.PI / 4) * R(), ((Math.PI * 3) / 4) * R(), (Math.PI * 3) / 4,
      -Math.PI / 4, (-Math.PI * 3) / 4 - (Math.PI / 4) * R(), -Math.PI / 4];
    len = len.map((v) => v * sca);
    const rot = (i) => joints(i).reduce((s, k) => s + ang[k], 0);
    const pts = ang.map((_, i) => joints(i).reduce((p, k) => [p[0] + len[k] * Math.cos(rot(k)), p[1] + len[k] * Math.sin(rot(k))], [0, 0]));
    const y0 = yoff - pts[4][1];
    const g = ([x, y]) => [(fli ? -1 : 1) * x + xoff, y + y0];
    const cloth = (P, fun) => {
      const [t1, t2] = expand(bezmh(P, 2), fun);
      fillPoly(c, t1.concat(t2.slice().reverse()).map(g), '#fff');
      stroke(c, t1.map(g), { wid: 1, col: grey(0.5) });
      stroke(c, t2.map(g), { wid: 1, col: grey(0.6) });
    };
    const fall = (x, k, base) => sca * k * (Math.sin(0.5 * x * Math.PI) * Math.pow(Math.sin(x * Math.PI), 0.1) + (1 - x) * base);
    const fsleeve = (x) => fall(x, 8, 0.4), fbody = (x) => fall(x, 11, 0.5);
    const fhead = (x) => sca * 7 * Math.pow(Math.max(0, 0.25 - Math.pow(x - 0.5, 2)), 0.3);
    if (ite) ite(c, g(pts[8]), g(pts[6]), { fli });
    cloth([pts[1], pts[7], pts[8]], fsleeve);
    cloth([pts[1], pts[0], pts[3], pts[4]], fbody);
    cloth([pts[1], pts[5], pts[6]], fsleeve);
    cloth([pts[1], pts[2]], fhead);
    // hair
    const [h1, h2] = expand(bezmh([pts[1], pts[2]], 2), fhead);
    h1.splice(0, Math.floor(h1.length * 0.1));
    h2.splice(0, Math.floor(h2.length * 0.95));
    fillPoly(c, h1.concat(h2.reverse()).map(g), grey(0.6));
    hat(c, g(pts[1]), g(pts[2]), { fli });
  }

  function walker(c, x, y, { sca = 1.25, dir = 1 } = {}) {
    // a stretch of path under the feet
    const path0 = [];
    for (let i = -10; i <= 10; i++) path0.push([x + i * 5, y + 1 + noise(i * 0.3, x * 0.01) * 2]);
    stroke(c, path0, { wid: 1.4, col: grey(0.3) });
    figure(c, x, y, { sca, dir });
  }

  // Trees of the plateaus standing on the shore, alone or in a little group.
  function grove(c, kind, x, y) {
    if (kind === 'big') tree04(c, x, y, { hei: 150 + R() * 110 });
    else if (kind === 'pine') {
      const n = 1 + ((R() * 3) | 0);
      for (let i = 0; i < n; i++) tree05(c, x + (i - (n - 1) / 2) * 28 + normRand(-6, 6), y + normRand(-3, 3), { hei: 150 + R() * 130 });
    } else if (kind === 'bare') tree06(c, x, y, { hei: 60 + R() * 40 });
    else if (kind === 'dark') { for (let px = x - 50; px < x + 50; px += 20) tree07(c, px + 10 * normRand(-1, 1), y + normRand(-1, 1), { hei: normRand(40, 80) }); }
    else if (kind === 'crooked') { for (let i = 0; i < 2 + R() * 3; i++) tree08(c, x + normRand(-30, 30), y, { hei: 60 + R() * 40 }); }
  }

  // One to three of the original's figures on the shore.
  function people(c, x, y) {
    const n = randChoice([1, 2, 2, 3]);
    for (let i = 0; i < n; i++) {
      man(c, x + (i - (n - 1) / 2) * 24 + normRand(-4, 4), y, {
        sca: normRand(0.45, 0.6), fli: R() < 0.5, hat: R() < 0.6 ? capHat : strawHat, ite: R() < 0.3 ? staff : null,
      });
    }
  }

  function birds(c, x, y, { n = 4 } = {}) {
    for (let i = 0; i < n; i++) {
      const bx = x + randGaussian() * 40, by = y + randGaussian() * 14, sz = 4 + R() * 4;
      const tip = R() * 0.6 - 0.3;
      stroke(c, [[bx - sz, by - sz * (0.45 + tip)], [bx - sz * 0.5, by - sz * 0.2], [bx, by],
        [bx + sz * 0.5, by - sz * 0.25], [bx + sz, by - sz * (0.5 - tip)]], { wid: 1.1, col: 'rgba(70,70,70,0.8)' });
    }
  }

  // ---------- paper ----------

  let PAPER = null;   // the tile, shared by the samples

  function paperTile() {
    const S = 256, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const img = g.createImageData(S, S);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        // tileable mottling: noise sampled on a torus
        const a = (x / S) * Math.PI * 2, b = (y / S) * Math.PI * 2;
        const m = noise(3 + Math.cos(a) * 1.5, 3 + Math.sin(a) * 1.5, 5 + Math.cos(b) * 1.5 + Math.sin(b)) - 0.5;
        const grain = (Math.random() - 0.5) * 9;
        img.data[i] = 238 + m * 14 + grain;
        img.data[i + 1] = 230 + m * 14 + grain;
        img.data[i + 2] = 212 + m * 12 + grain;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  // ---------- the catalogue ----------
  // Every element of the handscroll, by category, for the lab's painter. Each
  // has a sample: the element alone in a view of [w, h] world units. `zone` is
  // where the planner puts it (far, mountains, slopes, plateaus, peaks, the
  // mountains' feet, the shore, the water, the sky); `needs` the element (or
  // any of the elements) it can't do without; `def` its density in the home's
  // handscroll (0 if absent). `orig` marks what comes from shan-shui-inf.

  const n0 = () => R() * 100;
  const CATALOG = [
    { id: 'mountains', name: { it: 'Montagne', en: 'Mountains' }, items: [
      { id: 'mount', name: { it: 'Montagne alte', en: 'High mountains' }, def: 1, zone: 'mountains', orig: true, view: [640, 440],
        sample: (c) => mountain(c, 320, 420, n0(), { hei: 400, wid: 540, tex: 240 }) },
      { id: 'hill', name: { it: 'Colline vicine', en: 'Near hills' }, def: 1, zone: 'shore', orig: true, view: [420, 200],
        sample: (c) => mountain(c, 210, 185, n0(), { hei: 95, wid: 320, tex: 110 }) },
      { id: 'plateau', name: { it: 'Altopiani', en: 'Plateaus' }, zone: 'mountains', orig: true, view: [640, 360],
        sample: (c) => { const bd = flatMount(c, 320, 330, n0(), { hei: 160, wid: 520 }); if (bd) flatDec(c, bd, { kind: -1, crooked: false, lodge: false }); } },
      { id: 'ridges', name: { it: 'Creste lontane', en: 'Distant ridges' }, def: 1, zone: 'far', view: [640, 300],
        sample: (c) => { farRidge(c, 0, 640, 200, 160, 0.006, 1, 205); farRidge(c, 0, 640, 290, 110, 0.009, 2, 190); } },
      { id: 'rock', name: { it: 'Rocce', en: 'Rocks' }, def: 1, zone: 'shore', orig: true, view: [220, 110],
        sample: (c) => { rock(c, 80, 95, { wid: 60, hei: 40 }); rock(c, 150, 100, { wid: 34, hei: 22 }); } },
    ] },
    { id: 'water', name: { it: 'Acqua', en: 'Water' }, items: [
      { id: 'waves', name: { it: 'Onde', en: 'Waves' }, def: 1, zone: 'water', orig: true, view: [520, 110],
        sample: (c) => water(c, 260, 80, { len: 520, clu: 9 }) },
      { id: 'boat', name: { it: 'Barca da pesca', en: 'Fishing boat' }, def: 1, zone: 'water', needs: 'water.waves', view: [260, 120],
        sample: (c) => { water(c, 130, 110, { len: 240, clu: 5 }); boat(c, 70, 85); } },
      { id: 'poler', name: { it: 'Barcaiolo', en: 'Boatman' }, zone: 'water', needs: 'water.waves', orig: true, view: [260, 120],
        sample: (c) => { water(c, 130, 110, { len: 240, clu: 5 }); boat(c, 70, 85, { poler: true }); } },
      { id: 'bridge', name: { it: 'Ponte', en: 'Bridge' }, def: 1, zone: 'water', needs: 'water.waves', view: [240, 120],
        sample: (c) => bridge(c, 120, 70, { len: 120 }) },
    ] },
    { id: 'trees', name: { it: 'Alberi', en: 'Trees' }, items: [
      { id: 'shrubs', name: { it: 'Cespugli', en: 'Shrubs' }, def: 1, needs: ['mountains.mount', 'mountains.hill'], zone: 'slopes', orig: true, view: [200, 100],
        sample: (c) => { for (let i = 0; i < 4; i++) tree02(c, 50 + i * 35, 60 + (i % 2) * 10, { a: 0.5 }); } },
      { id: 'saplings', name: { it: 'Alberelli', en: 'Saplings' }, def: 1, needs: ['mountains.mount', 'mountains.hill'], zone: 'slopes', orig: true, view: [200, 160],
        sample: (c) => { for (let i = 0; i < 3; i++) tree01(c, 60 + i * 40, 150, { hei: 90 + i * 15, wid: 3, a: 0.35 }); } },
      { id: 'leafy', name: { it: 'Albero frondoso', en: 'Leafy tree' }, needs: ['mountains.mount', 'mountains.hill'], zone: 'slopes', orig: true, view: [200, 200],
        sample: (c) => tree03(c, 100, 190, { hei: 150, wid: 8, ben: (v) => Math.sin(v * 2) * 0.15 }) },
      { id: 'big', name: { it: 'Grande albero', en: 'Big tree' }, zone: 'plateaus', orig: true, view: [360, 360],
        sample: (c) => tree04(c, 180, 350, { hei: 300 }) },
      { id: 'pine', name: { it: 'Pino', en: 'Pine' }, zone: 'plateaus', orig: true, view: [260, 340],
        sample: (c) => tree05(c, 130, 330, { hei: 300 }) },
      { id: 'bare', name: { it: 'Albero spoglio', en: 'Bare tree' }, zone: 'plateaus', orig: true, view: [320, 360],
        sample: (c) => tree06(c, 160, 350, { hei: 100 }) },
      { id: 'dark', name: { it: 'Albero scuro', en: 'Dark tree' }, zone: 'plateaus', orig: true, view: [220, 150],
        sample: (c) => { for (let i = 0; i < 4; i++) tree07(c, 50 + i * 40, 140, { hei: 70 + i * 6 }); } },
      { id: 'crooked', name: { it: 'Albero contorto', en: 'Crooked tree' }, zone: 'plateaus', orig: true, view: [200, 160],
        sample: (c) => { for (let i = 0; i < 3; i++) tree08(c, 60 + i * 40, 150, { hei: 90 }); } },
    ] },
    { id: 'buildings', name: { it: 'Architetture', en: 'Buildings' }, items: [
      { id: 'house', name: { it: 'Casa', en: 'House' }, def: 1, zone: 'shore', view: [140, 110], sample: (c) => house(c, 70, 100, { wid: 46 }) },
      { id: 'village', name: { it: 'Villaggio', en: 'Village' }, def: 1, zone: 'shore', view: [200, 140], sample: (c) => village(c, 100, 120) },
      { id: 'hall', name: { it: 'Casa a piani', en: 'Storeyed house' }, needs: ['mountains.mount', 'mountains.hill'], zone: 'feet', orig: true, view: [140, 120],
        sample: (c) => hall(c, 70, 110, { wid: 60, sto: 3, sty: 1 + ((R() * 3) | 0), rot: R() }) },
      { id: 'lodge', name: { it: 'Capanna sul terrazzo', en: 'Terrace lodge' }, zone: 'plateaus', needs: 'mountains.plateau', orig: true, view: [260, 150],
        sample: (c) => lodgeHall(c, 130, 135, { wid: 180, hei: 90, per: R() }) },
      { id: 'gazebo', name: { it: 'Gazebo', en: 'Gazebo' }, needs: ['mountains.mount', 'mountains.hill'], zone: 'feet', orig: true, view: [110, 110],
        sample: (c) => gazebo(c, 55, 100, { sto: 2, wid: 36 }) },
      { id: 'pavilion', name: { it: 'Padiglione', en: 'Pavilion' }, def: 1, zone: 'shore', view: [140, 140], sample: (c) => pavilion(c, 70, 130, { wid: 54 }) },
      { id: 'pagoda', name: { it: 'Pagoda sulla collina', en: 'Hill pagoda' }, def: 1, zone: 'shore', view: [200, 220], sample: (c) => pagoda(c, 100, 200, { sto: 4 }) },
      { id: 'tower', name: { it: 'Pagoda in vetta', en: 'Summit pagoda' }, zone: 'peaks', needs: 'mountains.mount', orig: true, view: [130, 230],
        sample: (c) => tallPagoda(c, 65, 220, { sto: 7, wid: 48 }) },
      { id: 'pylon', name: { it: 'Traliccio', en: 'Pylon' }, needs: ['mountains.mount', 'mountains.hill'], zone: 'feet', orig: true, view: [90, 130], sample: (c) => pylon(c, 45, 120) },
    ] },
    { id: 'figures', name: { it: 'Figure e animali', en: 'Figures and animals' }, items: [
      { id: 'walker', name: { it: 'Viandante', en: 'Wanderer' }, def: 1, zone: 'shore', view: [140, 70], sample: (c) => walker(c, 70, 55) },
      { id: 'people', name: { it: 'Figure', en: 'People' }, zone: 'shore', orig: true, view: [200, 90],
        sample: (c) => {
          man(c, 40, 80, { sca: 0.5, hat: capHat, fli: false });
          man(c, 110, 80, { sca: 0.5, hat: strawHat, ite: staff });
          man(c, 165, 80, { sca: 0.45, hat: capHat });
        } },
      { id: 'birds', name: { it: 'Stormi', en: 'Flocks' }, def: 1, zone: 'sky', view: [200, 90], sample: (c) => birds(c, 100, 50, { n: 5 }) },
    ] },
  ];

  const ITEMS = new Map(CATALOG.flatMap((cat) => cat.items.map((it) => [`${cat.id}.${it.id}`, it])));

  // A recipe is { 'category.id': density }; what it leaves out keeps the home's
  // density. An element whose needs are all at 0 drops to 0 too.
  function densities(recipe = {}) {
    const d = {};
    for (const [k, it] of ITEMS) d[k] = Math.max(0, Number(recipe[k] ?? it.def ?? 0) || 0);
    for (let changed = true; changed;) {
      changed = false;
      for (const [k, it] of ITEMS) {
        const needs = [].concat(it.needs || []);
        if (d[k] > 0 && needs.length && !needs.some((n) => d[n] > 0)) { d[k] = 0; changed = true; }
      }
    }
    return d;
  }

  // ---------- the scroll ----------

  return class Shanshui {
    constructor(container, roles, recipe = null) {
      this.el = container;
      this.roles = roles;            // role of each link index (null if not in the world)
      this.dens = densities(recipe || {});
      this.seed = (Math.random() * 1e9) | 0;
      noiseSeed(this.seed);
      this.paper = paperTile();
      this.ink = document.createElement('canvas');
      this.inkCtx = this.ink.getContext('2d');
      this.panels = new Map();
      this.plans = new Map();
      this.X = 0;
      this.idle = null;
    }

    static get catalog() { return CATALOG; }
    // the densities a recipe comes to, needs applied
    static densities(recipe) { return densities(recipe); }

    // A finished painting for the lab's painter: `width` world units of the
    // scroll (a panel is 800), `height` pixels tall. One panel is painted per
    // frame, onPanel(done, total) tells how far it got. Resolves to the canvas.
    static async paint(recipe, seed, { width = 4 * PW, height = 1000, onPanel = () => {} } = {}) {
      const sh = new Shanshui(document.createElement('div'), [], recipe);
      sh.setRecipe(recipe, seed);
      Object.assign(sh, { s: height / WORLD_H, dpr: 1, h: height });
      sh.w = width * sh.s;
      const out = document.createElement('canvas');
      out.width = Math.round(sh.w);
      out.height = height;
      const g = out.getContext('2d');
      const n = Math.ceil(width / PW);
      for (let k = 0; k < n; k++) {
        g.drawImage(sh.renderPanel(k), Math.round(k * PW * sh.s), 0);
        onPanel(k + 1, n);
        await new Promise((r) => requestAnimationFrame(r));
      }
      return out;
    }

    // A new recipe (and seed): everything is planned and painted again.
    setRecipe(recipe, seed = this.seed) {
      this.dens = densities(recipe || {});
      this.seed = seed;
      noiseSeed(seed);
      this.plans.clear();
      for (const cv of this.panels.values()) cv.remove();
      this.panels.clear();
    }

    // One element alone on paper, `scale` canvas pixels per world unit.
    static sample(canvas, key, { seed = 1, scale = 1 } = {}) {
      const [cat, id] = key.split('.');
      const it = CATALOG.find((k) => k.id === cat)?.items.find((k) => k.id === id);
      if (!it) return false;
      if (!perlin) noiseSeed(seed);
      const [w, h] = it.view;
      canvas.width = Math.ceil(w * scale);
      canvas.height = Math.ceil(h * scale);
      const ink = document.createElement('canvas');
      ink.width = canvas.width; ink.height = canvas.height;
      const c = ink.getContext('2d');
      c.fillStyle = '#fff';
      c.fillRect(0, 0, ink.width, ink.height);
      c.setTransform(scale, 0, 0, scale, 0, 0);
      c.lineJoin = 'round';
      R = mulberry32(seed);
      try { it.sample(c); } finally { R = Math.random; }
      const p = canvas.getContext('2d');
      p.fillStyle = p.createPattern(PAPER || (PAPER = paperTile()), 'repeat');
      p.fillRect(0, 0, canvas.width, canvas.height);
      p.globalCompositeOperation = 'multiply';
      p.drawImage(ink, 0, 0);
      p.globalCompositeOperation = 'source-over';
      return true;
    }

    resize(w, h, dpr) {
      this.w = w; this.h = h;
      this.dpr = Math.min(dpr, MAX_DPR);
      this.s = h / WORLD_H;
      for (const cv of this.panels.values()) cv.remove();
      this.panels.clear();
    }

    // What lives in panel k, decided with randomness seeded by k.
    plan(k) {
      if (this.plans.has(k)) return this.plans.get(k);
      const rng = mulberry32(this.seed ^ Math.imul(k + 7919, 2654435761));
      const items = [];
      const x0 = k * PW;
      // Two or three big mountains, plus small near hills along the shore.
      const mounts = 2 + (rng() < 0.4 ? 1 : 0);
      const big = [];
      for (let i = 0; i < mounts + 1 + (rng() < 0.6); i++) {
        const near = i >= mounts;
        const y = near ? 700 + rng() * 90 : 420 + rng() * 260;
        const hei = near ? 40 + rng() * 70 : Math.min(y - 70, 140 + rng() * 300);
        const wid = near ? 160 + rng() * 200 : 380 + rng() * 260;
        const m = { type: 'mount', key: near ? 'mountains.hill' : 'mountains.mount', near, x: x0 + rng() * PW, y, hei, wid, seed: (rng() * 1e6) | 0, nseed: rng() * 100,
          box: [-wid / 2 - 60, -hei - 60, wid / 2 + 60, 140] };
        items.push(m);
        if (!near) big.push(m);
      }
      // Dwellings at the feet of the big mountains, just in front of them.
      for (const m of big) {
        if (rng() < 0.55) {
          const side = rng() < 0.5 ? -1 : 1;
          const type = rng() < 0.5 ? 'village' : 'house';
          items.push({ type, key: `buildings.${type}`, x: m.x + side * m.wid * (0.28 + rng() * 0.18), y: m.y + 8 + rng() * 22,
            seed: (rng() * 1e6) | 0, wid: 30 + rng() * 16, box: [-90, -90, 90, 30] });
        }
      }
      for (let i = 0; i < 3 + (rng() < 0.5); i++) {
        const y = 640 + rng() * 140;
        items.push({ type: 'water', key: 'water.waves', x: x0 + rng() * PW, y, seed: (rng() * 1e6) | 0, box: [-260, -40, 260, 40] });
      }
      if (rng() < 0.35) items.push({ type: 'bridge', key: 'water.bridge', x: x0 + rng() * PW, y: 690 + rng() * 80, seed: (rng() * 1e6) | 0, len: 70 + rng() * 50, box: [-70, -40, 70, 40] });
      for (let i = 0; i < 2 + ((rng() * 3) | 0); i++) {
        const w = 18 + rng() * 26;
        items.push({ type: 'rock', key: 'mountains.rock', x: x0 + rng() * PW, y: 700 + rng() * 90, seed: (rng() * 1e6) | 0, wid: w, hei: w * (0.5 + rng() * 0.4), box: [-30, -40, 30, 10] });
      }
      if (rng() < 0.45) {
        const fli = rng() < 0.5;
        items.push({ type: 'boat', key: 'water.boat', x: x0 + rng() * PW, y: 660 + rng() * 110, fli, seed: (rng() * 1e6) | 0,
          box: fli ? [-130, -50, 10, 20] : [-10, -50, 130, 20] });
      }
      // Link elements: each cycle of LINK_CYCLE panels holds every role once.
      const cycle = Math.floor(k / LINK_CYCLE);
      const crng = mulberry32(this.seed ^ Math.imul(cycle + 104729, 2246822519));
      const slots = ROLES.map(() => Math.floor(crng() * LINK_CYCLE));
      ROLES.forEach((role, r) => {
        if (slots[r] !== ((k % LINK_CYCLE) + LINK_CYCLE) % LINK_CYCLE) return;
        const x = x0 + 80 + rng() * (PW - 160);
        const seed = (rng() * 1e6) | 0, key = ROLE_KEY[role];
        if (role === 'pavilion') items.push({ type: role, key, x, y: 660 + rng() * 80, seed, wid: 46 + rng() * 14, box: [-55, -110, 55, 8] });
        if (role === 'pagoda') items.push({ type: role, key, x, y: 560 + rng() * 110, seed, sto: 3 + ((rng() * 4) | 0), box: [-60, -190, 60, 10] });
        if (role === 'walker') items.push({ type: role, key, x, y: 720 + rng() * 55, seed, dir: rng() < 0.5 ? -1 : 1, box: [-22, -38, 22, 6] });
        if (role === 'boat') {
          const fli = rng() < 0.5;
          items.push({ type: role, key, x, y: 650 + rng() * 110, seed, fli, box: fli ? [-130, -50, 10, 20] : [-10, -50, 130, 20] });
        }
        if (role === 'birds') items.push({ type: role, key, x, y: 90 + rng() * 140, seed, box: [-70, -35, 70, 30] });
      });
      this.dress(k, items);
      this.plans.set(k, items);
      // Old plans are cheap but not free: keep a window around the view.
      for (const key of this.plans.keys()) if (key < k - 6) this.plans.delete(key);
      return items;
    }

    // The recipe on top of the plan, with randomness of its own so that the
    // home's densities (all 1, the new elements at 0) leave the plan as it is:
    // each planned element is kept, dropped or repeated by its density, then
    // the elements the home doesn't have are added.
    dress(k, items) {
      const d = this.dens, x0 = k * PW;
      const rng = mulberry32(this.seed ^ Math.imul(k + 31337, 2246822519) ^ 0x5bd1e995);
      const count = (v) => Math.floor(v) + (rng() < v % 1 ? 1 : 0);
      const seed = () => (rng() * 1e6) | 0;
      const planned = items.splice(0);
      const boats = d['water.boat'] + d['water.poler'];
      for (const it of planned) {
        const v = it.key === 'water.boat' ? boats : d[it.key];
        const n = v === 1 ? 1 : count(v);
        for (let i = 0; i < n; i++) {
          const copy = i === 0 ? it : { ...it, x: x0 + rng() * PW, seed: seed(), nseed: rng() * 100 };
          if (it.key === 'water.boat' && d['water.poler'] > 0) copy.poler = rng() * boats < d['water.poler'];
          items.push(copy);
        }
      }
      // plateaus, and what grows on them
      for (let i = count(d['mountains.plateau'] * 0.8); i > 0; i--) {
        const wid = 260 + rng() * 260;
        const kinds = [[0, d['mountains.rock'] * 0.5], [1, d['trees.pine']], [2, d['trees.big']], [3, d['trees.bare']], [4, d['trees.dark']]];
        const sum = kinds.reduce((a, [, w]) => a + w, 0);
        let r = rng() * sum, kind = -1;
        for (const [kk, w] of kinds) { if (sum > 0 && r < w) { kind = kk; break; } r -= w; }
        // cut higher than the original's (50): in this world they'd hardly show
        items.push({ type: 'plateau', key: 'mountains.plateau', x: x0 + rng() * PW, y: 640 + rng() * 130, wid, cho: 0.8 + rng() * 0.8, seed: seed(), nseed: rng() * 100,
          dec: { kind, crooked: rng() < d['trees.crooked'] * 0.6, shrubs: d['trees.shrubs'] > 0, lodge: rng() < d['buildings.lodge'] * 0.45 },
          box: [-wid / 2 - 70, -330, wid / 2 + 70, 60] });
      }
      // lone trees and groves along the shore
      const GROVES = { big: [0.35, 90], pine: [0.5, 70], bare: [0.4, 80], dark: [0.4, 70], crooked: [0.4, 50] };
      for (const [id, [per, half]] of Object.entries(GROVES)) {
        for (let i = count(d[`trees.${id}`] * per); i > 0; i--) {
          items.push({ type: 'grove', key: `trees.${id}`, kind: id, x: x0 + rng() * PW, y: 715 + rng() * 75, seed: seed(), box: [-half - 60, -320, half + 60, 10] });
        }
      }
      for (let i = count(d['figures.people'] * 0.8); i > 0; i--) {
        items.push({ type: 'people', key: 'figures.people', x: x0 + rng() * PW, y: 715 + rng() * 70, seed: seed(), box: [-60, -50, 60, 8] });
      }
    }

    drawItem(c, it) {
      R = mulberry32(it.seed);
      switch (it.type) {
        case 'mount': {
          const d = this.dens;
          mountain(c, it.x, it.y, it.nseed, {
            hei: it.hei, wid: it.wid, tex: it.hei < 120 ? 110 : 260,
            shrubs: d['trees.shrubs'], saplings: d['trees.saplings'], leafy: d['trees.leafy'],
            halls: d['buildings.hall'], gazebos: d['buildings.gazebo'], pylons: d['buildings.pylon'], towers: it.near ? 0 : d['buildings.tower'],
          });
          break;
        }
        case 'plateau': {
          const bd = flatMount(c, it.x, it.y, it.nseed, { hei: 260 + R() * 120, wid: it.wid, cho: it.cho });
          if (bd) flatDec(c, bd, it.dec);
          break;
        }
        case 'grove': grove(c, it.kind, it.x, it.y); break;
        case 'people': people(c, it.x, it.y); break;
        case 'house': house(c, it.x, it.y, { wid: it.wid }); break;
        case 'village': village(c, it.x, it.y); break;
        case 'bridge': bridge(c, it.x, it.y, { len: it.len }); break;
        case 'rock': rock(c, it.x, it.y, { wid: it.wid, hei: it.hei }); break;
        case 'water': water(c, it.x, it.y, { len: 500, clu: 8 }); break;
        case 'boat': water(c, it.x + (it.fli ? -60 : 60), it.y + 28, { len: 260, clu: 5 }); boat(c, it.x, it.y, { fli: it.fli, sca: 0.9, poler: it.poler }); break;
        case 'pavilion': pavilion(c, it.x, it.y, { wid: it.wid }); break;
        case 'pagoda': pagoda(c, it.x, it.y, { sto: it.sto }); break;
        case 'walker': walker(c, it.x, it.y, { dir: it.dir }); break;
        case 'birds': birds(c, it.x, it.y); break;
      }
      R = Math.random;
    }

    // Paints panel k: ink on a white layer, then multiplied onto the paper.
    renderPanel(k) {
      const { s, dpr } = this;
      const S = s * dpr;
      const pw = Math.ceil(PW * S), ph = Math.ceil(WORLD_H * S);
      const x0 = k * PW, x1 = x0 + PW;
      const ink = this.ink, c = this.inkCtx;
      if (ink.width !== pw || ink.height !== ph) { ink.width = pw; ink.height = ph; }
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#fff';
      c.fillRect(0, 0, pw, ph);
      c.setTransform(S, 0, 0, S, -x0 * S, 0);
      c.lineJoin = 'round';

      R = mulberry32(this.seed);
      // distant ridges: two layers in the home, one when sparse, a third further away when dense
      const rd = this.dens['mountains.ridges'];
      if (rd >= 1.8) farRidge(c, x0, x1, 260, 250, 0.0025, 3, 218);
      if (rd > 0) farRidge(c, x0, x1, 330, 230, 0.0035, 1, 205);
      if (rd >= 0.5) farRidge(c, x0, x1, 430, 150, 0.005, 2, 190);

      const items = [this.plan(k - 1), this.plan(k), this.plan(k + 1)].flat()
        .filter((it) => it.x + it.box[2] > x0 && it.x + it.box[0] < x1)
        .sort((a, b) => (a.type === 'birds') - (b.type === 'birds') || a.y - b.y);
      for (const it of items) this.drawItem(c, it);

      const cv = document.createElement('canvas');
      cv.width = pw; cv.height = ph;
      cv.style.width = `${PW * s}px`;
      cv.style.height = `${WORLD_H * s}px`;
      const p = cv.getContext('2d');
      const pat = p.createPattern(this.paper, 'repeat');
      pat.setTransform(new DOMMatrix([1, 0, 0, 1, -((x0 * S) % 256), 0]));
      p.fillStyle = pat;
      p.fillRect(0, 0, pw, ph);
      p.globalCompositeOperation = 'multiply';
      p.drawImage(ink, 0, 0);
      return cv;
    }

    range() {
      const k0 = Math.floor(this.X / PW);
      const k1 = Math.floor((this.X + this.w / this.s) / PW);
      return [k0, k1];
    }

    addPanel(k) {
      const cv = this.renderPanel(k);
      cv.style.transform = `translate3d(${(k * PW - this.X) * this.s}px, 0, 0)`;
      this.el.appendChild(cv);
      this.panels.set(k, cv);
    }

    // Visible panels are painted right away; the next one when the browser idles.
    ensure() {
      const [k0, k1] = this.range();
      for (let k = k0; k <= k1; k++) if (!this.panels.has(k)) this.addPanel(k);
      const next = k1 + 1;
      if (!this.panels.has(next) && !this.idle) {
        const run = () => { this.idle = null; if (!this.panels.has(next)) this.addPanel(next); };
        this.idle = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 1500 }) : setTimeout(run, 50);
      }
      for (const [k, cv] of this.panels) {
        if (k < k0 - 1 || k > next + 1) { cv.remove(); this.panels.delete(k); }
      }
    }

    update(dt) {
      this.X += SPEED * dt;
      this.ensure();
      for (const [k, cv] of this.panels) {
        cv.style.transform = `translate3d(${(k * PW - this.X) * this.s}px, 0, 0)`;
      }
    }

    // Screen rectangle of each link's element, if one is on screen.
    linkRects() {
      const [k0, k1] = this.range();
      const best = {};
      for (let k = k0; k <= k1; k++) {
        for (const it of this.plan(k)) {
          if (!ROLES.includes(it.type)) continue;
          const x = (it.x + it.box[0] - this.X) * this.s, w = (it.box[2] - it.box[0]) * this.s;
          const y = (it.y + it.box[1]) * this.s, h = (it.box[3] - it.box[1]) * this.s;
          const seen = Math.min(x + w, this.w) - Math.max(x, 0);
          if (seen <= 0) continue;
          if (!best[it.type] || seen > best[it.type].seen) best[it.type] = { x, y, w, h, seen };
        }
      }
      return this.roles.map((role) => (role && best[role]) || null);
    }

    // The current view, for the ascii pass during transitions.
    drawView(g, w, h) {
      const k = w / this.w;
      g.fillStyle = '#efe9dc';
      g.fillRect(0, 0, w, h);
      for (const [i, cv] of this.panels) {
        g.drawImage(cv, (i * PW - this.X) * this.s * k, 0, PW * this.s * k, h);
      }
    }
  };
})();
