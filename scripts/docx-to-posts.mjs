#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripTags(html) {
  return String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

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

function uniquePath(baseDir, baseName, ext) {
  let candidate = path.join(baseDir, `${baseName}${ext}`);
  let i = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(baseDir, `${baseName}-${i}${ext}`);
    i += 1;
  }
  return candidate;
}

async function main() {
  const docxPath = process.argv[2];
  if (!docxPath) {
    console.error('Usage: npm run convert:docx -- <path-to-file.docx>');
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

  const outputDir = path.join(process.cwd(), 'src', 'content', 'blog');
  ensureDir(outputDir);

  const now = new Date();
  const created = [];

  sections.forEach((section, index) => {
    const plain = stripMd(section.body);
    const description = plain.slice(0, 160) || section.title || `Parte ${index + 1}`;
    const baseSlug = slugify(section.title || `parte-${index + 1}`);
    const filePath = path.join(outputDir, `${baseSlug}.mdx`);

    const frontmatter = `---\n` +
      `title: ${yamlSingleQuote(section.title || `Parte ${index + 1}`)}\n` +
      `description: ${yamlSingleQuote(description)}\n` +
      `pubDate: ${now.toISOString()}\n` +
      `---`;

    const content = `${frontmatter}\n\n${section.body}\n`;
    fs.writeFileSync(filePath, content, 'utf8');
    created.push(path.relative(process.cwd(), filePath));
  });

  console.log('Created files:');
  created.forEach((f) => console.log(' -', f));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


