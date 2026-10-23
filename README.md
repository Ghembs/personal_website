# personal_website

Personal site of Giuliano Gambacorta, for [giulianogambacorta.com](https://giulianogambacorta.com).

The landing page is a single full-screen scene that keeps changing its look:

- **tunnel**: rectangles in riso inks turning on the inner wall of a cylinder (Canvas2D);
- **ascii**: the same scene redrawn as a grid of characters (p5.js WebGL shaders);
- **nuvole**: ascii clouds drifting across paper;
- **shan shui**: an endless ink-landscape handscroll, with the links hidden in it.

Keys `1`–`4` pick a mode, `space` a random one. There are a few easter eggs.

## Structure

```
public/          the site, served as is (no build step)
  index.html
  main.js        modes, transitions, links, the WebGL pipeline
  kaleido.js     the tunnel
  shanshui.js    the handscroll
  shaders.js     source and ascii shaders
  style.css
  _headers       Cloudflare Pages response headers
wrangler.toml    Cloudflare Pages project config
```

## Run locally

```bash
python3 -m http.server 5173 --directory public
```

Then open <http://localhost:5173>.

## Deploy

The Cloudflare Pages project is `giuliano-gambacorta-website`, serving `public/`.

Either connect this repository in the Cloudflare dashboard (Workers & Pages →
Create → Pages → Connect to Git) with **no build command** and **`public`** as
the output directory, or deploy from the command line:

```bash
npx wrangler pages project create giuliano-gambacorta-website --production-branch main
npx wrangler pages deploy
```

Then add `giulianogambacorta.com` under the project's Custom domains.

## License

[MIT](LICENSE). Third-party code and assets are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
