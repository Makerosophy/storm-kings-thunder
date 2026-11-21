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
- Post/avventure in `src/content/blog/*` (`.md` o `.mdx`); usare `N-avventura` come nome per includerli in home e archivio.
- Immagini pubbliche in `public/images/*`
- Documenti Word sorgente in `docs-local/`, fuori da `public/` ed esclusi da Git.
  Per importarli: `npm run convert:docx -- "docs-local/nome-file.docx" --start 23`.
  Usa il primo numero libero: le sezioni diventano `23-avventura.mdx`,
  `24-avventura.mdx` e così via. Se un numero della sequenza è già occupato
  da un file `.md` o `.mdx`, l'importazione si ferma prima di scrivere.
  Non usare `public/docs/`: Astro la copia nell'output pubblico.

### Build

```bash
npm run build
npm run preview # verifica la build locale
```

La build fallisce se l'output contiene `dist/docs/`. Lo stesso controllo
si applica nei workflow GitHub Pages prima dell'upload.

### Deploy su GitHub Pages
- Workflow: `.github/workflows/pages.yml`
- Il workflow riconosce i siti utente/organizzazione dal nome del repository: `<owner>.github.io`.
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
