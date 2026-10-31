# personal_website

Personal site of Giuliano Gambacorta, for [giulianogambacorta.com](https://giulianogambacorta.com).

The landing page is a single full-screen scene that keeps changing its look,
always passing through a grid of characters (p5.js WebGL shaders):

- **tunnel**: rectangles in riso inks turning on the inner wall of a cylinder (Canvas2D);
- **scene**: an ascii scene drawn cell by cell, a random recipe of the lab's
  catalogue — a land (desert, jungle, volcano, ice, countryside, sea), a time
  of day, maybe rain or snow, one or two heroes (dinosaur, boat, plane, train,
  balloon; a train on the sea, a dinosaur chasing it) and things to see. With the dinosaur it is a little game (space or a tap to
  jump, hold to jump higher). Links sit on random objects of the scene, never
  twice at once; Florence's Duomo carries only STF and Shanghai's Oriental
  Pearl tower only 中文;
- **shan shui**: an endless ink-landscape handscroll, with the links hidden in it.

Keys `1`–`3` pick a mode, `8` (八, which sounds like 发, "to prosper") opens the
handscroll, `space` a random mode (in a scene: jump, or the next scene).
`#dino`, `#mare`, `#aereo` and `#treno` open a scene with that hero.

Every page is in Italian and English (`public/i18n.js`, a button on each page;
the browser's language at first). There are a few easter eggs.

## Structure

```
public/          the site, served as is (no build step)
  index.html
  main.js        modes, transitions, links, the WebGL pipeline
  kaleido.js     the tunnel
  shanshui.js    the handscroll
  scenes.js      the ascii scenes (behaviour)
  scene-catalog.js  their drawings, lands and palettes, by category; what goes with what
  lab/           the lab notebook: one card per experiment (lab.js)
  lab/scene/     the scene composer: the same full-screen scene as the home, its
                 elements in a drawer (Scenes.compose); save as image or text
  lab/shanshui/  the shan shui painter: a density for each element of the
                 handscroll (Shanshui.catalog), painted on confirm into a scroll
                 of 2-6 panels or a screen-sized frame (Shanshui.paint); save as PNG
  lab/toni/      the tone trainer: a hidden HSK character is pronounced (its
                 syllable, from cinese/voice.js) and its tone guessed, tones
                 drawn evenly; then the character, its card on request. Or
                 spoken: pitch.js tracks the voice (YIN), draws it against the
                 recording's and tells the tone by the shape of the curve (a
                 small logistic regression, fitted to one voice's syllables),
                 a little by the recording's; all in the browser. The card
                 opens there too.
                 The microphone keeps its last seconds, so a take starts a
                 little before the press and ends after the release; tapped,
                 it ends when the voice does; hands free, the voice starts it
  img/           logos (Vesta Laris, STF)
  shaders.js     source and ascii shaders
  style.css
  _headers       Cloudflare Pages response headers
  cinese/        the Chinese section: page, data/, fonts/, audio/ (voice.js plays it)
scripts/         build-hanzi.mjs, build-audio.mjs and build-relations.mjs, the data pipeline for cinese/
wrangler.toml    Cloudflare Pages project config
```

## Chinese section (`public/cinese`)

The HSK 1–4 characters in 3D (Babylon.js, one instanced mesh): arranged by level,
by radical or by phonetic family, coloured by level or tone, with a card for each
character (readings, meanings, composition, family, example sentences and words
up to the chosen level, words filterable by part of speech, stroke order with
Hanzi Writer). A 2D mode (default on phones) lays the levels out as flat discs
and, on a click, shows only the clicked character, radical or phonetic component
with what it connects to. Each HSK level can be shown or hidden on its own;
radicals sit on orbits by stroke count; a switch toggles a light and a dark
theme. `#字` in the URL opens a character directly, `?vista=radicali|fonetica`
picks a view (then `#氵` opens a radical, `#青` a phonetic component).

`public/cinese/introduzione/` is an introduction for complete beginners, in
Italian: the tones (with their changes), pinyin and the sounds that trip up an
Italian speaker, how characters are built (with links into the radicals and
phonetic views) and stroke order, and ten points of basic grammar.

A switch shows the words instead (2D only, `?vista=parole`, `#词语` opens one):
the HSK 1–4 words by reading, a disc of text per level, drawn as a second layer
of instances over the same glyph atlas. A selected word gathers the words
sharing its characters; its card links to those characters, and a character's
card to its words.

Pronunciation (`public/cinese/voice.js`), in the cards and in the introduction,
is the same on every device: native recordings from audio-cmn (CC BY-SA), each
reading its syllable, each word its recording (87% of the HSK 1-4 words) or
else its syllables chained with the tone changes of speech (3+3, 不, 一).
Sentences use the device's speech synthesis when it has a Chinese voice, the
chained syllables otherwise.

Search takes a character, pinyin (tones optional) or an English word, matched
in the meanings of characters and words. Cards also list synonyms and antonyms
(Chinese Open Wordnet and WordNet, filtered with the CC-CEDICT meanings by
`scripts/build-relations.mjs`) within the chosen levels.

Its data and font subset are built by:

```bash
npm install
npm run build:hanzi -- path/to/HSK-syllabus.pdf
```

which needs `pdftotext` (poppler-utils) and `bzip2`, and downloads CC-CEDICT,
Make Me a Hanzi, the Tatoeba exports and Noto Serif SC into `data/raw/` (git-ignored). The syllabus PDF is read
locally and not published. Data licences: [public/cinese/data/LICENSES.md](public/cinese/data/LICENSES.md).

The recordings come from a sparse checkout of audio-cmn:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/hugolpz/audio-cmn ../audio-cmn
git -C ../audio-cmn sparse-checkout set 24k-abr
node scripts/build-audio.mjs ../audio-cmn
```

Their licences: [public/cinese/audio/LICENSES.md](public/cinese/audio/LICENSES.md).

Synonyms and antonyms (downloads the Chinese Open Wordnet and WordNet 3.0 into
`data/raw/`):

```bash
node scripts/build-relations.mjs
```

## Run locally

```bash
python3 -m http.server 5173 --directory public
```

Then open <http://localhost:5173>.

## Deploy

The Cloudflare Pages project is `giuliano-gambacorta-website`, serving `public/`.

Deploys run from GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):
every push to `master` goes to production, and a manual run (Actions → Deploy to
Cloudflare Pages → Run workflow) deploys the chosen branch as a preview. The first
run creates the Pages project if it does not exist yet.

It needs two repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | an API token with the **Account → Cloudflare Pages → Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account id |

Or set them from the command line:

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

A manual deploy from a local checkout also works:

```bash
npx wrangler pages deploy
```

Then add `giulianogambacorta.com` under the project's Custom domains.

## License

[MIT](LICENSE). Third-party code and assets are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
