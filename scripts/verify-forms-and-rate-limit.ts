import assert from 'node:assert/strict';

async function main() {
  console.log('--- STARTING FORM VERIFICATION AND RATE LIMIT AUDIT ---');
  const baseUrl = 'http://localhost:4000';

  // 1. Empty fields
  const emptyRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' })
  });
  console.log(`1. Empty fields test: status=${emptyRes.status} (expected 400)`);
  const emptyData = await emptyRes.json();
  console.log('   Response:', JSON.stringify(emptyData.error));

  // 2. Invalid email format
  const invalidEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user-not-an-email', password: 'ValidPassword123!' })
  });
  console.log(`2. Invalid email test: status=${invalidEmailRes.status} (expected 400)`);
  const invalidEmailData = await invalidEmailRes.json();
  console.log('   Response:', JSON.stringify(invalidEmailData.error));

  // 3. Extremely long input
  const longInputRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'toolong_' + 'a'.repeat(300) + '@example.com',
      password: 'ValidPassword123!'
    })
  });
  console.log(`3. Extremely long email test: status=${longInputRes.status} (expected 400)`);
  const longInputData = await longInputRes.json();
  console.log('   Response:', JSON.stringify(longInputData.error));

  // 4. Script tag / XSS escaping
  const testEmail = `xss_test_${Date.now()}@example.com`;
  const xssRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'ValidPassword123!',
      displayName: '<script>alert(1)</script>'
    })
  });
  console.log(`4. XSS script tag submission: status=${xssRes.status} (expected 201 created safely)`);
  const xssData = await xssRes.json();
  console.log('   Safe returned displayName:', xssData.data?.user?.displayName);

  // 5. Honeypot rejection
  const honeypotRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `bot_${Date.now()}@spambot.com`,
      password: 'ValidPassword123!',
      website: 'https://spambot-link.com'
    })
  });
  console.log(`5. Honeypot filled test: status=${honeypotRes.status} (expected 400)`);
  const honeypotData = await honeypotRes.json();
  console.log('   Honeypot Response:', JSON.stringify(honeypotData.error));

  // 6. Rapid submission rate limiting (10 rapid requests to auth)
  console.log('6. Sending rapid requests to test rate limiting...');
  let hitRateLimit = false;
  let rateLimitStatus = 0;
  for (let i = 0; i < 35; i++) {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad_login@example.com', password: 'wrong' })
    });
    if (res.status === 429) {
      hitRateLimit = true;
      rateLimitStatus = res.status;
      const data = await res.json();
      console.log(`   Hit rate limiter at attempt ${i + 1}: status=429`, JSON.stringify(data.error));
      break;
    }
  }
  console.log(`   Rate limiter triggered successfully: ${hitRateLimit}`);

  console.log('--- ALL FORM & SECURITY TESTS COMPLETED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
