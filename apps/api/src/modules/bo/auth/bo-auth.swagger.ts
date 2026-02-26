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
import { BoLoginDto } from './dto/bo-login.dto';

export function BoAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO username login (httpOnly cookie)' }),
    ApiBody({ type: BoLoginDto }),
    ApiOkResponse({
      description: '로그인 성공 (access/refresh 쿠키 발급)',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'bo' },
          loginType: { type: 'string', example: 'username' },
          user: {
            type: 'object',
            properties: {
              username: { type: 'string', example: 'test' },
            },
            required: ['username'],
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

export function BoAuthRefreshDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO refresh token rotation (httpOnly cookie)' }),
    ApiCookieAuth('bo_refresh_token'),
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

export function BoAuthMeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO 본인 정보 조회' }),
    ApiCookieAuth('bo_access_token'),
    ApiOkResponse({
      description: '본인 정보 조회 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'test' },
          displayName: { type: 'string', example: 'BO Test Admin' },
        },
        required: ['id', 'username', 'displayName'],
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
