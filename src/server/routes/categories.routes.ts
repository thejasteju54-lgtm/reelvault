import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { getCategories, createCategory, deleteCategory } from '../services/categories.service.js';

const router = Router();
router.use(requireAuth);

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #6366f1).').optional()
});

router.get('/', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const categories = getCategories(req.user!.userId);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateBody(CreateCategorySchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, color } = req.body;
    const category = createCategory(req.user!.userId, name, color);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const deleted = deleteCategory(req.user!.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found.' }
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
