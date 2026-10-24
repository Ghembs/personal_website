// The scene catalogue: every element of the ascii scenes by category, to pick
// from. Picked elements line up on the stage, in the colours of the picked
// land and time; the selection lives in the URL (?s=lands.desert,vehicles.dino).

const TEXT = {
  it: {
    back: '[ ← giulianogambacorta ]', title: 'catalogo delle scene', yours: 'la tua scena',
    hint: 'scegli gli elementi qui sotto: ambiente e ora danno i colori, il resto si mette in fila',
    clear: '[ svuota ]', random: '[ a caso ]', empty: '(vuota)', lang: 'EN', count: '{n} elementi',
    foot: 'Gli stessi disegni delle scene della home, letti da <code>scene-catalog.js</code>.',
    docTitle: 'Catalogo delle scene · Giuliano Gambacorta',
  },
  en: {
    back: '[ ← giulianogambacorta ]', title: 'scene catalogue', yours: 'your scene',
    hint: 'pick elements below: land and time set the colours, the rest lines up',
    clear: '[ clear ]', random: '[ random ]', empty: '(empty)', lang: 'IT', count: '{n} elements',
    foot: 'The same drawings as the home page scenes, read from <code>scene-catalog.js</code>.',
    docTitle: 'Scene catalogue · Giuliano Gambacorta',
  },
};
const t = (k, v) => I18N.t(TEXT, k, v);
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const { categories, widthOf } = SceneCatalog;
const byKey = new Map(categories.flatMap((c) => c.items.map((it) => [`${c.id}.${it.id}`, { cat: c, item: it }])));
// one land and one time at most; the rest is a list
const SINGLE = new Set(['lands', 'times']);

let picked = new URLSearchParams(location.search).get('s')?.split(',').filter((k) => byKey.has(k)) || [];

function save() {
  const q = picked.length ? `?s=${picked.join(',')}` : location.pathname;
  history.replaceState(null, '', q);
}

function toggle(key) {
  const { cat } = byKey.get(key);
  if (picked.includes(key)) picked = picked.filter((k) => k !== key);
  else {
    if (SINGLE.has(cat.id)) picked = picked.filter((k) => byKey.get(k).cat.id !== cat.id);
    picked.push(key);
  }
  save();
  render();
}

// The colours: the picked land's, then the picked time's on top.
const BASE = { bg: '#f4f1ea', fg: '#2f2b26', dim: '#9d968a', accent: '#c4553f', green: '#4f7a48', hl: '#151311' };
function palette() {
  let p = { ...BASE };
  for (const key of picked) {
    const { cat, item } = byKey.get(key);
    if (cat.id === 'lands') p = { ...p, ...item.palette };
  }
  for (const key of picked) {
    const { cat, item } = byKey.get(key);
    if (cat.id === 'times') p = { ...p, bg: item.palette.bg, fg: item.palette.fg, dim: item.palette.dim, accent: item.palette.accent };
  }
  return p;
}

// The stage: drawings side by side on one baseline, wrapped to the width.
function stage() {
  const pal = palette();
  const el = $('#stage');
  el.style.background = pal.bg;
  el.style.color = pal.fg;
  const things = picked.map((k) => byKey.get(k)).filter(({ cat }) => !SINGLE.has(cat.id) || cat.id === 'times');
  if (!things.length) { el.innerHTML = `<span style="color:${pal.dim}">${t('empty')}</span>`; return; }
  const cols = Math.max(30, Math.floor(el.clientWidth / 8.4) - 2);
  const rows = [];
  let line = [];
  let w = 0;
  for (const th of things) {
    const tw = widthOf(th.item.lines) + 3;
    if (w + tw > cols && line.length) { rows.push(line); line = []; w = 0; }
    line.push(th);
    w += tw;
  }
  rows.push(line);
  const colour = (it) => pal[it.role || 'fg'] || pal.fg;
  el.innerHTML = rows.map((ln) => {
    const h = Math.max(...ln.map((th) => th.item.lines.length));
    const out = [];
    for (let r = 0; r < h; r++) {
      out.push(ln.map((th) => {
        const lines = th.item.lines, pad = h - lines.length;
        const txt = r < pad ? '' : lines[r - pad];
        return `<span style="color:${colour(th.item)}">${esc(txt.padEnd(widthOf(lines) + 3))}</span>`;
      }).join(''));
    }
    out.push(`<span style="color:${pal.dim}">${'_'.repeat(Math.min(cols, ln.reduce((a, th) => a + widthOf(th.item.lines) + 3, 0)))}</span>`);
    return out.join('\n');
  }).join('\n\n');
}

function catalog() {
  $('#catalog').innerHTML = categories.map((c) => `
    <section class="cat">
      <h2>${c.name[I18N.lang]} <small>${t('count', { n: c.items.length })}</small></h2>
      <div class="items">${c.items.map((it) => {
        const key = `${c.id}.${it.id}`, on = picked.includes(key);
        const sw = it.palette ? `<span class="swatch">${['bg', 'fg', 'dim', 'accent', 'green'].map((k) => it.palette[k] ? `<i style="background:${it.palette[k]}"></i>` : '').join('')}</span>` : '';
        return `<button class="item${on ? ' on' : ''}" data-key="${key}" aria-pressed="${on}">
          <pre>${esc(it.lines.join('\n'))}</pre>
          <span class="name">${it.name[I18N.lang]}${sw}</span>
        </button>`;
      }).join('')}</div>
    </section>`).join('');
}

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  catalog();
  stage();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-key]');
  if (b) toggle(b.dataset.key);
});
$('#clear').addEventListener('click', () => { picked = []; save(); render(); });
$('#random').addEventListener('click', () => {
  const one = (id) => { const c = categories.find((x) => x.id === id); return `${id}.${c.items[(Math.random() * c.items.length) | 0].id}`; };
  picked = [one('lands'), one('times'), one('vehicles'), one('trees'), one('buildings'), one('animals'), one('sky')];
  if (Math.random() < 0.5) picked.push(one('landmarks'));
  save();
  render();
});
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
window.addEventListener('resize', stage);
render();
