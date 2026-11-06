// The interval timer ("timer a turni"), dressed as a media player of the
// early 2000s: one view where the plan is a playlist and the workout plays in
// the player's display. A plan is a preparation, then one or more blocks
// (turni), each a list of sections repeated a number of rounds (giri) with a
// rest between rounds, and a pause between blocks. Nothing leaves the
// browser: plans live in localStorage, and a plan is shared as a link carrying
// it in the hash (never sent to the server). Three skins: dark, eco, aqua.

const TEXT = {
  it: {
    lang: 'EN', back: 'torna alla cesta dei giochi', docTitle: 'Timer a turni · Giuliano Gambacorta',
    mainTitle: 'timer a turni', plTitle: 'piano', libTitle: 'libreria', color: 'colore',
    roundL: 'giro', blockL: 'turno', leftL: 'resta',
    prevT: 'indietro', playT: 'via', pauseT: 'pausa', stopT: 'ferma', nextT: 'avanti', ejectT: 'libreria',
    soundT: 'suono', voiceT: 'voce che annuncia le sezioni',
    name: "nome dell'allenamento", durT: 'durata: 40 = quaranta secondi, 130 o 1:30 = un minuto e mezzo',
    prepLabel: 'Preparazione', restLabel: 'Recupero', pauseLabel: 'Pausa', section: 'Sezione {n}',
    block: 'turno {n}', rounds: 'giri', rest: 'recupero', pause: 'pausa fra i turni',
    addSection: '+ sezione', addBlock: '+ turno', save: 'salva', share: 'link', fresh: 'nuovo',
    dupBlock: 'duplica il turno', delBlock: 'togli il turno', delSection: 'togli la sezione', pickColor: 'scegli il colore',
    saved: 'salvato ✓', copied: 'link copiato ✓', mine: 'i tuoi allenamenti', examples: 'esempi',
    none: 'ancora nessuno: quelli che salvi restano in questo browser',
    del: 'elimina', confirmDel: 'Eliminare «{n}»?', discard: 'Le modifiche non salvate andranno perse. Continuare?',
    work: 'Lavoro', easy: 'Riposo', untitled: 'Allenamento',
    next: 'poi {l} {d}', last: 'ultima sezione', ready: 'pronto', paused: 'in pausa', done: 'Fatto!',
    ex: { tabata: 'Tabata', interval: '40/20 × 4', emom: 'EMOM 10′', circuit: 'Circuito', squat: 'Squat', push: 'Piegamenti', plank: 'Plank', minute: 'Minuto' },
  },
  en: {
    lang: 'IT', back: 'back to the toy box', docTitle: 'Interval timer · Giuliano Gambacorta',
    mainTitle: 'interval timer', plTitle: 'plan', libTitle: 'library', color: 'colour',
    roundL: 'round', blockL: 'block', leftL: 'left',
    prevT: 'back', playT: 'go', pauseT: 'pause', stopT: 'stop', nextT: 'skip', ejectT: 'library',
    soundT: 'sound', voiceT: 'a voice calls the intervals',
    name: 'workout name', durT: 'duration: 40 = forty seconds, 130 or 1:30 = a minute and a half',
    prepLabel: 'Get ready', restLabel: 'Rest', pauseLabel: 'Pause', section: 'Interval {n}',
    block: 'block {n}', rounds: 'rounds', rest: 'rest', pause: 'pause between blocks',
    addSection: '+ interval', addBlock: '+ block', save: 'save', share: 'link', fresh: 'new',
    dupBlock: 'duplicate the block', delBlock: 'remove the block', delSection: 'remove the interval', pickColor: 'pick the colour',
    saved: 'saved ✓', copied: 'link copied ✓', mine: 'your workouts', examples: 'examples',
    none: 'none yet: the ones you save stay in this browser',
    del: 'delete', confirmDel: 'Delete “{n}”?', discard: 'Unsaved changes will be lost. Go on?',
    work: 'Work', easy: 'Easy', untitled: 'Workout',
    next: 'next {l} {d}', last: 'last interval', ready: 'ready', paused: 'paused', done: 'Done!',
    ex: { tabata: 'Tabata', interval: '40/20 × 4', emom: 'EMOM 10′', circuit: 'Circuit', squat: 'Squats', push: 'Push-ups', plank: 'Plank', minute: 'Minute' },
  },
};
const t = (k, vars) => I18N.t(TEXT, k, vars);
const ex = (k) => (TEXT[I18N.lang] || TEXT.it).ex[k];
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Section colours: candy, gel and neon at once.
const PALETTE = [
  { bg: '#ff4f6d' }, // cherry
  { bg: '#2fd38a' }, // mint
  { bg: '#2f8cff' }, // aqua blue
  { bg: '#ff9a2f' }, // tangerine
  { bg: '#a463ff' }, // grape
  { bg: '#ffd23f' }, // lemon
  { bg: '#ff6fd0' }, // bubblegum
  { bg: '#36e2ff' }, // cyan
];
const PREP = { bg: '#ffd23f' };
const REST = { bg: '#9fb4c8' };
const MAX_DUR = 99 * 60 + 59;
const SKINS = { dark: '#05070b', eco: '#5fc3f5', aqua: '#0a5fb5' };

