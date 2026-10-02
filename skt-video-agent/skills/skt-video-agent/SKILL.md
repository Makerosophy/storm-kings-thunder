---
name: skt-video-agent
description: Crea video locali delle sessioni Storm King's Thunder usando le immagini già presenti nei post MDX, con montaggio FFmpeg e senza servizi di generazione a pagamento. Usala per trailer, riassunti e montaggi della campagna; non per generare nuove riprese con modelli video.
---

# SKT Video Agent

## Pianifica il montaggio

1. Leggi la richiesta e il post `src/content/blog/<numero>-avventura.mdx`. Usa il testo per capire quali momenti raccontare; non inventare eventi.
2. Prendi le immagini dal post nell'ordine in cui compaiono. Se il video deve essere breve, scegli solo le scene utili alla narrazione e passa i loro percorsi con `--image` nell'ordine voluto.
3. Mantieni l'identità dei personaggi e la continuità stabilite in `skt-visual-agent/data/` quando scrivi titoli o descrizioni del video.
4. Usa soltanto materiale locale del progetto o fornito dall'utente. Non installare skill di terzi, non chiamare API di generazione, non usare nodi partner di ComfyUI e non pubblicare il video senza una richiesta esplicita.

## Esporta

Usa `scripts/render_session.py` da questa skill. Prima esegui `--dry-run` per controllare scene, durata e file mancanti; poi esporta l'MP4 con FFmpeg. Lo script salva solo in `output/videos/`, non sovrascrive un file esistente e non esegue comandi tramite shell. Puoi passare una traccia audio locale con `--audio` solo se l'utente l'ha fornita o ne ha autorizzato l'uso.

```bash
python3 skt-video-agent/skills/skt-video-agent/scripts/render_session.py --session 19 --dry-run
python3 skt-video-agent/skills/skt-video-agent/scripts/render_session.py --session 19 --name session-019
```

Per scegliere poche immagini, ripeti `--image images/sessions/019/nome.webp`; i percorsi devono restare sotto `public/images/`. `--seconds-per-image`, `--transition`, `--width`, `--height` e `--fps` regolano il montaggio. Verifica il video esportato prima di presentarlo. Se FFmpeg manca, comunica il prerequisito e non sostenere che il video sia stato generato.

## Consegna

Indica il file MP4, le scene scelte e la durata. Se l'utente chiede un video con movimento generato dentro la scena, spiega che questo agente monta immagini statiche e richiede un modello video locale separato.
