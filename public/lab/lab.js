// The lab notebook: one card per experiment, pinned to graph paper. Cards of
// experiments that exist link to them and may show a live preview; the
// others are notes of what is coming.

const TEXT = {
  it: {
    back: '← giulianogambacorta', title: 'quaderno di laboratorio', lang: 'EN',
    sub: 'esperimenti, prototipi, piccoli strumenti. alcuni finiti, altri a metà.',
    foot: 'Ogni esperimento ha la sua pagina e il suo aspetto.', open: 'apri →', soon: 'in preparazione',
    docTitle: 'Laboratorio · Giuliano Gambacorta',
  },
  en: {
    back: '← giulianogambacorta', title: 'lab notebook', lang: 'IT',
    sub: 'experiments, prototypes, small tools. some finished, some halfway.',
    foot: 'Every experiment has its own page and its own look.', open: 'open →', soon: 'in the works',
    docTitle: 'Lab · Giuliano Gambacorta',
  },
};
const t = (k) => I18N.t(TEXT, k);

// The experiments. `href` for those that exist; `preview` 'scenes' runs the
// ascii scene engine live in the card; `sketch` is a drawing for the others.
const EXPERIMENTS = [
  {
    id: 'scene', href: 'scene/', date: '2026-10', preview: 'scenes', tags: ['ascii', 'generativo'],
    title: { it: 'Catalogo delle scene', en: 'Scene catalogue' },
    text: {
      it: 'Tutti i pezzi delle scene ASCII della home, divisi per categoria: ambienti, ore, mezzi, monumenti, alberi, animali. Si scelgono e si mettono in fila.',
      en: 'Every piece of the home page ascii scenes, by category: lands, times, vehicles, landmarks, trees, animals. Pick them and line them up.',
    },
  },
  {
    id: 'composer', date: '…', tags: ['ascii', 'generativo'],
    title: { it: 'Compositore di scene', en: 'Scene composer' },
    text: {
      it: 'Dal catalogo a una scena animata: ambiente, meteo e protagonista a scelta, da condividere con un link.',
      en: 'From the catalogue to a moving scene: land, weather and hero of your choice, shared with a link.',
    },
    sketch: ['  .--.     ~v~', ' (    )-.', '(______)', '    ____|[]__', '   |  o  o  |>', '___(O)(O)(O)___'],
  },
  {
    id: 'house', date: '…', tags: ['domotica', 'Vesta Laris'],
    title: { it: 'Una casa che si accende', en: 'A house that lights up' },
    text: {
      it: 'Una casa in sezione con luci, sensori e termostato da toccare: l\'idea di Vesta Laris, in piccolo.',
      en: 'A house in cross-section with lights, sensors and a thermostat to touch: the idea of Vesta Laris, in small.',
    },
    sketch: ['      /\\', '     /  \\', '    /____\\', '    |[*]#|', '    |[ ]o|', '    |____|'],
  },
  {
    id: 'shanshui', date: '…', tags: ['generativo', '山水'],
    title: { it: 'Pittore di shan shui', en: 'Shan shui painter' },
    text: {
      it: 'Il rotolo di paesaggio della home, a tutto schermo, con i suoi parametri e l\'esportazione dell\'immagine.',
      en: 'The home page landscape scroll, full screen, with its parameters and image export.',
    },
    sketch: ['     /\\', '  /\\/  \\  /\\', ' /  \\   \\/  \\', '~~~~~~~~~~~~~~', '  ~~  _/\\_ ~~'],
  },
  {
    id: 'tones', date: '…', tags: ['cinese', 'audio'],
    title: { it: 'Allenamento sui toni', en: 'Tone trainer' },
    text: {
      it: 'Ascolta una sillaba e indovina il tono. Usa la sintesi vocale del dispositivo, come l\'introduzione al cinese.',
      en: 'Hear a syllable and guess its tone. It uses the device\'s speech synthesis, like the introduction to Chinese.',
    },
    sketch: ['  ā   á   ǎ   à', ' ___  /  \\_/  \\', '               \\'],
  },
];

const TAGS = { en: { generativo: 'generative', domotica: 'home-automation', cinese: 'chinese' } };
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  const L = I18N.lang;
  $('#bench').innerHTML = EXPERIMENTS.map((x, k) => {
    const tilt = ((k * 37) % 7 - 3) * 0.6;
    const body = `
      <div class="tape"></div>
      <div class="view">${x.preview ? `<canvas data-preview="${x.preview}"></canvas>` : `<pre>${esc(x.sketch.join('\n'))}</pre>`}</div>
      <h2>${x.title[L]}</h2>
      <p>${x.text[L]}</p>
      <div class="meta"><span>${x.tags.map((g) => `#${TAGS[L]?.[g] || g}`).join(' ')}</span><span class="when">${x.href ? t('open') : t('soon')}</span></div>`;
    return x.href
      ? `<a class="card" href="${x.href}" style="--tilt:${tilt}deg">${body}</a>`
      : `<div class="card soon" style="--tilt:${tilt}deg">${body}</div>`;
  }).join('');
  startPreviews();
}

// Live previews: the ascii scenes engine, in the card, only while it is seen.
let running = [];
function startPreviews() {
  running.forEach((r) => r.stop());
  running = [];
  document.querySelectorAll('canvas[data-preview="scenes"]').forEach((cv) => {
    const box = cv.parentElement;
    const sc = new Scenes(cv, [], '', {});
    sc.setText([], '', {});
    const size = () => sc.resize(box.clientWidth, box.clientHeight, window.devicePixelRatio || 1);
    size();
    sc.pick();
    let on = false, last = 0, raf = 0, since = 0;
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000 || 0);
      last = now;
      since += dt;
      if (since > 14) { sc.pick(); since = 0; }        // a new scene now and then
      sc.update(dt);
      sc.render();
      if (on) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) { last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    });
    io.observe(cv);
    window.addEventListener('resize', size);
    running.push({ stop: () => { on = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); } });
  });
}

$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
document.fonts.load('400 13px "JetBrains Mono"').finally(render);
