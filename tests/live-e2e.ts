import assert from 'node:assert/strict';

async function runLiveE2E() {
  const BASE_URL = 'http://localhost:4000';
  console.log('--- ReelVault Live End-to-End Verification ---');

  // 1. Verify health check
  console.log('1. Checking /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.equal(healthData.success, true);
  assert.equal(healthData.app, 'ReelVault');
  console.log('✓ Health check passed');

  // 2. Verify SPA static index.html serving
  console.log('2. Checking SPA index.html serving...');
  const spaRes = await fetch(`${BASE_URL}/`);
  assert.equal(spaRes.status, 200);
  const spaText = await spaRes.text();
  assert.match(spaText, /ReelVault/);
  console.log('✓ SPA served successfully');

  // 3. User Registration / Login
  console.log('3. Authenticating test user...');
  const userPayload = {
    email: `e2e_user_${Date.now()}@reelvault.app`,
    password: 'Password123!',
    displayName: 'E2E Tester'
  };

  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });
  assert.equal(registerRes.status, 201);
  const registerData = await registerRes.json();
  assert.equal(registerData.success, true);
  const token = registerData.data.token;
  assert.ok(token);
  console.log('✓ User registered and JWT token acquired');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 4. Save a Reel with tracking URL normalization
  console.log('4. Saving a Reel...');
  const reelInput = {
    url: 'https://www.instagram.com/reel/C8XYZabc123/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    title: 'High Performance SQLite with WAL Mode',
    notes: 'Remember to set PRAGMA journal_mode = WAL and foreign_keys = ON.',
    tags: ['database', 'sqlite', 'performance']
  };

  const saveRes = await fetch(`${BASE_URL}/api/reels`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(reelInput)
  });
  assert.equal(saveRes.status, 201);
  const saveData = await saveRes.json();
  assert.equal(saveData.success, true);
  const savedReel = saveData.data;
  assert.equal(savedReel.instagramShortcode, 'C8XYZabc123');
  assert.equal(savedReel.canonicalUrl, 'https://www.instagram.com/reel/C8XYZabc123/');
  assert.deepEqual(savedReel.tags.sort(), ['database', 'performance', 'sqlite']);
  console.log('✓ Reel saved with canonical normalization and tag cleaning');

  // 5. Duplicate Reel prevention
  console.log('5. Testing duplicate prevention...');
  const dupRes = await fetch(`${BASE_URL}/api/reels`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      url: 'https://instagr.am/reel/C8XYZabc123/' // alternate domain variant
    })
  });
  assert.equal(dupRes.status, 409);
  const dupData = await dupRes.json();
  assert.equal(dupData.success, false);
  assert.equal(dupData.error.code, 'DUPLICATE_REEL');
  assert.equal(dupData.error.existingReelId, savedReel.id);
  console.log('✓ Duplicate URL variant accurately rejected with 409 DUPLICATE_REEL');

  // 6. Toggle Favorite & Watched
  console.log('6. Toggling Favorite and Watched status...');
  const favRes = await fetch(`${BASE_URL}/api/reels/${savedReel.id}/favorite`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.equal(favRes.status, 200);
  const favData = await favRes.json();
  assert.equal(favData.data.isFavorite, true);

  const watchedRes = await fetch(`${BASE_URL}/api/reels/${savedReel.id}/watched`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.equal(watchedRes.status, 200);
  const watchedData = await watchedRes.json();
  assert.equal(watchedData.data.isWatched, true);
  assert.ok(watchedData.data.watchedAt);
  console.log('✓ Favorite & Watched toggled successfully');

  // 7. Search & Filter
  console.log('7. Testing search & tag filtering...');
  const searchRes = await fetch(`${BASE_URL}/api/reels?q=SQLite`, {
    headers: authHeaders
  });
  assert.equal(searchRes.status, 200);
  const searchData = await searchRes.json();
  assert.equal(searchData.data.length, 1);
  assert.equal(searchData.data[0].id, savedReel.id);

  const tagFilterRes = await fetch(`${BASE_URL}/api/reels?tag=performance`, {
    headers: authHeaders
  });
  assert.equal(tagFilterRes.status, 200);
  const tagFilterData = await tagFilterRes.json();
  assert.equal(tagFilterData.data.length, 1);
  console.log('✓ Full text search and tag filter working');

  // 8. Stats Endpoint
  console.log('8. Checking statistics...');
  const statsRes = await fetch(`${BASE_URL}/api/stats`, {
    headers: authHeaders
  });
  assert.equal(statsRes.status, 200);
  const statsData = await statsRes.json();
  assert.equal(statsData.data.total, 1);
  assert.equal(statsData.data.favorites, 1);
  assert.equal(statsData.data.watched, 1);
  console.log('✓ Vault metrics and statistics validated');

  // 9. Export Endpoint (JSON & CSV)
  console.log('9. Checking export endpoint...');
  const exportJsonRes = await fetch(`${BASE_URL}/api/export?format=json`, {
    headers: authHeaders
  });
  assert.equal(exportJsonRes.status, 200);
  const exportJson = await exportJsonRes.json();
  assert.equal(exportJson.length, 1);
  assert.equal(exportJson[0].url, 'https://www.instagram.com/reel/C8XYZabc123/');

  const exportCsvRes = await fetch(`${BASE_URL}/api/export?format=csv`, {
    headers: authHeaders
  });
  assert.equal(exportCsvRes.status, 200);
  const exportCsv = await exportCsvRes.text();
  assert.match(exportCsv, /URL,Title,Creator,Category,Tags,Notes/);
  console.log('✓ JSON & CSV data exports validated');

  console.log('\n=============================================');
  console.log('🎉 ALL LIVE END-TO-END VERIFICATION CHECKS PASSED!');
  console.log('=============================================\n');
}

runLiveE2E().catch((err) => {
  console.error('E2E validation failed:', err);
  process.exit(1);
});
