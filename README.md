# Omar Bouattour — Portfolio

A personal, responsive portfolio built from Omar's CV, with a light-first design, dark mode, and a portrait-led introduction. The visual direction follows the supplied [Mohamed Yassine Abid](https://mohamedyassineabid.github.io/) and [Emna Mnejja](https://mnejja-emna.github.io/) references.

## Run locally

Requires Node.js 20 or newer. The website has no runtime dependencies. LinkeDOM is used only for automated DOM checks.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Set `PORT` to change the port.

```bash
npm test       # Nine checks for interactions, media discovery, assets, and HTTP delivery
npm run build  # Produce the static site and photo manifest in dist/
```

## Photos

See [PHOTOS.md](PHOTOS.md). Put images in the relevant project or event folder under `public/images/`. They are discovered automatically and become card covers and multi-image galleries. Add optional `captions.json` files for captions and accessible descriptions.

The current portrait and event photographs were supplied by Omar. The portrait lives in `public/images/profile/portrait.png`. Replace that file to update it; event images live in the matching album folders.

The development server refreshes the photo manifest on page reload. Build and redeploy after changing photos on the hosted site.

## Structure

- `src/index.html`: hero, about, projects, experience, hackathons, education, and contact.
- `src/css/portfolio.css`: responsive layout and light/dark theme variables.
- `src/theme.js`: applies a saved theme before the first paint.
- `src/main.js`: filters, theme toggle, menu, project/event details, photo galleries, clipboard.
- `content/albums.json`: album IDs and photo folders.
- `public/`: CV, portrait, photo albums, self-hosted fonts, favicon, and sharing artwork.
- `scripts/media.mjs`: image discovery, sorting, captions, and manifest generation.
- `scripts/`: local server and static build.
- `tests/`: Node test runner and LinkeDOM checks.
- `.openai/hosting.json`: existing Site identity and static output directory.
- `vendor/devfolio/`: retained stylesheet from the initial MIT-licensed template import.

## Editing and validation

Update visible summaries in `src/index.html` and detailed descriptions in `src/main.js`. Update the CV in `public/Omar_Bouattour.pdf`. Availability follows the supplied CV: a six-month internship starting February 2027.

Run `npm test`, `npm run build`, and `git diff --check` before deployment. The test suite checks DOM behavior and server responses; browser verification is still needed for visual layout, native dialog behavior, and actual mobile rendering.

## Attribution

The initial version imported [DevFolio](https://github.com/AnilSeervi/DevFolio) by Anil Seervi; its MIT license remains in `LICENSE`. The revised design and galleries are custom implementations inspired by the user-supplied references. DM Sans and Space Grotesk are self-hosted under the SIL Open Font License.
