import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({ stdin: { contents: `export * from './lib/demo-orders'; export * from './lib/admin-validation';`, resolveDir: process.cwd() }, bundle:true, platform:'node', format:'esm', write:false });
const { demoOrders, readLocalOrders, validResource, initialResources } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
assert.equal(demoOrders.length, 12);
assert.equal(validResource('orders', demoOrders), true);
assert.equal(new Set(demoOrders.map(order => order.status)).size, 4);
assert.deepEqual([...new Set(demoOrders.map(order => order.items.length))].sort(), [1,2,3]);
for (const order of demoOrders) {
  assert.ok(order.items.every(item => item.image && ['S','M','L'].includes(item.size)));
  assert.equal(Number(order.total.replace(/\D/g,'')), order.items.reduce((sum,item) => sum + Number(item.price.replace(/\D/g,'')) * item.quantity,0));
}
const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value) };
const existing = { ...demoOrders[0], id:'US-existing', customer:'Existing customer' };
memory.set('uksein_orders', JSON.stringify([existing]));
const seeded = readLocalOrders();
assert.equal(seeded.length,13);
assert.deepEqual(seeded[0], existing, 'preserve existing orders');
assert.equal(readLocalOrders().length,13, 'no duplicate seeds');
const modified = seeded.filter(order => order.id !== 'DEMO-1001').map(order => order.id === 'DEMO-1002' ? { ...order, status:'Completed' } : order);
memory.set('uksein_orders',JSON.stringify(modified));
assert.deepEqual(readLocalOrders(),modified,'preserve changes and deletions after seeding');
assert.deepEqual(initialResources().orders, [], 'production resources never seed fake customer orders');
console.log('Dummy order data and migration checks passed.');
