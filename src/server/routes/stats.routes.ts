import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { getVaultStats, exportVaultData } from '../services/reels.service.js';

const router = Router();
router.use(requireAuth);

router.get('/stats', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const stats = getVaultStats(req.user!.userId);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
});

router.get('/export', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const exported = exportVaultData(req.user!.userId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reelvault-export.csv"');
      res.status(200).send(exported);
      return;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reelvault-export.json"');
    res.status(200).send(exported);
  } catch (err) {
    next(err);
  }
});

export default router;
