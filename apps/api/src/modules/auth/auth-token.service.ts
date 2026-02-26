import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomUUID } from 'node:crypto';

type TokenType = 'access' | 'refresh';
type AuthScope = 'fo' | 'bo';

export interface AuthTokenPayload {
  type: TokenType;
  scope: AuthScope;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

const TOKEN_SECRET = 'ecommerce-demo-static-auth-secret';
const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14;

@Injectable()
export class AuthTokenService {
  issueTokenPair(scope: AuthScope, subject: string): TokenPair {
    return {
      accessToken: this.signToken(
        'access',
        scope,
        subject,
        ACCESS_TOKEN_TTL_SECONDS,
      ),
      refreshToken: this.signToken(
        'refresh',
        scope,
        subject,
        REFRESH_TOKEN_TTL_SECONDS,
      ),
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
    };
  }

  rotateRefreshToken(scope: AuthScope, refreshToken: string): TokenPair {
    const payload = this.verifyToken(refreshToken, 'refresh');

    if (payload.scope !== scope) {
      throw new UnauthorizedException('Invalid token scope');
    }

    return this.issueTokenPair(scope, payload.sub);
  }

  verifyAccessToken(scope: AuthScope, accessToken: string): AuthTokenPayload {
    const payload = this.verifyToken(accessToken, 'access');

    if (payload.scope !== scope) {
      throw new UnauthorizedException('Invalid token scope');
    }

    return payload;
  }

  private signToken(
    type: TokenType,
    scope: AuthScope,
    subject: string,
    ttlSeconds: number,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      type,
      scope,
      sub: subject,
      iat: now,
      exp: now + ttlSeconds,
      jti: randomUUID(),
    };

    const payloadPart = this.toBase64Url(JSON.stringify(payload));
    const signature = this.sign(payloadPart);

    return `${payloadPart}.${signature}`;
  }

  private verifyToken(
    token: string,
    expectedType: TokenType,
  ): AuthTokenPayload {
    const [payloadPart, signature] = token.split('.');

    if (!payloadPart || !signature) {
      throw new UnauthorizedException('Malformed token');
    }

    const expectedSignature = this.sign(payloadPart);

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(
      this.fromBase64Url(payloadPart),
    ) as AuthTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      throw new UnauthorizedException('Expired token');
    }

    if (payload.type !== expectedType) {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private sign(value: string): string {
    return createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
  }

  private toBase64Url(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private fromBase64Url(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
  }
}
