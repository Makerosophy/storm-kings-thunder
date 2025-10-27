## SKT - Storm King's Thunder

Sito statico in Astro che ospita il diario della campagna Storm King's Thunder.

[![Deploy Astro to Pages](https://github.com/Makerosophy/storm-kings-thunder/actions/workflows/pages.yml/badge.svg)](https://github.com/Makerosophy/storm-kings-thunder/actions/workflows/pages.yml)

### Sviluppo

```bash
npm install
npm run dev
# http://localhost:4321
```

### Contenuti
- Post/avventure in `src/content/blog/*` (MDX)
- Immagini pubbliche in `public/images/*`

### Build

```bash
npm run build
npm run preview # verifica la build locale
```

### Deploy su GitHub Pages
- Workflow: `.github/workflows/pages.yml`
- `astro.config.mjs` legge `SITE` e `BASE` da env impostate dal workflow
- URL finale:
  - Repo utente/organizzazione → `https://<utente>.github.io`
  - Repo progetto → `https://<utente>.github.io/<repo>`

### Primo push

```bash
git init
git add .
git commit -m "feat: setup sito SKT, favicon, GH Pages"
git branch -M main
git remote add origin <git-url>
git push -u origin main
```

### Licenza
MIT
