import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  saveReel,
  getReels,
  getReelById,
  updateReel,
  toggleFavorite,
  toggleWatched,
  toggleArchive,
  deleteReel,
  syncReels
} from '../services/reels.service.js';

const router = Router();

// Public thumbnail proxy for Instagram reels to avoid CORS, hotlink, and referrer blockage
router.get('/thumbnail/:shortcode', async (req, res) => {
  const shortcode = req.params.shortcode;
  if (!shortcode || !/^[A-Za-z0-9_-]{3,40}$/.test(shortcode)) {
    res.status(400).json({ error: 'Invalid shortcode' });
    return;
  }

  try {
    const igUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const igResponse = await fetch(igUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': ''
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);

    if (!igResponse.ok) {
      res.status(igResponse.status).json({ error: 'Thumbnail not available' });
      return;
    }

    const contentType = igResponse.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      res.status(404).json({ error: 'Thumbnail returned non-image content' });
      return;
    }

    const arrayBuffer = await igResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: 'Failed to retrieve reel thumbnail' });
  }
});

// All remaining reel routes require authentication
router.use(requireAuth);

const CreateReelSchema = z.object({
  url: z.string().min(1, 'Instagram Reel URL is required.').max(1000),
  title: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
  thumbnailUrl: z.string().max(2000).nullable().optional(),
  website: z.string().max(0, 'Bot activity detected (honeypot triggered).').optional()
});

const UpdateReelSchema = z.object({
  title: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
  thumbnailUrl: z.string().max(2000).nullable().optional()
});

const QueryReelsSchema = z.object({
  q: z.string().max(255).optional(),
  status: z.enum(['all', 'unwatched', 'watched']).optional(),
  favorite: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
  archived: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
  categoryId: z.string().uuid().optional(),
  tag: z.string().max(50).optional(),
  sort: z.enum(['newest', 'oldest', 'updated', 'alphabetical']).optional(),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100).optional()),
  cursor: z.string().optional()
});

// Save Reel (Quick Save)
router.post('/', validateBody(CreateReelSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = saveReel(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

const SyncReelsSchema = z.object({
  reels: z.array(z.object({
    id: z.string().optional(),
    url: z.string().optional(),
    instagramUrl: z.string().optional(),
    canonicalUrl: z.string().optional(),
    instagramShortcode: z.string().min(1),
    title: z.string().nullable().optional(),
    creatorUsername: z.string().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isFavorite: z.boolean().optional(),
    isWatched: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    watchedAt: z.string().nullable().optional(),
    archivedAt: z.string().nullable().optional()
  })).max(500)
});

// Sync Reels (Hydrate cache to SQLite)
router.post('/sync', validateBody(SyncReelsSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const synced = syncReels(req.user!.userId, req.body.reels);
    res.status(200).json({
      success: true,
      data: synced
    });
  } catch (err) {
    next(err);
  }
});

// List / Query Reels
router.get('/', validateQuery(QueryReelsSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = getReels(req.user!.userId, req.query);
    res.status(200).json({
      success: true,
      data: result.reels,
      meta: {
        total: result.total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Reel Details
router.get('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reel = getReelById(req.user!.userId, req.params.id);
    if (!reel) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Reel not found.' }
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: reel
    });
  } catch (err) {
    next(err);
  }
});

// Update Reel
router.patch('/:id', validateBody(UpdateReelSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = updateReel(req.user!.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Toggle Favorite
router.post('/:id/favorite', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = toggleFavorite(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Toggle Watched
router.post('/:id/watched', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = toggleWatched(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Toggle Archive
router.post('/:id/archive', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = toggleArchive(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete Reel
router.delete('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    deleteReel(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
