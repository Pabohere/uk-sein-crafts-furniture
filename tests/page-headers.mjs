import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({ stdin: { contents: `export * from './lib/store-content'; export * from './lib/admin-validation'; export * from './lib/public-data';`, resolveDir: process.cwd() }, bundle:true, platform:'node', format:'esm', write:false });
const { defaultContent, validResource, pageHeaderImagesFor, saveContent, readContent, setPublicData } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
assert.equal(validResource('content_en', defaultContent), true);
const legacy = { ...defaultContent }; delete legacy.pageImages;
assert.equal(validResource('content_en', legacy), true, 'older published content remains editable');
assert.deepEqual(pageHeaderImagesFor(legacy, 'contact'), legacy.home.heroImages);
const updated = structuredClone(defaultContent);
updated.pageImages.collection = ['https://example.com/new-header.jpg', ''];
assert.equal(validResource('content_en', updated), true);
assert.deepEqual(pageHeaderImagesFor(updated, 'collection'), ['https://example.com/new-header.jpg']);
updated.pageImages.contact = [];
assert.deepEqual(pageHeaderImagesFor(updated, 'contact'), updated.home.heroImages, 'empty page images fall back to Home');
for (const images of [Array(5).fill('https://example.com/img.jpg'), ['javascript:alert(1)'], ['data:image/svg+xml;base64,AA==']]) {
  assert.equal(validResource('content_en', { ...updated, pageImages: { ...updated.pageImages, collection: images } }), false);
}
assert.equal(validResource('content_en', { ...updated, pageImages: { ...updated.pageImages, unknown: [] } }), false);
const memory = new Map(); globalThis.window = {}; globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value) };
saveContent(updated, 'en');
assert.deepEqual(readContent('en').pageImages, updated.pageImages, 'admin page images persist through reload');
setPublicData({ content_en: updated });
assert.deepEqual(pageHeaderImagesFor(readContent('en'), 'collection'), ['https://example.com/new-header.jpg'], 'published CMS feeds headers');
console.log('Page header settings, persistence and validation checks passed.');
