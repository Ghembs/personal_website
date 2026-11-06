// The timer's skins, and the contract they keep.
//
// A skin is three things:
//   1. an entry in SKINS below: its name, colours for the browser bar and its
//      marble, an icon set, and a layout chosen from a closed menu;
//   2. a stylesheet skins/<id>.css, linked in index.html, every rule under
//      body[data-skin="<id>"]: the tokens below, and whatever it paints;
//   3. if it wants one, a photo in img/ (public domain or CC0, credited in
//      THIRD_PARTY_NOTICES.md).
// The page itself never changes: a skin only styles what the contract names.
//
// PARTS (never renamed)
//   windows   #player #playlist #library #picker — each .win > .title (.ico .tt) + .body
//   display   .lcd > .px (a free layer) #state #time (.colon) .now (#now-gem #label)
//             #vis .secbar (20 <i>) .marquee (#marq) .chips (.chip > b + small)
//   position  .strip > #segs (36 <i>, each with --c)
//   keys      .deck > .transport (#prev #play #pause #stop #next #eject) + .lights (.led #sound #voice)
//   switch    .skins > button[data-skin] (one per skin)
//   plan      #name #list > .row (.fixed .head .cfg .sec .add) with .n .gem .nm .dur .mini
//             .pbar (.btn.sm #flash .tot)
//   library   #mine #examples > li > .item (.n .nm small) + .mini.x
//
// STATES (set by the view; a skin decides how they look)
//   .btn.down      latched: #play while running, #pause while paused
//   .btn.press     a key on the keyboard pressed it, for a moment
//   #segs i.lit, .secbar i.lit   played blocks
//   .row.now       the row playing          #player.paused / .last / .done
//   body.live      a workout is on (editing locked)
//   .led.on  #eject.on  .skins [aria-checked="true"]
//   --seg          the colour of the segment playing (on #player and .row.now)
//   --c            a gem's colour, a block's colour
//
// TOKENS (each skin defines them on body[data-skin])
//   type     --ui (labels) --text (lists, fields) --lcd-font (the display)
//   colour   --fg --dim --accent --engrave (a text-shadow, or none)
//   shape    --r (window radius) --drop (shadow colour)
//   display  --lcd-fg --lcd-dim --lcd-glow --lcd-spec (its reflection, 0–1)
//   keys     --key-top --key-bot --key-edge --key-fg, and --hot-* for #play
//   lists    --list --list-fg --row-alt --row-head --field
//   scenery  --photo --photo-at --veil (and a smaller --photo under 900px)
// Shared textures to use or not: --grain --brushed --carbon (timer.css).
//
// LAYOUT (body[data-*], geometry in timer.css; a skin only paints it)
//   deck    row | wheel | arc | cluster
//           wheel is painted with --wheel (background), --wheel-rim (box-shadow),
//           --wheel-press (a pressed key's glow)
//   lcd     rect | lens | lozenge
//   panes   rect | leaf  (leaf: --leaf, the long radius; --leaf-in inside)
//   switch  marbles | capsule  (capsule: --cap, --cap-on, --cap-fg, --cap-on-fg)
// ICONS    pixel | glossy (icons.js); the windows get pixel art or 3D objects.

const SKINS = [
  {
    id: 'dark', theme: '#05070b', marble: ['#0b0f14', '#7dff6a'], icons: 'pixel',
    layout: { deck: 'wheel', lcd: 'rect', panes: 'rect', switch: 'marbles' },
  },
  {
    id: 'eco', theme: '#2e6b1c', marble: ['#2f8f0a', '#d6ff7a'], icons: 'glossy',
    layout: { deck: 'arc', lcd: 'lens', panes: 'leaf', switch: 'marbles' },
  },
  {
    id: 'aqua', theme: '#0a5fb5', marble: ['#0a5fd0', '#9fe2ff'], icons: 'glossy',
    layout: { deck: 'cluster', lcd: 'lozenge', panes: 'rect', switch: 'capsule' },
  },
  {
    id: 'chrome', theme: '#c9b8ff', marble: ['#8a7dd8', '#ffd1f2'], icons: 'glossy',
    layout: { deck: 'row', lcd: 'lozenge', panes: 'leaf', switch: 'capsule' },
  },
];

const Skins = {
  list: SKINS,
  get: (id) => SKINS.find((s) => s.id === id) || SKINS[0],
  // dress the page in a skin: its name, its layout, its icons, the browser bar
  apply(id) {
    const s = Skins.get(id), b = document.body;
    b.dataset.skin = s.id;
    for (const [k, v] of Object.entries(s.layout)) b.dataset[k] = v;
    document.querySelector('meta[name="theme-color"]').content = s.theme;
    Icons.apply(s.icons);
    return s;
  },
  // the switch: one button per skin, its marble in the skin's colours
  switchHTML: () => SKINS.map((s) => `<button data-skin="${s.id}" role="radio" style="--m1:${s.marble[0]};--m2:${s.marble[1]}">${s.id}</button>`).join(''),
};
