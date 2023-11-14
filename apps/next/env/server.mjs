import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const envServer = createEnv({
  server: {
    ADMIN: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    DB_TOKEN: z.string().min(1),
    DB_URL: z.string().min(1),
  },
  runtimeEnv: {
    ADMIN: process.env.ADMIN,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_TOKEN: process.env.DB_TOKEN,
    DB_URL: process.env.DB_URL,
  },
});