// ---- durations ---------------------------------------------------------

const fmt = (s) => {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};

// "40" forty seconds, "90" ninety, "130" or "1:30" or "1m30" a minute and a
// half (as on a microwave: past two digits, the last two are seconds).
// null when it can't be read.
function parseDur(str) {
  const s = String(str).trim().toLowerCase().replace(/[.,'′]/g, ':').replace(/\s+/g, '');
  if (!s) return 0;
  let m = s.match(/^(\d{1,3}):(\d{0,2})$/);
  if (m) return clamp(+m[1] * 60 + +(m[2] || 0), 0, MAX_DUR);
  m = s.match(/^(?:(\d{1,3})m(?:in)?)?(?:(\d{1,4})s?)?$/);
  if (m && (m[1] || m[2]) && /[ms]/.test(s)) return clamp(+(m[1] || 0) * 60 + +(m[2] || 0), 0, MAX_DUR);
  if (/^\d{1,4}$/.test(s)) return clamp(s.length <= 2 ? +s : +s.slice(0, -2) * 60 + +s.slice(-2), 0, MAX_DUR);
  return null;
}

// ---- plans -------------------------------------------------------------

const sec = (label, dur, c) => ({ label, dur, c });
const EXAMPLES = {
  tabata: () => ({ name: ex('tabata'), prep: 10, pause: 60, blocks: [{ sections: [sec(t('work'), 20, 0), sec(t('easy'), 10, 1)], rounds: 8, rest: 0 }] }),
  interval: () => ({ name: ex('interval'), prep: 10, pause: 60, blocks: [{ sections: [sec(t('work'), 40, 0), sec(t('easy'), 20, 1)], rounds: 4, rest: 60 }] }),
  emom: () => ({ name: ex('emom'), prep: 10, pause: 60, blocks: [{ sections: [sec(ex('minute'), 60, 2)], rounds: 10, rest: 0 }] }),
  circuit: () => ({
    name: ex('circuit'), prep: 15, pause: 120, blocks: [
      { sections: [sec(ex('squat'), 40, 0), sec(t('easy'), 20, 1), sec(ex('push'), 40, 3), sec(t('easy'), 20, 1)], rounds: 3, rest: 60 },
      { sections: [sec(ex('plank'), 30, 4), sec(t('easy'), 15, 1)], rounds: 4, rest: 0 },
    ],
  }),
};

// a plan read from storage or from a link is checked field by field
function sanitize(p) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.blocks)) return null;
  const num = (v, a, b, d) => (Number.isFinite(+v) ? clamp(Math.round(+v), a, b) : d);
  const str = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
  const blocks = p.blocks.slice(0, 20).map((b) => ({
    sections: (Array.isArray(b?.sections) ? b.sections : []).slice(0, 30)
      .map((s) => ({ label: str(s?.label, 40), dur: num(s?.dur, 0, MAX_DUR, 0), c: num(s?.c, 0, PALETTE.length - 1, 0) })),
    rounds: num(b?.rounds, 1, 99, 1),
    rest: num(b?.rest, 0, MAX_DUR, 0),
  })).filter((b) => b.sections.length);
  if (!blocks.length) return null;
  return { name: str(p.name, 60), prep: num(p.prep, 0, MAX_DUR, 0), pause: num(p.pause, 0, MAX_DUR, 0), blocks };
}

// links: the plan, compact, as base64url of its JSON
function encode(p) {
  const c = { n: p.name, p: p.prep, z: p.pause, b: p.blocks.map((b) => ({ g: b.rounds, r: b.rest, s: b.sections.map((s) => [s.label, s.dur, s.c]) })) };
  let bin = '';
  new TextEncoder().encode(JSON.stringify(c)).forEach((x) => { bin += String.fromCharCode(x); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(h) {
  try {
    const bin = atob(h.replace(/-/g, '+').replace(/_/g, '/'));
    const c = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
    return sanitize({ name: c.n, prep: c.p, pause: c.z, blocks: (c.b || []).map((b) => ({ rounds: b.g, rest: b.r, sections: (b.s || []).map(([label, dur, cc]) => ({ label, dur, c: cc })) })) });
  } catch (e) { return null; }
}

const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode, full */ } },
};
const K = { plans: 'timer-plans', draft: 'timer-draft', opts: 'timer-opts' };

