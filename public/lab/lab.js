// The toy box ("cesta dei giochi"): one card per toy, pinned to graph paper.
// Cards of toys that exist link to them and may show a live preview; the
// others are notes of what is coming.

const TEXT = {
  it: {
    back: '← giulianogambacorta', title: 'Cesta dei giochi', lang: 'EN',
    sub: "Un'alternativa sana ed estetica al doomscrolling.",
    foot: 'Non si vince nulla ma fa stare bene lo stesso.', open: 'apri →', soon: 'in preparazione', building: 'in costruzione →',
    docTitle: 'Cesta dei giochi · Giuliano Gambacorta',
  },
  en: {
    back: '← giulianogambacorta', title: 'The toy box', lang: 'IT',
    sub: 'A healthy, good-looking alternative to doomscrolling.',
    foot: 'Nothing to win, but it feels good all the same.', open: 'open →', soon: 'in the works', building: 'under construction →',
    docTitle: 'The toy box · Giuliano Gambacorta',
  },
};
const t = (k) => I18N.t(TEXT, k);

// The experiments. `href` for those that exist; `preview` runs the ascii scene
// engine ('scenes') or the handscroll ('shanshui') live in the card; `sketch`
// is a drawing for the others.
const EXPERIMENTS = [
  {
    id: 'composer', href: 'scene/', preview: 'scenes', tags: ['ascii', 'generativo'],
    title: { it: 'Compositore di scene', en: 'Scene composer' },
    text: {
      it: 'Le scene ASCII della home, da comporre a piacere: ambiente, ora, meteo, mezzi, monumenti, alberi e animali, ognuno al suo posto. Si salva come immagine o come testo.',
      en: 'The home page ascii scenes, to put together as you like: land, time, weather, vehicles, landmarks, trees and animals, each in its place. Save it as an image or as text.',
    },
  },
  {
    id: 'shanshui', href: 'shanshui/', preview: 'shanshui', tags: ['generativo', '山水'],
    title: { it: 'Pittore di shan shui', en: 'Shan shui painter' },
    text: {
      it: 'Il rotolo di paesaggio della home, con tutti gli elementi dell\'originale: montagne, altopiani, acque, alberi, architetture e figure, ognuno con la sua densità. Si dipinge su conferma e si salva come immagine.',
      en: 'The home page landscape scroll, with all the original\'s elements: mountains, plateaus, waters, trees, buildings and figures, each with its density. It is painted when you confirm, and saved as an image.',
    },
  },
  {
    id: 'chinese', href: '../cinese/esercizi/', tags: ['cinese', 'audio'],
    title: { it: '中文练习', en: '中文练习' },
    text: {
      it: 'Esercizi di cinese sui caratteri e sulle parole HSK, dei livelli che vuoi: ascolto, pronuncia, lettura e scrittura, e altri in arrivo.',
      en: 'Chinese exercises on the HSK characters and words, from the levels you choose: listening, speaking, reading and writing, with more to come.',
    },
    sketch: ['  ā   á   ǎ   à', ' ___  /  \\_/  \\', '  飞机  →  airplane'],
  },
  {
    id: 'timer', href: 'timer/', tags: ['allenamento', 'strumento'],
    title: { it: 'Timer a turni', en: 'Interval timer' },
    text: {
      it: 'Un timer per tabata, circuiti e intervalli: turni ripetibili con le sezioni che vuoi, preparazione, recuperi e pause. Senza account, abbonamenti o consensi; i piani restano nel browser o si passano con un link.',
      en: 'A timer for tabata, circuits and intervals: repeatable blocks with the sections you like, a get-ready, rests and pauses. No account, subscription or consent; plans stay in the browser or travel as a link.',
    },
    sketch: ['   ▶ 0:40', '  ████████████░░░░░░', '  lavoro   riposo   ×4', '  ⟳ recupero 1:00'],
  },
];

const TAGS = { en: { generativo: 'generative', domotica: 'home-automation', cinese: 'chinese', allenamento: 'workout', strumento: 'tool' } };
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Each load pins the cards anew, as Resina's "tagli" does: the tape in other
// places, and the paper torn along a side or two by an svg turbulence that
// bites into its edge. Drawn once per load, so a language switch keeps them.
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];

// where a piece of tape may go: centre in % of the card, angle in degrees
const SPOTS = {
  top: () => [rnd(28, 72), rnd(-1, 1), rnd(-9, 9)],
  tl: () => [rnd(3, 8), rnd(0, 3), rnd(-50, -30)],
  tr: () => [rnd(92, 97), rnd(0, 3), rnd(30, 50)],
  bl: () => [rnd(3, 8), rnd(97, 100), rnd(30, 50)],
  br: () => [rnd(92, 97), rnd(97, 100), rnd(-50, -30)],
  left: () => [rnd(-1, 1), rnd(22, 55), 90 + rnd(-7, 7)],
  right: () => [rnd(99, 101), rnd(22, 55), 90 + rnd(-7, 7)],
};
const LAYOUTS = [['top'], ['top'], ['tl', 'tr'], ['tl', 'br'], ['tr', 'bl'], ['left', 'right'], ['top', 'bl', 'br'], ['tl', 'tr', 'br'], ['tl', 'tr', 'bl', 'br']];
const TAPES = ['240, 214, 140', '240, 214, 140', '236, 226, 196', '255, 255, 255'];

