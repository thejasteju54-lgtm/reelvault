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

    // Preserve full original path when routed through Vercel rewrites
    const matchedPath =
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string);

    let currentUrl = req.url || '/api';
    if (matchedPath && matchedPath.startsWith('/api')) {
      const qIdx = currentUrl.indexOf('?');
      const queryString = qIdx !== -1 ? currentUrl.substring(qIdx) : '';
      req.url = matchedPath.includes('?') ? matchedPath : matchedPath + queryString;
    } else if (!currentUrl.startsWith('/api')) {
      req.url = '/api' + (currentUrl.startsWith('/') ? currentUrl : '/' + currentUrl);
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
