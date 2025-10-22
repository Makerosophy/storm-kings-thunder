# Storm King's Thunder — Diario Sessioni (Astro)

Questo progetto pubblica i resoconti della campagna D&D con Astro, usando una collection `sessions` e pagine statiche.

## Sviluppo

```bash
npm run dev
# http://localhost:4321
```

## Aggiungere una nuova sessione
1. Crea un file in `src/content/sessions/NNN-slug.mdx` con frontmatter:

```mdx
---
title: "Sessione N — Titolo"
pubDate: 2025-10-15
sessionNumber: N
cover: "/images/sessions/NNN/cover.jpg"
tags: ["tag1", "tag2"]
characters: ["Nome1", "Nome2"]
aiImages: true
summary: "Riassunto breve della sessione."
gallery:
  - src: "/images/sessions/NNN/img1.webp"
    alt: "Descrizione immagine"
---

Testo della sessione...
```

2. Aggiungi le immagini in `public/images/sessions/NNN/` (usa .webp/.avif se possibile).

## Deploy su GitHub Pages
- Workflow già incluso in `.github/workflows/pages.yml`.
- Imposta `site` in `astro.config.mjs` con l'URL delle Pages.
- Se pubblichi sotto `/<repo>`, imposta `base: '/<repo>'`.

## Struttura chiave
- `src/content/sessions/*` — sessioni in MD/MDX
- `src/pages/sessioni/*` — pagine indice e dettaglio
- `src/components/Gallery.astro`, `SessionCard.astro` — UI componenti