let plan, planId = null, dirty = false;
const opts = Object.assign({ sound: true, voice: false, skin: 'dark', library: true }, store.get(K.opts, {}));
if (!SKINS[opts.skin]) opts.skin = 'dark';

function blockLen(b) {
  const per = b.sections.reduce((a, s) => a + s.dur, 0);
  return { per, all: per ? b.rounds * per + (b.rounds - 1) * b.rest : 0 };
}

// The workout as a list of segments, each with its colour, its place, and
// the playlist row it plays (`row`).
function timeline(p) {
  const segs = [];
  const B = p.blocks.map((b, bi) => ({ b, bi })).filter(({ b }) => blockLen(b).per > 0);
  if (!B.length) return segs;
  if (p.prep > 0) segs.push({ kind: 'prep', label: t('prepLabel'), dur: p.prep, color: PREP, row: 'prep' });
  B.forEach(({ b, bi }, k) => {
    const where = { block: k, nb: B.length, nr: b.rounds };
    for (let g = 0; g < b.rounds; g++) {
      b.sections.forEach((s, si) => {
        if (s.dur > 0) segs.push({ kind: 'work', label: s.label.trim() || t('section', { n: si + 1 }), dur: s.dur, color: PALETTE[s.c], round: g, row: `s-${bi}-${si}`, ...where });
      });
      if (g < b.rounds - 1 && b.rest > 0) segs.push({ kind: 'rest', label: t('restLabel'), dur: b.rest, color: REST, round: g, row: `r-${bi}`, ...where });
    }
    if (k < B.length - 1 && p.pause > 0) segs.push({ kind: 'rest', label: t('pauseLabel'), dur: p.pause, color: REST, round: b.rounds - 1, row: `p-${B[k + 1].bi}`, ...where });
  });
  return segs;
}
const planTotal = (p) => timeline(p).reduce((a, s) => a + s.dur, 0);

// ---- the playlist (the editor) ------------------------------------------------

const durInput = (v, f, b = '', s = '') =>
  `<input class="dur" type="text" inputmode="numeric" autocomplete="off" data-f="${f}" data-b="${b}" data-s="${s}" value="${fmt(v)}" title="${esc(t('durT'))}" aria-label="${esc(t('durT'))}">`;

function renderList() {
  const rows = [];
  let n = 0;
  const many = plan.blocks.length > 1;
  rows.push(`<li class="row fixed" data-row="prep"><span class="n">00</span><i class="gem" style="--c:${PREP.bg}"></i><span class="nm">${t('prepLabel')}</span>${durInput(plan.prep, 'prep')}<span></span></li>`);
  plan.blocks.forEach((b, bi) => {
    if (bi > 0) rows.push(`<li class="row fixed" data-row="p-${bi}"><span class="n">··</span><i class="gem" style="--c:${REST.bg}"></i><span class="nm">${t('pause')}</span>${durInput(plan.pause, 'pause')}<span></span></li>`);
    rows.push(`<li class="row head">
      <span class="bt">${t('block', { n: bi + 1 })}</span><span class="sum" id="bsum-${bi}"></span>
      <span class="tools"><button class="mini" data-act="dupBlock" data-b="${bi}" title="${t('dupBlock')}" aria-label="${t('dupBlock')}">⧉</button>${many ? `<button class="mini" data-act="delBlock" data-b="${bi}" title="${t('delBlock')}" aria-label="${t('delBlock')}">×</button>` : ''}</span>
    </li>`);
    rows.push(`<li class="row cfg${b.rounds > 1 ? '' : ' single'}" data-row="r-${bi}">
      <span class="step"><button class="mini" data-act="less" data-b="${bi}" aria-label="−">−</button><input type="number" inputmode="numeric" min="1" max="99" data-f="rounds" data-b="${bi}" value="${b.rounds}" aria-label="${t('rounds')}"><button class="mini" data-act="more" data-b="${bi}" aria-label="+">+</button><label>${t('rounds')}</label></span>
      <span class="rest"><label>${t('rest')}</label>${durInput(b.rest, 'rest', bi)}</span>
    </li>`);
    b.sections.forEach((s, si) => {
      n++;
      rows.push(`<li class="row sec" data-row="s-${bi}-${si}">
        <span class="n">${String(n).padStart(2, '0')}.</span>
        <button class="gem" data-act="color" data-b="${bi}" data-s="${si}" style="--c:${PALETTE[s.c].bg}" title="${t('pickColor')}" aria-label="${t('pickColor')}"></button>
        <input class="nm" type="text" data-f="label" data-b="${bi}" data-s="${si}" value="${esc(s.label)}" placeholder="${esc(t('section', { n: si + 1 }))}" maxlength="40">
        ${durInput(s.dur, 'dur', bi, si)}
        ${b.sections.length > 1 ? `<button class="mini x" data-act="delSection" data-b="${bi}" data-s="${si}" title="${t('delSection')}" aria-label="${t('delSection')}">×</button>` : '<span></span>'}
      </li>`);
    });
    rows.push(`<li class="row add"><button class="mini wide" data-act="addSection" data-b="${bi}">${t('addSection')}</button></li>`);
  });
  $('#list').innerHTML = rows.join('');
  $('#name').value = plan.name;
  totals();
  lockEditing(!!run);
  markRow();
}

