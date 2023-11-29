import { apiRouteHandler, apiRouteOperation } from 'next-rest-framework';
import { z } from 'zod';

import { checkAdmin, checkUser } from '@/auth';
import { userRoleSchema } from '@/helpers/UserRole';
import { emptyOptionsOperation, getApiDesc } from '@/helpers/apiFramework';

const roleResultSchema = z.object({ role: userRoleSchema.optional() });

export default apiRouteHandler({
  OPTIONS: emptyOptionsOperation,

  POST: apiRouteOperation(
    getApiDesc({ operationId: 'checkRole', tags: ['auth'] })
  )
    .outputs([
      {
        status: 200,
        contentType: 'application/json',
        schema: roleResultSchema,
      },
    ])
    .handler((req, res) => {
      switch (true) {
        case checkAdmin(req):
          return res.json({ role: 'admin' });
        case checkUser(req):
          return res.json({ role: 'user' });
        default:
          return res.json({ role: undefined });
      }
    }),
});
