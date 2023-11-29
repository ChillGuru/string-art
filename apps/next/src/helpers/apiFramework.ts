import { apiRouteOperation } from 'next-rest-framework';
import { OpenApiOperation } from 'next-rest-framework/dist/types';
import { z } from 'zod';

const emptyOperationDesc = {
  operationId: '',
  tags: [],
  description: '',
  summary: '',
  externalDocs: '',
  deprecated: false,
  parameters: '',
  callbacks: '',
  security: '',
  servers: '',
} satisfies OpenApiOperation;

export function getApiDesc(
  operationDesc: Partial<OpenApiOperation>
): OpenApiOperation {
  return { ...emptyOperationDesc, ...operationDesc } satisfies OpenApiOperation;
}

export const emptyOptionsOperation = apiRouteOperation(
  getApiDesc({ tags: ['_options'] })
)
  .outputs([{ status: 200, contentType: 'text/plain', schema: z.string() }])
  .handler((req, res) => res.send(''));
