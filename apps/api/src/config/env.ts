import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@myklasi.online'),
  EMAIL_FROM_NAME: z.string().default('MyKlasi SMS'),

  // SMS
  AFRICASTALKING_API_KEY: z.string().optional(),
  AFRICASTALKING_USERNAME: z.string().default('sandbox'),
  AFRICASTALKING_SENDER_ID: z.string().default('MYKLASI'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // App
  APP_URL: z.string().default('http://localhost:5173'),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('3600').transform(Number),
});
import fs from 'fs';
import path from 'path';

// Programmatically load .env file if it exists and variables aren't already set
const envPaths = [
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const firstEqual = trimmed.indexOf('=');
        if (firstEqual === -1) continue;
        const key = trimmed.substring(0, firstEqual).trim();
        let val = trimmed.substring(firstEqual + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
      console.log(`✅ Loaded environment variables from: ${envPath}`);
      break;
    } catch (err) {
      console.error(`⚠️ Failed to read .env at ${envPath}:`, err);
    }
  }
}

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  console.error(result.error.flatten().fieldErrors);
  // Do NOT call process.exit(1) in serverless — it terminates the entire function runtime.
  // Throw instead so the caller can return a proper 500 response.
  throw new Error(
    'Missing or invalid environment variables: ' +
      JSON.stringify(result.error.flatten().fieldErrors),
  );
}

export const env = result.data;
export type Env = typeof env;
