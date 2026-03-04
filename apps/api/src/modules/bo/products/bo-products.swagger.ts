import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiConsumes,
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

const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 101 },
    storeId: { type: 'number', example: 1 },
    categoryId: { type: 'number', nullable: true, example: 1001 },
    name: { type: 'string', example: 'N트래블 엔보우 워시백' },
    slug: { type: 'string', example: 'ntravel-washbag-22x18x9' },
    status: { type: 'string', example: 'draft' },
    isVisible: { type: 'boolean', example: false },
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
      example: 'https://cdn.example.com/products/washbag/main.jpg',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'storeId',
    'categoryId',
    'name',
    'slug',
    'status',
    'isVisible',
    'moq',
    'moqInquiryOnly',
    'baseSupplyCost',
    'vatType',
    'vatRate',
    'isPrintable',
    'printMethod',
    'printArea',
    'proofLeadTimeDays',
    'thumbnailUrl',
    'createdAt',
    'updatedAt',
  ],
};

const quoteSchema = {
  type: 'object',
  properties: {
    target: { type: 'string', example: 'bo' },
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

const productDetailSchema = {
  type: 'object',
  properties: {
    ...productSchema.properties,
    descriptionHtml: { type: 'string', example: '<p>상품 상세</p>' },
    seo: {
      type: 'object',
      nullable: true,
    },
    media: {
      type: 'array',
      items: { type: 'object' },
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
      items: { type: 'object' },
    },
    specGroups: {
      type: 'array',
      items: { type: 'object' },
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
  },
};

const optionGroupsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      productId: { type: 'number', example: 101 },
      name: { type: 'string', example: '제품 색상 선택' },
      isRequired: { type: 'boolean', example: true },
      selectionType: { type: 'string', example: 'single' },
      sortOrder: { type: 'number', example: 0 },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 10 },
            label: { type: 'string', example: '그레이' },
            extraSupplyCost: { type: 'number', example: 0 },
            extraUnitPrice: { type: 'number', example: 0 },
            sortOrder: { type: 'number', example: 0 },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
    },
  },
};

const priceTiersSchema = {
  type: 'object',
  properties: {
    guest: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1001 },
          minQty: { type: 'number', example: 30 },
          marginRate: { type: 'number', example: 31 },
          unitPriceOverride: { type: 'number', nullable: true, example: null },
          computedUnitPrice: { type: 'number', example: 6075 },
          isActive: { type: 'boolean', example: true },
        },
      },
    },
    member: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 2001 },
          minQty: { type: 'number', example: 30 },
          marginRate: { type: 'number', example: 28 },
          unitPriceOverride: { type: 'number', nullable: true, example: null },
          computedUnitPrice: { type: 'number', example: 5850 },
          isActive: { type: 'boolean', example: true },
        },
      },
    },
  },
};

const specGroupsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      productId: { type: 'number', example: 101 },
      name: { type: 'string', example: '기본정보' },
      sortOrder: { type: 'number', example: 0 },
      specs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 10 },
            label: { type: 'string', example: '제품크기' },
            value: { type: 'string', example: '220 x 180 x 90 mm' },
            sortOrder: { type: 'number', example: 0 },
          },
        },
      },
    },
  },
};

const shippingTiersSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      minQty: { type: 'number', example: 30 },
      shippingFee: { type: 'number', example: 3000 },
      isActive: { type: 'boolean', example: true },
    },
  },
};

const mediaSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      type: { type: 'string', example: 'image' },
      sourceType: { type: 'string', example: 'internal' },
      url: {
        type: 'string',
        example: '/uploads/products/2026/03/03/1700000000000-xxxx.png',
      },
      altText: { type: 'string', nullable: true, example: '대표 이미지' },
      sortOrder: { type: 'number', example: 0 },
    },
  },
};

const tagsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      tag: { type: 'string', example: '판촉물' },
      sortOrder: { type: 'number', example: 0 },
    },
  },
};

const searchAliasesSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      aliasText: { type: 'string', example: '여행용 워시백' },
      sortOrder: { type: 'number', example: 0 },
    },
  },
};