function totals() {
  plan.blocks.forEach((b, bi) => {
    const { per, all } = blockLen(b);
    const el = $(`#bsum-${bi}`);
    if (el) el.textContent = `${b.rounds}×${fmt(per)} → ${fmt(all)}`;
  });
  $('#total').textContent = fmt(planTotal(plan));
  if (!run) { buildStrip(timeline(plan)); draw(); }
}

function changed(rerender) {
  dirty = true;
  store.set(K.draft, { plan, planId, dirty });
  if (rerender) renderList(); else totals();
}

const field = (f, b, s) => {
  if (f === 'prep' || f === 'pause') return [plan, f];
  if (f === 'rest' || f === 'rounds') return [plan.blocks[b], f];
  if (f === 'dur' || f === 'label') return [plan.blocks[b].sections[s], f];
  return [plan, f];
};

$('#list').addEventListener('input', (e) => {
  const el = e.target, f = el.dataset.f;
  if (!f) return;
  const [obj, key] = field(f, +el.dataset.b, +el.dataset.s);
  if (f === 'label') obj[key] = el.value;
  else if (f === 'rounds') {
    const v = parseInt(el.value, 10);
    if (!(v >= 1)) return;
    obj[key] = clamp(v, 1, 99);
    el.closest('.row').classList.toggle('single', obj[key] < 2);
  } else {
    const v = parseDur(el.value);
    el.classList.toggle('bad', v == null);
    if (v == null) return;
    obj[key] = v;
    // the pause is one, shown between each pair of blocks
    if (f === 'pause') $$('[data-f="pause"]').forEach((x) => { if (x !== el) x.value = fmt(v); });
  }
  changed();
});
// on leaving a field, it shows what was understood
$('#list').addEventListener('change', (e) => {
  const el = e.target, f = el.dataset.f;
  if (!f || f === 'label') return;
  const [obj, key] = field(f, +el.dataset.b, +el.dataset.s);
  el.value = f === 'rounds' ? obj[key] : fmt(obj[key]);
  el.classList.remove('bad');
});
$('#name').addEventListener('input', (e) => { plan.name = e.target.value; changed(); });

$('#list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn || run) return;
  const bi = +btn.dataset.b, si = +btn.dataset.s, b = plan.blocks[bi];
  switch (btn.dataset.act) {
    case 'color': openPicker(btn, bi, si); return;
    case 'addSection': {
      const used = new Set(b.sections.map((s) => s.c));
      const c = PALETTE.findIndex((_, i) => !used.has(i));
      b.sections.push(sec('', 30, c < 0 ? b.sections.length % PALETTE.length : c));
      changed(true);
      $(`[data-row="s-${bi}-${b.sections.length - 1}"] .nm`)?.focus();
      return;
    }
    case 'delSection': b.sections.splice(si, 1); break;
    case 'dupBlock': plan.blocks.splice(bi + 1, 0, JSON.parse(JSON.stringify(b))); break;
    case 'delBlock': plan.blocks.splice(bi, 1); break;
    case 'less': b.rounds = clamp(b.rounds - 1, 1, 99); break;
    case 'more': b.rounds = clamp(b.rounds + 1, 1, 99); break;
    default: return;
  }
  changed(true);
});
$('#addBlock').addEventListener('click', () => {
  plan.blocks.push({ sections: [sec(t('work'), 40, 0), sec(t('easy'), 20, 1)], rounds: 3, rest: 0 });
  changed(true);
});

// the colour picker: a little window of gems by the one clicked
let picking = null;
function openPicker(btn, bi, si) {
  const P = $('#picker'), s = plan.blocks[bi].sections[si];
  picking = { bi, si, btn };
  P.querySelector('.swatches').innerHTML = PALETTE.map((c, i) =>
    `<button class="gem${i === s.c ? ' on' : ''}" data-c="${i}" style="--c:${c.bg}" aria-label="${c.bg}"></button>`).join('');
  P.hidden = false;
  const r = btn.getBoundingClientRect(), w = P.offsetWidth;
  P.style.left = `${clamp(r.left + window.scrollX - 14, 8 + window.scrollX, window.scrollX + document.documentElement.clientWidth - w - 8)}px`;
  P.style.top = `${r.bottom + window.scrollY + 8}px`;
  P.querySelector('.on')?.focus();
}
function closePicker() { $('#picker').hidden = true; picking = null; }
$('#picker').addEventListener('click', (e) => {
  const g = e.target.closest('[data-c]');
  if (!g || !picking) return;
  const s = plan.blocks[picking.bi].sections[picking.si];
  s.c = +g.dataset.c;
  picking.btn.style.setProperty('--c', PALETTE[s.c].bg);
  closePicker();
  changed();
});
document.addEventListener('pointerdown', (e) => {
  if (picking && !e.target.closest('#picker') && e.target !== picking.btn) closePicker();
});

