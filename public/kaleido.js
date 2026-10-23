// Cylindrical tunnel of glass rectangles, drawn with Canvas2D.
// The rectangle style (riso inks, offset shadow, double stroke) follows the
// "skew" sketch in Bruno Imbrizi's creative-coding-domestika-2022 (MIT).
// Rectangles are tiles on the inner wall of a cylinder (angle theta, depth z).
// Two motions:
//  - orbit:  the tiles are fixed and the whole cylinder turns around its axis.
//            The picture is drawn once and the canvas is rotated by CSS, so the
//            compositor does the work; it is redrawn only when something changes.
//  - flight: the camera flies along the axis, tiles are born small at the
//            vanishing point and grow towards the screen edges (redrawn per frame).
// The canvas is a square of side 2R (R = half screen diagonal) centred on the
// screen, so it covers the viewport at any rotation.
// Links are ordinary tiles in a neutral colour, always drawn on top, with their
// label cut out of the tile so whatever lies beneath shows through the letters.

const RISO = {
  aqua: '#5ec8e5', fluoPink: '#ff48b0', mint: '#82d8d5', sunflower: '#ffb511',
  brightRed: '#f15060', blue: '#0078bf', yellow: '#ffe800', purple: '#765ba7',
  flatGold: '#bb8b41', orange: '#ff6c2f',
};

const PALETTES = [
  { name: 'acqua e rosa',  bg: '#141518', inks: [RISO.aqua, RISO.fluoPink] },
  { name: 'menta e sole',  bg: '#1c1d21', inks: [RISO.mint, RISO.sunflower] },
  { name: 'rosso e blu',   bg: '#101014', inks: [RISO.brightRed, RISO.blue] },
  { name: 'giallo viola',  bg: '#1a1a1e', inks: [RISO.yellow, RISO.purple] },
  { name: 'oro e menta',   bg: '#202125', inks: [RISO.flatGold, RISO.mint] },
  { name: 'arancio acqua', bg: '#17181c', inks: [RISO.orange, RISO.aqua] },
];

const FOCAL = 0.9;        // screen radius (in half-diagonals) of a point at z = 1
const Z_FAR = 14;
const Z_NEAR = 0.15;
const SPEED = 1.4;        // flight: depth units per second
const COUNT_MIN = 30, COUNT_MAX = 80;
const ARC_STEPS = 8;
const EXIT_MARGIN = 1.15; // flight: a tile is recycled once its inner edge is this far out
const LINK_FILL = '#eeece6';   // opaque: only the cut-out letters show what lies beneath
const LINK_FONT = '600 {s}px "Space Grotesk", system-ui, sans-serif';

function shade(hex, k, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `rgba(${c.join(',')},${alpha})`;
}

const byDepth = (a, b) => b.z - a.z;

