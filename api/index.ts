import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/server/app.js';
import { initDatabase } from '../src/server/db/database.js';

let appInstance: ReturnType<typeof createApp> | null = null;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appInstance) {
    if (process.env.VERCEL) {
      process.env.DATABASE_PATH = '/tmp/reelvault.sqlite';
    }
    initDatabase();
    appInstance = createApp();
  }

  // Ensure req.url starts with /api for express routing if stripped by Vercel rewrites
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return (appInstance as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
