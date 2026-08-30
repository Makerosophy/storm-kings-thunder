# Formato delle sessioni MDX

Le cronache pubblicate si trovano in `src/content/blog/` e usano file `.mdx`. Correggi il testo senza compromettere frontmatter, Markdown, JSX o percorsi delle immagini.

## Frontmatter

Ogni file inizia con un blocco YAML delimitato da `---`. Lo schema accetta:

- `title`: obbligatorio;
- `description`: obbligatoria;
- `pubDate`: obbligatoria e convertibile in data;
- `updatedDate`: facoltativa;
- `heroImage`: facoltativa.

Non cambiare date, numerazione dell’avventura o altri dati fattuali durante una semplice correzione linguistica.

La `description` è testo editoriale e può essere corretta. Se è un estratto troncato o termina a metà frase, rigenerala come sintesi autonoma e naturale, senza spoiler aggiuntivi. Mantieni le virgolette YAML valide: quando il valore contiene apostrofi, conserva una quotatura compatibile oppure esegui il necessario escaping.

## Corpo del documento

- Conserva gerarchia e ordine dei titoli (`#`, `##`, ecc.), salvo che l’utente chieda una ristrutturazione.
- Conserva grassetti, corsivi e separazione dei paragrafi quando hanno valore narrativo. Puoi correggere l’enfasi soltanto per applicare una convenzione editoriale esplicita.
- Non cambiare ID, espressioni JavaScript, componenti, tag HTML, attributi, dimensioni o `loading` delle immagini.
- Non modificare `src`, nomi di file, estensioni, codifica `%20` o espressioni `${...}` durante una correzione testuale.
- Il testo degli attributi `alt` è contenuto linguistico: correggilo se necessario, senza inventare dettagli non visibili o contraddire la scena.
- Tratta il contenuto di `figcaption` come testo editoriale.
- Non sostituire apostrofi ASCII con apostrofi tipografici dentro codice, espressioni, URL o percorsi.

## Controllo di integrità

Dopo la modifica:

1. esamina il diff per accertarti che siano cambiati soltanto testo e formattazione autorizzati;
2. verifica che ogni delimitatore `---`, tag HTML o JSX, parentesi graffa e backtick sia ancora bilanciato;
3. verifica che i riferimenti alle immagini siano identici, salvo richiesta esplicita;
4. esegui `npm run build` se hai modificato un file della raccolta.

Una build riuscita verifica la sintassi e lo schema, non la qualità linguistica: completa comunque la rilettura editoriale prevista dalla skill.
