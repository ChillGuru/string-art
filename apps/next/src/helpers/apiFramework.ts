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

export function getOperationDesc(
  operationDesc: Partial<OpenApiOperation>
): OpenApiOperation {
  return { ...emptyOperationDesc, ...operationDesc } satisfies OpenApiOperation;
}

const stringSchema = z.string();
export const emptyOptionsOperation = apiRouteOperation(
  getOperationDesc({ tags: ['options'] })
)
  .outputs([{ status: 200, contentType: 'text/plain', schema: stringSchema }])
  .handler((req, res) => res.send(''));
