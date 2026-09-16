import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp } from './server.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('GET /items returns initial items list (200)', async () => {
  const res = await fetch(`${baseUrl}/items`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.items));
  assert.strictEqual(data.items.length >= 2, true);
});

test('GET /items/1 returns item with id 1 (200)', async () => {
  const res = await fetch(`${baseUrl}/items/1`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.item.id, 1);
  assert.strictEqual(data.item.name, 'Item Alpha');
});

test('GET /items/999 returns not found (404)', async () => {
  const res = await fetch(`${baseUrl}/items/999`);
  assert.strictEqual(res.status, 404);
});

test('POST /items creates a new valid item (201)', async () => {
  const payload = { name: 'Item Gamma', price: 79.99 };
  const res = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.item.name, 'Item Gamma');
  assert.strictEqual(data.item.price, 79.99);
  assert.ok(typeof data.item.id === 'number');
});

test('POST /items rejects invalid payload (400)', async () => {
  const res = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: true })
  });
  assert.strictEqual(res.status, 400);
});
