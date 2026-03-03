import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  buildSuccessSchema,
  commonErrorSchema,
} from '../../../common/swagger/swagger-response.schema';

const categoryNodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 1 },
    parentId: { type: 'number', nullable: true, example: null },
    depth: { type: 'number', example: 1 },
    path: { type: 'string', example: '1' },
    name: { type: 'string', example: 'Electronics' },
    slug: { type: 'string', example: 'electronics' },
    sortOrder: { type: 'number', example: 0 },
    isActive: { type: 'boolean', example: true },
    isVisible: { type: 'boolean', example: true },
    isMainExposed: { type: 'boolean', example: true },
    children: {
      type: 'array',
      items: { type: 'object' },
    },
  },
  required: [
    'id',
    'parentId',
    'depth',
    'path',
    'name',
    'slug',
    'sortOrder',
    'isActive',
    'isVisible',
    'isMainExposed',
    'children',
  ],
};

export function FoCategoriesTreeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO 카테고리 트리 조회' }),
    ApiOkResponse({
      description: '카테고리 트리 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: categoryNodeSchema,
      }),
    }),
    ApiInternalServerErrorResponse({
      description: '서버 에러',
      schema: commonErrorSchema,
    }),
  );
}

export function FoCategoriesMainDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO 메인 노출 카테고리 조회' }),
    ApiOkResponse({
      description: '메인 노출 카테고리 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            parentId: { type: 'number', nullable: true, example: null },
            depth: { type: 'number', example: 1 },
            path: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Electronics' },
            slug: { type: 'string', example: 'electronics' },
            sortOrder: { type: 'number', example: 0 },
            isActive: { type: 'boolean', example: true },
            isVisible: { type: 'boolean', example: true },
            isMainExposed: { type: 'boolean', example: true },
          },
          required: [
            'id',
            'parentId',
            'depth',
            'path',
            'name',
            'slug',
            'sortOrder',
            'isActive',
            'isVisible',
            'isMainExposed',
          ],
        },
      }),
    }),
    ApiInternalServerErrorResponse({
      description: '서버 에러',
      schema: commonErrorSchema,
    }),
  );
}
