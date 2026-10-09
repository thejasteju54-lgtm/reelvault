import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { getTags, deleteTag } from '../services/tags.service.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const tags = getTags(req.user!.userId);
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const deleted = deleteTag(req.user!.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tag not found.' }
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
