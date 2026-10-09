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
  deleteReel
} from '../services/reels.service.js';

const router = Router();

// 100% of reel routes require authentication
router.use(requireAuth);

const CreateReelSchema = z.object({
  url: z.string().min(1, 'Instagram Reel URL is required.').max(1000),
  title: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).optional()
});

const UpdateReelSchema = z.object({
  title: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).optional()
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
