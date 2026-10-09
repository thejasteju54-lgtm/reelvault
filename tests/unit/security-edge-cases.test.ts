import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/server/utils/crypto.js';
import { parseInstagramUrl, normalizeTags } from '../../src/server/utils/instagram.js';
import { initDatabase, closeDatabase, getDb } from '../../src/server/db/database.js';
import { registerUser, loginUser } from '../../src/server/services/auth.service.js';
import { saveReel, getReels, deleteReel, getReelById } from '../../src/server/services/reels.service.js';
import { createCategory, getCategories, deleteCategory } from '../../src/server/services/categories.service.js';
import { getTags } from '../../src/server/services/tags.service.js';

test.before(() => {
  initDatabase({ dbPath: ':memory:' });
});

test.after(() => {
  closeDatabase();
});

test('Crypto - scrypt hashing, salts, and timing safe verification', () => {
  const password = 'SuperSecretPassword123!';
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  // Different salts produce different hashes
  assert.notEqual(hash1, hash2);

  // Correct verification
  assert.equal(verifyPassword(password, hash1), true);
  assert.equal(verifyPassword(password, hash2), true);

  // Incorrect password rejection
  assert.equal(verifyPassword('WrongPassword123!', hash1), false);

  // Malformed hashes return false without throwing
  assert.equal(verifyPassword(password, 'malformed-hash-without-salt'), false);
  assert.equal(verifyPassword(password, ''), false);
  assert.equal(verifyPassword(password, 'salt:'), false);
});

test('URL Parser - sanitizes malicious query strings and maintains shortcode integrity', () => {
  const messyUrl = 'https://www.instagram.com/reel/DBabc123XYZ/?igsh=12345&utm_source=ig_web_button_share_sheet&utm_medium=copy_link#fragment';
  const parsed = parseInstagramUrl(messyUrl);
  assert.equal(parsed.isValid, true);
  assert.equal(parsed.shortcode, 'DBabc123XYZ');
  assert.equal(parsed.canonicalUrl, 'https://www.instagram.com/reel/DBabc123XYZ/');

  // XSS injection attempts in URL path
  const xssUrl = 'https://www.instagram.com/reel/<script>alert(1)</script>/';
  const parsedXss = parseInstagramUrl(xssUrl);
  assert.equal(parsedXss.isValid, false);
});

test('Tag Normalizer - strips punctuation, emojis, and normalizes casing', () => {
  const messyTags = [
    '  #REACT  ',
    'react',
    '#NodeJS',
    'typescript!',
    'web_dev-2026',
    '   ',
    '#@$%^&*()'
  ];
  const cleaned = normalizeTags(messyTags);
  assert.deepEqual(cleaned, ['react', 'nodejs', 'typescript', 'web_dev-2026']);
});

test('SQL Injection Resiliency - complex SQL injection strings in search queries', () => {
  // Register a dedicated user
  const auth = registerUser('sqli_test@reelvault.app', 'SecretPass123!');
  const userId = auth.user.id;

  // Save a reel
  const reel = saveReel(userId, {
    url: 'https://www.instagram.com/reel/SQLI_SAFE_123/',
    title: 'Normal Title About Databases',
    notes: 'Secure SQL parameter binding test',
    tags: ['database', 'security']
  });

  assert.ok(reel.id);

  // Attempt SQL Injection queries in search
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE reels; --",
    "' UNION SELECT id, email, password_hash FROM users --",
    "' OR 1=1 --",
    "admin' --"
  ];

  for (const payload of sqliPayloads) {
    const results = getReels(userId, { q: payload });
    // None should match our record and no SQL syntax error should be thrown
    assert.equal(results.reels.length, 0);
  }

  // Verify the reel and database table are completely intact
  const verifyReel = getReelById(userId, reel.id);
  assert.ok(verifyReel);
  assert.equal(verifyReel.title, 'Normal Title About Databases');
});

test('Category Isolation and Cascade Safety', () => {
  const user1 = registerUser('cat_user1@reelvault.app', 'Password123!');
  const user2 = registerUser('cat_user2@reelvault.app', 'Password123!');

  // User 1 creates custom category
  const cat1 = createCategory(user1.user.id, 'Custom Engineering', '#10b981');
  assert.equal(cat1.name, 'Custom Engineering');

  // User 2 creates same named category without conflict
  const cat2 = createCategory(user2.user.id, 'Custom Engineering', '#3b82f6');
  assert.equal(cat2.name, 'Custom Engineering');
  assert.notEqual(cat1.id, cat2.id);

  // User 1 saves a reel with cat1
  const reel = saveReel(user1.user.id, {
    url: 'https://www.instagram.com/reel/CAT_CASCADE_999/',
    categoryId: cat1.id,
    tags: ['engineering']
  });
  assert.equal(reel.categoryId, cat1.id);

  // User 2 attempts to delete User 1's category -> must return false (no-op / protected)
  const unauthorizedDelete = deleteCategory(user2.user.id, cat1.id);
  assert.equal(unauthorizedDelete, false);

  // User 1 deletes their own category
  const authorizedDelete = deleteCategory(user1.user.id, cat1.id);
  assert.equal(authorizedDelete, true);

  // Reel category_id should be SET NULL safely via foreign key constraint
  const updatedReel = getReelById(user1.user.id, reel.id);
  assert.ok(updatedReel);
  assert.equal(updatedReel.categoryId, null);
});

test('Reel Tag Cleanup on Reel Deletion', () => {
  const user = registerUser('tag_cleanup@reelvault.app', 'Password123!');
  const reel = saveReel(user.user.id, {
    url: 'https://www.instagram.com/reel/TAG_CLEANUP_001/',
    tags: ['temporary-tag-1', 'temporary-tag-2']
  });

  const db = getDb();
  const countBefore = (db.prepare('SELECT COUNT(*) as count FROM reel_tags WHERE reel_id = ?').get(reel.id) as { count: number }).count;
  assert.equal(countBefore, 2);

  // Delete Reel
  deleteReel(user.user.id, reel.id);

  // Associated reel_tags join records must be automatically removed via CASCADE
  const countAfter = (db.prepare('SELECT COUNT(*) as count FROM reel_tags WHERE reel_id = ?').get(reel.id) as { count: number }).count;
  assert.equal(countAfter, 0);
});
