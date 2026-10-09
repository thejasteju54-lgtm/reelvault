import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, getUserById } from '../services/auth.service.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address.').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100),
  displayName: z.string().max(100).optional()
});

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

router.post('/register', validateBody(RegisterSchema), (req: Request, res: Response, next) => {
  try {
    const { email, password, displayName } = req.body;
    const result = registerUser(email, password, displayName);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateBody(LoginSchema), (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    const result = loginUser(email, password);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' }
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

export default router;
