import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
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
import { FoSocialLoginDto } from './dto/fo-social-login.dto';

export function FoAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO email login (httpOnly cookie)' }),
    ApiBody({ type: FoLoginDto }),
    ApiOkResponse({
      description: '로그인 성공 (access/refresh 쿠키 발급)',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'fo' },
          loginType: { type: 'string', example: 'email' },
          user: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'test@test.test' },
            },
            required: ['email'],
          },
        },
        required: ['scope', 'loginType', 'user'],
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
      description: '소셜 로그인 성공 (access/refresh 쿠키 발급)',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'fo' },
          loginType: { type: 'string', example: 'social' },
          provider: { type: 'string', example: 'google' },
        },
        required: ['scope', 'loginType', 'provider'],
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
    ApiOperation({ summary: 'FO refresh token rotation (httpOnly cookie)' }),
    ApiCookieAuth('fo_refresh_token'),
    ApiOkResponse({
      description: '토큰 재발급 성공 (쿠키 갱신)',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          refreshed: { type: 'boolean', example: true },
        },
        required: ['refreshed'],
      }),
    }),
    ApiBadRequestResponse({
      description: '요청 오류',
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

export function FoAuthMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'FO 본인 정보 조회' }),
    ApiCookieAuth('fo_access_token'),
    ApiOkResponse({
      description: '본인 정보 조회 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          email: { type: 'string', example: 'test@test.test' },
          displayName: { type: 'string', example: 'FO Test User' },
        },
        required: ['id', 'email', 'displayName'],
      }),
    }),
    ApiBadRequestResponse({
      description: '요청 오류',
      schema: commonErrorSchema,
    }),
    ApiUnauthorizedResponse({
      description: '토큰 검증 실패',
      schema: commonErrorSchema,
    }),
    ApiForbiddenResponse({
      description: '접근 권한 없음',
      schema: commonErrorSchema,
    }),
    ApiNotFoundResponse({
      description: '사용자 없음',
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
