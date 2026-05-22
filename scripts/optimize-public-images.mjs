import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = new URL('../', import.meta.url).pathname;
const imageRoots = ['public/images/sessions', 'public/images/home'];
const sourceRoots = ['src/pages', 'src/content'];
const imageExt = /\.(png|jpe?g)$/i;
const maxWidth = 1600;
const webpQuality = 82;

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

async function optimizeImage(file) {
	const output = file.replace(imageExt, '.webp');
	const sourceStat = await fs.stat(file);
	const image = sharp(file, { failOn: 'none' });
	const metadata = await image.metadata();
	const pipeline =
		metadata.width && metadata.width > maxWidth
			? image.resize({ width: maxWidth, withoutEnlargement: true })
			: image;

	await pipeline.webp({ quality: webpQuality, effort: 4 }).toFile(output);

	const outputStat = await fs.stat(output);
	if (outputStat.size >= sourceStat.size) {
		await fs.rm(output);
		return null;
	}

	return {
		source: path.relative(root, file),
		output: path.relative(root, output),
		sourceSize: sourceStat.size,
		outputSize: outputStat.size,
	};
}

async function rewriteReferences(converted) {
	const replacements = converted.flatMap(({ source, output }) => {
		const sourcePath = source.replace(/^public\//, '');
		const outputPath = output.replace(/^public\//, '');
		return [
			[sourcePath, outputPath],
			[encodeURI(sourcePath), encodeURI(outputPath)],
		];
	});
	const sourceFiles = (await Promise.all(sourceRoots.map((dir) => listFiles(path.join(root, dir))))).flat();
	let changedFiles = 0;

	for (const file of sourceFiles.filter((entry) => /\.(astro|mdx|md|js|ts)$/i.test(entry))) {
		const original = await fs.readFile(file, 'utf8');
		let updated = original;

		for (const [source, output] of replacements) {
			updated = updated.split(source).join(output);
		}

		if (file.includes(`${path.sep}src${path.sep}content${path.sep}blog${path.sep}`)) {
			updated = await enhanceBlogImageTags(updated);
			updated = updated.replace(/alt="([^"]*?)\s+(resized|optimized)"/gi, 'alt="$1"');
		}

		if (updated !== original) {
			changedFiles += 1;
			await fs.writeFile(file, updated);
		}
	}

	return changedFiles;
}

function appendAttribute(tag, attribute) {
	return tag.replace(/\s*\/?>$/, (ending) => {
		const close = ending.includes('/') ? ' />' : '>';
		return ` ${attribute}${close}`;
	});
}

async function enhanceBlogImageTags(original) {
	const imageTags = [...original.matchAll(/<img\b[^>]*>/g)];
	if (imageTags.length === 0) return original;

	let updated = '';
	let lastIndex = 0;

	for (const match of imageTags) {
		const tag = match[0];
		let nextTag = tag;
		const srcMatch = tag.match(/images\/[^"`}]+/);

		if (!/\sloading=/.test(nextTag)) {
			nextTag = appendAttribute(nextTag, 'loading="lazy"');
		}

		if (!/\sdecoding=/.test(nextTag)) {
			nextTag = appendAttribute(nextTag, 'decoding="async"');
		}

		if (srcMatch && (!/\swidth=/.test(nextTag) || !/\sheight=/.test(nextTag))) {
			const imagePath = path.join(root, 'public', decodeURI(srcMatch[0]));

			try {
				const metadata = await sharp(imagePath, { failOn: 'none' }).metadata();
				if (metadata.width && metadata.height) {
					if (!/\swidth=/.test(nextTag)) {
						nextTag = appendAttribute(nextTag, `width="${metadata.width}"`);
					}
					if (!/\sheight=/.test(nextTag)) {
						nextTag = appendAttribute(nextTag, `height="${metadata.height}"`);
					}
				}
			} catch {
				// Keep the image usable even if metadata cannot be read.
			}
		}

		updated += original.slice(lastIndex, match.index) + nextTag;
		lastIndex = match.index + tag.length;
	}

	return updated + original.slice(lastIndex);
}

const images = (
	await Promise.all(
		imageRoots.map(async (dir) =>
			(await listFiles(path.join(root, dir))).filter((file) => imageExt.test(file))
		)
	)
).flat();

const converted = (await Promise.all(images.map(optimizeImage))).filter(Boolean);
const changedFiles = await rewriteReferences(converted);
const originalBytes = converted.reduce((total, image) => total + image.sourceSize, 0);
const outputBytes = converted.reduce((total, image) => total + image.outputSize, 0);
const savedBytes = originalBytes - outputBytes;

console.log(
	JSON.stringify(
		{
			converted: converted.length,
			changedFiles,
			originalMb: Number((originalBytes / 1024 / 1024).toFixed(2)),
			webpMb: Number((outputBytes / 1024 / 1024).toFixed(2)),
			savedMb: Number((savedBytes / 1024 / 1024).toFixed(2)),
		},
		null,
		2
	)
);
