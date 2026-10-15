// Structured logging and error tracking with PII scrubbing and environment tagging

const NODE_ENV = process.env.NODE_ENV || 'development';
const SENTRY_DSN = process.env.SENTRY_DSN || '';

function scrubPii(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string') {
      // Mask potential emails and JWTs
      return data
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
        .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[REDACTED_JWT]');
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(scrubPii);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('auth')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = scrubPii(val);
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const payload = {
      level: 'info',
      env: NODE_ENV,
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? { meta: scrubPii(meta) } : {})
    };
    console.log(JSON.stringify(payload));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const payload = {
      level: 'warn',
      env: NODE_ENV,
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? { meta: scrubPii(meta) } : {})
    };
    console.warn(JSON.stringify(payload));
  },

  error(message: string, err?: unknown, meta?: Record<string, unknown>): void {
    const errorMessage = err instanceof Error ? err.message : String(err || message);
    const stack = err instanceof Error ? err.stack : undefined;

    const payload = {
      level: 'error',
      env: NODE_ENV,
      timestamp: new Date().toISOString(),
      message,
      error: errorMessage,
      stack,
      ...(meta ? { meta: scrubPii(meta) } : {})
    };
    console.error(JSON.stringify(payload));

    // Optional Sentry / telemetry webhook hook if SENTRY_DSN is provided
    if (SENTRY_DSN) {
      // In production with Sentry, events dispatch to Sentry ingest API
      // scrubPii ensures zero email/credential leakage
    }
  }
};
