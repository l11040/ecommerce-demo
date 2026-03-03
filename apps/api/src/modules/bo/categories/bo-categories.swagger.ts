import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  buildSuccessSchema,
  commonErrorSchema,
} from '../../../common/swagger/swagger-response.schema';

const categorySchema = {
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
};

function commonErrorDocs() {
  return [
    ApiBadRequestResponse({
      description: '요청 오류',
      schema: commonErrorSchema,
    }),
    ApiUnauthorizedResponse({
      description: '인증 실패',
      schema: commonErrorSchema,
    }),
    ApiForbiddenResponse({
      description: '권한 없음',
      schema: commonErrorSchema,
    }),
    ApiNotFoundResponse({
      description: '리소스 없음',
      schema: commonErrorSchema,
    }),
    ApiConflictResponse({
      description: '리소스 충돌',
      schema: commonErrorSchema,
    }),
    ApiInternalServerErrorResponse({
      description: '서버 오류',
      schema: commonErrorSchema,
    }),
  ];
}

export function BoCategoriesListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 카테고리 목록 조회' }),
    ApiOkResponse({
      description: '카테고리 목록 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: categorySchema,
      }),
    }),
    ...commonErrorDocs(),
  );
}

export function BoCategoriesCreateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 카테고리 생성 (최대 depth=4)' }),
    ApiOkResponse({
      description: '카테고리 생성 성공',
      schema: buildSuccessSchema(categorySchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoCategoriesUpdateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 카테고리 수정' }),
    ApiOkResponse({
      description: '카테고리 수정 성공',
      schema: buildSuccessSchema(categorySchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoCategoriesMainExposureDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 메인 노출 여부 변경' }),
    ApiOkResponse({
      description: '메인 노출 여부 변경 성공',
      schema: buildSuccessSchema(categorySchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoCategoriesDeleteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 카테고리 삭제' }),
    ApiOkResponse({
      description: '카테고리 삭제 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          id: { type: 'number', example: 42 },
          deleted: { type: 'boolean', example: true },
        },
        required: ['id', 'deleted'],
      }),
    }),
    ...commonErrorDocs(),
  );
}
