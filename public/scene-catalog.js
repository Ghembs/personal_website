// The catalogue of the ascii scenes: every drawing (sprites, landmarks, trees,
// vehicles), every land and every palette, sorted into categories with names
// in Italian and English. scenes.js draws the scenarios from these parts; the
// lab's scene page lists them, so that scenes can be put together by hand.

const SceneCatalog = (() => {
  // Sprites are written as raw multi-line strings; the first newline is dropped.
  const art = (t) => t.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
  const widthOf = (lines) => Math.max(...lines.map((l) => [...l].length));
  const wrap = (x, span) => ((x % span) + span) % span;

  const CLOUDS = [
    ['   .--.', '.-(    ).', '(___.____)'],
    ['  .-~~-.', ' (      )-.', '(____.____)'],
    ['   _', ' _( )_', '(_____)'],
    ['       .--.', '  .-~~(    )-.', ' (            )', "  '-.______.-'"],
  ];
  const SUN = ['  \\ | /', '-- ( ) --', '  / | \\'];
  const DUSK_SUN = [' .--.', '(    )', " '--'"];
  const MOON = [' .-.', '(  (', " '-'"];

  // Landmarks.
  const DUOMO = art(String.raw`
                        |
                       /^\
                      (___)
                      |||||                       _
                  .-'"""""""'-.                  |+|
               .-'   |   |   |  '-.              |=|
             .'      |   |   |     '.            |#|
            /        |   |   |       \           |=|
           /_________|___|___|________\          |#|
          |____________________________|         |=|
          | /\  /\  /\  /\  /\  /\  /\ |         |#|
     _____|/__\/__\/__\/__\/__\/__\/__\|_____    |=|
    |  /\  |                            |  /\ |  |#|
    | /  \ |  ||    ||    ||    ||    ||| /  \|  |=|
    |/____\|  ||    ||    ||    ||    |||/____\| |#|
    |______|__||____||____||____||____|||______|_|=|_ `);
  const PEARL = art(String.raw`
            |
            |
            |
           (o)
           | |
           | |
           | |
          .---.
         (     )
          '---'
          || ||
          || ||
         .-----.
        /       \
       (    O    )
        \       /
         '-----'
        /|| || ||\
       / || || || \
      (  || || ||  )
     /   || || ||   \
    /____||_||_||____\ `);


  // Logos drawn in characters, for links that show an icon instead of a name.
  const ICONS = {
    'vesta-laris': [
      '   /\\',
      '  //\\\\',
      ' o-o-o-o',
      ' |_|_|_|',
    ],
    stf: [
      '    .------.',
      '    |i  /^\\ |',
      '  _ ||_(___)|',
      '_| |\'------\'',
    ],
  };

  const DINO = art(String.raw`
              ______
             / o    \
             |   ____|
             |  |__
 \          /   |_,
  \________/    |
   \            /
    \__      __/`);
  const DINO_LEGS = [
    ['      |  \\  |', '     _|   \\_|_'],
    ['      /  |  /', '     /_   |_/_'],
  ];
  const DINO_AIR = ['      |   |', '     _|  _|'];

  // Each land: two palettes (day, night) with sky and ground gradients, a far
  // silhouette, its trees and its obstacles. The dinosaur walks from one land
  // into the next every few hundred metres.
  const BIOMES = {
    desert: {
      palettes: {
        day: { bg: '#f6efe2', fg: '#5a4c3c', dim: '#c2b29b', hl: '#2a2117', accent: '#b4683d', green: '#7f8f52', skyTop: '#f2dcc0', skyLow: '#fbf5ea', soil: '#ead8bb', soilDeep: '#dcc39c' },
        night: { bg: '#221d27', fg: '#d9cdbb', dim: '#5d5466', hl: '#ffffff', accent: '#d98d5f', green: '#6f7d4c', skyTop: '#0f0d1c', skyLow: '#2e2433', soil: '#2a2420', soilDeep: '#1c1714' },
      },
      far: 'mesa', trees: ['saguaroL', 'saguaro', 'joshuaL', 'joshua'], obstacles: ['cactusS', 'cactusL', 'cactusD', 'rock'],
      ground: ".,'.`,..", props: ['bones', 'skull', 'pebbles', 'bush', 'pebbles', 'tuft'],
    },
    jungle: {
      palettes: {
        day: { bg: '#eef4e6', fg: '#334a2c', dim: '#a9bf9a', hl: '#162212', accent: '#c46a3a', green: '#4f8a3c', skyTop: '#cfe6d4', skyLow: '#f2f7ea', soil: '#c9dbb3', soilDeep: '#a9c492' },
        night: { bg: '#121c16', fg: '#cfe0c6', dim: '#3d5a45', hl: '#ffffff', accent: '#d9874f', green: '#4f8a52', skyTop: '#07110d', skyLow: '#16261d', soil: '#14211a', soilDeep: '#0c1610' },
      },
      far: 'hills', trees: ['palmL', 'palm', 'canopyL', 'canopy', 'fern'], obstacles: ['log', 'rock', 'fern', 'logL'],
      ground: '",;\'v.,"', props: ['tuft', 'flowers', 'tuft', 'mushrooms', 'grass', 'pebbles'],
    },
    volcano: {
      palettes: {
        day: { bg: '#efe4df', fg: '#3c3335', dim: '#b6a7a3', hl: '#1c1617', accent: '#d2502e', green: '#6d6a4c', skyTop: '#d9b8a8', skyLow: '#f4e8e2', soil: '#cbb8b0', soilDeep: '#a8928a' },
        night: { bg: '#1a1213', fg: '#e3d3cf', dim: '#5c4446', hl: '#ffffff', accent: '#ff6a3a', green: '#5f5a44', skyTop: '#2a0c08', skyLow: '#3a1d1a', soil: '#24191a', soilDeep: '#160f10' },
      },
      far: 'volcano', trees: ['deadL', 'dead', 'fern'], obstacles: ['rock', 'rockL', 'lava'],
      ground: '.:,.:o.', props: ['crack', 'pebbles', 'bones', 'crack', 'stones'],
    },
    ice: {
      palettes: {
        day: { bg: '#eef3f7', fg: '#344a5c', dim: '#b3c4d1', hl: '#16222c', accent: '#c8553d', green: '#4d7f6e', skyTop: '#c6dcec', skyLow: '#f3f7fa', soil: '#f7fafc', soilDeep: '#d8e4ec' },
        night: { bg: '#0f1622', fg: '#d6e4ee', dim: '#3f5469', hl: '#ffffff', accent: '#e07a5a', green: '#4a7a6a', skyTop: '#050a14', skyLow: '#182436', soil: '#26364a', soilDeep: '#18222f' },
      },
      far: 'peaks', trees: ['pineXL', 'pineL', 'pine'], obstacles: ['ice', 'snowman', 'rock', 'iceL'],
      ground: '*.*.,\'*', props: ['drift', 'pebbles', 'drift', 'tracks', 'stones'],
    },
  };

  const OBST = {
    cactusS: { lines: art(String.raw`
  _
 | |
_| |_
 | |`), mat: 'cactus' },
    cactusL: { lines: art(String.raw`
   _
  | | _
_ | || |
| || |_/
\_   |
  |  |`), mat: 'cactus' },
    cactusD: { lines: art(String.raw`
  _  _
 | || |
_| || |_
 |    |`), mat: 'cactus' },
    rock: { lines: art(String.raw`
  .--.
 /    \
(______)`), mat: 'rock' },
    rockL: { lines: art(String.raw`
  .----._
 /       \
(_________)`), mat: 'rock' },
    log: { lines: art(String.raw`
 ______
(______)`), mat: 'wood' },
    logL: { lines: art(String.raw`
 ________
(________)`), mat: 'wood' },
    fern: { lines: art(String.raw`
\ | /
 \|/
--+--`), mat: 'leaf' },
    // a pool sunk into the ground: its top row sits on the ground line
    lava: { lines: [' .~~~~~~~~~.', '(~*~~o~~~*~~)', " '~~~~~~~~~'"], mat: 'fire', pool: true },
    ice: { lines: art(String.raw`
 ____
|    |
|____|`), mat: 'ice' },
    iceL: { lines: art(String.raw`
 ____ __
|    |  |
|____|__|`), mat: 'ice' },
    snowman: { lines: art(String.raw`
  _
 (_)
(   )
(___)`), mat: 'snow' },
  };
  for (const o of Object.values(OBST)) { o.w = widthOf(o.lines); o.h = o.pool ? 1 : o.lines.length; }

  const TREES = {
    saguaro: art(String.raw`
     _
  _ | |
 | || | _
 | || || |
  \_   _/
    | |
    | |`),
    saguaroL: art(String.raw`
        _
       | |
   _   | |
  | |  | |   _
  | |  | |  | |
  | |__| |__| |
   \___   ___/
       | |
       | |
       | |
       | |`),
    joshua: art(String.raw`
 \|/   \|/
  \     /
   \ | /
    \|/
     |
     |`),
    joshuaL: art(String.raw`
 \\|//     \\|//
  \|/  \|/  \|/
   \    |    /
    \   |   /
     \__|__/
        |
        |
        |
       /|\ `),
    palm: art(String.raw`
  __\ | /__
 /   \|/   \
      |
      |
      |
      |`),
    palmL: art(String.raw`
     __ _.--._ __
   .'  \  |  /  '.
  /   .-\ | /-.   \
       ' \|/ '
          |
          (
           )
          (
           )
          (
           )`),
    fern: art(String.raw`
 \  |  /
  \ | /
 --\|/--
    |`),
    canopy: art(String.raw`
   .-ooOOoo-.
  (oOoOoOoOoo)
   '-oOOOoo-'
      | |
      | |
      | |`),
    canopyL: art(String.raw`
       .-~~~~~~-.
    .-(  oO  oO  )-.
   (  oOo  Oo  oOo  )
  (  Oo  oOOo  oO  oo)
    '-(  oO  oO  )-'
       '-.____.-'
           ||
           ||
           ||
          /||\ `),
    dead: art(String.raw`
 \  /
  \/ /
   \/
   |
   |`),
    deadL: art(String.raw`
   \   |   /
    \  |  /_
  \_ \ | / _/
    \_\|/_/
       |
       |
       |
      /|\ `),
    pine: art(String.raw`
    ^
   /*\
  /***\
 /*****\
    |`),
    pineL: art(String.raw`
     ^
    /*\
   /***\
  /*****\
 /*******\
     |
     |`),
    pineXL: art(String.raw`
       ^
      /*\
     /***\
    /*****\
     /***\
    /*****\
   /*******\
    /*****\
   /*******\
  /*********\
      |||
      |||`),
  };
  const PTERO = [[' \\   /', '--\\_/~<'], [' _   _', '--\\_/~<']];
  // props scattered over the foreground
  const PROPS = {
    bones: ['o==o  _', '   o=o'],
    skull: [' .-.', '(o.o)', " |=|"],
    pebbles: ['o  .', ' . o .'],
    stones: [' _', '(_) _', '   (_)'],
    bush: ['\\|//', ' \\|/'],
    tuft: ['\\|/'],
    grass: ['\\ | /', ' \\|/'],
    flowers: ['* @ *', '\\|/|'],
    mushrooms: [' n  n', '(_)(_)'],
    crack: ['~~-~~~'],
    drift: ['  .--.', '.(    )-.'],
    tracks: ['v  v', '  v  v'],
  };

  const FAR = {
    mesa: (x) => (Math.sin(x * 0.02) > 0.3 ? 5 : Math.sin(x * 0.02) > -0.2 ? 2 : 0) + (Math.sin(x * 0.07) > 0.8 ? 1 : 0),
    hills: (x) => Math.round(3 + 2 * Math.sin(x * 0.03) + Math.sin(x * 0.11)),
    peaks: (x) => Math.round(Math.max(0, 7 - Math.abs(((x * 0.15) % 14) - 7)) + Math.sin(x * 0.05) * 1.5),
    volcano: (x) => { const d = Math.abs(wrap(x, 160) - 80); return d < 6 ? 9 : Math.max(0, Math.round(9 - (d - 6) * 0.35)); },
  };


  const BOAT = [
    '       |\\',
    '       | \\',
    '       |  \\',
    '       |___\\',
    '  _____|_____',
    '  \\ o  o  o /',
    '   \\_______/',
  ];
  const BUOY = ['  _|_', ' (___)'];
  const FISH = ['><>', '<><', '><((°>', '<°))><'];
  const CHEST = [' ____', '[_$__]'];
  const MINIPLANE = ['_|_', '=[_]>'];
  // a crab, scuttling sideways: two frames of legs
  const CRAB = [[' (\\/)(\\/)', '  \\(°°)/', '  //  \\\\'], [' (\\/)(\\/)', '  \\(°°)/', '  \\\\  //']];


  const GROUND = {
    house: { lines: art(String.raw`
    __
   /  \__
  /      \
 /________\
 | []  [] |
 |   __   |
 |__|  |__|`), mat: 'house' },
    tower: { lines: art(String.raw`
   ___
  /___\
  |[]|
  |  |
  |__|`), mat: 'house' },
    church: { lines: art(String.raw`
     +
    /_\
    | |
   _|_|_
  /     \
 /_______\
 |  ___  |
 | |   | |
 |_|___|_|`), mat: 'house' },
    castle: { lines: art(String.raw`
  |>
  |
 []_[]_[]
 |      |
 |  __  |
 |_|  |_|`), mat: 'castle' },
    factory: { lines: art(String.raw`
       []
       ||
 /|/|/|||
 |  [] ||
 |_____||`), mat: 'house', smoke: [7, -1] },
    mill: { lines: art(String.raw`
   /|\
  / | \
 /__|__\ `), mat: 'mill', blades: true },
    treeR: { lines: art(String.raw`
  .oOo.
 (oOoOo)
  'oOo'
    |`), mat: 'tree', green: true },
    pine: { lines: art(String.raw`
   ^
  /*\
 /***\
   |`), mat: 'tree', green: true },
    cypress: { lines: art(String.raw`
  ()
 (  )
 (  )
 (  )
  ||`), mat: 'tree', green: true },
    oak: { lines: art(String.raw`
     .-~~~-.
  .-(  oOo  )-.
 (  oOo  oOo  )
  '-(  oOo  )-'
     '-._.-'
       | |
       | |`), mat: 'tree', green: true },
    cypressL: { lines: art(String.raw`
   /\
  (  )
 (    )
 (    )
 (    )
  (  )
  (  )
   ||
   ||`), mat: 'tree', green: true },
    pineL: { lines: art(String.raw`
     ^
    /*\
   /***\
    /*\
   /***\
  /*****\
 /*******\
    |||`), mat: 'tree', green: true },
    duomo: { lines: DUOMO, mat: 'duomo', landmark: 'stf' },
    pearl: { lines: PEARL, mat: 'pearl', landmark: 'zh' },
  };
  for (const o of Object.values(GROUND)) o.w = widthOf(o.lines);
  const BLADES = [
    [' \\   /', '  \\ /', '   o', '  / \\', ' /   \\'],
    ['   |', '   |', '---o---', '   |', '   |'],
  ];
  const GENERIC = ['house', 'house', 'tower', 'church', 'castle', 'factory', 'mill', 'treeR', 'oak', 'oak', 'pineL', 'cypress', 'cypressL', 'cypressL'];


  const PLANE = [
    '   __',
    '   \\ \\_____________',
    '   [==  o o o o o   \\___',
    '   /_/_____________ ___/',
    '        \\_\\',
  ];
  const BALLOON = ['  .-~~-.', ' /      \\', '|        |', ' \\      /', "  '.__.'", '   \\  /', '    []'];
  const KITE = ['  /\\', ' /  \\', ' \\  /', '  \\/', '   }', '   {'];


  const LOCO = art(String.raw`
       ____
  ____|[] |______
 |  ____________ \__
 | |  ||  ||  | |   \
 |_|__||__||__|_|___/
   (O)(O)    (O)(O)`);
  const WAGON = art(String.raw`
 ______________________
| []  []  []  []  []  |
|_____________________|
  (O)(O)        (O)(O)`);
  const STATION = art(String.raw`
 _____________________
/_____________________\
  |                 |
  |                 |
__|_________________|__`);
  const TUNNEL_IN = ['  ___', ' /', '/', '|', '|', '|', '|'];
  const TUNNEL_OUT = ['___', '   \\', '    \\', '    |', '    |', '    |', '    |'];


  const SEA_PALETTES = {
    day: { bg: '#dbe9ef', fg: '#22323a', dim: '#8ba5b2', hl: '#152229', accent: '#c4553f', wave: '#2f7ea3', foam: '#6fb3cf', deep: '#123a52', under: '#5ea3c1', sun: '#e2a03a', lite: '#cfe6f0' },
    night: { bg: '#0b1523', fg: '#d6e2e9', dim: '#4e6475', hl: '#ffffff', accent: '#e06a4f', wave: '#3f84ad', foam: '#7cb6d2', deep: '#050d16', under: '#2d6c8c', sun: '#ece5c6', lite: '#cfe6f0' },
    storm: { bg: '#9aa7ae', fg: '#1d262b', dim: '#5d6b73', hl: '#10171b', accent: '#c4553f', wave: '#2c5f78', foam: '#d6e3e8', deep: '#0e2635', under: '#3e7891', sun: '#9aa7ae', lite: '#d6e3e8' },
  };

  const PLANE_PALETTES = {
    day: { bg: '#d9e8f2', fg: '#2a3340', dim: '#93a9b9', hl: '#18202a', accent: '#c4553f', gold: '#d99a2b', cloud: '#7f97a8', green: '#4f7f46', field: '#a39a45', soil: '#cbd9c2' },
    dusk: { bg: '#f2d4bd', fg: '#3a2b34', dim: '#c39a8e', hl: '#24171e', accent: '#b5443a', gold: '#d98a2f', cloud: '#cc9f92', green: '#5e5a4a', field: '#a8755a', soil: '#e6c3ab' },
    night: { bg: '#0c1120', fg: '#d6dde6', dim: '#46536b', hl: '#ffffff', accent: '#d86a50', gold: '#e8c36a', cloud: '#4f5d76', green: '#2f4a3a', field: '#4a4f34', soil: '#141c2a' },
  };

  const TRAIN_PALETTES = {
    day: { bg: '#e6edf0', fg: '#2c333b', dim: '#9aa8b3', hl: '#171c22', accent: '#b8463a', gold: '#d89a2c', cloud: '#8a9fae', green: '#4f7a48', field: '#a5a052', soil: '#d3dccb', rock: '#6f6a64' },
    dusk: { bg: '#f0d2c0', fg: '#3b2b31', dim: '#c79e94', hl: '#23161c', accent: '#a83f37', gold: '#d98a2f', cloud: '#cfa296', green: '#5f5b4a', field: '#a8765a', soil: '#e7c6b2', rock: '#6a5458' },
    night: { bg: '#0d1220', fg: '#d5dce5', dim: '#45526a', hl: '#ffffff', accent: '#d8664d', gold: '#ffd27a', cloud: '#4c5a72', green: '#2c4636', field: '#454a33', soil: '#121a26', rock: '#3a3f4c' },
  };

  // ---------- the categories ----------
  // Each item: id, names, the drawing (lines) and the colour role it is drawn
  // in; lands and times carry their palette instead.

  const item = (id, it, en, lines, extra = {}) => ({ id, name: { it, en }, lines, ...extra });
  const side = (...blocks) => {
    // a few drawings side by side, standing on the same baseline
    const h = Math.max(...blocks.map((b) => b.length));
    const pad = blocks.map((b) => [...Array(h - b.length).fill(''), ...b]);
    return Array.from({ length: h }, (_, r) => pad.map((b, k) => b[r].padEnd(widthOf(blocks[k]) + 2)).join(''));
  };

  // What goes with what: an item may ask for some lands, some times of day or
  // another item (`only`). The composer greys out the rest; the engine leaves
  // it out. Odd mixes stay possible: a Duomo by the sea, a pterodactyl over
  // the countryside.
  const ON_LAND = ['desert', 'jungle', 'volcano', 'ice', 'countryside'];
  const RIVERS = ['sea', 'countryside', 'jungle'];   // where a boat finds water
  const onLand = (t) => ({ ...t, only: t.only || { lands: ON_LAND } });

  const LANDS = {
    desert: ['Deserto', 'Desert'], jungle: ['Giungla', 'Jungle'], volcano: ['Vulcano', 'Volcano'], ice: ['Ghiaccio', 'Ice'],
  };
  const categories = [
    { id: 'lands', name: { it: 'Ambienti', en: 'Lands' }, items: [
      ...Object.entries(LANDS).map(([id, [it, en]]) => item(id, it, en,
        side(TREES[BIOMES[id].trees[0]], OBST[BIOMES[id].obstacles[0]].lines), { palette: BIOMES[id].palettes.day, land: id })),
      item('countryside', 'Campagna', 'Countryside', side(GROUND.house.lines, GROUND.cypressL.lines, GROUND.mill.lines), { palette: PLANE_PALETTES.day, land: 'countryside' }),
      item('sea', 'Mare', 'Sea', side(BOAT, ['~~~~~~~~~~', '  ><>  <><']), { palette: SEA_PALETTES.day, land: 'sea' }),
    ] },
    { id: 'times', name: { it: 'Ora', en: 'Time of day' }, items: [
      item('day', 'Giorno', 'Day', SUN, { palette: PLANE_PALETTES.day }),
      item('dusk', 'Tramonto', 'Dusk', DUSK_SUN, { palette: PLANE_PALETTES.dusk }),
      item('night', 'Notte', 'Night', MOON, { palette: PLANE_PALETTES.night }),
    ] },
    { id: 'weather', name: { it: 'Clima', en: 'Weather' }, items: [
      item('rain', 'Pioggia', 'Rain', ['  .--.', ' (    )-.', '(______)', ' / / / /', '/ / / /'], { palette: SEA_PALETTES.storm }),
      item('snow', 'Neve', 'Snow', ['  .--.', ' (    )-.', '(______)', ' *  .  *', '.  *  . '], { palette: { bg: '#eef2f5', fg: '#3b4a57', dim: '#a9b8c4', accent: '#c8553d', green: '#6f8f86' } }),
    ] },
    { id: 'vehicles', name: { it: 'Mezzi e protagonisti', en: 'Vehicles and heroes' }, items: [
      item('dino', 'Dinosauro', 'Dinosaur', [...DINO, ...DINO_LEGS[0]], { only: { lands: ON_LAND } }),
      item('boat', 'Barca a vela', 'Sailing boat', BOAT, { only: { lands: RIVERS } }),
      item('plane', 'Aereo', 'Plane', PLANE),
      item('miniplane', 'Aereo piccolo', 'Small plane', MINIPLANE),
      item('train', 'Treno', 'Train', side(WAGON, LOCO)),
      item('balloon', 'Mongolfiera', 'Hot-air balloon', BALLOON),
      item('kite', 'Aquilone', 'Kite', KITE),
    ] },
    { id: 'landmarks', name: { it: 'Monumenti', en: 'Landmarks' }, items: [
      item('duomo', 'Duomo di Firenze', 'Florence Cathedral', DUOMO),
      item('pearl', 'Perla d\'Oriente', 'Oriental Pearl Tower', PEARL),
    ] },
    { id: 'buildings', name: { it: 'Edifici', en: 'Buildings' }, items: [
      item('house', 'Casa', 'House', GROUND.house.lines), item('tower', 'Torre', 'Tower', GROUND.tower.lines),
      item('church', 'Chiesa', 'Church', GROUND.church.lines), item('castle', 'Castello', 'Castle', GROUND.castle.lines),
      item('factory', 'Fabbrica', 'Factory', GROUND.factory.lines), item('mill', 'Mulino', 'Windmill', [...BLADES[0], ...GROUND.mill.lines]),
      item('station', 'Stazione', 'Station', STATION),
    ].map(onLand) },
    { id: 'trees', name: { it: 'Alberi e piante', en: 'Trees and plants' }, items: [
      item('oak', 'Quercia', 'Oak', GROUND.oak.lines), item('treeR', 'Albero', 'Tree', GROUND.treeR.lines),
      item('cypressL', 'Cipresso', 'Cypress', GROUND.cypressL.lines), item('pineL', 'Pino', 'Pine', GROUND.pineL.lines),
      item('saguaroL', 'Saguaro', 'Saguaro', TREES.saguaroL), item('joshuaL', 'Albero di Giosuè', 'Joshua tree', TREES.joshuaL),
      item('palmL', 'Palma', 'Palm', TREES.palmL), item('canopyL', 'Chioma tropicale', 'Tropical canopy', TREES.canopyL),
      item('fern', 'Felce', 'Fern', TREES.fern), item('deadL', 'Albero secco', 'Dead tree', TREES.deadL),
      item('pineXL', 'Abete', 'Fir', TREES.pineXL),
    ].map((t) => onLand({ ...t, role: 'green' })) },
    { id: 'obstacles', name: { it: 'Ostacoli', en: 'Obstacles' }, items: [
      item('cactusL', 'Cactus', 'Cactus', OBST.cactusL.lines), item('cactusD', 'Cactus doppio', 'Twin cactus', OBST.cactusD.lines),
      item('rockL', 'Masso', 'Boulder', OBST.rockL.lines), item('logL', 'Tronco', 'Log', OBST.logL.lines),
      item('iceL', 'Blocchi di ghiaccio', 'Ice blocks', OBST.iceL.lines), item('snowman', 'Pupazzo di neve', 'Snowman', OBST.snowman.lines),
      item('lava', 'Lava', 'Lava', OBST.lava.lines, { role: 'accent' }),
    ].map((t) => ({ ...t, only: { lands: ON_LAND, needs: 'vehicles.dino' } })) },
    { id: 'animals', name: { it: 'Animali', en: 'Animals' }, items: [
      item('ptero', 'Pterodattilo', 'Pterodactyl', PTERO[0]),
      item('gull', 'Gabbiano', 'Gull', ['~v~']),
      item('fish', 'Pesci', 'Fish', [FISH[2], '   ' + FISH[1], FISH[0]], { only: { lands: ['sea'] } }),
      item('crab', 'Granchi', 'Crabs', CRAB[0], { role: 'accent', only: { lands: ['sea', 'desert', 'jungle'] } }),
    ] },
    { id: 'sky', name: { it: 'Cielo', en: 'Sky' }, items: [
      ...CLOUDS.map((c, k) => item(`cloud${k}`, `Nuvola ${k + 1}`, `Cloud ${k + 1}`, c, { role: 'dim' })),
      item('sun', 'Sole', 'Sun', SUN, { role: 'accent', only: { times: ['day'] } }), item('moon', 'Luna', 'Moon', MOON, { role: 'accent' }),
      item('stars', 'Stelle', 'Stars', ['*   .    *', '   .   *  ', ' *     .  '], { role: 'dim', only: { times: ['night'] } }),
    ] },
    { id: 'ground', name: { it: 'Terreno', en: 'Ground' }, items: [
      item('bones', 'Ossa', 'Bones', PROPS.bones), item('skull', 'Teschio', 'Skull', PROPS.skull),
      item('flowers', 'Fiori', 'Flowers', PROPS.flowers, { role: 'green' }), item('mushrooms', 'Funghi', 'Mushrooms', PROPS.mushrooms),
      item('grass', 'Erba', 'Grass', PROPS.grass, { role: 'green' }), item('stones', 'Sassi', 'Stones', PROPS.stones),
      item('drift', 'Neve', 'Snow drift', PROPS.drift, { role: 'dim' }), item('crack', 'Crepa di lava', 'Lava crack', PROPS.crack, { role: 'accent' }),
      item('buoy', 'Boa', 'Buoy', BUOY, { role: 'accent', only: { lands: RIVERS } }),
      item('chest', 'Forziere', 'Treasure chest', CHEST, { role: 'accent', only: { lands: ['sea'] } }),
    ].map(onLand) },
    { id: 'logos', name: { it: 'Loghi', en: 'Logos' }, items: [
      item('vesta-laris', 'Vesta Laris', 'Vesta Laris', ICONS['vesta-laris']),
      item('stf', 'Stairway to Florence', 'Stairway to Florence', ICONS.stf),
    ].map(onLand) },
  ];

  const byKey = new Map(categories.flatMap((c) => c.items.map((it) => [`${c.id}.${it.id}`, it])));
  // Why an item can't be in a scene ({ why: 'land' | 'time' | 'needs', ... }),
  // or null when it can.
  function blocked(key, { land = 'countryside', time = 'day', picks = [] } = {}) {
    const o = byKey.get(key)?.only;
    if (!o) return null;
    if (o.lands && !o.lands.includes(land)) return { why: 'land', land };
    if (o.times && !o.times.includes(time)) return { why: 'time', times: o.times };
    if (o.needs && !picks.includes(o.needs)) return { why: 'needs', item: o.needs };
    return null;
  }
  // The picks of a recipe that fit its land and time (dropping one may drop
  // another: no dinosaur, no obstacles).
  function fit({ land, time, picks = [] }) {
    let out = picks.filter((k) => byKey.has(k));
    for (let n = -1; n !== out.length;) {
      n = out.length;
      out = out.filter((k) => !blocked(k, { land, time, picks: out }));
    }
    return out;
  }

  return {
    categories, byKey, blocked, fit,
    parts: {
      CLOUDS, SUN, DUSK_SUN, MOON, DUOMO, PEARL, ICONS, DINO, DINO_LEGS, DINO_AIR, BIOMES, OBST, TREES, PTERO, PROPS, FAR, BOAT, BUOY, FISH, CHEST, MINIPLANE, CRAB, GROUND, BLADES, GENERIC, PLANE, BALLOON, KITE, LOCO, WAGON, STATION, TUNNEL_IN, TUNNEL_OUT, SEA_PALETTES, PLANE_PALETTES, TRAIN_PALETTES,
    },
    art, widthOf,
  };
})();
