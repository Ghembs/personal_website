// The shan shui painter: a recipe of elements and densities, painted into a
// handscroll (or a screen-sized frame) only when asked, then saved as an image.
// The recipe lives in the URL: ?d=mountains.plateau:1.5,trees.pine:0.8&seed=42&f=scroll:4
// (d lists what differs from the home's handscroll).

const TEXT = {
  it: {
    back: '[ ← cesta dei giochi ]', title: 'pittore di shan shui', lang: 'EN', open: '[ ≡ ricetta ]', close: '[ × ]', closeLabel: 'chiudi',
    hint: 'scegli cosa far apparire e quanto: il paesaggio si dipinge solo quando confermi',
    paint: '[ dipingi ]', save: '[ salva immagine ]', format: 'formato', scroll: 'rotolo', screen: 'a schermo', length: 'lunghezza',
    seed: 'seme', reseed: '[ nuovo seme ]', random: '[ a caso ]', home: '[ come nella home ]', clear: '[ svuota ]',
    count: '{n} elementi', needs: 'serve: {name}', or: ' o ', orig: 'da shan-shui-inf',
    empty: 'componi la ricetta e premi [ dipingi ]', painting: 'dipingo… {k}/{n}', nothing: 'la ricetta è vuota: solo carta',
    foot: 'Disegni portati, e semplificati, da <a href="https://github.com/LingDong-/shan-shui-inf">shan-shui-inf</a> di Lingdong Huang (MIT); case, villaggi, padiglioni, ponti, viandanti e stormi sono nuovi.',
    docTitle: 'Pittore di shan shui · Giuliano Gambacorta',
  },
  en: {
    back: '[ ← the toy box ]', title: 'shan shui painter', lang: 'IT', open: '[ ≡ recipe ]', close: '[ × ]', closeLabel: 'close',
    hint: 'choose what appears and how much of it: the landscape is painted only when you confirm',
    paint: '[ paint ]', save: '[ save image ]', format: 'format', scroll: 'scroll', screen: 'screen', length: 'length',
    seed: 'seed', reseed: '[ new seed ]', random: '[ random ]', home: '[ as on the home page ]', clear: '[ clear ]',
    count: '{n} elements', needs: 'needs: {name}', or: ' or ', orig: 'from shan-shui-inf',
    empty: 'compose the recipe and press [ paint ]', painting: 'painting… {k}/{n}', nothing: 'the recipe is empty: just paper',
    foot: 'Drawings ported, and simplified, from <a href="https://github.com/LingDong-/shan-shui-inf">shan-shui-inf</a> by Lingdong Huang (MIT); the houses, villages, pavilions, bridges, wanderers and flocks are new.',
    docTitle: 'Shan shui painter · Giuliano Gambacorta',
  },
};
const t = (k, v) => I18N.t(TEXT, k, v);
const $ = (s) => document.querySelector(s);

const CATALOG = Shanshui.catalog;
const ITEM = new Map(CATALOG.flatMap((c) => c.items.map((it) => [`${c.id}.${it.id}`, it])));
const KEYS = [...ITEM.keys()];
const HOME = Object.fromEntries(KEYS.map((k) => [k, ITEM.get(k).def || 0]));
// where the painter starts: the home's handscroll and a few of the original's elements
const START = { ...HOME, 'mountains.plateau': 0.8, 'trees.pine': 0.6, 'buildings.hall': 0.6, 'buildings.tower': 0.6, 'figures.people': 0.6, 'water.poler': 0.5 };
const MAX = 3;
const newSeed = () => (Math.random() * 1e9) | 0;
const round = (v) => Math.round(v * 10) / 10;

// ---------- the recipe, and the URL ----------

let dens = { ...START }, seed = newSeed(), format = 'scroll', length = 4;
const last = {};        // the density an element had before it was switched off

const q = new URLSearchParams(location.search);
const fromUrl = q.has('d') || q.has('seed');
if (q.has('d')) {
  dens = { ...HOME };
  for (const pair of q.get('d').split(',')) {
    const [k, v] = pair.split(':');
    if (ITEM.has(k)) dens[k] = Math.min(MAX, Math.max(0, +v || 0));
  }
}
if (q.has('seed')) seed = (+q.get('seed') >>> 0) || seed;
if (q.get('f')) {
  const [f, n] = q.get('f').split(':');
  format = f === 'screen' ? 'screen' : 'scroll';
  length = Math.min(8, Math.max(2, +n || 4));
}

function save() {
  const p = new URLSearchParams();
  const d = KEYS.filter((k) => dens[k] !== HOME[k]).map((k) => `${k}:${dens[k]}`);
  if (d.length) p.set('d', d.join(','));
  p.set('seed', seed);
  p.set('f', format === 'screen' ? 'screen' : `scroll:${length}`);
  history.replaceState(null, '', `${location.pathname}?${p.toString().replace(/%3A/g, ':').replace(/%2C/g, ',')}`);
}

