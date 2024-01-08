import { apiRoute, apiRouteOperation } from 'next-rest-framework';
import { z } from 'zod';

import { checkAdmin, checkUser } from '@/auth';
import { userRoleSchema } from '@/helpers/UserRole';
import { authDescription, emptyOptionsOperation } from '@/helpers/apiFramework';

const roleResultSchema = z.object({ role: userRoleSchema.optional() });

export default apiRoute({
  _checkOptions: emptyOptionsOperation,

  checkRole: apiRouteOperation({
    method: 'POST',
    openApiOperation: { description: authDescription, tags: ['auth'] },
  })
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
