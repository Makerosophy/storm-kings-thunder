import { lstatSync } from 'node:fs';

const docs = new URL('../dist/docs', import.meta.url);
if (lstatSync(docs, { throwIfNoEntry: false })) {
	console.error('Build blocked: dist/docs/ contains potentially private documents. Move Word sources out of public/docs/ into docs-local/ and rebuild.');
	process.exitCode = 1;
}
