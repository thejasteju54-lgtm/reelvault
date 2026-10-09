import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../../src/server/config/env.js';

describe('Environment Variable Startup Validation', () => {
  test('Passes with valid development defaults', () => {
    const config = validateEnv();
    assert.ok(config);
    assert.equal(typeof config.PORT, 'number');
    assert.ok(config.JWT_SECRET.length >= 16);
  });

  test('Fails in production when JWT_SECRET is default or shorter than 32 chars', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'twenty_chars_secret_123';

      assert.throws(() => {
        validateEnv();
      }, /Insecure JWT_SECRET in production environment/);
    } finally {
      process.env = originalEnv;
    }
  });

  test('Passes in production when strong 32+ char JWT_SECRET is provided', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a_very_strong_cryptographically_secure_production_secret_key_12345';

      const config = validateEnv();
      assert.equal(config.NODE_ENV, 'production');
      assert.equal(config.JWT_SECRET, 'a_very_strong_cryptographically_secure_production_secret_key_12345');
    } finally {
      process.env = originalEnv;
    }
  });
});
