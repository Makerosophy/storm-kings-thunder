#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

function stripMd(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/[*>_`#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function yamlSingleQuote(input) {
  const s = String(input ?? '').replace(/\r?\n/g, ' ').trim();
  return `'${s.replace(/'/g, "''")}'`;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function main() {
  const { values, positionals } = parseArgs({
    options: { start: { type: 'string' } },
    allowPositionals: true,
  });
  const [docxPath] = positionals;
  const start = Number(values.start);
  if (positionals.length !== 1 || !/^\d+$/.test(values.start ?? '') || !Number.isSafeInteger(start) || start < 1) {
    console.error('Usage: npm run convert:docx -- docs-local/<file.docx> --start <positive-integer>');
    process.exit(1);
  }

  if (!fs.existsSync(docxPath)) {
    console.error(`File not found: ${docxPath}`);
    process.exit(1);
  }

  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const turndown = new TurndownService({ headingStyle: 'atx' });
  let markdown = turndown.turndown(html);
  // Replace inline Markdown images with plain links to avoid Astro image dimension errors
  markdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => `[${alt || 'immagine'}](${url})`);

  const sections = [];
  let current = { title: null, body: [] };
  for (const line of markdown.split(/\r?\n/)) {
    const m = line.match(/^#\s+(.*)$/);
    if (m) {
      if (current.title !== null) {
        sections.push({ title: current.title, body: current.body.join('\n').trim() });
      }
      current = { title: m[1].trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.title !== null) {
    sections.push({ title: current.title, body: current.body.join('\n').trim() });
  }
  if (sections.length === 0) {
    sections.push({ title: 'Parte 1', body: markdown });
  }

  if (!Number.isSafeInteger(start + (sections.length - 1))) {
    console.error('The chapter range exceeds the largest safe integer.');
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const ids = sections.map((_, index) => `${start + index}-avventura`);
  for (const id of ids) {
    for (const extension of ['.mdx', '.md']) {
      const candidate = path.join(outputDir, `${id}${extension}`);
      if (fs.lstatSync(candidate, { throwIfNoEntry: false })) {
        console.error(`Cannot import DOCX: chapter ID ${id} is already occupied by ${path.relative(process.cwd(), candidate)}.`);
        process.exit(1);
      }
    }
  }

  ensureDir(outputDir);

  const now = new Date();
  const created = [];

  sections.forEach((section, index) => {
    const title = section.title || `Parte ${index + 1}`;
    const plain = stripMd(section.body);
    const description = plain.slice(0, 160) || title;
    const filePath = path.join(outputDir, `${ids[index]}.mdx`);

    const frontmatter = `---\n` +
      `title: ${yamlSingleQuote(title)}\n` +
      `description: ${yamlSingleQuote(description)}\n` +
      `pubDate: ${now.toISOString()}\n` +
      `---`;

    const content = `${frontmatter}\n\n# ${title}\n\n${section.body}\n`;
    fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'wx' });
    created.push(path.relative(process.cwd(), filePath));
  });

  console.log('Created files:');
  created.forEach((f) => console.log(' -', f));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


