import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/server/app.js';
import { initDatabase, closeDatabase } from '../../src/server/db/database.js';
import { Server } from 'node:http';

let server: Server;
let baseUrl: string;

test.before(async () => {
  // Use in-memory SQLite for high-speed clean testing
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

test('Auth API - register, login, and verify profile', async () => {
  // 1. Register
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tester@example.com',
      password: 'password123',
      displayName: 'Test Engineer'
    })
  });
  assert.equal(regRes.status, 201);
  const regBody = await regRes.json();
  assert.equal(regBody.success, true);
  assert.ok(regBody.data.token);
  assert.equal(regBody.data.user.email, 'tester@example.com');
  const token = regBody.data.token;

  // 2. Reject duplicate email registration
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tester@example.com',
      password: 'password123'
    })
  });
  assert.equal(dupRes.status, 409);

  // 3. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tester@example.com',
      password: 'password123'
    })
  });
  assert.equal(loginRes.status, 200);
  const loginBody = await loginRes.json();
  assert.ok(loginBody.data.token);

  // 4. Me endpoint with token
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(meRes.status, 200);
  const meBody = await meRes.json();
  assert.equal(meBody.data.email, 'tester@example.com');
});

test('Reels API - Save, Duplicate Prevention, Search, Filter, and Toggles', async () => {
  // Register fresh user
  const reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'reeluser@example.com',
      password: 'password123'
    })
  });
  const { data: { token } } = await reg.json();
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 1. Save new reel
  const saveRes = await fetch(`${baseUrl}/api/reels`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      url: 'https://www.instagram.com/reel/C3_aBcDeF/?utm_source=ig_web_copy_link',
      title: 'Full Stack Node 26 Masterclass',
      notes: 'Must watch section on native SQLite and architecture',
      tags: ['NodeJS', 'TypeScript', 'Backend']
    })
  });
  assert.equal(saveRes.status, 201);
  const saveBody = await saveRes.json();
  assert.equal(saveBody.success, true);
  assert.equal(saveBody.data.instagramShortcode, 'C3_aBcDeF');
  assert.equal(saveBody.data.canonicalUrl, 'https://www.instagram.com/reel/C3_aBcDeF/');
  assert.deepEqual(saveBody.data.tags, ['backend', 'nodejs', 'typescript']);
  const reelId = saveBody.data.id;

  // 2. Duplicate Prevention - attempt saving same reel again
  const dupRes = await fetch(`${baseUrl}/api/reels`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      url: 'https://www.instagram.com/reel/C3_aBcDeF/'
    })
  });
  assert.equal(dupRes.status, 409);
  const dupBody = await dupRes.json();
  assert.equal(dupBody.success, false);
  assert.equal(dupBody.error.code, 'DUPLICATE_REEL');
  assert.equal(dupBody.error.existingReelId, reelId);

  // 3. Query Reels list
  const listRes = await fetch(`${baseUrl}/api/reels`, { headers: authHeaders });
  assert.equal(listRes.status, 200);
  const listBody = await listRes.json();
  assert.equal(listBody.data.length, 1);
  assert.equal(listBody.data[0].id, reelId);

  // 4. Multi-field search
  const searchMatch = await fetch(`${baseUrl}/api/reels?q=masterclass`, { headers: authHeaders });
  const searchMatchBody = await searchMatch.json();
  assert.equal(searchMatchBody.data.length, 1);

  const searchTag = await fetch(`${baseUrl}/api/reels?tag=typescript`, { headers: authHeaders });
  const searchTagBody = await searchTag.json();
  assert.equal(searchTagBody.data.length, 1);

  const searchMiss = await fetch(`${baseUrl}/api/reels?q=nonexistent`, { headers: authHeaders });
  const searchMissBody = await searchMiss.json();
  assert.equal(searchMissBody.data.length, 0);

  // 5. Toggle Favorite
  const favRes = await fetch(`${baseUrl}/api/reels/${reelId}/favorite`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.equal(favRes.status, 200);
  const favBody = await favRes.json();
  assert.equal(favBody.data.isFavorite, true);

  // 6. Toggle Watched
  const watchRes = await fetch(`${baseUrl}/api/reels/${reelId}/watched`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.equal(watchRes.status, 200);
  const watchBody = await watchRes.json();
  assert.equal(watchBody.data.isWatched, true);
  assert.ok(watchBody.data.watchedAt);

  // 7. Toggle Archive
  const archRes = await fetch(`${baseUrl}/api/reels/${reelId}/archive`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.equal(archRes.status, 200);
  const archBody = await archRes.json();
  assert.equal(archBody.data.isArchived, true);

  // Normal query excludes archived
  const activeRes = await fetch(`${baseUrl}/api/reels`, { headers: authHeaders });
  const activeBody = await activeRes.json();
  assert.equal(activeBody.data.length, 0);

  // Query with archived=true returns it
  const archivedRes = await fetch(`${baseUrl}/api/reels?archived=true`, { headers: authHeaders });
  const archivedBody = await archivedRes.json();
  assert.equal(archivedBody.data.length, 1);

  // 8. Stats endpoint
  const statsRes = await fetch(`${baseUrl}/api/stats`, { headers: authHeaders });
  assert.equal(statsRes.status, 200);
  const statsBody = await statsRes.json();
  assert.equal(statsBody.data.total, 1);
  assert.equal(statsBody.data.archived, 1);

  // 9. Delete Reel
  const delRes = await fetch(`${baseUrl}/api/reels/${reelId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.equal(delRes.status, 200);

  // Verify deletion
  const getDel = await fetch(`${baseUrl}/api/reels/${reelId}`, { headers: authHeaders });
  assert.equal(getDel.status, 404);
});
