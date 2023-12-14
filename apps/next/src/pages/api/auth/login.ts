import { eq } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';
import { apiRouteHandler, apiRouteOperation } from 'next-rest-framework';
import { z } from 'zod';

import db from '@/db';
import { Codes } from '@/db/schema';
import { envServer } from '@/env/server.mjs';
import { emptyOptionsOperation, getApiDesc } from '@/helpers/apiFramework';
import { userRoleSchema } from '@/helpers/UserRole';

const loginInputSchema = z.object({ code: z.string() });
const loginOutputSchema = z.object({
  token: z.string(),
  role: userRoleSchema,
});

export default apiRouteHandler({
  OPTIONS: emptyOptionsOperation,

  POST: apiRouteOperation(getApiDesc({ operationId: 'login', tags: ['auth'] }))
    .input({
      contentType: 'application/json',
      body: loginInputSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: 'application/json',
        schema: loginOutputSchema,
      },
      { status: 401, contentType: 'application/json', schema: z.string() },
    ])
    .handler(async (req, res) => {
      const { code } = req.body;

      const foundCodes = await db
        .select()
        .from(Codes)
        .where(eq(Codes.value, code));

      if (foundCodes.length === 0) {
        if (code !== envServer.ADMIN) {
          return res.status(401).json('Invalid code');
        }
        const token = jwt.sign({ admin: true }, envServer.JWT_SECRET, {
          expiresIn: '1d',
        });
        return res.status(200).json({ token, role: 'admin' });
      }

      const foundCode = foundCodes[0];
      await db
        .update(Codes)
        .set({ timesUsed: foundCode.timesUsed + 1, updatedAt: new Date() })
        .where(eq(Codes.id, foundCode.id));

      const token = jwt.sign({ code: foundCode.value }, envServer.JWT_SECRET, {
        expiresIn: '4h',
      });
      return res.status(200).json({ token, role: 'user' });
    }),
});
