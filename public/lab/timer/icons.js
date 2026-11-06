// The timer's icons, in two sets: pixel art for the dark skin (a hardware
// player of the early 2000s, its icons drawn on a dot-matrix screen) and
// glossy vector icons for eco and aqua (lit from the top: a white sheen over
// the upper half), with three little 3D objects for the windows' titles: a
// glass stopwatch, a playlist sheet, a notepad.
const Icons = (() => {
  // ---- pixel art: '#' ink, 'o' ink at a third, '+' a lit pixel ----
  const PIX = {
    play: ['#........', '###......', '#####....', '#######..', '#########', '#######..', '#####....', '###......', '#........'],
    pause: ['###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###'],
    stop: ['.........', '.#######.', '.#######.', '.#######.', '.#######.', '.#######.', '.#######.', '.#######.', '.........'],
    prev: ['##......#', '##.....##', '##....###', '##...####', '##..#####', '##...####', '##....###', '##.....##', '##......#'],
    next: ['#......##', '##.....##', '###....##', '####...##', '#####..##', '####...##', '###....##', '##.....##', '#......##'],
    eject: ['....#....', '...###...', '..#####..', '.#######.', '#########', '.........', '#########', '#########', '.........'],
    clock: ['...#####...', '..#ooooo#..', '.#o+o#ooo#.', '#o+oo#oooo#', '#oooo#oooo#', '#oooo###oo#', '#ooooooooo#', '#ooooooooo#', '.#ooooooo#.', '..#ooooo#..', '...#####...'],
    list: ['...........', '++.#######.', '...........', '++.#######.', '...........', '++.######..', '...........', '++.#######.', '...........', '++.#####...', '...........'],
    pad: ['.+.+.+.+.+.', '###########', '#ooooooooo#', '#o#######o#', '#ooooooooo#', '#o#######o#', '#ooooooooo#', '#o#####ooo#', '#ooooooooo#', '#ooooooooo#', '###########'],
  };
  function pixel(name) {
    const rows = PIX[name];
    const w = rows[0].length, h = rows.length;
    let r = '';
    rows.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === '#') r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      else if (c === 'o') r += `<rect x="${x}" y="${y}" width="1" height="1" opacity=".3"/>`;
      else if (c === '+') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="#fff"/>`;
    }));
    return `<svg class="pix" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${r}</svg>`;
  }

  // ---- glossy: the shape, and the same shape lit on its upper half ----
  const SHAPE = {
    play: '<path d="M8 4.8v14.4c0 .8.9 1.3 1.6.9l11.2-7.2c.6-.4.6-1.3 0-1.7L9.6 3.9C8.9 3.5 8 4 8 4.8z"/>',
    pause: '<rect x="5.5" y="4.5" width="5" height="15" rx="1.6"/><rect x="13.5" y="4.5" width="5" height="15" rx="1.6"/>',
    stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.4"/>',
    prev: '<rect x="4" y="5" width="3.2" height="14" rx="1.2"/><path d="M19.5 6v12c0 .8-.9 1.2-1.5.8L9.2 12.8c-.6-.4-.6-1.2 0-1.6L18 5.2c.6-.4 1.5 0 1.5.8z"/>',
    next: '<rect x="16.8" y="5" width="3.2" height="14" rx="1.2"/><path d="M4.5 6v12c0 .8.9 1.2 1.5.8l8.8-6c.6-.4.6-1.2 0-1.6L6 5.2c-.6-.4-1.5 0-1.5.8z"/>',
    eject: '<path d="M11.2 4.4 4.6 12.6c-.5.6 0 1.6.8 1.6h13.2c.8 0 1.3-1 .8-1.6l-6.6-8.2c-.4-.5-1.2-.5-1.6 0z"/><rect x="4.5" y="16" width="15" height="3.6" rx="1.3"/>',
  };
  const glossy = (name) => `<svg class="gl" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor">${SHAPE[name]}</g><g fill="#fff" opacity=".55" clip-path="url(#ic-top)">${SHAPE[name]}</g></svg>`;

  // ---- the three objects of the titles ----
  const OBJ = {
    clock: `<svg class="obj" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="10" y="1.2" width="4" height="3.2" rx="1" fill="url(#ic-chrome)"/>
      <rect x="17.6" y="4.6" width="2.6" height="2.2" rx=".8" transform="rotate(45 18.9 5.7)" fill="url(#ic-chrome)"/>
      <circle cx="12" cy="13.6" r="9.4" fill="url(#ic-chrome)"/>
      <circle cx="12" cy="13.6" r="7.6" fill="url(#ic-face)"/>
      <g stroke="#30465c" stroke-width=".9" stroke-linecap="round" opacity=".7"><path d="M12 7v1.3M12 19v1.3M5.4 13.6h1.3M17.3 13.6h1.3"/></g>
      <path d="M12 13.6V8.9M12 13.6l3.3 2.1" stroke="#1d2c3c" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <circle cx="12" cy="13.6" r="1.1" fill="#ff4f6d"/>
      <ellipse cx="10.2" cy="9.6" rx="5.6" ry="2.8" fill="#fff" opacity=".75"/>
    </svg>`,
    list: `<svg class="obj" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="2.5" width="17" height="19.5" rx="2.2" fill="#000" opacity=".2" transform="translate(.8 .8)"/>
      <rect x="3.5" y="2.5" width="17" height="19.5" rx="2.2" fill="url(#ic-sheet)" stroke="#7f95ad" stroke-width=".6"/>
      <circle cx="7.2" cy="7.5" r="1.6" fill="url(#ic-red)"/><rect x="10" y="6.7" width="8" height="1.6" rx=".8" fill="#9fb3c8"/>
      <circle cx="7.2" cy="12.2" r="1.6" fill="url(#ic-green)"/><rect x="10" y="11.4" width="6.5" height="1.6" rx=".8" fill="#9fb3c8"/>
      <circle cx="7.2" cy="16.9" r="1.6" fill="url(#ic-blue)"/><rect x="10" y="16.1" width="7.5" height="1.6" rx=".8" fill="#9fb3c8"/>
      <path d="M5 3.5h14c.6 0 1 .4 1 1v4c-4-1.6-10-1.6-16 .4V4.5c0-.6.4-1 1-1z" fill="#fff" opacity=".55"/>
    </svg>`,
    pad: `<svg class="obj" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5h16v14.2L16.6 23H4z" fill="#000" opacity=".2" transform="translate(.8 .8)"/>
      <path d="M4 5.5h16v14.2L16.6 23H4z" fill="url(#ic-paper)" stroke="#b89a2c" stroke-width=".6"/>
      <path d="M16.6 23v-2.6c0-.4.3-.7.7-.7H20z" fill="#e8cf6c" stroke="#b89a2c" stroke-width=".5"/>
      <g stroke="#7aa7d8" stroke-width=".7"><path d="M5.5 11h13M5.5 14h13M5.5 17h13M5.5 20h9.5"/></g>
      <path d="M7.5 8.5v14" stroke="#e2756a" stroke-width=".6"/>
      <rect x="3.4" y="2.6" width="17.2" height="4.4" rx="1.2" fill="url(#ic-band)"/>
      <g fill="url(#ic-chrome)"><circle cx="7" cy="4.8" r="1"/><circle cx="12" cy="4.8" r="1"/><circle cx="17" cy="4.8" r="1"/></g>
      <rect x="4.2" y="3" width="15.6" height="1.6" rx=".8" fill="#fff" opacity=".45"/>
    </svg>`,
  };

  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <clipPath id="ic-top" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="24" height="11.2"/></clipPath>
    <linearGradient id="ic-chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#b9c4cf"/><stop offset=".55" stop-color="#7e8a97"/><stop offset="1" stop-color="#e9eef3"/></linearGradient>
    <radialGradient id="ic-face" cx=".45" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#d9efff"/><stop offset="1" stop-color="#8fc4ef"/></radialGradient>
    <linearGradient id="ic-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe5ef"/></linearGradient>
    <linearGradient id="ic-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbd6"/><stop offset="1" stop-color="#f5e48a"/></linearGradient>
    <linearGradient id="ic-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a7a"/><stop offset=".5" stop-color="#d9362a"/><stop offset="1" stop-color="#a8221a"/></linearGradient>
    <radialGradient id="ic-red" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffd2da"/><stop offset=".5" stop-color="#ff4f6d"/><stop offset="1" stop-color="#b8203c"/></radialGradient>
    <radialGradient id="ic-green" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#d4ffe8"/><stop offset=".5" stop-color="#2fd38a"/><stop offset="1" stop-color="#14855a"/></radialGradient>
    <radialGradient id="ic-blue" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#d6e9ff"/><stop offset=".5" stop-color="#2f8cff"/><stop offset="1" stop-color="#1550b0"/></radialGradient>
  </defs></svg>`;

  return {
    // fill every [data-icon] with the icon of the skin
    apply(skin, root = document) {
      if (!document.getElementById('ic-top')) document.body.insertAdjacentHTML('afterbegin', DEFS);
      root.querySelectorAll('[data-icon]').forEach((el) => {
        const n = el.dataset.icon;
        el.innerHTML = skin === 'dark' ? pixel(n) : el.classList.contains('ico') ? OBJ[n] : glossy(n);
      });
    },
  };
})();
