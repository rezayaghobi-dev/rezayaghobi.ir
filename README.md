# Reza Yaghobi — personal site

A static, single-page portfolio for `rezayaghobi.ir`. Plain HTML, CSS and one small
JavaScript file. There is no build step and the page makes no external requests.

## Preview locally

From this directory:

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080/>.

## Structure

```
index.html            all content and both inline SVG diagrams
favicon.svg           "RY" monogram
robots.txt
assets/style.css      design tokens, layout, components, motion, responsive rules
assets/brand.css      generated per-tile brand colours (used for tile hover borders)
assets/app.js         progress line, section reveals, diagram line drawing
assets/boot.js        adds .js to <html> before render
assets/fonts/         two latin variable woff2 files
assets/icons/         33 tool icons (simple-icons + neutral monograms)
assets/img/           screenshots, certificate images (WebP), og.png
tools/build-icons.mjs regenerates the icon set and assets/brand.css
tools/og.html         template used to render the Open Graph image
```

## Fonts

The fonts are copied from the Fontsource packages, latin variable weight files only:

- `@fontsource-variable/bricolage-grotesque` →
  `bricolage-grotesque-latin-wght-normal.woff2`
- `@fontsource-variable/instrument-sans` →
  `instrument-sans-latin-wght-normal.woff2`

They are declared with `font-display: swap` and a system fallback stack. Small
labels use the system monospace stack.

## Icons

Icons are generated from [`simple-icons`](https://simpleicons.org/) in a scratch
folder outside this site. Install it once:

```bash
mkdir -p /tmp/ry-scratch
cd /tmp/ry-scratch
npm init -y
npm install simple-icons
```

Then, from this project:

```bash
node tools/build-icons.mjs
# or point at another install:
SIMPLE_ICONS_DIR=/path/to/node_modules/simple-icons node tools/build-icons.mjs
```

The script reads each icon's slug, path and brand hex from `simple-icons`, then:

- writes `assets/icons/<tool>.svg` with the brand colour as `fill`;
- lightens any brand colour that falls below 3:1 contrast on the `#0a0d14`
  background (Helm and Elasticsearch needed this);
- writes `assets/brand.css` with one `--brand` custom property per tile;
- writes a neutral monogram tile for tools simple-icons does not include:
  HAProxy, Keepalived, Argo CD, GitOps, Nexus Repository, Loki, Alloy, Zabbix,
  C# and Microsoft SQL Server. These are plain letters, not imitations of logos.

## Images

`assets/img/pipeline.png` and `assets/img/dashboard.png` are copies of the supplied
screenshots. The page uses 1200 px wide WebP versions generated with Pillow:

```python
from PIL import Image
im = Image.open("images/pipline-green.png").convert("RGB")
im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS).save(
    "assets/img/pipeline-1200.webp", "WEBP", quality=82, method=6
)
```

Repeat for `images/dashboard.png`.

The three ArvanCloud certificate images are converted from `images/Associate.jpg`,
`images/professional.png` and `images/expert.png` to 1000 px wide WebP at quality
80: `cert-associate.webp`, `cert-professional.webp` and `cert-expert.webp`. The
full-size WebP opens in a new tab when a thumbnail is clicked.

## Open Graph image

`assets/img/og.png` is a 1200 × 630 render of `tools/og.html`. With the preview
server running:

```bash
google-chrome --headless=new --hide-scrollbars --window-size=1200,630 \
  --screenshot=assets/img/og.png http://localhost:8080/tools/og.html
```

## Notes

- Section reveals, hero fades and the staggered tile/row fades are gated behind
  classes added by `app.js`, so the page remains fully visible if JavaScript is
  disabled or fails.
- All motion is disabled under `prefers-reduced-motion: reduce`.
- The pipeline diagram uses the stage names from the devops-test repository
  (`test`, `build`, `publish`, `deploy`) rather than invented steps.
