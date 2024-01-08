import { docsApiRoute } from 'next-rest-framework';

export default docsApiRoute({
  docsConfig: { provider: 'swagger-ui' },
});
