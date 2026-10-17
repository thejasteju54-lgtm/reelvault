import type { IncomingMessage, ServerResponse } from 'node:http';

// Ensure /tmp sqlite database path in serverless
if (process.env.VERCEL || process.env.VERCEL_ENV || !process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = '/tmp/reelvault.sqlite';
}

import { createApp } from '../src/server/app.js';
import { initDatabase } from '../src/server/db/database.js';

let appInstance: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appInstance) {
    initDatabase();
    appInstance = createApp();
  }
  return appInstance;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = getApp();

    // Reconstruct full original path when routed through Vercel rewrites
    let currentUrl = req.url || '/api';

    if (currentUrl.includes('__rv_path=')) {
      try {
        const dummyBase = 'http://localhost';
        const parsedUrl = new URL(currentUrl, dummyBase);
        const rvPath = parsedUrl.searchParams.get('__rv_path') || '';
        parsedUrl.searchParams.delete('__rv_path');
        const remainingQuery = parsedUrl.searchParams.toString();
        const cleanSubPath = rvPath.startsWith('/') ? rvPath : `/${rvPath}`;
        req.url = `/api${cleanSubPath}${remainingQuery ? `?${remainingQuery}` : ''}`;
      } catch {
        // Fallback to currentUrl if URL parsing fails
      }
    } else {
      const forwardedUri =
        (req.headers['x-forwarded-uri'] as string) ||
        (req.headers['x-vercel-forwarded-for-url'] as string);

      if (forwardedUri && forwardedUri.startsWith('/api') && !forwardedUri.startsWith('/api/index')) {
        req.url = forwardedUri;
      } else if (!req.url || req.url === '/api/index' || req.url.startsWith('/api/index?')) {
        const qIdx = currentUrl.indexOf('?');
        const queryString = qIdx !== -1 ? currentUrl.substring(qIdx) : '';
        req.url = `/api${queryString}`;
      } else if (!currentUrl.startsWith('/api')) {
        req.url = '/api' + (currentUrl.startsWith('/') ? currentUrl : '/' + currentUrl);
      }
    }

    return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
  } catch (err: unknown) {
    console.error('Unhandled Vercel serverless error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'SERVERLESS_FUNCTION_ERROR',
            message: `Serverless error: ${message}`
          }
        })
      );
    }
  }
}
