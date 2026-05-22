import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const publicImagesRoot = path.join(root, 'public/images');
const sourceRoots = ['src/pages', 'src/content', 'src/layouts', 'src/components'];
const sourceExt = /\.(astro|mdx|md|js|ts)$/i;
const imageExt = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const originalExt = /\.(png|jpe?g)$/i;

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

const [imageFiles, sourceFiles] = await Promise.all([
	listFiles(publicImagesRoot),
	Promise.all(sourceRoots.map((dir) => listFiles(path.join(root, dir)))).then((groups) =>
		groups.flat().filter((file) => sourceExt.test(file))
	),
]);

let sourceText = '';
for (const file of sourceFiles) {
	sourceText += `\n${await fs.readFile(file, 'utf8')}`;
}

const images = await Promise.all(
	imageFiles
		.filter((file) => imageExt.test(file))
		.map(async (file) => {
			const stat = await fs.stat(file);
			const publicPath = path.relative(path.join(root, 'public'), file);
			const referenced = sourceText.includes(publicPath) || sourceText.includes(encodeURI(publicPath));
			return {
				file,
				publicPath,
				referenced,
				size: stat.size,
				type: path.extname(file).slice(1).toLowerCase(),
			};
		})
);

const referenced = images.filter((image) => image.referenced);
const unreferenced = images.filter((image) => !image.referenced);
const unreferencedOriginals = unreferenced.filter((image) => originalExt.test(image.file));
const unreferencedWebp = unreferenced.filter((image) => image.file.endsWith('.webp'));
const referencedOriginals = referenced.filter((image) => originalExt.test(image.file));
const referencedWebp = referenced.filter((image) => image.file.endsWith('.webp'));

const largestUnreferencedOriginals = unreferencedOriginals
	.sort((a, b) => b.size - a.size)
	.slice(0, 20)
	.map((image) => ({
		path: image.publicPath,
		mb: mb(image.size),
	}));

console.log(
	JSON.stringify(
		{
			totalImages: images.length,
			totalMb: mb(images.reduce((total, image) => total + image.size, 0)),
			referencedImages: referenced.length,
			referencedMb: mb(referenced.reduce((total, image) => total + image.size, 0)),
			unreferencedImages: unreferenced.length,
			unreferencedMb: mb(unreferenced.reduce((total, image) => total + image.size, 0)),
			referencedWebp: referencedWebp.length,
			unreferencedWebp: unreferencedWebp.length,
			referencedOriginals: referencedOriginals.length,
			unreferencedOriginals: unreferencedOriginals.length,
			largestUnreferencedOriginals,
		},
		null,
		2
	)
);
