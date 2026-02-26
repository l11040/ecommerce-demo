import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export type SwaggerResponseSchema = SchemaObject & Partial<ReferenceObject>;

export function buildSuccessSchema(
  dataSchema: SwaggerResponseSchema,
): SwaggerResponseSchema {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      code: { type: 'string', example: 'COMMON_OK' },
      message: { type: 'string', example: 'OK' },
      data: dataSchema,
    },
    required: ['success', 'code', 'message', 'data'],
  };
}

export const commonErrorSchema: SwaggerResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    code: { type: 'string', example: 'COMMON_UNAUTHORIZED' },
    message: { type: 'string', example: 'Unauthorized' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'password' },
          reason: { type: 'string', example: 'INVALID' },
        },
      } as SchemaObject,
    },
    meta: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          example: '4c9888e9-9f69-4d7a-b997-fca6fdb73ed8',
        },
      },
    },
  },
  required: ['success', 'code', 'message', 'meta'],
};
