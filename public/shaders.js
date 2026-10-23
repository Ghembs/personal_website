// Shared full-screen vertex shader: p5's rect() feeds a unit square,
// stretched here to cover clip space.
const VERT = `
precision highp float;
attribute vec3 aPosition;
void main() {
  vec4 p = vec4(aPosition, 1.0);
  p.xy = p.xy * 2.0 - 1.0;
  gl_Position = p;
}`;

// Source pass: kaleidoscope texture and flat clouds, cross-faded by uMix.
// Everything is computed from gl_FragCoord in CSS pixels with a top-left origin,
// the same space main.js uses to place the DOM links.
const SOURCE_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uDensity;
uniform float uTime;
uniform float uMix;
uniform sampler2D uKaleido;
uniform float uKRot;
uniform float uKSize;
uniform float uVertical;   // 1 on portrait screens: clouds drift upwards
uniform vec2 uMapOrigin;   // when uMapScale.x > 0, render a css region into a small
uniform vec2 uMapScale;    // target (css px per target px): used to sample cloud density
uniform vec2 uMapPx;
uniform float uShan;       // shan shui view, a snapshot of the handscroll
uniform sampler2D uShanTex;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

// The tunnel is drawn by kaleido.js on a square canvas of side uKSize, centred
// on the screen and rotated by uKRot (CSS): undo the rotation to sample it.
vec3 kaleido(vec2 css) {
  vec2 p = css - 0.5 * uRes;
  float c = cos(uKRot), s = sin(uKRot);
  vec2 local = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  return texture2D(uKaleido, local / uKSize + 0.5).rgb;
}

vec3 clouds(vec2 css) {
  float m = min(uRes.x, uRes.y);
  if (uVertical > 0.5) css = css.yx;
  vec2 p = css / m * vec2(1.0, 2.2);
  float far  = fbm(p * 1.6 + vec2(uTime * 0.02, 3.0));
  float near = fbm(p * 1.1 + vec2(uTime * 0.045, 0.0));
  float c = max(smoothstep(0.6, 0.8, far) * 0.5, smoothstep(0.56, 0.74, near));
  return vec3(c);
}

void main() {
  vec2 css = uMapScale.x > 0.0
    ? uMapOrigin + vec2(gl_FragCoord.x, uMapPx.y - gl_FragCoord.y) * uMapScale
    : vec2(gl_FragCoord.x, uRes.y * uDensity - gl_FragCoord.y) / uDensity;
  vec3 col = vec3(0.0);
  if (uMix < 0.999) col += kaleido(css) * (1.0 - uMix);
  if (uMix > 0.001) col += clouds(css) * uMix;
  if (uShan > 0.001) col = mix(col, texture2D(uShanTex, css / uRes).rgb, uShan);
  gl_FragColor = vec4(col, 1.0);
}`;

// ASCII pass: pixelates the source and swaps each cell for a glyph from the atlas.
// uAscii 0 -> pure source, ~0.5 -> growing pixels, 1 -> glyph grid.
const ASCII_FRAG = `
precision highp float;
uniform sampler2D uSrc;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform float uDensity;
uniform vec2 uCell;
uniform float uGlyphs;
uniform float uAscii;
uniform float uColorMode;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uInvert;     // 1 for ink on paper (shan shui): dark ink makes dense glyphs

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y * uDensity - gl_FragCoord.y) / uDensity;

  float grow = smoothstep(0.0, 0.55, uAscii);
  vec2 cell = mix(vec2(1.0 / uDensity), uCell, grow);
  vec2 ci = floor(css / cell);
  vec2 cc = (ci + 0.5) * cell;
  vec3 src = texture2D(uSrc, vec2(cc.x / uRes.x, 1.0 - cc.y / uRes.y)).rgb;

  float lum = dot(src, vec3(0.299, 0.587, 0.114));
  lum = mix(lum, 1.0 - lum * 1.15, uInvert);
  lum = pow(clamp(lum * 1.15, 0.0, 0.999), 0.8);
  float gi = floor(lum * uGlyphs);
  vec2 local = fract(css / cell);
  float g = texture2D(uAtlas, vec2((gi + local.x) / uGlyphs, local.y)).r;

  vec3 tint = mix(uInk, clamp(src * 1.5 + 0.15, 0.0, 1.0), uColorMode);
  vec3 ascii = mix(uPaper, tint, g);

  gl_FragColor = vec4(mix(src, ascii, smoothstep(0.45, 1.0, uAscii)), 1.0);
}`;
