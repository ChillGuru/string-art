import { eq } from 'drizzle-orm';
import { apiRouteHandler, apiRouteOperation } from 'next-rest-framework';
import { codeArrayInputSchema, codeInputSchema, codeSchema } from 'ui';
import { z } from 'zod';

import { checkAdmin } from '@/auth';
import db from '@/db';
import { Codes } from '@/db/schema';
import { emptyOptionsOperation, getApiDesc } from '@/helpers/apiFramework';

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
    .input({ contentType: 'application/json', body: codeInputSchema })
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

  PUT: apiRouteOperation(
    getApiDesc({ operationId: 'createManyCodes', tags: ['codes'] })
  )
    .input({ contentType: 'application/json', body: codeArrayInputSchema })
    .outputs([
      {
        status: 200,
        contentType: 'application/json',
        schema: codeSchema.array(),
      },
      { status: 403, contentType: 'application/json', schema: z.string() },
    ])
    .handler(async (req, res) => {
      if (!checkAdmin(req)) {
        return res.status(403).send('Forbidden');
      }
      const { codes } = req.body;
      const newCodes = await db
        .insert(Codes)
        .values(
          codes.map((c) => ({
            value: c,
          }))
        )
        .returning(selectionWithoutDates);
      return res.json(newCodes);
    }),

  DELETE: apiRouteOperation(
    getApiDesc({ operationId: 'deleteCode', tags: ['codes'] })
  )
    .input({ contentType: 'application/json', body: codeInputSchema })
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