// the densities as painted: an element without what it needs is at 0
const effective = () => Shanshui.densities(dens);
const blocked = (k) => {
  const needs = [].concat(ITEM.get(k).needs || []);
  return needs.length && !needs.some((n) => effective()[n] > 0) ? needs : null;
};

let dirty = true;
function changed() {
  dirty = true;
  $('#paint').classList.add('dirty');
  save();
}

// ---------- the drawer ----------

function catalog() {
  const L = I18N.lang, name = (k) => ITEM.get(k).name[L].toLowerCase();
  $('#catalog').innerHTML = CATALOG.map((c) => `
    <section class="cat">
      <h2>${c.name[L]} <small>${t('count', { n: c.items.length })}</small></h2>
      <div class="items">${c.items.map((it) => {
        const key = `${c.id}.${it.id}`, v = dens[key], b = blocked(key);
        const why = b ? t('needs', { name: b.map(name).join(t('or')) }) : '';
        return `<div class="item${v > 0 && !b ? ' on' : ''}${b ? ' off' : ''}" data-key="${key}"${b ? ` title="${why}"` : ''}>
          <button class="thumb" ${b ? 'disabled' : ''} aria-pressed="${v > 0}" title="${it.orig ? t('orig') : ''}"><canvas data-sample="${key}"></canvas></button>
          <span class="name">${it.name[L]} <output>${v > 0 ? `×${v.toFixed(1)}` : '–'}</output></span>
          <input type="range" min="0" max="${MAX}" step="0.1" value="${v}" ${b ? 'disabled' : ''} aria-label="${it.name[L]}">
          ${b ? `<span class="why">${why}</span>` : ''}
        </div>`;
      }).join('')}</div>
    </section>`).join('');
  thumbs();
}

// Thumbnails: each element drawn alone, a few per frame (they are cached).
const drawn = new Map();
let thumbQueue = [];
function thumbs() {
  thumbQueue = [...document.querySelectorAll('canvas[data-sample]')];
  const step = () => {
    const t0 = performance.now();
    while (thumbQueue.length && performance.now() - t0 < 12) {
      const cv = thumbQueue.shift(), key = cv.dataset.sample;
      if (!drawn.has(key)) {
        const it = ITEM.get(key), dpr = Math.min(2, window.devicePixelRatio || 1);
        const sc = Math.min(130 / it.view[0], 74 / it.view[1]) * dpr;
        const src = document.createElement('canvas');
        Shanshui.sample(src, key, { seed: 7, scale: sc });
        drawn.set(key, { src, dpr });
      }
      const { src, dpr } = drawn.get(key);
      cv.width = src.width; cv.height = src.height;
      cv.style.width = `${src.width / dpr}px`;
      cv.getContext('2d').drawImage(src, 0, 0);
    }
    if (thumbQueue.length) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// one element changed: its card, and those whose needs it may have changed
function refresh() {
  for (const el of document.querySelectorAll('.item')) {
    const key = el.dataset.key, v = dens[key], b = blocked(key);
    if (!!b !== el.classList.contains('off')) { catalog(); return; }
    el.classList.toggle('on', v > 0 && !b);
    el.querySelector('output').textContent = v > 0 ? `×${v.toFixed(1)}` : '–';
    el.querySelector('input').value = v;
    el.querySelector('.thumb').setAttribute('aria-pressed', v > 0);
  }
}

$('#catalog').addEventListener('input', (e) => {
  const el = e.target.closest('.item');
  if (!el || e.target.type !== 'range') return;
  dens[el.dataset.key] = round(+e.target.value);
  refresh();
  changed();
});
$('#catalog').addEventListener('click', (e) => {
  const b = e.target.closest('.thumb');
  if (!b || b.disabled) return;
  const key = b.closest('.item').dataset.key;
  if (dens[key] > 0) { last[key] = dens[key]; dens[key] = 0; } else dens[key] = last[key] || 1;
  refresh();
  changed();
});

function controls() {
  document.querySelectorAll('input[name=format]').forEach((r) => { r.checked = r.value === format; });
  $('#length').value = length;
  $('#length-out').textContent = length;
  $('.format .len').classList.toggle('off', format !== 'scroll');
  $('#seed').value = seed;
}
document.querySelectorAll('input[name=format]').forEach((r) => r.addEventListener('change', () => { format = r.value; controls(); changed(); }));
$('#length').addEventListener('input', () => { length = +$('#length').value; format = 'scroll'; controls(); changed(); });
$('#seed').addEventListener('change', () => { seed = (+$('#seed').value >>> 0) || 0; controls(); changed(); });
$('#reseed').addEventListener('click', () => { seed = newSeed(); controls(); changed(); });
$('#home').addEventListener('click', () => { dens = { ...HOME }; catalog(); changed(); });
$('#clear').addEventListener('click', () => { dens = Object.fromEntries(KEYS.map((k) => [k, 0])); catalog(); changed(); });
// a random recipe, still a landscape: some ground, some water, distant ridges
$('#random').addEventListener('click', () => {
  for (const k of KEYS) dens[k] = Math.random() < 0.45 ? round(0.4 + Math.random() * 1.6) : 0;
  if (!(dens['mountains.mount'] || dens['mountains.hill'] || dens['mountains.plateau'])) dens['mountains.mount'] = 1;
  dens['water.waves'] ||= 1;
  dens['mountains.ridges'] ||= 1;
  seed = newSeed();
  controls();
  catalog();
  changed();
});

const drawer = (on) => {
  document.body.classList.toggle('open', on);
  $('#open').setAttribute('aria-expanded', on);
};
$('#open').addEventListener('click', () => drawer(true));
$('#close').addEventListener('click', () => drawer(false));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') drawer(!document.body.classList.contains('open'));
  else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) paint();
});

