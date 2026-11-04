// The Chinese exercises: one section per group, one card per exercise, each
// mode of an exercise a link that opens it (?modo=). A new exercise is a new
// entry in GROUPS, and its folder beside this page. Below them, what this
// browser remembers (progressi.js), to save to a file or load from one.

const TEXT = {
  it: {
    title: 'Esercizi di cinese · Giuliano Gambacorta', back: '← i caratteri HSK 1–4', h1: 'Esercizi di cinese',
    grammar: 'grammatica', lab: 'laboratorio', theme: 'Tema chiaro / scuro', lang: 'EN', langName: 'English',
    lead: 'Esercizi sui caratteri e sulle parole dei livelli HSK 1–4, sugli stessi dati della <a href="../">sezione di cinese</a>: in ognuno scegli i livelli, e ogni risposta porta alla scheda del carattere o della parola. I progressi restano in questo browser.',
    open: 'apri →',
    pTitle: 'I tuoi progressi',
    pLead: 'Ogni esercizio ricorda, carattere per carattere e parola per parola, come hai risposto, e ti ripropone prima ciò che sbagli e ciò che è ora di ripassare: dopo un minuto, dieci, un giorno, tre, una settimana e sempre più in là, finché rispondi giusto. Tutto resta in questo browser: per portarlo su un altro dispositivo, o per non perderlo se cancelli i dati del sito, salvalo in un file e caricalo dall\'altra parte. Caricare un file aggiunge le sue risposte a quelle di qui.',
    pNone: 'Ancora nessuna risposta.', pSeen: 'visti', pDue: 'da ripassare', pLearned: 'imparati', pAnswers: 'risposte',
    dueBadge: 'da ripassare: {n}', export: 'salva in un file', import: 'carica da un file',
    imported: 'Aggiunte {n} risposte.', importedNone: 'Nessuna risposta nuova nel file.', importBad: 'Questo file non contiene progressi degli esercizi.',
    foot: 'Si trovano anche nel <a href="../../lab/">laboratorio</a>, tra gli altri esperimenti.',
  },
  en: {
    title: 'Chinese exercises · Giuliano Gambacorta', back: '← the HSK 1–4 characters', h1: 'Chinese exercises',
    grammar: 'grammar', lab: 'lab', theme: 'Light / dark theme', lang: 'IT', langName: 'Italiano',
    lead: 'Exercises on the characters and words of HSK levels 1–4, on the same data as the <a href="../">Chinese section</a>: in each you choose the levels, and every answer leads to the card of the character or word. Your progress stays in this browser.',
    open: 'open →',
    pTitle: 'Your progress',
    pLead: 'Each exercise remembers, character by character and word by word, how you answered, and asks again first what you get wrong and what is due for review: after a minute, ten, a day, three, a week and further on, as long as you answer right. It all stays in this browser: to take it to another device, or not to lose it if you clear the site\'s data, save it to a file and load it on the other side. Loading a file adds its answers to the ones here.',
    pNone: 'No answers yet.', pSeen: 'seen', pDue: 'to review', pLearned: 'learned', pAnswers: 'answers',
    dueBadge: 'to review: {n}', export: 'save to a file', import: 'load from a file',
    imported: '{n} answers added.', importedNone: 'No new answers in the file.', importBad: 'This file holds no exercise progress.',
    foot: 'They are also in the <a href="../../lab/">lab</a>, among the other experiments.',
  },
};

