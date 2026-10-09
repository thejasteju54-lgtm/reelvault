import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInstagramUrl, normalizeTags } from '../../src/server/utils/instagram.js';

test('parseInstagramUrl - valid reel urls with and without tracking', () => {
  const url1 = 'https://www.instagram.com/reel/C3_aBcDeF/';
  const res1 = parseInstagramUrl(url1);
  assert.equal(res1.isValid, true);
  assert.equal(res1.shortcode, 'C3_aBcDeF');
  assert.equal(res1.canonicalUrl, 'https://www.instagram.com/reel/C3_aBcDeF/');

  // With query parameters and tracking
  const url2 = 'https://www.instagram.com/reel/C3_aBcDeF/?utm_source=share&igsh=NDhhOWU1Nzg=';
  const res2 = parseInstagramUrl(url2);
  assert.equal(res2.isValid, true);
  assert.equal(res2.shortcode, 'C3_aBcDeF');
  assert.equal(res2.canonicalUrl, 'https://www.instagram.com/reel/C3_aBcDeF/');

  // Mobile / short domain instagr.am
  const url3 = 'https://instagr.am/reel/DF99281a_b/';
  const res3 = parseInstagramUrl(url3);
  assert.equal(res3.isValid, true);
  assert.equal(res3.shortcode, 'DF99281a_b');
  assert.equal(res3.canonicalUrl, 'https://www.instagram.com/reel/DF99281a_b/');

  // /reels/ plural path
  const url4 = 'https://instagram.com/reels/xyz_123/';
  const res4 = parseInstagramUrl(url4);
  assert.equal(res4.isValid, true);
  assert.equal(res4.shortcode, 'xyz_123');

  // /p/ post containing reel
  const url5 = 'https://www.instagram.com/p/Co91-88xYz/';
  const res5 = parseInstagramUrl(url5);
  assert.equal(res5.isValid, true);
  assert.equal(res5.shortcode, 'Co91-88xYz');
  assert.equal(res5.canonicalUrl, 'https://www.instagram.com/reel/Co91-88xYz/');

  // Without https prefix (user just pasted instagram.com/reel/...)
  const url6 = 'instagram.com/reel/ABC123xyz/';
  const res6 = parseInstagramUrl(url6);
  assert.equal(res6.isValid, true);
  assert.equal(res6.shortcode, 'ABC123xyz');
});

test('parseInstagramUrl - rejects malicious protocols and external domains', () => {
  // JavaScript pseudo protocol
  const bad1 = parseInstagramUrl("javascript:alert('xss')");
  assert.equal(bad1.isValid, false);

  // Data URI
  const bad2 = parseInstagramUrl("data:text/html,<script>alert(1)</script>");
  assert.equal(bad2.isValid, false);

  // Phishing external domain
  const bad3 = parseInstagramUrl('https://evil-phishing-instagram.com/reel/ABC123xyz/');
  assert.equal(bad3.isValid, false);

  // Twitter/YouTube URL
  const bad4 = parseInstagramUrl('https://youtube.com/shorts/abcdef');
  assert.equal(bad4.isValid, false);

  // Malformed / empty
  const bad5 = parseInstagramUrl('');
  assert.equal(bad5.isValid, false);

  const bad6 = parseInstagramUrl('not-a-url');
  assert.equal(bad6.isValid, false);
});

test('normalizeTags - cleans, strips #, dedupes, and lowercases', () => {
  const input = [' Python ', '#TypeScript', '#AI', 'python', 'Machine-Learning', '100%_Awesome!'];
  const cleaned = normalizeTags(input);
  assert.deepEqual(cleaned, ['python', 'typescript', 'ai', 'machine-learning', '100_awesome']);
});
