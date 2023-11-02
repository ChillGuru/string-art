import { configDotenv } from 'dotenv';

import type { Config } from 'drizzle-kit';

configDotenv();

export default {
  schema: './db/schema.ts',
  out: './.drizzle',
  driver: 'turso',
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_TOKEN!,
  },
} satisfies Config;