function lockEditing(on) {
  document.body.classList.toggle('live', on);
  $$('#list input, #list button, #name, #addBlock, #new, #library button').forEach((el) => { el.disabled = on; });
}

// ---- saving, sharing, the library -----------------------------------------

let flashTimer = 0;
function flash(msg) {
  $('#flash').textContent = msg;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { $('#flash').textContent = ''; }, 2200);
}

function load(p, id = null) {
  if (run) return false;
  if (dirty && !confirm(t('discard'))) return false;
  plan = JSON.parse(JSON.stringify(p));
  planId = id;
  dirty = false;
  store.set(K.draft, { plan, planId, dirty });
  renderList();
  renderLibrary();
  return true;
}

function save() {
  const plans = store.get(K.plans, []);
  if (!plan.name.trim()) plan.name = `${t('untitled')} ${new Date().toLocaleDateString(I18N.lang)}`;
  $('#name').value = plan.name;
  const entry = { id: planId || `p${Date.now().toString(36)}`, plan: JSON.parse(JSON.stringify(plan)) };
  const at = plans.findIndex((x) => x.id === entry.id);
  if (at >= 0) plans[at] = entry; else plans.unshift(entry);
  store.set(K.plans, plans);
  planId = entry.id;
  dirty = false;
  store.set(K.draft, { plan, planId, dirty });
  renderLibrary();
  draw();
  flash(t('saved'));
}

async function share() {
  const url = `${location.origin}${location.pathname}#${encode(plan)}`;
  try {
    await navigator.clipboard.writeText(url);
    flash(t('copied'));
  } catch (e) {
    prompt(t('share'), url);
  }
}

function renderLibrary() {
  const plans = store.get(K.plans, []).map((x) => ({ ...x, plan: sanitize(x.plan) })).filter((x) => x.plan);
  $('#mine').innerHTML = plans.length
    ? plans.map((x, i) => `<li${x.id === planId ? ' class="on"' : ''}>
        <button class="item" data-load="${esc(x.id)}"><span class="n">${i + 1}.</span><span class="nm">${esc(x.plan.name || t('untitled'))}</span><small>${fmt(planTotal(x.plan))}</small></button>
        <button class="mini x" data-del="${esc(x.id)}" title="${t('del')}" aria-label="${t('del')}">×</button></li>`).join('')
    : `<li class="none">${t('none')}</li>`;
  $('#examples').innerHTML = Object.entries(EXAMPLES).map(([k, f], i) =>
    `<li><button class="item" data-ex="${k}"><span class="n">${i + 1}.</span><span class="nm">${esc(ex(k))}</span><small>${fmt(planTotal(f()))}</small></button></li>`).join('');
  lockEditing(!!run);
}

$('#library').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || run) return;
  const plans = store.get(K.plans, []);
  if (b.dataset.ex) load(EXAMPLES[b.dataset.ex]());
  else if (b.dataset.load) {
    const x = plans.find((y) => y.id === b.dataset.load);
    const p = x && sanitize(x.plan);
    if (p) load(p, x.id);
  } else if (b.dataset.del) {
    const x = plans.find((y) => y.id === b.dataset.del);
    if (!x || !confirm(t('confirmDel', { n: x.plan?.name || t('untitled') }))) return;
    store.set(K.plans, plans.filter((y) => y.id !== x.id));
    if (planId === x.id) { planId = null; dirty = true; store.set(K.draft, { plan, planId, dirty }); }
    renderLibrary();
  }
});

