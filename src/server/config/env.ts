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
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Invalid environment variables detected at startup:');
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Environment validation failed');
  }

  const env = result.data;

  // Strict production check for JWT_SECRET
  if (env.NODE_ENV === 'production') {
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
