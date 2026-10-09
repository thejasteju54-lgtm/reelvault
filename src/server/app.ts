import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';

import authRoutes from './routes/auth.routes.js';
import reelsRoutes from './routes/reels.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import tagsRoutes from './routes/tags.routes.js';
import statsRoutes from './routes/stats.routes.js';
import { errorHandler } from './middleware/error.js';

export function createApp(): express.Application {
  const app = express();

  // Basic security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible SPA resource loading in local dev
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Rate Limiting (DoS and brute force protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 600, // Limit each IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.'
      }
    }
  });
  app.use('/api/', limiter);

  // Body parser with 100kb payload limit
  app.use(express.json({ limit: '100kb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      status: 'healthy',
      app: 'ReelVault',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/reels', reelsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/tags', tagsRoutes);
  app.use('/api', statsRoutes);

  // Serve production client build if exists
  const clientDist = path.resolve(process.cwd(), 'dist/client');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}