$('#save').addEventListener('click', save);
$('#share').addEventListener('click', share);
$('#new').addEventListener('click', () => load({ name: '', prep: 10, pause: 60, blocks: [{ sections: [sec(t('work'), 40, 0), sec(t('easy'), 20, 1)], rounds: 4, rest: 0 }] }));
$('#eject').addEventListener('click', () => {
  opts.library = !opts.library;
  store.set(K.opts, opts);
  renderOpts();
  if (opts.library && matchMedia('(max-width: 900px)').matches) $('#library').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---- options and skins ------------------------------------------------------------

function renderOpts() {
  for (const k of ['sound', 'voice']) {
    $(`#${k}`).classList.toggle('on', opts[k]);
    $(`#${k}`).setAttribute('aria-pressed', opts[k]);
  }
  document.body.dataset.skin = opts.skin;
  $$('.skins button').forEach((b) => b.setAttribute('aria-checked', b.dataset.skin === opts.skin));
  document.querySelector('meta[name="theme-color"]').content = SKINS[opts.skin];
  $('#library').hidden = !opts.library;
  $('#eject').classList.toggle('on', opts.library);
  visColors = null;
}
function toggle(k) {
  opts[k] = !opts[k];
  store.set(K.opts, opts);
  renderOpts();
  if (k === 'sound' && run) scheduleBeeps();
}
$('#sound').addEventListener('click', () => toggle('sound'));
$('#voice').addEventListener('click', () => toggle('voice'));
$('.skins').addEventListener('click', (e) => {
  const b = e.target.closest('[data-skin]');
  if (!b) return;
  opts.skin = b.dataset.skin;
  store.set(K.opts, opts);
  renderOpts();
  drawVis(0);
});

// ---- sound -------------------------------------------------------------------
// Beeps are scheduled on the audio clock for the whole run at once, so they
// stay on time when the tab is in the background and timers are throttled.

let ctx = null;
let beeps = [];
function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ctx && AC) ctx = new AC();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function beep(at, freq, len, vol = 0.22) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.012);
  g.gain.setValueAtTime(vol, Math.max(at + 0.012, at + len - 0.05));
  g.gain.linearRampToValueAtTime(0, at + len);
  o.connect(g).connect(ctx.destination);
  o.start(at);
  o.stop(at + len + 0.02);
  beeps.push(o);
}
function cancelBeeps() {
  beeps.forEach((o) => { try { o.stop(); } catch (e) { /* not started */ } o.disconnect(); });
  beeps = [];
}
function scheduleBeeps() {
  cancelBeeps();
  if (!opts.sound || !run || !run.on || !ctx) return;
  const e = elapsed(), now = ctx.currentTime + 0.03;
  const at = (x) => now + (x - e);
  run.segs.forEach((s, i) => {
    const start = run.bounds[i], end = run.bounds[i + 1];
    for (let k = 3; k >= 1; k--) if (end - k > start + 0.5 && end - k >= e) beep(at(end - k), 660, 0.11);
    if (end < e - 0.05) return;
    const nx = run.segs[i + 1];
    if (!nx) [0, 0.18, 0.36].forEach((d, j) => beep(at(end + d), [784, 988, 1319][j], j === 2 ? 0.7 : 0.16));
    else if (nx.kind === 'work') beep(at(end), 1046, 0.5, 0.26);
    else beep(at(end), 523, 0.6);
  });
}

