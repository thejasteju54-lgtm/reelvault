// Privacy-first analytics service respecting explicit user consent

const CONSENT_KEY = 'reelvault_cookie_consent';
const ANALYTICS_ID = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ANALYTICS_ID || 'RV-ANALYTICS-PRIVACY';

export type ConsentStatus = 'accepted' | 'rejected' | 'pending';

export const analytics = {
  getConsentStatus(): ConsentStatus {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === 'accepted') return 'accepted';
      if (stored === 'rejected') return 'rejected';
      return 'pending';
    } catch {
      return 'pending';
    }
  },

  setConsent(choice: 'accepted' | 'rejected'): void {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
      window.dispatchEvent(new CustomEvent('reelvault:consent-changed', { detail: choice }));
    } catch {
      // Ignore localStorage write failures
    }
  },

  resetConsent(): void {
    try {
      localStorage.removeItem(CONSENT_KEY);
      window.dispatchEvent(new CustomEvent('reelvault:consent-changed', { detail: 'pending' }));
    } catch {
      // Ignore
    }
  },

  pageView(path: string): void {
    if (this.getConsentStatus() !== 'accepted') {
      return;
    }
    // In production, dispatch to analytics beacon or endpoint
    if (typeof window !== 'undefined' && (window as unknown as { _rv_telemetry?: Array<unknown> })._rv_telemetry) {
      (window as unknown as { _rv_telemetry: Array<unknown> })._rv_telemetry.push({
        type: 'pageview',
        path,
        id: ANALYTICS_ID,
        ts: Date.now()
      });
    }
  },

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (this.getConsentStatus() !== 'accepted') {
      return;
    }
    if (typeof window !== 'undefined') {
      const globalQueue = (window as unknown as { _rv_telemetry?: Array<unknown> });
      if (!globalQueue._rv_telemetry) {
        globalQueue._rv_telemetry = [];
      }
      globalQueue._rv_telemetry.push({
        type: 'event',
        eventName,
        properties,
        id: ANALYTICS_ID,
        ts: Date.now()
      });
    }
  }
};
