# Omar Bouattour — Portfolio

A responsive professional portfolio adapted from [AnilSeervi/DevFolio](https://github.com/AnilSeervi/DevFolio), using the experience, education, skills, and projects in Omar's supplied CV. The original MIT license is retained in `LICENSE`.

## Run locally

Requires Node.js 20 or newer. The website has no runtime dependencies. Install the test-only dependency to run automated checks. LinkeDOM checks DOM behavior; it does not replace visual browser verification.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Set `PORT` to change the port.

```bash
npm test       # Check page links, CV, interactive wiring, and HTTP responses
npm run build  # Produce the deployable static site in dist/
```

## Structure

- `src/index.html`: portfolio sections and CV-based content.
- `src/css/template.css`: imported DevFolio base styles.
- `src/css/portfolio.css`: typography, theme, layouts, and responsive overrides.
- `src/main.js`: project filters, details dialogs, mobile navigation, and copy-email.
- `public/`: original downloadable CV, favicon, sharing artwork, self-hosted fonts.
- `scripts/`: dependency-free development server and static build.
- `tests/`: Node test runner checks.
- `.openai/hosting.json`: Sites identity and static output directory.

## Editing

Update project summaries in `src/index.html` and detailed descriptions in `src/main.js`. Replace `public/Omar_Bouattour.pdf` when the CV changes. Availability currently follows the supplied CV: a six-month internship starting February 2027.

The source link for the Kubernetes project was verified against Omar's public GitHub repository. Other projects have detailed summaries and a discussion link; add their repository URLs only when confirmed.

Keep changes focused and run `npm test` and `npm run build` before deployment. Browser checks should cover mobile navigation, filters, project dialogs (including Escape and focus return), email copying, and the CV download.

## Attribution

DevFolio by Anil Seervi, MIT. Import details are in `TEMPLATE.md`. DM Sans and Space Grotesk are self-hosted under the SIL Open Font License; license files live alongside the fonts.
