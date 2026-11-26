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
npm test       # Check interactions, motion preferences, galleries, media discovery, assets, and HTTP delivery
npm run build  # Produce the static site and photo manifest in dist/
```

## GitHub Pages

This repository publishes to https://omarbouat.github.io/ using the workflow in `.github/workflows/deploy.yml`. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source once. Pushes to `main` then install dependencies, run tests, build `dist/`, and deploy the website automatically. You can also start the workflow from the **Actions** tab.

Keep the repository named `omarbouat.github.io`; asset paths assume the website is hosted at the domain root. Generated files and dependencies stay out of Git. The `.nojekyll` file is included in the build for compatibility with manual static publishing.

## Photos

See [PHOTOS.md](PHOTOS.md). Put images in the relevant project or event folder under `public/images/`. They are discovered automatically and become card covers and multi-image galleries. Add optional `captions.json` files for captions and accessible descriptions.

The current portrait and event photographs were supplied by Omar. The portrait lives in `public/images/profile/portrait.png`. Replace that file to update it; event images live in the matching album folders.

The development server refreshes the photo manifest on page reload. Build and redeploy after changing photos on the hosted site.

The project list includes Student Mental Health Analysis (PDA), based on the supplied presentation and verified [analysis notebooks](https://github.com/OmarBouat/Project-Data-Analysis). The original five projects start with approved illustrated covers; the Big Data project uses its supplied presentation cover. The PDA and vegetable-classification galleries each retain five curated screenshots after the cover; crop recommendation retains three covering its objective, model evaluation, and web application. See the photo guide for selected slide numbers.

The sixth project, **Hadoop HA & Big Data Platform**, links to [its public repository](https://github.com/OmarBouat/big-data-ha-cluster). Its six-image gallery covers the supplied project presentation, four-VM service placement, HDFS/YARN design, Spark workloads, recorded Router failover, and the Hive crime-analysis summary. Details also describe HBase failover validation. The project is presented as a single-host lab; no uptime or recovery-time benchmark is claimed.

## Structure

- `src/index.html`: hero, CV technology bar, about, experience, projects, hackathons, education, and contact.
- `src/css/portfolio.css`: responsive layout and light/dark theme variables.
- `src/theme.js`: applies a saved theme before the first paint.
- `src/main.js`: technology scrolling controls, entrance animations, filters, theme, navigation, galleries, and clipboard.
- `content/albums.json`: album IDs and photo folders.
- `content/technology-logos.json`: logo sources, pinned revisions, and concept-icon attribution.
- `public/`: CV, portrait, photo albums, self-hosted fonts, favicon, and sharing artwork.
- `scripts/media.mjs`: image discovery, sorting, captions, and manifest generation.
- `scripts/`: local server and static build.
- `tests/`: Node test runner and LinkeDOM checks.
- `.openai/hosting.json`: existing Site identity and static output directory.

The technology strip includes all 45 languages, frameworks, platforms, and model tools named in the CV as locally hosted SVG logos or concept icons. Hover, focus, or tap a logo to reveal its name. All 45 logos share one borderless row. Pause scrolling to browse the row manually; reduced-motion preferences also disable automatic scrolling and entrance animations. Monochrome marks adapt to dark mode. Experience cards stay fully expanded and appear before projects.

## Editing and validation

Update visible summaries in `src/index.html` and detailed descriptions in `src/main.js`. Update the CV in `public/Omar_Bouattour.pdf`. The current CV includes freelance AI and full-stack work at UTA Metaux (September–October 2026), an autonomous business agent, and updated AI/backend skills. Availability follows the supplied CV: a six-month internship starting February 2027.

`public/` contains only assets used by the website. Keep original slide decks and unused uploads outside the repository. `node_modules/` and `dist/` are generated locally and ignored by Git; recreate them with `npm ci` and `npm run build`.

Run `npm test`, `npm run build`, and `git diff --check` before deployment. When changing CSS or `main.js`, update their `?v=` asset versions in `src/index.html` so returning visitors receive the new files from GitHub Pages. The test suite checks DOM behavior and server responses; browser verification is still needed for visual layout, native dialog behavior, and actual mobile rendering.

## Attribution

The initial version imported [DevFolio](https://github.com/AnilSeervi/DevFolio) by Anil Seervi at commit `650cbbef5c5e132321ef51e7b8626d98f11276ad`. Its MIT license remains in `LICENSE`. The current design and galleries use custom HTML, CSS, and JavaScript inspired by the references above; the unused template stylesheet has been removed. DM Sans and Space Grotesk are self-hosted under the SIL Open Font License; their license files are in `public/fonts/`.

Technology marks come from [Devicon](https://github.com/devicons/devicon), [Lobe Icons](https://github.com/lobehub/lobe-icons), [Simple Icons](https://github.com/simple-icons/simple-icons), [LiteLLM](https://github.com/BerriAI/litellm), and the [Apache IoTDB website](https://iotdb.apache.org/). Their licenses are retained in `public/licenses/`; source URLs are recorded in `content/technology-logos.json`. The SQL, PL/SQL, model architecture, AI agent, API, and CI/CD symbols are original concept illustrations. GPT uses the OpenAI mark and Nexus uses the Sonatype mark. Brand marks identify technologies and do not imply endorsement.
