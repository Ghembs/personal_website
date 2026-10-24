// The scene composer: pick elements from the catalogue and the ascii scene
// engine composes them into a moving scene (Scenes.compose). The recipe lives
// in the URL: ?s=lands.desert,vehicles.dino&v=1.2&d=0.8

const TEXT = {
  it: {
    back: '[ ← cesta dei giochi ]', title: 'compositore di scene', yours: 'la tua scena',
    hint: 'scegli un ambiente, un\'ora e quello che vuoi vederci dentro: ogni cosa trova il suo posto',
    clear: '[ svuota ]', random: '[ a caso ]', lang: 'EN', count: '{n} elementi',
    speed: 'velocità', density: 'densità', pause: '[ pausa ]', play: '[ riprendi ]',
    png: '[ salva immagine ]', txt: '[ copia testo ]', copied: '[ copiato ]',
    foot: 'Gli stessi disegni delle scene della home, letti da <code>scene-catalog.js</code>.',
    docTitle: 'Compositore di scene · Giuliano Gambacorta',
  },
  en: {
    back: '[ ← the toy box ]', title: 'scene composer', yours: 'your scene',
    hint: 'pick a land, a time and whatever you want in it: everything finds its place',
    clear: '[ clear ]', random: '[ random ]', lang: 'IT', count: '{n} elements',
    speed: 'speed', density: 'density', pause: '[ pause ]', play: '[ play ]',
    png: '[ save image ]', txt: '[ copy text ]', copied: '[ copied ]',
    foot: 'The same drawings as the home page scenes, read from <code>scene-catalog.js</code>.',
    docTitle: 'Scene composer · Giuliano Gambacorta',
  },
};
const t = (k, v) => I18N.t(TEXT, k, v);
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const { categories } = SceneCatalog;
const byKey = new Map(categories.flatMap((c) => c.items.map((it) => [`${c.id}.${it.id}`, { cat: c, item: it }])));
// one land and one time at most; the rest is a list
const SINGLE = new Set(['lands', 'times']);

const q = new URLSearchParams(location.search);
let picked = q.get('s')?.split(',').filter((k) => byKey.has(k)) || ['lands.countryside', 'times.day', 'vehicles.train'];
$('#speed').value = q.get('v') || 1;
$('#density').value = q.get('d') || 1;

function save() {
  const p = new URLSearchParams();
  if (picked.length) p.set('s', picked.join(','));
  if (+$('#speed').value !== 1) p.set('v', $('#speed').value);
  if (+$('#density').value !== 1) p.set('d', $('#density').value);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p.toString().replace(/%2C/g, ',')}` : ''}`);
}

function toggle(key) {
  const { cat } = byKey.get(key);
  if (picked.includes(key)) picked = picked.filter((k) => k !== key);
  else {
    if (SINGLE.has(cat.id)) picked = picked.filter((k) => byKey.get(k).cat.id !== cat.id);
    picked.push(key);
  }
  save();
  compose();
  catalog();
}

// ---------- the live scene ----------

const canvas = $('#stage');
const scenes = new Scenes(canvas, [], '', {});
let paused = false, last = 0;

function recipe() {
  const one = (cat) => picked.find((k) => k.startsWith(`${cat}.`))?.split('.')[1];
  return {
    land: one('lands') || 'countryside',
    time: one('times') || 'day',
    picks: picked.filter((k) => !SINGLE.has(byKey.get(k).cat.id)),
    speed: +$('#speed').value,
    density: +$('#density').value,
  };
}

function size() {
  const box = $('#view');
  // cells small enough for about 36 rows: the tallest landmarks fit in the sky
  const cellH = Math.max(8, Math.min(15, Math.floor(box.clientHeight / 36)));
  scenes.resize(box.clientWidth, box.clientHeight, window.devicePixelRatio || 1, cellH);
}

function compose() {
  scenes.compose(recipe());
  scenes.update(0);
  scenes.render();
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000 || 0);
  last = now;
  if (!paused) { scenes.update(dt); scenes.render(); }
  requestAnimationFrame(frame);
}

// ---------- the catalogue ----------

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
  $('#pause').textContent = paused ? t('play') : t('pause');
  catalog();
}

// ---------- controls ----------

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-key]');
  if (b) toggle(b.dataset.key);
});
$('#clear').addEventListener('click', () => { picked = []; save(); compose(); catalog(); });
$('#random').addEventListener('click', () => {
  const one = (id) => { const c = categories.find((x) => x.id === id); return `${id}.${c.items[(Math.random() * c.items.length) | 0].id}`; };
  picked = [one('lands'), one('times'), one('vehicles'), one('trees'), one('trees'), one('buildings'), one('animals'), one('sky'), one('ground')];
  if (Math.random() < 0.6) picked.push(one('landmarks'));
  if (Math.random() < 0.5) picked.push(one('obstacles'));
  picked = [...new Set(picked)];
  save();
  compose();
  catalog();
});
for (const id of ['speed', 'density']) {
  $(`#${id}`).addEventListener('input', () => { save(); if (id === 'density') compose(); else scenes.s.speed = 10 * +$('#speed').value; });
}
$('#pause').addEventListener('click', () => { paused = !paused; $('#pause').textContent = paused ? t('play') : t('pause'); });
$('#png').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `scena-${recipe().land}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
});
$('#txt').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(scenes.asText());
    $('#txt').textContent = t('copied');
    setTimeout(() => { $('#txt').textContent = t('txt'); }, 1500);
  } catch (e) { /* no clipboard: nothing to do */ }
});
$('#lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
window.addEventListener('resize', () => { size(); compose(); });

document.fonts.load('400 13px "JetBrains Mono"').finally(() => {
  render();
  size();
  compose();
  requestAnimationFrame(frame);
});