// an end of the tape, torn off by hand: a zigzag of a few points
function tornEnd(len, right) {
  const pts = [];
  for (let i = 0, n = 4 + Math.floor(Math.random() * 3); i <= n; i++) {
    const x = (rnd(0, 4) / len) * 100;
    pts.push(`${(right ? 100 - x : x).toFixed(1)}% ${(right ? 100 - (i / n) * 100 : (i / n) * 100).toFixed(1)}%`);
  }
  return pts;
}

function tape() {
  return pick(LAYOUTS).map((s) => {
    const [x, y, a] = SPOTS[s]();
    const len = Math.round(rnd(68, 118)), tall = Math.round(rnd(20, 27));
    const clip = [...tornEnd(len, false), ...tornEnd(len, true)].join(',');
    return `<i class="tape" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${len}px;height:${tall}px;--tc:${pick(TAPES)};--ta:${rnd(0.55, 0.8).toFixed(2)};transform:translate(-50%,-50%) rotate(${a.toFixed(1)}deg);clip-path:polygon(${clip})"></i>`;
  }).join('');
}

// Resina's filter, smaller for a card: noise displaces the paper, and only
// what stays inside its old shape is kept, so the edge is bitten, never grown.
// The paper reaches past the card on its whole sides and is clipped back
// straight there; only the torn ones keep their bites.
const REACH = 14;
function paper(k) {
  const sides = ['top', 'right', 'bottom', 'left'];
  const torn = new Set([pick(sides)]);
  if (Math.random() < 0.35) torn.add(pick(sides));
  const filter = `<filter id="tear${k}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${rnd(0.03, 0.07).toFixed(3)}" numOctaves="${Math.round(rnd(3, 5))}" seed="${Math.floor(Math.random() * 1e5)}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="${Math.round(rnd(10, 18))}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feComposite in="d" in2="SourceGraphic" operator="in" result="c"/>
    <feDropShadow dx="0" dy="1" stdDeviation="0.7" flood-opacity="0.2"/>
  </filter>`;
  const inset = sides.map((s) => (torn.has(s) ? '0' : `-${REACH}px`)).join(' ');
  const clip = sides.map((s) => (torn.has(s) ? '-30px' : `${REACH}px`)).join(' ');
  return { filter, html: `<div class="paper" style="inset:${inset};clip-path:inset(${clip});filter:url(#tear${k})"></div>` };
}

const DECOR = EXPERIMENTS.map((x, k) => ({ tilt: rnd(-2.4, 2.4).toFixed(2), tape: tape(), paper: paper(k) }));
document.body.insertAdjacentHTML('beforeend', `<svg class="defs" aria-hidden="true"><defs>${DECOR.map((d) => d.paper.filter).join('')}</defs></svg>`);

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  const L = I18N.lang;
  $('#bench').innerHTML = EXPERIMENTS.map((x, k) => {
    const { tilt } = DECOR[k];
    const body = `
      ${DECOR[k].paper.html}${DECOR[k].tape}
      <div class="view">${x.preview === 'scenes' ? '<canvas data-preview="scenes"></canvas>' : x.preview ? `<div class="ink" data-preview="${x.preview}"></div>` : `<pre>${esc(x.sketch.join('\n'))}</pre>`}</div>
      <h2>${x.title[L]}</h2>
      <p>${x.text[L]}</p>
      <div class="meta"><span>${x.tags.map((g) => `#${TAGS[L]?.[g] || g}`).join(' ')}</span><span class="when">${x.href ? t(x.status || 'open') : t('soon')}</span></div>`;
    return x.href
      ? `<a class="card" href="${x.href}" style="--tilt:${tilt}deg">${body}</a>`
      : `<div class="card soon" style="--tilt:${tilt}deg">${body}</div>`;
  }).join('');
  startPreviews();
}

// Live previews, in the card, only while it is seen.
let running = [];
function whileSeen(el, frame, size) {
  let on = false, last = 0, raf = 0;
  const loop = (now) => {
    frame(Math.min(0.1, (now - last) / 1000 || 0));
    last = now;
    if (on) raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on) { last = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  });
  io.observe(el);
  window.addEventListener('resize', size);
  running.push({ stop: () => { on = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); } });
}

// the handscroll, with a few of the original's elements the home doesn't show
const SHAN_PREVIEW = { 'mountains.plateau': 1, 'trees.pine': 0.6, 'buildings.tower': 0.8, 'buildings.hall': 0.6 };

function startPreviews() {
  running.forEach((r) => r.stop());
  running = [];
  document.querySelectorAll('[data-preview="shanshui"]').forEach((box) => {
    const sh = new Shanshui(box, [], SHAN_PREVIEW);
    const size = () => { sh.resize(box.clientWidth, box.clientHeight, window.devicePixelRatio || 1); sh.update(0); };
    size();
    whileSeen(box, (dt) => sh.update(dt), size);
  });
  document.querySelectorAll('canvas[data-preview="scenes"]').forEach((cv) => {
    const box = cv.parentElement;
    const sc = new Scenes(cv, [], '', {});
    sc.setText([], '', {});
    const size = () => sc.resize(box.clientWidth, box.clientHeight, window.devicePixelRatio || 1);
    size();
    sc.pick();
    let since = 0;
    whileSeen(cv, (dt) => {
      since += dt;
      if (since > 14) { sc.pick(); since = 0; }        // a new scene now and then
      sc.update(dt);
      sc.render();
    }, size);
  });
}

$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
document.fonts.load('400 13px "JetBrains Mono"').finally(render);