const GROUPS = [
  {
    zh: '声调', name: { it: 'I toni', en: 'Tones' },
    exercises: [
      {
        href: 'toni/', deck: 'tones', name: { it: 'Allenamento sui toni', en: 'Tone trainer' },
        text: {
          it: 'Un carattere dei livelli che scegli, nascosto: lo ascolti o lo pronunci, e poi ne vedi la scheda.',
          en: 'A hidden character from the levels you choose: you hear it or say it, then see its card.',
        },
        modes: [
          { m: 'listen', it: 'ascolto', en: 'listening', d: { it: 'ascolta una registrazione e indovina il tono', en: 'hear a recording and guess the tone' } },
          { m: 'speak', it: 'pronuncia', en: 'speaking', d: { it: 'pronuncialo e guarda la tua voce accanto a quella di una madrelingua', en: 'say it and see your voice beside a native speaker\'s' } },
        ],
      },
    ],
  },
  {
    zh: '词语', name: { it: 'Le parole', en: 'Words' },
    exercises: [
      {
        href: 'parole/', deck: 'words', name: { it: 'Allenamento sulle parole', en: 'Word trainer' },
        text: {
          it: 'Le parole dei livelli che scegli, tutte o solo di alcune categorie (verbi, classificatori…), in più esercizi, ciascuno con il suo punteggio.',
          en: 'The words of the levels you choose, all of them or only some parts of speech (verbs, measure words…), several ways, each with its own score.',
        },
        modes: [
          { m: 'meaning', it: 'significato', en: 'meaning', d: { it: 'vedi la parola e riconoscine il significato tra quattro', en: 'see the word and pick its meaning out of four' } },
          { m: 'word', it: 'parola', en: 'word', d: { it: 'vedi il significato e scegli la parola tra quattro', en: 'see the meaning and pick the word out of four' } },
          { m: 'write', it: 'scrittura', en: 'writing', d: { it: 'dal significato, scrivila a mano tratto per tratto', en: 'from its meaning, write it by hand stroke by stroke' } },
          { m: 'pinyin', it: 'pinyin', en: 'pinyin', d: { it: 'scrivine il pinyin, con i toni', en: 'type its pinyin, with the tones' } },
          { m: 'pick', it: 'pinyin a scelta', en: 'pinyin, picked', d: { it: 'scegline la lettura tra quattro, quando hai poco tempo', en: 'pick its reading out of four, when time is short' } },
        ],
      },
    ],
  },
];

const t = (k, v) => I18N.t(TEXT, k, v);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function render() {
  const L = I18N.lang;
  document.title = t('title');
  I18N.apply(TEXT);
  const b = document.getElementById('lang');
  b.textContent = t('lang');
  b.title = t('langName');
  document.getElementById('groups').innerHTML = GROUPS.map((g) => `
    <section>
      <h2><span class="hz">${g.zh}</span> ${esc(g.name[L])}</h2>
      ${g.exercises.map((x) => `
        <article class="ex">
          <h3><a href="${x.href}">${esc(x.name[L])}</a></h3>
          <p>${esc(x.text[L])}</p>
          <ul class="modes">${x.modes.map((m) => `
            <li><a href="${x.href}?modo=${m.m}"><b>${esc(m[L])}</b> <span>${esc(m.d[L])}</span>${badge(`${x.deck}-${m.m}`)}</a></li>`).join('')}
          </ul>
        </article>`).join('')}
    </section>`).join('');
  renderProgress();
}

// what is due in a mode, beside its link
function badge(deck) {
  const n = Progress.summary(deck).due;
  return n ? `<em class="due">${t('dueBadge', { n })}</em>` : '';
}

// a row per mode with answers: items seen, due, learned
function renderProgress() {
  const L = I18N.lang;
  const rows = GROUPS.flatMap((g) => g.exercises.flatMap((x) => x.modes.map((m) => [`${x.name[L]} · ${m[L]}`, Progress.summary(`${x.deck}-${m.m}`)])))
    .filter(([, r]) => r.answers);
  document.getElementById('progress').innerHTML = `
    <h2><span class="hz">进度</span> ${t('pTitle')}</h2>
    <p>${t('pLead')}</p>
    ${rows.length ? `<table class="prog">
      <thead><tr><th></th><th>${t('pSeen')}</th><th>${t('pDue')}</th><th>${t('pLearned')}</th><th>${t('pAnswers')}</th></tr></thead>
      <tbody>${rows.map(([name, r]) => `<tr><th>${esc(name)}</th><td>${r.seen}</td><td>${r.due}</td><td>${r.learned}</td><td>${r.answers}</td></tr>`).join('')}</tbody>
    </table>` : `<p class="note">${t('pNone')}</p>`}
    <p class="file">
      <button id="export" class="go">${t('export')}</button>
      <label class="go">${t('import')}<input id="import" type="file" accept="application/json,.json" hidden></label>
      <span id="file-note" class="note" role="status"></span>
    </p>`;
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#export')) return;
  const blob = new Blob([JSON.stringify(Progress.exportData())], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `progressi-cinese-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'import' || !e.target.files[0]) return;
  let msg;
  try {
    const n = Progress.importData(JSON.parse(await e.target.files[0].text()));
    msg = n ? t('imported', { n }) : t('importedNone');
  } catch (err) { msg = t('importBad'); }
  render();
  document.getElementById('file-note').textContent = msg;
});

const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
});
document.getElementById('lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
render();
