// Client-side structured logger and telemetry hook

const IS_DEV = import.meta.env.DEV;

function scrubClientPii(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[REDACTED_JWT]');
}

export const clientLogger = {
  info(message: string, ...args: unknown[]): void {
    if (IS_DEV) {
      console.log(`[ReelVault:Info] ${message}`, ...args);
    }
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[ReelVault:Warn] ${message}`, ...args);
  },

  error(message: string, error?: unknown): void {
    const cleanMsg = scrubClientPii(message);
    console.error(`[ReelVault:Error] ${cleanMsg}`, error);

    // Optional error monitoring hook (e.g. Sentry Browser SDK)
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: unknown) => void } }).Sentry.captureException(error || new Error(cleanMsg));
    }
  }
};

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    clientLogger.error('Unhandled window error', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    clientLogger.error('Unhandled promise rejection', event.reason);
  });
}