// ---------- painting ----------

let painting = null, busy = false;

// The red seal, bottom right: 山水 in two columns.
async function seal(cv) {
  try { await document.fonts.load('60px "Ma Shan Zheng"', '山水'); } catch (e) { /* the system's font, then */ }
  const g = cv.getContext('2d'), S = Math.round(cv.height * 0.07), x = cv.width - S * 1.6, y = cv.height - S * 1.7;
  g.save();
  g.fillStyle = 'rgba(178, 52, 38, 0.86)';
  g.beginPath();
  g.roundRect(x, y, S, S, S * 0.12);
  g.fill();
  g.fillStyle = 'rgba(250, 240, 225, 0.95)';
  g.font = `${S * 0.46}px "Ma Shan Zheng", serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('山', x + S / 2, y + S * 0.28);
  g.fillText('水', x + S / 2, y + S * 0.72);
  g.restore();
}

async function paint() {
  if (busy) return;
  busy = true;
  dirty = false;
  $('#paint').classList.remove('dirty');
  $('#paint').disabled = true;
  $('#empty').hidden = true;
  const empty = !Object.values(effective()).some((v) => v > 0);
  // a scroll: `length` panels, 1000 px tall; on screen: the window, at its own resolution
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const height = format === 'screen' ? Math.round(innerHeight * dpr) : 1000;
  const width = format === 'screen' ? Math.ceil(800 * (innerWidth / innerHeight)) : length * 800;
  const bar = $('#progress-bar');
  $('#progress').hidden = false;
  $('#progress-text').textContent = t(empty ? 'nothing' : 'painting', { k: 0, n: Math.ceil(width / 800) });
  bar.style.width = '0';
  try {
    const cv = await Shanshui.paint(effective(), seed, {
      width, height,
      onPanel: (k, n) => {
        $('#progress-text').textContent = t(empty ? 'nothing' : 'painting', { k, n });
        bar.style.width = `${(100 * k) / n}%`;
      },
    });
    await seal(cv);
    painting = cv;
    const art = $('#art');
    art.replaceChildren(cv);
    art.classList.toggle('screen', format === 'screen');
    art.scrollLeft = 0;
    $('#save').disabled = false;
    if (innerWidth <= 700) drawer(false);      // on a phone the sheet would hide it
  } finally {
    busy = false;
    $('#paint').disabled = false;
    setTimeout(() => { $('#progress').hidden = true; }, 600);
  }
}

$('#paint').addEventListener('click', paint);
$('#save').addEventListener('click', () => {
  if (!painting) return;
  painting.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shanshui-${seed}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
});

// Panning the scroll: drag it, or turn the wheel.
const art = $('#art');
let drag = null;
art.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' || art.classList.contains('screen')) return;     // touch scrolls natively
  drag = { x: e.clientX, left: art.scrollLeft };
  art.classList.add('drag');
  art.setPointerCapture(e.pointerId);
});
art.addEventListener('pointermove', (e) => { if (drag) art.scrollLeft = drag.left - (e.clientX - drag.x); });
art.addEventListener('pointerup', () => { drag = null; art.classList.remove('drag'); });
art.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { art.scrollLeft += e.deltaY; e.preventDefault(); }
}, { passive: false });

// ---------- start ----------

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  controls();
  catalog();
}
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });

render();
save();
drawer(innerWidth > 700 && !fromUrl);
if (fromUrl) paint();
