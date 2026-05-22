import { SITE_TITLE } from '../consts';

const defaultLength = 155;

export function formatSeoTitle(title: string) {
	const cleanTitle = title.trim();
	return cleanTitle === SITE_TITLE ? cleanTitle : `${cleanTitle} | ${SITE_TITLE}`;
}

export function cleanSeoDescription(description: string, maxLength = defaultLength) {
	const clean = description
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/[`*_>#{}[\]()~|\\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (clean.length <= maxLength) return clean;

	const truncated = clean.slice(0, maxLength + 1);
	const lastSpace = truncated.lastIndexOf(' ');
	const safe = lastSpace > maxLength * 0.72 ? truncated.slice(0, lastSpace) : clean.slice(0, maxLength);
	return `${safe.trim()}...`;
}

export function excerptFromMarkdown(markdown: string, maxLength = defaultLength) {
	const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---/, ' ');
	const withoutImports = withoutFrontmatter.replace(/^import\s.+$/gm, ' ');
	const withoutMdxBlocks = withoutImports.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, ' ');
	const proseOnly = withoutMdxBlocks
		.split('\n')
		.filter((line) => {
			const clean = line.trim();
			if (!clean) return false;
			if (/^#{1,6}\s+/.test(clean)) return false;
			if (/^\*\*\d{1,2}[\/\\]\d{1,2}[\/\\]\d{4}\*\*$/.test(clean)) return false;
			if (/^\*\*[\w\s]+Rest\*\*$/i.test(clean)) return false;
			return true;
		})
		.join(' ');

	return cleanSeoDescription(proseOnly, maxLength);
}
