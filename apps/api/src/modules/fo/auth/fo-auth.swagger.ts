import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
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
import { FoLoginDto } from './dto/fo-login.dto';
import { FoRefreshTokenDto } from './dto/fo-refresh-token.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';

const tokenPairDataSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', example: 'access.token.value' },
    refreshToken: { type: 'string', example: 'refresh.token.value' },
    accessTokenExpiresIn: { type: 'number', example: 900 },
    refreshTokenExpiresIn: { type: 'number', example: 1209600 },
  },
  required: [
    'accessToken',
    'refreshToken',
    'accessTokenExpiresIn',
    'refreshTokenExpiresIn',
  ],
};

export function FoAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO email login' }),
    ApiBody({ type: FoLoginDto }),
    ApiOkResponse({
      description: '로그인 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'fo' },
          loginType: { type: 'string', example: 'email' },
          user: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'user@example.com' },
            },
            required: ['email'],
          },
          ...tokenPairDataSchema.properties,
        },
        required: [
          'scope',
          'loginType',
          'user',
          ...tokenPairDataSchema.required,
        ],
      }),
    }),
    ApiBadRequestResponse({
      description: '요청 바디 오류',
      schema: commonErrorSchema,
    }),
    ApiUnauthorizedResponse({
      description: '인증 실패',
      schema: commonErrorSchema,
    }),
    ApiForbiddenResponse({
      description: '접근 권한 없음',
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
      description: '서버 에러',
      schema: commonErrorSchema,
    }),
  );
}

export function FoAuthSocialLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO social login (future-ready placeholder)' }),
    ApiBody({ type: FoSocialLoginDto }),
    ApiOkResponse({
      description: '소셜 로그인 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'fo' },
          loginType: { type: 'string', example: 'social' },
          provider: { type: 'string', example: 'google' },
          ...tokenPairDataSchema.properties,
        },
        required: [
          'scope',
          'loginType',
          'provider',
          ...tokenPairDataSchema.required,
        ],
      }),
    }),
    ApiBadRequestResponse({
      description: '요청 바디 오류',
      schema: commonErrorSchema,
    }),
    ApiUnauthorizedResponse({
      description: '인증 실패',
      schema: commonErrorSchema,
    }),
    ApiForbiddenResponse({
      description: '접근 권한 없음',
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
      description: '서버 에러',
      schema: commonErrorSchema,
    }),
  );
}

export function FoAuthRefreshDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO refresh token rotation' }),
    ApiBody({ type: FoRefreshTokenDto }),
    ApiOkResponse({
      description: '토큰 재발급 성공',
      schema: buildSuccessSchema(tokenPairDataSchema),
    }),
    ApiBadRequestResponse({
      description: '요청 바디 오류',
      schema: commonErrorSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'refresh token 검증 실패',
      schema: commonErrorSchema,
    }),
    ApiForbiddenResponse({
      description: '접근 권한 없음',
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
      description: '서버 에러',
      schema: commonErrorSchema,
    }),
  );
}
