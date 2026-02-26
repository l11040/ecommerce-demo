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
import { BoLoginDto } from './dto/bo-login.dto';
import { BoRefreshTokenDto } from './dto/bo-refresh-token.dto';

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

export function BoAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO username login' }),
    ApiBody({ type: BoLoginDto }),
    ApiOkResponse({
      description: '로그인 성공',
      schema: buildSuccessSchema({
        type: 'object',
        properties: {
          scope: { type: 'string', example: 'bo' },
          loginType: { type: 'string', example: 'username' },
          user: {
            type: 'object',
            properties: {
              username: { type: 'string', example: 'admin_master' },
            },
            required: ['username'],
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

export function BoAuthRefreshDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'BO refresh token rotation' }),
    ApiBody({ type: BoRefreshTokenDto }),
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
