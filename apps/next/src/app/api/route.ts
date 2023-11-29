import { docsRouteHandler } from 'next-rest-framework';

export const GET = docsRouteHandler({
  docsConfig: { provider: 'swagger-ui' },
});
