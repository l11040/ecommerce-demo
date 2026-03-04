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

const productDetailSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 101 },
    storeId: { type: 'number', example: 1 },
    categoryId: { type: 'number', nullable: true, example: 1001 },
    name: { type: 'string', example: 'N트래블 엔보우 워시백' },
    slug: { type: 'string', example: 'ntravel-washbag-22x18x9' },
    status: { type: 'string', example: 'published' },
    isVisible: { type: 'boolean', example: true },
    moq: { type: 'number', example: 30 },
    moqInquiryOnly: { type: 'boolean', example: false },
    baseSupplyCost: { type: 'number', example: 4200 },
    vatType: { type: 'string', example: 'exclusive' },
    vatRate: { type: 'number', example: 10 },
    isPrintable: { type: 'boolean', example: true },
    printMethod: { type: 'string', nullable: true, example: '실크 1도 인쇄' },
    printArea: { type: 'string', nullable: true, example: '80 x 70 mm' },
    proofLeadTimeDays: { type: 'number', nullable: true, example: 4 },
    thumbnailUrl: {
      type: 'string',
      nullable: true,
      example: '/uploads/products/washbag-main.jpg',
    },
    media: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          type: { type: 'string', example: 'image' },
          sourceType: { type: 'string', example: 'internal' },
          url: {
            type: 'string',
            example: '/uploads/products/washbag-gray.jpg',
          },
          altText: { type: 'string', nullable: true, example: '워시백 그레이' },
          sortOrder: { type: 'number', example: 0 },
        },
      },
    },
    descriptionHtml: { type: 'string', example: '<p>상품 상세</p>' },
    seo: {
      type: 'object',
      nullable: true,
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    searchAliases: {
      type: 'array',
      items: { type: 'string' },
    },
    optionGroups: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
    specGroups: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
    priceTiers: {
      type: 'object',
      properties: {
        guest: { type: 'array', items: { type: 'object' } },
        member: { type: 'array', items: { type: 'object' } },
      },
    },
    shippingTiers: {
      type: 'array',
      items: { type: 'object' },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const productListItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 101 },
    storeId: { type: 'number', example: 1 },
    categoryId: { type: 'number', nullable: true, example: 1001 },
    name: { type: 'string', example: 'N트래블 엔보우 워시백' },
    slug: { type: 'string', example: 'ntravel-washbag-22x18x9' },
    moq: { type: 'number', example: 30 },
    moqInquiryOnly: { type: 'boolean', example: false },
    vatType: { type: 'string', example: 'exclusive' },
    vatRate: { type: 'number', example: 10 },
    isPrintable: { type: 'boolean', example: true },
    printMethod: { type: 'string', nullable: true, example: '실크 1도 인쇄' },
    printArea: { type: 'string', nullable: true, example: '80 x 70 mm' },
    proofLeadTimeDays: { type: 'number', nullable: true, example: 4 },
    thumbnailUrl: {
      type: 'string',
      nullable: true,
      example: '/uploads/products/washbag-main.jpg',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const quoteSchema = {
  type: 'object',
  properties: {
    target: { type: 'string', example: 'fo' },
    productId: { type: 'number', example: 101 },
    productName: { type: 'string', example: 'N트래블 엔보우 워시백' },
    customerSegment: { type: 'string', example: 'guest' },
    quantity: { type: 'number', example: 3000 },
    moq: { type: 'number', example: 30 },
    vatType: { type: 'string', example: 'exclusive' },
    vatRate: { type: 'number', example: 10 },
    appliedTier: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        minQty: { type: 'number', example: 3000 },
        marginRate: { type: 'number', example: 25 },
        unitPrice: { type: 'number', example: 5085 },
      },
    },
    selectedOptionItemIds: {
      type: 'array',
      items: { type: 'number' },
      example: [10, 12],
    },
    optionAdjustmentUnitPrice: { type: 'number', example: 0 },
    optionAdjustmentSupplyCost: { type: 'number', example: 0 },
    unitPrice: { type: 'number', example: 5085 },
    supplyUnitCost: { type: 'number', example: 4200 },
    supplyTotal: { type: 'number', example: 12600000 },
    subtotalExVat: { type: 'number', example: 15255000 },
    vatAmount: { type: 'number', example: 1525500 },
    shippingFee: { type: 'number', example: 0 },
    totalAmount: { type: 'number', example: 16780500 },
    estimatedMargin: { type: 'number', example: 2655000 },
  },
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

export function FoProductsListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'FO 상품 목록 조회' }),
    ApiOkResponse({
      description: '상품 목록 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: productListItemSchema,
      }),
    }),
    ...commonErrorDocs(),
  ) as MethodDecorator;
}

export function FoStoreProductsListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'FO 스토어별 상품 목록 조회' }),
    ApiOkResponse({
      description: '스토어 상품 목록 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: productListItemSchema,
      }),
    }),
    ...commonErrorDocs(),
  ) as MethodDecorator;
}

export function FoProductsDetailDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'FO 상품 상세 조회' }),
    ApiOkResponse({
      description: '상품 상세 조회 성공',
      schema: buildSuccessSchema(productDetailSchema),
    }),
    ...commonErrorDocs(),
  ) as MethodDecorator;
}

export function FoProductsQuoteDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'FO 상품 견적 계산' }),
    ApiOkResponse({
      description: '견적 계산 성공',
      schema: buildSuccessSchema(quoteSchema),
    }),
    ...commonErrorDocs(),
  ) as MethodDecorator;
}
