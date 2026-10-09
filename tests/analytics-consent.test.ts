import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage and window events for Node environment
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, val: string) { this.store[key] = val; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const mockStorage = new MockLocalStorage();
(globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
(globalThis as unknown as { window: Record<string, unknown> }).window = {
  dispatchEvent: () => true,
  _rv_telemetry: []
};

// Import analytics service
import { analytics } from '../src/client/services/analytics.js';

describe('Analytics & Cookie Consent Hardening Behavior', () => {
  test('1. Before consent: status is pending, NO events fire', () => {
    mockStorage.clear();
    (globalThis.window as unknown as { _rv_telemetry: unknown[] })._rv_telemetry = [];

    assert.equal(analytics.getConsentStatus(), 'pending');

    // Attempting to track pageview or custom event while pending
    analytics.pageView('/test-page');
    analytics.trackEvent('test_click', { button: 'cta' });

    assert.equal(
      (globalThis.window as unknown as { _rv_telemetry: unknown[] })._rv_telemetry.length,
      0,
      'No telemetry events may be emitted when consent is pending'
    );
  });

  test('2. When rejected: status is rejected, zero cookies or telemetry requests emitted', () => {
    analytics.setConsent('rejected');
    assert.equal(analytics.getConsentStatus(), 'rejected');

    analytics.pageView('/privacy');
    analytics.trackEvent('save_reel');

    assert.equal(
      (globalThis.window as unknown as { _rv_telemetry: unknown[] })._rv_telemetry.length,
      0,
      'Rejected consent MUST suppress all telemetry and non-essential cookies'
    );
  });

  test('3. When accepted: status is accepted, telemetry event queue receives events', () => {
    analytics.setConsent('accepted');
    assert.equal(analytics.getConsentStatus(), 'accepted');

    analytics.pageView('/dashboard');
    analytics.trackEvent('save_reel', { shortcode: 'CX123' });

    const queue = (globalThis.window as unknown as { _rv_telemetry: Array<{ type: string; event?: string; path?: string }> })._rv_telemetry;
    assert.equal(queue.length, 2);
    assert.equal(queue[0].type, 'pageview');
    assert.equal(queue[0].path, '/dashboard');
    assert.equal(queue[1].type, 'event');
    assert.equal(queue[1].eventName, 'save_reel');
  });

  test('4. Consent can be revoked later (Reset Consent)', () => {
    analytics.resetConsent();
    assert.equal(analytics.getConsentStatus(), 'pending');

    // Verify localStorage cleared
    assert.equal(mockStorage.getItem('reelvault_cookie_consent'), null);
  });
});
