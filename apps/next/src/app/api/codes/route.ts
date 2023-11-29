import { eq } from 'drizzle-orm';
import { routeHandler } from 'next-rest-framework';
import { z } from 'zod';

import { checkAdmin } from '@/auth';
import db from '@/db';
import { Codes } from '@/db/schema';
import { emptyHandler } from '@/helpers/emptyHandler';

const selectionWithoutDates = {
  id: Codes.id,
  timesUsed: Codes.timesUsed,
  value: Codes.value,
};

const handler = routeHandler({});

export async function GET(req: Request) {
  if (!checkAdmin(req)) {
    return new Response('Forbidden', { status: 403 });
  }
  const codes = await db.select(selectionWithoutDates).from(Codes);
  return Response.json(codes);
}

const codeCreationInputSchema = z.object({
  code: z
    .string()
    .length(8, 'Код должен содержать 8 символов')
    .regex(/^\d+$/, 'Код должен состоять только из цифер'),
});
type CodeCreationInput = z.infer<typeof codeCreationInputSchema>;
export async function POST(req: Request) {
  if (!checkAdmin(req)) {
    return new Response('Forbidden', { status: 403 });
  }

  let body: CodeCreationInput;
  try {
    body = await req.json().then(codeCreationInputSchema.parse);
  } catch {
    return new Response('Invalid input', { status: 400 });
  }

  const newCodes = await db
    .insert(Codes)
    .values({ value: body.code })
    .returning(selectionWithoutDates);

  return Response.json(newCodes[0]);
}

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) {
    return new Response('Forbidden', { status: 403 });
  }

  let body: CodeCreationInput;
  try {
    body = await req.json().then(codeCreationInputSchema.parse);
  } catch {
    return new Response('Invalid input', { status: 400 });
  }

  const deletedCodes = await db
    .delete(Codes)
    .where(eq(Codes.value, body.code.toString()))
    .returning(selectionWithoutDates);

  return Response.json(deletedCodes[0]);
}

export const OPTIONS = emptyHandler;