function speak(text) {
  if (!opts.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = I18N.lang === 'it' ? 'it-IT' : 'en-GB';
  speechSynthesis.speak(u);
}

// the screen stays on while a workout runs
let lock = null;
async function keepAwake(on) {
  try {
    if (on && !lock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    } else if (!on && lock) { await lock.release(); lock = null; }
  } catch (e) { /* not allowed, not supported */ }
}

// ---- the run -------------------------------------------------------------------

let run = null;
const now = () => performance.now();
const elapsed = () => (run.on ? run.base + (now() - run.t0) / 1000 : run.base);
const indexAt = (e) => {
  let i = 0;
  while (i < run.segs.length - 1 && run.bounds[i + 1] <= e) i++;
  return i;
};

function start() {
  closePicker();
  document.activeElement?.blur?.();
  const segs = timeline(plan);
  if (!segs.length) return;
  const bounds = [0];
  segs.forEach((s) => bounds.push(bounds[bounds.length - 1] + s.dur));
  run = { segs, bounds, total: bounds[bounds.length - 1], base: 0, t0: now(), on: false, idx: -1, done: false };
  buildStrip(segs);
  lockEditing(true);
  resume();
}

function resume() {
  if (!run || run.done) return;
  run.t0 = now();
  run.on = true;
  audio();
  if (run.base === 0 && opts.sound && ctx) beep(ctx.currentTime + 0.03, run.segs[0].kind === 'work' ? 1046 : 523, 0.35);
  scheduleBeeps();
  keepAwake(true);
  loop();
}
function pause() {
  if (!run || !run.on) return;
  run.base = elapsed();
  run.on = false;
  cancelBeeps();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  draw();
}
function seek(e) {
  if (!run) return;
  run.done = false;
  run.base = clamp(e, 0, run.total);
  run.t0 = now();
  if (run.base >= run.total) { finish(); return; }
  scheduleBeeps();
  tick();
}
const skip = () => { const i = indexAt(elapsed()); if (i >= run.segs.length - 1) finish(); else seek(run.bounds[i + 1]); };
const back = () => { const e = elapsed(), i = indexAt(e); seek(e - run.bounds[i] > 2 || i === 0 ? run.bounds[i] : run.bounds[i - 1]); };

function stop() {
  if (!run) return;
  cancelBeeps();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  keepAwake(false);
  run = null;
  lockEditing(false);
  document.title = t('docTitle');
  buildStrip(timeline(plan));
  markRow();
  draw();
}

function finish() {
  run.base = run.total;
  run.on = false;
  run.done = true;
  cancelBeeps();
  keepAwake(false);
  speak(t('done'));
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  markRow();
  draw();
}

// what to do on entering a segment
function enter(i) {
  const s = run.segs[i];
  if (i > 0 || run.base > 0) speak(s.label);
  if (navigator.vibrate && i > 0) navigator.vibrate(s.kind === 'work' ? 250 : [120, 80, 120]);
  markRow();
}

// the playlist row that plays now, kept in view
function markRow() {
  $$('#list .row.now').forEach((r) => r.classList.remove('now'));
  if (!run || run.done) return;
  const s = run.segs[indexAt(elapsed())];
  const row = $(`#list [data-row="${s.row}"]`);
  if (!row) return;
  row.classList.add('now');
  row.style.setProperty('--seg', s.color.bg);
  const L = $('#list'), top = row.offsetTop - L.offsetTop;
  if (top < L.scrollTop || top + row.offsetHeight > L.scrollTop + L.clientHeight) L.scrollTo({ top: top - L.clientHeight / 3, behavior: 'smooth' });
}

let raf = 0;
function loop() {
  cancelAnimationFrame(raf);
  let last = now();
  const go = (ts) => {
    tick();
    drawVis((ts - last) / 1000);
    last = ts;
    if (run && run.on) raf = requestAnimationFrame(go);
  };
  raf = requestAnimationFrame(go);
}
// rAF stops in the background: the run still moves on, a few times a second
setInterval(() => { if (run && run.on && document.hidden) tick(); }, 250);

function tick() {
  if (!run || run.done) return;
  const e = elapsed();
  if (e >= run.total) { finish(); return; }
  const i = indexAt(e);
  if (i !== run.idx) { run.idx = i; if (run.on) enter(i); else markRow(); }
  draw();
}

// ---- the display --------------------------------------------------------------

// the position bar: the whole workout, a coloured piece per segment
function buildStrip(segs) {
  const total = segs.reduce((a, s) => a + s.dur, 0) || 1;
  $('#segs').innerHTML = segs.map((s) => `<i style="flex-grow:${s.dur / total};--c:${s.color.bg}"></i>`).join('');
}
$('#strip').addEventListener('click', (e) => {
  if (!run) return;
  const r = $('#strip').getBoundingClientRect();
  seek(clamp((e.clientX - r.left) / r.width, 0, 1) * run.total);
});

let marqText = '';
function setMarquee(text) {
  if (text === marqText) return;
  marqText = text;
  const m = $('#marq');
  m.textContent = `${text}   ✦   ${text}   ✦   `;
  m.style.animationDuration = `${Math.max(8, text.length * 0.32)}s`;
}

function draw() {
  const P = $('#player');
  if (!run || run.done) {
    const total = run ? run.total : planTotal(plan);
    const name = plan.name.trim() || t('untitled');
    P.style.setProperty('--seg', run ? PALETTE[1].bg : 'var(--accent)');
    $('#state').textContent = '■';
    $('#time').textContent = fmt(total);
    $('#label').textContent = run ? t('done') : name;
    $('#i-round').textContent = '--';
    $('#i-block').textContent = '--';
    $('#i-left').textContent = run ? '0:00' : fmt(total);
    $('#head').style.left = run ? '100%' : '0%';
    setMarquee(`${name} (${fmt(total)}) · ${run ? t('done') : t('ready')}`);
    P.classList.remove('paused', 'last');
    P.classList.toggle('done', !!run);
    document.title = run ? `${t('done')} · ${t('docTitle')}` : t('docTitle');
    if (!run || !run.on) drawVis(0);
    return;
  }
  const e = elapsed(), i = indexAt(e), s = run.segs[i];
  const left = run.bounds[i + 1] - e;
  const shown = Math.ceil(left - 1e-6);
  P.style.setProperty('--seg', s.color.bg);
  P.classList.toggle('paused', !run.on);
  P.classList.toggle('last', run.on && shown <= 3);
  P.classList.remove('done');
  $('#state').textContent = run.on ? '▶' : '❚❚';
  $('#time').textContent = fmt(shown);
  $('#label').textContent = s.label;
  $('#i-round').textContent = s.kind === 'prep' ? '--' : `${s.round + 1}/${s.nr}`;
  $('#i-block').textContent = s.kind === 'prep' ? '--' : `${s.block + 1}/${s.nb}`;
  $('#i-left').textContent = fmt(Math.ceil(run.total - e));
  $('#head').style.left = `${(e / run.total) * 100}%`;
  const nx = run.segs[i + 1];
  setMarquee(`${s.label} (${fmt(s.dur)}) ·${nx ? t('next', { l: nx.label, d: fmt(nx.dur) }) : t('last')}${run.on ? '' : ` · ${t('paused')}`}`);
  document.title = `${fmt(shown)} · ${s.label}`;
}

// the visualizer: bars in the colour of the section, dancing while it runs
const BARS = 18;
const vis = { h: new Float32Array(BARS), peak: new Float32Array(BARS), t: 0 };
let visColors = null;
function drawVis(dt) {
  const cv = $('#vis'), g = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !H) return;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  if (!visColors) {
    const cs = getComputedStyle(document.body);
    visColors = { peak: cs.getPropertyValue('--lcd-fg').trim() || '#fff', dim: cs.getPropertyValue('--lcd-dim').trim() || 'rgba(255,255,255,.1)' };
  }
  const seg = getComputedStyle($('#player')).getPropertyValue('--seg').trim() || visColors.peak;
  const live = run && run.on;
  vis.t += dt;
  const e = run ? elapsed() : 0, beat = live ? 1 - (e % 1) : 0;
  for (let i = 0; i < BARS; i++) {
    const target = live
      ? clamp(0.25 + 0.45 * beat * (1 - i / BARS) + 0.3 * Math.abs(Math.sin(vis.t * (2 + i * 0.37) + i)) * Math.random(), 0.05, 1)
      : 0.06 + 0.04 * Math.sin(i * 0.9);
    vis.h[i] += (target - vis.h[i]) * Math.min(1, dt * 14 || 1);
    vis.peak[i] = Math.max(vis.h[i], vis.peak[i] - dt * 0.6);
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const bw = W / BARS;
  for (let i = 0; i < BARS; i++) {
    const x = i * bw + 1, w = bw - 2;
    for (let y = H - 2; y > 0; y -= 3) { g.fillStyle = visColors.dim; g.fillRect(x, y - 2, w, 2); }
    const h = Math.round(vis.h[i] * H / 3) * 3;
    const grad = g.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, seg);
    grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad;
    for (let y = H - 2; y > H - h; y -= 3) g.fillRect(x, y - 2, w, 2);
    g.fillStyle = visColors.peak;
    g.fillRect(x, Math.round(H - vis.peak[i] * H) - 1, w, 1.5);
  }
}

