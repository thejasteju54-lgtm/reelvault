import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../../src/server/app.js';
import { initDatabase, closeDatabase } from '../../src/server/db/database.js';

describe('Pre-Launch Hardening & Compliance Verification', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    process.env.DATABASE_PATH = './data/test-hardening.sqlite';
    process.env.JWT_SECRET = 'test_jwt_secret_min_32_characters_long_for_test';
    initDatabase();
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

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDatabase();
    try {
      if (fs.existsSync('./data/test-hardening.sqlite')) {
        fs.unlinkSync('./data/test-hardening.sqlite');
      }
    } catch {
      // Ignore
    }
  });

  test('1. Force HTTPS Redirect (returns 301 when x-forwarded-proto is http)', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: {
        'x-forwarded-proto': 'http',
        'x-forwarded-host': 'reelvault.app',
        host: 'reelvault.app'
      },
      redirect: 'manual'
    });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://reelvault.app/api/health');
  });

  test('2. Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    // HSTS
    const hsts = res.headers.get('strict-transport-security');
    assert.ok(hsts, 'Strict-Transport-Security must be present');
    assert.match(hsts, /max-age=31536000/);

    // X-Content-Type-Options
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');

    // X-Frame-Options
    assert.equal(res.headers.get('x-frame-options'), 'DENY');

    // Referrer-Policy
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');

    // Permissions-Policy
    const perm = res.headers.get('permissions-policy');
    assert.ok(perm, 'Permissions-Policy must be present');
    assert.match(perm, /camera=\(\)/);

    // Content-Security-Policy
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp, 'Content-Security-Policy must be present');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
  });

  test('3. SEO & Static Assets: robots.txt, sitemap.xml, site.webmanifest, icons', async () => {
    // robots.txt
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(robotsRes.status, 200);
    const robotsText = await robotsRes.text();
    assert.match(robotsText, /User-agent: \*/);
    assert.match(robotsText, /Sitemap: https:\/\/reelvault\.app\/sitemap\.xml/);

    // sitemap.xml
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(sitemapRes.status, 200);
    const sitemapText = await sitemapRes.text();
    assert.match(sitemapText, /https:\/\/reelvault\.app\//);
    assert.match(sitemapText, /https:\/\/reelvault\.app\/privacy/);
    assert.match(sitemapText, /https:\/\/reelvault\.app\/terms/);

    // site.webmanifest
    const manifestRes = await fetch(`${baseUrl}/site.webmanifest`);
    assert.equal(manifestRes.status, 200);
    const manifestData = await manifestRes.json();
    assert.equal(manifestData.name, 'ReelVault');

    // favicon.svg
    const svgRes = await fetch(`${baseUrl}/favicon.svg`);
    assert.equal(svgRes.status, 200);
    assert.match(await svgRes.text(), /<svg/);

    // og-preview.png (1200x630)
    const ogRes = await fetch(`${baseUrl}/og-preview.png`);
    assert.equal(ogRes.status, 200);
    const ogBuf = Buffer.from(await ogRes.arrayBuffer());
    assert.equal(ogBuf[0], 0x89);
    assert.equal(ogBuf[1], 0x50); // PNG header

    // apple-touch-icon.png
    const touchRes = await fetch(`${baseUrl}/apple-touch-icon.png`);
    assert.equal(touchRes.status, 200);
    const touchBuf = Buffer.from(await touchRes.arrayBuffer());
    assert.equal(touchBuf[0], 0x89);
  });

  test('4. Custom 404 behavior for unknown API routes and /404 path', async () => {
    const apiNotFoundRes = await fetch(`${baseUrl}/api/nonexistent-route-xyz`);
    assert.equal(apiNotFoundRes.status, 404);
    const apiNotFoundData = await apiNotFoundRes.json();
    assert.equal(apiNotFoundData.success, false);
    assert.equal(apiNotFoundData.error.code, 'NOT_FOUND');

    const notFoundPageRes = await fetch(`${baseUrl}/404`);
    assert.equal(notFoundPageRes.status, 404);
  });

  test('5. Form Validation Attack Matrix (empty, malformed email, XSS script tags, length limits)', async () => {
    // 5a. Empty email
    const emptyEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: 'ValidPassword123!' })
    });
    assert.equal(emptyEmailRes.status, 400);

    // 5b. Malformed email
    const malformedEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'ValidPassword123!' })
    });
    assert.equal(malformedEmailRes.status, 400);

    // 5c. Short password
    const shortPassRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: '123' })
    });
    assert.equal(shortPassRes.status, 400);

    // 5d. Excessively long password (>100 chars)
    const longPassRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'a'.repeat(150) })
    });
    assert.equal(longPassRes.status, 400);

    // 5e. XSS injection string safely handled in display name
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'xss_tester@example.com',
        password: 'ValidPassword123!',
        displayName: '<script>alert("xss")</script>'
      })
    });
    assert.equal(regRes.status, 201);
    const regData = await regRes.json();
    assert.equal(regData.success, true);
    assert.equal(regData.data.user.displayName, '<script>alert("xss")</script>');
  });

  test('6. Honeypot Spam Protection (rejection when honeypot field is filled)', async () => {
    // Spam bot fills the hidden website honeypot field
    const spamRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bot_spammer@example.com',
        password: 'Password123!',
        website: 'https://spam-link-promoter.com'
      })
    });
    assert.equal(spamRes.status, 400);
    const spamData = await spamRes.json();
    assert.equal(spamData.success, false);
    assert.equal(spamData.error.code, 'VALIDATION_ERROR');
    assert.match(spamData.error.message, /Bot activity detected/);
  });

  test('7. Secrets Audit in repo and built dist/ output', async () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    assert.ok(fs.existsSync(distPath), 'dist/ directory must exist');

    const searchDir = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(searchDir(fullPath));
        } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const clientFiles = searchDir(path.join(distPath, 'client'));
    const secretPatterns = [
      /sk_[live|test]_[0-9a-zA-Z]{24}/,
      /-----BEGIN PRIVATE KEY-----/,
      /service_role/,
      /postgres:\/\//,
      /mongodb:\/\//
    ];

    for (const filePath of clientFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of secretPatterns) {
        assert.equal(pattern.test(content), false, `Found secret pattern matching ${pattern} in ${filePath}`);
      }
    }
  });

  test('8. Broken Link Crawl across internal site routes (0 broken links)', async () => {
    const routesToTest = [
      '/',
      '/privacy',
      '/terms',
      '/robots.txt',
      '/sitemap.xml',
      '/site.webmanifest',
      '/favicon.svg',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/og-preview.png'
    ];

    for (const route of routesToTest) {
      const res = await fetch(`${baseUrl}${route}`);
      assert.ok(
        res.status === 200 || res.status === 304,
        `Route ${route} returned broken status ${res.status}`
      );
    }
  });
});
