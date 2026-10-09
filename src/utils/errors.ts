import { PostgrestError } from '@supabase/supabase-js';

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_URL'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_REEL'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function handleSupabaseError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle Supabase PostgrestError
  const pgError = error as PostgrestError;
  if (pgError && pgError.code) {
    // Supabase / Postgres error codes
    switch (pgError.code) {
      case '23505': // unique_violation
        if (pgError.message.includes('instagram_shortcode')) {
          throw new ApiError('DUPLICATE_REEL', 'This Reel has already been saved.', 409);
        }
        break;
      case '23503': // foreign_key_violation
        throw new ApiError('VALIDATION_ERROR', 'Invalid reference (e.g. category does not exist).', 400);
      case 'PGRST116': // Not found
        throw new ApiError('NOT_FOUND', 'Resource not found.', 404);
    }
  }

  console.error('[Supabase Error]:', error);
  throw new ApiError('INTERNAL_ERROR', 'An unexpected error occurred.', 500);
}
