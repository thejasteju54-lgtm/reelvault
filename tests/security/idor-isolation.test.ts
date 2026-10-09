import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/server/app.js';
import { initDatabase, closeDatabase } from '../../src/server/db/database.js';
import { Server } from 'node:http';

let server: Server;
let baseUrl: string;

test.before(async () => {
  initDatabase({ dbPath: ':memory:' });
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr) {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  closeDatabase();
});

test('Security & IDOR Isolation - User A and User B cannot access each other data', async () => {
  // 1. Create User A
  const regA = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'userA@example.com', password: 'password123' })
  });
  const { data: { token: tokenA } } = await regA.json();

  // 2. Create User B
  const regB = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'userB@example.com', password: 'password123' })
  });
  const { data: { token: tokenB } } = await regB.json();

  // 3. User A saves Reel X
  const saveA = await fetch(`${baseUrl}/api/reels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      url: 'https://www.instagram.com/reel/SECRET_REEL_123/',
      title: "User A's Private Architecture Reel",
      notes: 'Confidential personal notes'
    })
  });
  assert.equal(saveA.status, 201);
  const { data: reelA } = await saveA.json();

  // 4. User B attempts to GET User A's reel by ID -> must fail with 404 (IDOR blocked)
  const getB = await fetch(`${baseUrl}/api/reels/${reelA.id}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert.equal(getB.status, 404);

  // 5. User B attempts to PATCH User A's reel -> must fail with 404
  const patchB = await fetch(`${baseUrl}/api/reels/${reelA.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({ title: 'Hacked Title' })
  });
  assert.equal(patchB.status, 404);

  // 6. User B attempts to DELETE User A's reel -> must fail with 404
  const deleteB = await fetch(`${baseUrl}/api/reels/${reelA.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert.equal(deleteB.status, 404);

  // Verify User A's reel remains un-tampered
  const verifyA = await fetch(`${baseUrl}/api/reels/${reelA.id}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert.equal(verifyA.status, 200);
  const verifyABody = await verifyA.json();
  assert.equal(verifyABody.data.title, "User A's Private Architecture Reel");

  // 7. User B can save the SAME Instagram shortcode in their OWN vault without conflict
  const saveB = await fetch(`${baseUrl}/api/reels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({
      url: 'https://www.instagram.com/reel/SECRET_REEL_123/',
      title: "User B's Own Copy"
    })
  });
  assert.equal(saveB.status, 201);
  const { data: reelB } = await saveB.json();
  assert.notEqual(reelA.id, reelB.id);
  assert.equal(reelA.instagramShortcode, reelB.instagramShortcode);
});