// ---- transport ---------------------------------------------------------------

const play = () => { if (!run || run.done) start(); else if (!run.on) resume(); };
const playPause = () => { if (run && run.on) pause(); else play(); };
$('#play').addEventListener('click', play);
$('#pause').addEventListener('click', () => { if (run && !run.done) { if (run.on) pause(); else resume(); } });
$('#stop').addEventListener('click', stop);
$('#next').addEventListener('click', () => run && !run.done && skip());
$('#prev').addEventListener('click', () => run && !run.done && back());
$('.lcd').addEventListener('click', playPause);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && picking) { closePicker(); return; }
  if (e.target.matches('input') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  // the old player's keys too: z x c v b
  if (k === ' ') { e.preventDefault(); playPause(); }
  else if (k === 'x') play();
  else if (k === 'c') $('#pause').click();
  else if (k === 'v') stop();
  else if ((k === 'arrowright' || k === 'b') && run && !run.done) skip();
  else if ((k === 'arrowleft' || k === 'z') && run && !run.done) back();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && run && run.on) { keepAwake(true); tick(); }
});
window.addEventListener('resize', () => drawVis(0));

// ---- start up -------------------------------------------------------------------

function render() {
  I18N.apply(TEXT);
  document.title = t('docTitle');
  $('#lang').textContent = t('lang');
  $('#name').placeholder = t('name');
  $('#addBlock').textContent = t('addBlock');
  $('#save').textContent = t('save');
  $('#share').textContent = t('share');
  $('#new').textContent = t('fresh');
  renderOpts();
  renderList();
  renderLibrary();
  draw();
}
$('#lang').addEventListener('click', () => { if (!run) { I18N.set(I18N.other); render(); } });

(function init() {
  const shared = location.hash.length > 1 && decode(location.hash.slice(1));
  const draft = store.get(K.draft, null);
  if (shared) {
    plan = shared;
    dirty = true;
    history.replaceState(null, '', location.pathname);
    store.set(K.draft, { plan, planId, dirty });
  } else if (draft && sanitize(draft.plan)) {
    plan = sanitize(draft.plan);
    planId = draft.planId || null;
    dirty = !!draft.dirty;
  } else plan = EXAMPLES.interval();
  render();
  document.fonts?.ready?.then(() => drawVis(0));
})();
