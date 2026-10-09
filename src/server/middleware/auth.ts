import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthError, ensureUserExists } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.'
      }
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = verifyToken(token);
    req.user = payload;
    ensureUserExists(payload.userId, payload.email);
    next();
  } catch (err: unknown) {
    const authErr = err as AuthError;
    res.status(authErr.statusCode || 401).json({
      success: false,
      error: {
        code: authErr.code || 'UNAUTHORIZED',
        message: authErr.message || 'Invalid authentication token.'
      }
    });
  }
}
