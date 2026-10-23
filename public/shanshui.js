// Shan shui (山水): an endless ink-landscape handscroll.
// The drawing algorithms (brush stroke, layered mountains, texture strokes, feet,
// trees, water, boat hull) are ported to Canvas2D, and simplified, from
// LingDong-'s shan-shui-inf (MIT, https://github.com/LingDong-/shan-shui-inf).
// Buildings, figures, birds and the far ridges are new, simpler drawings.
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

  function blob(c, x, y, { len = 20, wid = 5, ang = 0, col = 'rgba(200,200,200,0.9)', noi = 0.5,
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
    const pts = la.map(([l, a], i) => {
      const k = ns[i] * noi + (1 - noi);
      return [x + Math.cos(a + ang) * l * k, y + Math.sin(a + ang) * l * k];
    });
    fillPoly(c, pts, col);
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

  function mountain(c, xoff, yoff, seed, { hei = 300, wid = 500, tex = 200, veg = true } = {}) {
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
      (i, j) => { const ns = noise(j * 0.1, seed); return i === 0 && ns ** 3 < 0.1 && Math.abs(ptlist[i][j][1]) / hei > 0.2; });

    fillPoly(c, ptlist[0].concat([[0, reso[0] * 4]]), '#fff');
    stroke(c, ptlist[0], { col: 'rgba(100,100,100,0.3)', noi: 1, wid: 3 });
    foot(c, ptlist, xoff);
    texture(c, ptlist, { tex, sha: randChoice([0, 0, 0, 0, 5]) });

    // top
    vegetate((x, y) => tree02(c, x, y, { a: leafA(x, y, 0.5) }),
      (i, j) => { const ns = noise(i * 0.1, j * 0.1, seed + 2); return ns ** 3 < 0.13 && Math.abs(ptlist[i][j][1]) / hei > 0.5; });

    if (veg) {
      // middle
      vegetate((x, y) => {
        let ht = ((hei + y) / hei) * 70;
        ht = ht * 0.3 + R() * ht * 0.7;
        tree01(c, x, y, { hei: ht, wid: R() * 3 + 1, a: leafA(x, y, 0.3) });
      }, (i, j) => {
        const ns = noise(i * 0.2, j * 0.05, seed);
        return j % 2 && ns ** 4 < 0.018 && Math.abs(ptlist[i][j][1]) / hei < 0.3;
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
        return (j === 0 || j === ptlist[i].length - 1) && ns ** 4 < 0.018;
      });
    }
    c.restore();
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

  function boat(c, x, y, { len = 120, sca = 1, fli = false } = {}) {
    const dir = fli ? -1 : 1;
    figure(c, x + 22 * sca * dir, y + 2 * sca, { sca: 0.55 * sca, dir: -dir, staff: false, seated: true });
    // the fishing pole
    stroke(c, [[x + 24 * sca * dir, y - 8 * sca], [x + 55 * sca * dir, y - 30 * sca], [x + 85 * sca * dir, y - 42 * sca]], { wid: 0.6, col: 'rgba(80,80,80,0.8)', fun: () => 1 });
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

  function walker(c, x, y, { sca = 1.25, dir = 1 } = {}) {
    // a stretch of path under the feet
    const path0 = [];
    for (let i = -10; i <= 10; i++) path0.push([x + i * 5, y + 1 + noise(i * 0.3, x * 0.01) * 2]);
    stroke(c, path0, { wid: 1.4, col: grey(0.3) });
    figure(c, x, y, { sca, dir });
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

  // ---------- the scroll ----------

  return class Shanshui {
    constructor(container, roles) {
      this.el = container;
      this.roles = roles;            // role of each link index (null if not in the world)
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
        const m = { type: 'mount', x: x0 + rng() * PW, y, hei, wid, seed: (rng() * 1e6) | 0, nseed: rng() * 100,
          box: [-wid / 2 - 60, -hei - 60, wid / 2 + 60, 140] };
        items.push(m);
        if (!near) big.push(m);
      }
      // Dwellings at the feet of the big mountains, just in front of them.
      for (const m of big) {
        if (rng() < 0.55) {
          const side = rng() < 0.5 ? -1 : 1;
          items.push({ type: rng() < 0.5 ? 'village' : 'house', x: m.x + side * m.wid * (0.28 + rng() * 0.18), y: m.y + 8 + rng() * 22,
            seed: (rng() * 1e6) | 0, wid: 30 + rng() * 16, box: [-90, -90, 90, 30] });
        }
      }
      for (let i = 0; i < 3 + (rng() < 0.5); i++) {
        const y = 640 + rng() * 140;
        items.push({ type: 'water', x: x0 + rng() * PW, y, seed: (rng() * 1e6) | 0, box: [-260, -40, 260, 40] });
      }
      if (rng() < 0.35) items.push({ type: 'bridge', x: x0 + rng() * PW, y: 690 + rng() * 80, seed: (rng() * 1e6) | 0, len: 70 + rng() * 50, box: [-70, -40, 70, 40] });
      for (let i = 0; i < 2 + ((rng() * 3) | 0); i++) {
        const w = 18 + rng() * 26;
        items.push({ type: 'rock', x: x0 + rng() * PW, y: 700 + rng() * 90, seed: (rng() * 1e6) | 0, wid: w, hei: w * (0.5 + rng() * 0.4), box: [-30, -40, 30, 10] });
      }
      if (rng() < 0.45) {
        const fli = rng() < 0.5;
        items.push({ type: 'boat', x: x0 + rng() * PW, y: 660 + rng() * 110, fli, seed: (rng() * 1e6) | 0,
          box: fli ? [-130, -50, 10, 20] : [-10, -50, 130, 20] });
      }
      // Link elements: each cycle of LINK_CYCLE panels holds every role once.
      const cycle = Math.floor(k / LINK_CYCLE);
      const crng = mulberry32(this.seed ^ Math.imul(cycle + 104729, 2246822519));
      const slots = ROLES.map(() => Math.floor(crng() * LINK_CYCLE));
      ROLES.forEach((role, r) => {
        if (slots[r] !== ((k % LINK_CYCLE) + LINK_CYCLE) % LINK_CYCLE) return;
        const x = x0 + 80 + rng() * (PW - 160);
        const seed = (rng() * 1e6) | 0;
        if (role === 'pavilion') items.push({ type: role, x, y: 660 + rng() * 80, seed, wid: 46 + rng() * 14, box: [-55, -110, 55, 8] });
        if (role === 'pagoda') items.push({ type: role, x, y: 560 + rng() * 110, seed, sto: 3 + ((rng() * 4) | 0), box: [-60, -190, 60, 10] });
        if (role === 'walker') items.push({ type: role, x, y: 720 + rng() * 55, seed, dir: rng() < 0.5 ? -1 : 1, box: [-22, -38, 22, 6] });
        if (role === 'boat') {
          const fli = rng() < 0.5;
          items.push({ type: role, x, y: 650 + rng() * 110, seed, fli, box: fli ? [-130, -50, 10, 20] : [-10, -50, 130, 20] });
        }
        if (role === 'birds') items.push({ type: role, x, y: 90 + rng() * 140, seed, box: [-70, -35, 70, 30] });
      });
      this.plans.set(k, items);
      // Old plans are cheap but not free: keep a window around the view.
      for (const key of this.plans.keys()) if (key < k - 6) this.plans.delete(key);
      return items;
    }

    drawItem(c, it) {
      R = mulberry32(it.seed);
      switch (it.type) {
        case 'mount': mountain(c, it.x, it.y, it.nseed, { hei: it.hei, wid: it.wid, tex: it.hei < 120 ? 110 : 260 }); break;
        case 'house': house(c, it.x, it.y, { wid: it.wid }); break;
        case 'village': village(c, it.x, it.y); break;
        case 'bridge': bridge(c, it.x, it.y, { len: it.len }); break;
        case 'rock': rock(c, it.x, it.y, { wid: it.wid, hei: it.hei }); break;
        case 'water': water(c, it.x, it.y, { len: 500, clu: 8 }); break;
        case 'boat': water(c, it.x + (it.fli ? -60 : 60), it.y + 28, { len: 260, clu: 5 }); boat(c, it.x, it.y, { fli: it.fli, sca: 0.9 }); break;
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
      farRidge(c, x0, x1, 330, 230, 0.0035, 1, 205);
      farRidge(c, x0, x1, 430, 150, 0.005, 2, 190);

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
