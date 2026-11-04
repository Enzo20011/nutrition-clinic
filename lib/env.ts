/**
 * lib/env.ts
 * Validates that all required environment variables are present.
 * Import this at the top of any server-side file that depends on env.
 * Throws a clear error on startup rather than a cryptic 500 at runtime.
 */

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
] as const;

let validated = false;

export function validateEnv() {
  if (validated) return;
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please add them to your .env.local file.`
    );
  }
  validated = true;
}
