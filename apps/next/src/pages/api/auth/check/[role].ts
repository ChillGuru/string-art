import { apiRouteHandler, apiRouteOperation } from 'next-rest-framework';
import { z } from 'zod';

import { checkAdmin, checkUser } from '@/auth';
import { emptyOptionsOperation, getApiDesc } from '@/helpers/apiFramework';
import { userRoleSchema } from '@/helpers/UserRole';

export default apiRouteHandler({
  OPTIONS: emptyOptionsOperation,

  POST: apiRouteOperation(
    getApiDesc({ operationId: 'hasRole', tags: ['auth'] })
  )
    .input({
      query: z.object({ role: userRoleSchema.optional() }),
    })
    .outputs([
      { status: 200, contentType: 'text/plain', schema: z.string() },
      { status: 403, contentType: 'text/plain', schema: z.string() },
    ])
    .handler((req, res) => {
      const { role } = req.query;
      const isAllowed = (() => {
        switch (role) {
          case 'admin': {
            return checkAdmin(req);
          }
          case 'user': {
            return checkUser(req);
          }
          default: {
            return false;
          }
        }
      })();
      if (isAllowed) {
        return res.send('OK');
      }
      return res.status(403).send('Forbidden');
    }),
});
