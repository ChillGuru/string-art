import { docsApiRouteHandler } from 'next-rest-framework';

export default docsApiRouteHandler({
  docsConfig: { provider: 'swagger-ui' },
});
