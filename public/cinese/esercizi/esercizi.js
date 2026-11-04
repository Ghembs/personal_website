// The Chinese exercises: one section per group, one card per exercise, each
// mode of an exercise a link that opens it (?modo=). A new exercise is a new
// entry in GROUPS, and its folder beside this page.

const TEXT = {
  it: {
    title: 'Esercizi di cinese · Giuliano Gambacorta', back: '← i caratteri HSK 1–4', h1: 'Esercizi di cinese',
    grammar: 'grammatica', lab: 'laboratorio', theme: 'Tema chiaro / scuro', lang: 'EN', langName: 'English',
    lead: 'Esercizi sui caratteri e sulle parole dei livelli HSK 1–4, sugli stessi dati della <a href="../">sezione di cinese</a>: in ognuno scegli i livelli, e ogni risposta porta alla scheda del carattere o della parola. I progressi restano in questo browser.',
    open: 'apri →',
    foot: 'Si trovano anche nel <a href="../../lab/">laboratorio</a>, tra gli altri esperimenti.',
  },
  en: {
    title: 'Chinese exercises · Giuliano Gambacorta', back: '← the HSK 1–4 characters', h1: 'Chinese exercises',
    grammar: 'grammar', lab: 'lab', theme: 'Light / dark theme', lang: 'IT', langName: 'Italiano',
    lead: 'Exercises on the characters and words of HSK levels 1–4, on the same data as the <a href="../">Chinese section</a>: in each you choose the levels, and every answer leads to the card of the character or word. Your progress stays in this browser.',
    open: 'open →',
    foot: 'They are also in the <a href="../../lab/">lab</a>, among the other experiments.',
  },
};

const GROUPS = [
  {
    zh: '声调', name: { it: 'I toni', en: 'Tones' },
    exercises: [
      {
        href: 'toni/', name: { it: 'Allenamento sui toni', en: 'Tone trainer' },
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
        href: 'parole/', name: { it: 'Allenamento sulle parole', en: 'Word trainer' },
        text: {
          it: 'Le parole dei livelli che scegli, in tre esercizi, ciascuno con il suo punteggio.',
          en: 'The words of the levels you choose, three ways, each with its own score.',
        },
        modes: [
          { m: 'meaning', it: 'significato', en: 'meaning', d: { it: 'vedi la parola e riconoscine il significato tra quattro', en: 'see the word and pick its meaning out of four' } },
          { m: 'write', it: 'scrittura', en: 'writing', d: { it: 'dal significato, scrivila a mano tratto per tratto', en: 'from its meaning, write it by hand stroke by stroke' } },
          { m: 'pinyin', it: 'pinyin', en: 'pinyin', d: { it: 'scrivine il pinyin, con i toni', en: 'type its pinyin, with the tones' } },
        ],
      },
    ],
  },
];

const t = (k) => I18N.t(TEXT, k);
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
            <li><a href="${x.href}?modo=${m.m}"><b>${esc(m[L])}</b> <span>${esc(m.d[L])}</span></a></li>`).join('')}
          </ul>
        </article>`).join('')}
    </section>`).join('');
}

const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('hanzi-theme', root.dataset.theme); } catch (e) { /* private mode */ }
});
document.getElementById('lang').addEventListener('click', () => { I18N.set(I18N.other); render(); });
render();
