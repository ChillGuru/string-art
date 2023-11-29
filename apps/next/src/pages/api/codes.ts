import { eq } from 'drizzle-orm';
import { apiRouteHandler, apiRouteOperation } from 'next-rest-framework';
import { z } from 'zod';

import { checkAdmin } from '@/auth';
import db from '@/db';
import { Codes } from '@/db/schema';
import { emptyOptionsOperation, getApiDesc } from '@/helpers/apiFramework';

const codeSchema = z.object({
  id: z.number(),
  timesUsed: z.number(),
  value: z.string(),
});

const codeCreationSchema = z.object({
  code: z
    .string()
    .length(8, 'Код должен содержать 8 символов')
    .regex(/^\d+$/, 'Код должен состоять только из цифер'),
});

const selectionWithoutDates = {
  id: Codes.id,
  timesUsed: Codes.timesUsed,
  value: Codes.value,
};

export default apiRouteHandler({
  OPTIONS: emptyOptionsOperation,

  GET: apiRouteOperation(
    getApiDesc({ operationId: 'getCodes', tags: ['codes'] })
  )
    .outputs([
      {
        status: 200,
        contentType: 'application/json',
        schema: codeSchema.array(),
      },
      { status: 403, contentType: 'text/plain', schema: z.string() },
    ])
    .handler(async (req, res) => {
      if (!checkAdmin(req)) {
        return res.status(403).send('Forbidden');
      }
      const codes = await db.select(selectionWithoutDates).from(Codes);
      return res.json(codes);
    }),

  POST: apiRouteOperation(
    getApiDesc({ operationId: 'createCode', tags: ['codes'] })
  )
    .input({ contentType: 'application/json', body: codeCreationSchema })
    .outputs([
      { status: 200, contentType: 'application/json', schema: codeSchema },
      { status: 403, contentType: 'text/plain', schema: z.string() },
    ])
    .handler(async (req, res) => {
      if (!checkAdmin(req)) {
        return res.status(403).send('Forbidden');
      }
      const newCodes = await db
        .insert(Codes)
        .values({ value: req.body.code })
        .returning(selectionWithoutDates);
      return res.json(newCodes[0]);
    }),

  DELETE: apiRouteOperation(
    getApiDesc({ operationId: 'deleteCode', tags: ['codes'] })
  )
    .input({ contentType: 'application/json', body: codeCreationSchema })
    .outputs([
      { status: 200, contentType: 'application/json', schema: codeSchema },
      { status: 403, contentType: 'application/json', schema: z.string() },
    ])
    .handler(async (req, res) => {
      if (!checkAdmin(req)) {
        return res.status(403).send('Forbidden');
      }
      const deletedCodes = await db
        .delete(Codes)
        .where(eq(Codes.value, req.body.code))
        .returning(selectionWithoutDates);
      return res.json(deletedCodes[0]);
    }),
});
