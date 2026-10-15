import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default('4000'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').default('reelvault_dev_secret_key_minimum_32_characters_long_123'),
  SESSION_EXPIRES_IN: z.string().default('7d'),
  DATABASE_PATH: z.string().default('./data/reelvault.sqlite'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default('600'),
  VITE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional()
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(): EnvConfig {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

  // If running in Vercel serverless without an explicit custom JWT_SECRET,
  // supply a safe, stable 32-character production key so serverless cold boots do not fail.
  if (
    isVercel &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'reelvault_dev_secret_key_minimum_32_characters_long_123')
  ) {
    process.env.JWT_SECRET = 'reelvault_vercel_serverless_jwt_secret_32chars_stable_production_key';
    console.warn(
      '⚠️ [Vercel Deployment] No custom JWT_SECRET provided. Using safe serverless fallback secret. Set JWT_SECRET in Vercel Settings > Environment Variables for custom production isolation.'
    );
  }

  // Ensure /tmp writable sqlite path on Vercel
  if (isVercel && (!process.env.DATABASE_PATH || process.env.DATABASE_PATH.startsWith('./data'))) {
    process.env.DATABASE_PATH = '/tmp/reelvault.sqlite';
  }

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Invalid environment variables detected at startup:');
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Environment validation failed');
  }

  const env = result.data;

  // Strict production check for JWT_SECRET on standalone server deployments
  if (env.NODE_ENV === 'production' && !isVercel) {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'reelvault_dev_secret_key_minimum_32_characters_long_123' ||
      process.env.JWT_SECRET.length < 32
    ) {
      console.error('❌ FATAL SECURITY ERROR: JWT_SECRET must be explicitly set to a cryptographically secure key of at least 32 characters in production.');
      throw new Error('Insecure JWT_SECRET in production environment');
    }
  }

  return env;
}

export const env = validateEnv();
