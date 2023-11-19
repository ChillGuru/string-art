import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import db from '@/db';
import { Codes } from '@/db/schema';
import { envServer } from '@/env/server.mjs';
import { emptyHandler } from '@/helpers/emptyHandler';

const loginBodySchema = z.object({ code: z.string() });
export async function POST(req: Request) {
  let code: string;
  try {
    const body = await req.json().then((data) => loginBodySchema.parse(data));
    code = body.code;
  } catch {
    return new Response('Missing code', { status: 400 });
  }
  const foundCodes = await db.select().from(Codes).where(eq(Codes.value, code));

  if (foundCodes.length === 0) {
    if (code !== envServer.ADMIN) {
      return new Response('Invalid code', { status: 401 });
    }

    const token = jwt.sign({ admin: true }, envServer.JWT_SECRET, {
      expiresIn: '1d',
    });
    return Response.json({ token, role: 'admin' });
  }

  const foundCode = foundCodes[0];
  await db
    .update(Codes)
    .set({ timesUsed: foundCode.timesUsed + 1, updatedAt: new Date() });

  const token = jwt.sign({ code: foundCode.value }, envServer.JWT_SECRET, {
    expiresIn: '4h',
  });
  return Response.json({ token, role: 'user' });
}

export const OPTIONS = emptyHandler;
