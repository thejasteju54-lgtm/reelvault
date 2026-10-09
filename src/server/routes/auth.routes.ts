import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getUserById, ensureUserExists } from '../services/auth.service.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Strict rate limiting on authentication to prevent brute force
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 minutes window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: 'Too many authentication attempts from this IP. Please try again later.'
    }
  }
});

// Honeypot field: 'website' or 'hp_field' must be empty for real users
const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address.').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100),
  displayName: z.string().max(100).optional(),
  website: z.string().max(0, 'Bot activity detected (honeypot triggered).').optional()
});

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.').max(255),
  password: z.string().min(1, 'Password is required.').max(100),
  website: z.string().max(0, 'Bot activity detected (honeypot triggered).').optional()
});

router.post('/register', authRateLimiter, validateBody(RegisterSchema), (req: Request, res: Response, next) => {
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

router.post('/login', authRateLimiter, validateBody(LoginSchema), (req: Request, res: Response, next) => {
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
    let user = getUserById(req.user!.userId);
    if (!user) {
      ensureUserExists(req.user!.userId, req.user!.email);
      user = getUserById(req.user!.userId);
    }
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
