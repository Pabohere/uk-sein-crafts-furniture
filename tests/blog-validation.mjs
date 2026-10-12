import assert from 'node:assert/strict';
import { build } from 'esbuild';
// Bundle the real server validator, including its TypeScript imports.
const result = await build({ entryPoints: ['lib/admin-validation.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { validResource, initialResources } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const blog = { id: 'blog-test', kind: 'blog', title: 'လက်မှုပညာ', date: '12 OCTOBER 2026', button: 'Read more', image: 'https://example.com/cover.jpg', content: 'First paragraph.\n\nဒုတိယစာပိုဒ်။', images: ['https://example.com/gallery.jpg', 'data:image/png;base64,aGVsbG8='] };
assert.equal(validResource('events', initialResources().events), true, 'legacy events remain valid');
assert.equal(validResource('events', [blog]), true, 'blog text and gallery survive server validation');
for (const content of ['', '   ', 'x'.repeat(10001)]) assert.equal(validResource('events', [{ ...blog, content }]), false, 'reject missing or oversized content');
for (const images of [['javascript:alert(1)'], ['data:image/svg+xml;base64,aGVsbG8='], [''], Array(7).fill('https://example.com/image.jpg'), 'invalid']) assert.equal(validResource('events', [{ ...blog, images }]), false, 'reject invalid or excessive gallery images');
assert.equal(validResource('events', [{ ...blog, kind: 'invalid' }]), false);
assert.equal(validResource('events', [blog, blog]), false, 'reject duplicate post IDs');
const details = [{ type: 'text', text: 'Before the image' }, { type: 'image', src: 'data:image/png;base64,aGVsbG8=', alt: 'မြန်မာပုံ' }, { type: 'text', text: 'After the image' }];
const inline = { ...blog, content: 'Before the image\n\nAfter the image', details };
assert.equal(validResource('events', [inline]), true, 'accept an image between text blocks');
assert.equal(validResource('events', [{ ...inline, content: 'wrong text' }]), false, 'reject inconsistent excerpt and detail text');
for (const part of [{ type: 'image', src: 'javascript:alert(1)', alt: '' }, { type: 'image', src: 'data:image/svg+xml;base64,aGVsbG8=', alt: '' }, { type: 'html', text: '<script>alert(1)</script>' }]) {
  assert.equal(validResource('events', [{ ...inline, details: [details[0], part, details[2]] }]), false, 'reject unsafe inline content');
}
assert.equal(validResource('events', [{ ...inline, details: [{ type: 'text', text: inline.content }, ...Array(7).fill(details[1])] }]), false, 'limit inline image count');
console.log('Blog validation checks passed.');
