import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const distImagesRoot = path.join(root, 'dist/images');
const sourceRoots = ['src/pages', 'src/content', 'src/layouts', 'src/components'];
const sourceExt = /\.(astro|mdx|md|js|ts)$/i;
const originalExt = /\.(png|jpe?g)$/i;

async function exists(file) {
	try {
		await fs.access(file);
		return true;
	} catch {
		return false;
	}
}

async function listFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(dir, entry.name);
			if (entry.isDirectory()) return listFiles(entryPath);
			if (entry.isFile()) return [entryPath];
			return [];
		})
	);
	return files.flat();
}

function mb(bytes) {
	return Number((bytes / 1024 / 1024).toFixed(2));
}

if (!(await exists(distImagesRoot))) {
	console.log('No dist/images directory to prune.');
	process.exit(0);
}

const sourceFiles = (await Promise.all(sourceRoots.map((dir) => listFiles(path.join(root, dir)))))
	.flat()
	.filter((file) => sourceExt.test(file));

let sourceText = '';
for (const file of sourceFiles) {
	sourceText += `\n${await fs.readFile(file, 'utf8')}`;
}

const distImages = (await listFiles(distImagesRoot)).filter((file) => originalExt.test(file));
let removed = 0;
let removedBytes = 0;

for (const file of distImages) {
	const imagePath = path.relative(path.join(root, 'dist'), file);
	const publicPath = imagePath;
	const referenced = sourceText.includes(publicPath) || sourceText.includes(encodeURI(publicPath));

	if (referenced) continue;

	const stat = await fs.stat(file);
	await fs.rm(file);
	removed += 1;
	removedBytes += stat.size;
}

console.log(
	JSON.stringify(
		{
			removed,
			removedMb: mb(removedBytes),
		},
		null,
		2
	)
);