class Kaleido {
  constructor(canvas, labels) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // Link tiles are composed here first, so their label can be cut out of them.
    this.scratch = document.createElement('canvas');
    this.sctx = this.scratch.getContext('2d');
    this.labels = labels;
    this.coreRadius = 120;
    this.flight = false;
    this.dirty = true;
    this.paletteIndex = (Math.random() * PALETTES.length) | 0;
    // Label widths at 100px, to fit the text in its tile without measuring every frame.
    this.ctx.font = LINK_FONT.replace('{s}', 100);
    this.labelWidths = labels.map((l) => this.ctx.measureText(l).width);
  }

  get palette() { return PALETTES[this.paletteIndex]; }
  get rotSpeed() { return this.flight ? 0.02 : 0.05; }

  resize(w, h, dpr) {
    this.w = w; this.h = h; this.dpr = dpr;
    this.R = Math.hypot(w, h) / 2;
    this.F = this.R * FOCAL;   // px radius at z = 1
    this.canvas.width = this.canvas.height = Math.ceil(2 * this.R * dpr);
    this.canvas.style.width = this.canvas.style.height = `${2 * this.R}px`;
    this.dirty = true;
  }

  // A new structure: new count, new tiles, links included.
  build() {
    const count = COUNT_MIN + Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1));
    this.rects = Array.from({ length: count }, () => this.spawn({}, true));
    this.links = this.labels.map((label, i) => this.spawn({ link: i, label }, true));
    this.linkOrder = [...this.links];
    this.dirty = true;
  }

  nextPalette() {
    this.paletteIndex = (this.paletteIndex + 1) % PALETTES.length;
    this.build();
    return this.palette;
  }

  setFlight(on) {
    this.flight = on;
    this.build();
  }

  spawn(r, initial) {
    const inks = this.palette.inks;
    const pick = () => inks[(Math.random() * inks.length) | 0];
    r.theta = Math.random() * Math.PI * 2;
    r.aw = 0.18 + Math.random() * 0.5;          // angular width
    r.d = 0.4 + Math.random() * 1.8;            // length along the axis
    if (this.flight) {
      r.z = initial ? 1 + Math.random() * (Z_FAR - 1) : Z_FAR * (0.9 + Math.random() * 0.2);
    } else {
      // Near edge spread evenly in screen radius, from the core to the corners.
      // Links stay within the inscribed circle, so they never leave the screen.
      const lo = this.coreRadius * (r.label ? 1.6 : 1.1);
      const hi = r.label ? (Math.min(this.w, this.h) / 2) * 0.9 : this.R * 0.98;
      r.z = this.F / (lo + Math.random() * Math.max(1, hi - lo));
    }
    r.fill = pick();
    r.stroke = pick();
    r.glass = !r.label && Math.random() > 0.5;
    r.shadow = shade(r.fill, 0.25, 0.6);
    return r;
  }

  radius(z) { return this.F / Math.max(z, Z_NEAR); }

  // Recycled only once even the inner (far) edge is well past the screen corners.
  gone(z, d) { return this.radius(z + d) > this.R * EXIT_MARGIN; }

  update(dt) {
    if (!this.flight) return;
    for (const r of this.rects) {
      r.z -= SPEED * dt;
      if (this.gone(r.z, r.d)) this.spawn(r, false);
    }
    for (const r of this.links) {
      r.z -= SPEED * dt;
      if (this.gone(r.z, r.d)) this.spawn(r, false);
    }
    this.dirty = true;
  }

  // Screen geometry of a tile at rotation rot: centre, tangent angle, size.
  geometry(r, rot) {
    const r0 = this.radius(r.z), r1 = this.radius(r.z + r.d);
    const rm = (r0 + r1) / 2;
    const a = r.theta + rot;
    return {
      x: this.w / 2 + Math.cos(a) * rm,
      y: this.h / 2 + Math.sin(a) * rm,
      rm, angle: a + Math.PI / 2, width: r.aw * rm, height: r0 - r1,
    };
  }

  // Should the label be turned half way round to read upright at rotation rot?
  flipFor(r, rot) { return Math.cos(r.theta + rot + Math.PI / 2) < 0; }

  tilePath(c, r, ox, oy) {
    const r0 = this.radius(r.z), r1 = this.radius(r.z + r.d);
    const a0 = r.theta - r.aw / 2, step = r.aw / ARC_STEPS;
    c.beginPath();
    for (let i = 0; i <= ARC_STEPS; i++) {
      const a = a0 + step * i;
      c[i ? 'lineTo' : 'moveTo'](ox + Math.cos(a) * r0, oy + Math.sin(a) * r0);
    }
    for (let i = ARC_STEPS; i >= 0; i--) {
      const a = a0 + step * i;
      c.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1);
    }
    c.closePath();
  }

  // Fog: fade in from the vanishing point.
  alpha(z) { return Math.max(0, Math.min(1, (Z_FAR - z) / 3)); }

  // Draws the structure unrotated; rot is only used to keep labels upright.
  draw(rot) {
    const { ctx: c, dpr, palette, R } = this;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.fillStyle = palette.bg;
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(dpr, 0, 0, dpr, R * dpr, R * dpr);

    this.rects.sort(byDepth);
    for (const r of this.rects) this.drawTile(c, r, rot);
    // Links always win overlaps: drawn last, far to near among themselves.
    this.linkOrder.sort(byDepth);
    for (const r of this.linkOrder) this.drawTile(c, r, rot);

    c.globalAlpha = 1;
    this.drawCore(c);
    this.dirty = false;
  }

  drawTile(c, r, rot) {
    const k = this.radius(r.z) / 100;   // size factor for strokes and shadows
    const alpha = this.alpha(r.z);
    if (alpha <= 0) return;

    if (r.glass) {
      this.tilePath(c, r, 0, 0);
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = alpha * 0.3;
      c.fillStyle = r.fill;
      c.fill();
      c.globalAlpha = alpha;
      c.lineWidth = Math.max(0.5, 0.35 * k);
      c.strokeStyle = r.fill;
      c.stroke();
      c.globalCompositeOperation = 'source-over';
      return;
    }

    // Offset shadow as a plain fill: much cheaper than ctx.shadow*.
    c.globalAlpha = alpha;
    this.tilePath(c, r, -1.2 * k, 2.4 * k);
    c.fillStyle = r.label ? 'rgba(0,0,0,0.55)' : r.shadow;
    c.fill();

    if (r.label) {
      this.drawLinkTile(c, r, k, rot);
      return;
    }
    this.tilePath(c, r, 0, 0);
    this.paintTile(c, r, k, r.fill);
  }

  paintTile(c, r, k, fill) {
    c.fillStyle = fill;
    c.fill();
    c.lineWidth = 0.7 * k;
    c.strokeStyle = r.stroke;
    c.stroke();
    c.lineWidth = Math.max(0.5, 0.18 * k);
    c.strokeStyle = '#000';
    c.stroke();
  }

  // Tile on the scratch canvas, label erased with destination-out, then pasted.
  drawLinkTile(c, r, k, rot) {
    const { dpr } = this;
    const r0 = this.radius(r.z), r1 = this.radius(r.z + r.d);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i <= ARC_STEPS; i++) {
      const a = r.theta - r.aw / 2 + (r.aw * i) / ARC_STEPS;
      for (const rr of [r0, r1]) {
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }
    const pad = 0.7 * k + 2;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    // Clip to the canvas: in flight a near tile can be far larger than the screen.
    x0 = Math.max(x0, -this.R); y0 = Math.max(y0, -this.R);
    x1 = Math.min(x1, this.R); y1 = Math.min(y1, this.R);
    if (x1 <= x0 || y1 <= y0) return;
    const sw = Math.ceil((x1 - x0) * dpr), sh = Math.ceil((y1 - y0) * dpr);
    const { scratch, sctx: s } = this;
    if (scratch.width < sw || scratch.height < sh) {
      scratch.width = Math.max(scratch.width, sw);
      scratch.height = Math.max(scratch.height, sh);
    }
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, sw, sh);
    s.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    this.tilePath(s, r, 0, 0);
    this.paintTile(s, r, k, r.hover ? '#111114' : LINK_FILL);
    s.globalCompositeOperation = 'destination-out';
    this.drawLabel(s, r, rot);
    s.globalCompositeOperation = 'source-over';
    c.drawImage(scratch, 0, 0, sw, sh, x0, y0, sw / dpr, sh / dpr);
  }

  // The label is set straight along the tile's tangent, as large as it fits.
  drawLabel(c, r, rot) {
    const g = this.geometry(r, 0);
    const size = Math.min((g.width * 0.78 * 100) / this.labelWidths[r.link], g.height * 0.5);
    r.flip = this.flipFor(r, rot);
    if (size < 3) return;
    c.save();
    c.translate(g.x - this.w / 2, g.y - this.h / 2);
    c.rotate(g.angle + (r.flip ? Math.PI : 0));
    c.font = LINK_FONT.replace('{s}', size.toFixed(1));
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#000';
    c.fillText(r.label, 0, size * 0.05);
    c.restore();
  }

  // The core: a hexagon tile with the title cut out of it, like the links.
  // titleLines / titleSize are set by main.js from the DOM title.
  drawCore(c) {
    const { palette, dpr } = this;
    const hr = this.coreRadius;
    const hex = (g, ox, oy) => {
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const t = (i / 6) * Math.PI * 2 - Math.PI / 2;
        g[i ? 'lineTo' : 'moveTo'](ox + Math.cos(t) * hr, oy + Math.sin(t) * hr);
      }
      g.closePath();
    };
    hex(c, -hr * 0.04, hr * 0.08);
    c.fillStyle = shade(palette.inks[0], 0.25, 0.6);
    c.fill();

    const half = hr + hr * 0.06, side = Math.ceil(2 * half * dpr);
    const { scratch, sctx: s } = this;
    if (scratch.width < side || scratch.height < side) {
      scratch.width = Math.max(scratch.width, side);
      scratch.height = Math.max(scratch.height, side);
    }
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, side, side);
    s.setTransform(dpr, 0, 0, dpr, half * dpr, half * dpr);
    hex(s, 0, 0);
    s.fillStyle = palette.inks[0];
    s.fill();
    s.lineWidth = hr * 0.06;
    s.strokeStyle = palette.inks[1];
    s.stroke();
    s.lineWidth = 1.5;
    s.strokeStyle = '#000';
    s.stroke();

    const lines = this.titleLines || [], size = this.titleSize || 17;
    s.globalCompositeOperation = 'destination-out';
    s.font = `300 ${size}px "Unbounded", system-ui, sans-serif`;
    s.letterSpacing = `${(size * 0.22).toFixed(2)}px`;
    s.textAlign = 'center';
    s.textBaseline = 'middle';
    const lh = size * 1.45;
    // letter-spacing also trails the last letter: shift by half of it to centre.
    lines.forEach((line, i) => s.fillText(line, size * 0.11, (i - (lines.length - 1) / 2) * lh));
    s.letterSpacing = '0px';
    s.globalCompositeOperation = 'source-over';

    c.drawImage(scratch, 0, 0, side, side, -half, -half, side / dpr, side / dpr);
  }
}