const descriptionSchema = {
  type: 'object',
  properties: {
    productId: { type: 'number', example: 101 },
    descriptionHtmlRaw: { type: 'string', example: '<p>상품 상세 설명</p>' },
    descriptionHtmlSanitized: {
      type: 'string',
      example: '<p>상품 상세 설명</p>',
    },
    updatedByAdminId: { type: 'number', nullable: true, example: 1 },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const seoSchema = {
  type: 'object',
  properties: {
    productId: { type: 'number', example: 101 },
    metaTitle: { type: 'string', nullable: true, example: 'N트래블 워시백' },
    metaDescription: {
      type: 'string',
      nullable: true,
      example: 'N트래블 엔보우 워시백 상품 상세',
    },
    metaKeywords: {
      type: 'string',
      nullable: true,
      example: '워시백,판촉물,굿즈',
    },
    canonicalUrl: {
      type: 'string',
      nullable: true,
      example: 'https://example.com/products/ntravel-washbag',
    },
    robots: { type: 'string', nullable: true, example: 'index,follow' },
    ogTitle: {
      type: 'string',
      nullable: true,
      example: 'N트래블 워시백 OG 제목',
    },
    ogDescription: {
      type: 'string',
      nullable: true,
      example: 'N트래블 워시백 OG 설명',
    },
    ogImage: {
      type: 'string',
      nullable: true,
      example: 'https://cdn.example.com/products/washbag/og-image.jpg',
    },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const uploadImageSchema = {
  type: 'object',
  properties: {
    path: {
      type: 'string',
      example: '/uploads/products/2026/03/03/1700000000000-xxxx.png',
    },
    url: {
      type: 'string',
      example: '/uploads/products/2026/03/03/1700000000000-xxxx.png',
    },
    filename: { type: 'string', example: '1700000000000-xxxx.png' },
    mimeType: { type: 'string', example: 'image/png' },
    size: { type: 'number', example: 128340 },
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

export function BoProductsCreateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 생성' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 생성 성공',
      schema: buildSuccessSchema(productSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsUpdateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 기본정보 수정' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 기본정보 수정 성공',
      schema: buildSuccessSchema(productSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsUpdateStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 상태 수정' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 상태 수정 성공',
      schema: buildSuccessSchema(productSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 목록 조회' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 목록 조회 성공',
      schema: buildSuccessSchema({
        type: 'array',
        items: productSchema,
      }),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsDetailDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 상세 조회' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 상세 조회 성공',
      schema: buildSuccessSchema(productDetailSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsQuotePreviewDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 견적 미리보기' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '견적 계산 성공',
      schema: buildSuccessSchema(quoteSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceOptionsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 옵션 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '옵션 저장 성공',
      schema: buildSuccessSchema(optionGroupsSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplacePriceTiersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 수량별 가격 티어 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '가격 티어 저장 성공',
      schema: buildSuccessSchema(priceTiersSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceSpecsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 스펙 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '스펙 저장 성공',
      schema: buildSuccessSchema(specGroupsSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceShippingTiersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 배송비 티어 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '배송비 티어 저장 성공',
      schema: buildSuccessSchema(shippingTiersSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceMediaDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 미디어 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 미디어 저장 성공',
      schema: buildSuccessSchema(mediaSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceTagsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 태그 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 태그 저장 성공',
      schema: buildSuccessSchema(tagsSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceSearchAliasesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 검색 별칭 전체 교체 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 검색 별칭 저장 성공',
      schema: buildSuccessSchema(searchAliasesSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceDescriptionDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 상세 HTML 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '상품 상세 저장 성공',
      schema: buildSuccessSchema(descriptionSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsReplaceSeoDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 SEO 저장' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: 'SEO 저장 성공',
      schema: buildSuccessSchema(seoSchema),
    }),
    ...commonErrorDocs(),
  );
}

export function BoProductsUploadImageDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 상품 이미지 업로드' }),
    ApiCookieAuth('bo_access_token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['file'],
      },
    }),
    ApiOkResponse({
      description: '이미지 업로드 성공',
      schema: buildSuccessSchema(uploadImageSchema),
    }),
    ...commonErrorDocs(),
  );
}
