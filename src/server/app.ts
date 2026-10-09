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

  // Trust proxy for secure headers behind reverse proxy / load balancer (Vercel, Cloudflare, etc.)
  app.set('trust proxy', 1);

  // Force HTTPS redirect if requested via plain HTTP behind a reverse proxy
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || req.hostname;
      return res.redirect(301, `https://${host}${req.url}`);
    }
    next();
  });

  // Comprehensive security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https:"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false
    })
  );

  // Permissions-Policy header to restrict sensitive hardware features
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // CORS Configuration
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Global API Rate Limiting (DoS and brute force protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 600, // Limit each IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
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

  // 404 for unrecognized API endpoints
  app.all('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API endpoint was not found on ReelVault.'
      }
    });
  });

  // Serve production client build if exists
  const candidateDirs = [
    path.resolve(process.cwd(), 'dist/client'),
    path.resolve(process.cwd(), 'dist')
  ];
  const clientDist = candidateDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html')));
  if (clientDist) {
    app.use(express.static(clientDist));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      // If user directly requests /404, send index.html with 404 status
      if (req.path === '/404') {
        res.status(404).sendFile(path.join(clientDist, 'index.html'));
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}
