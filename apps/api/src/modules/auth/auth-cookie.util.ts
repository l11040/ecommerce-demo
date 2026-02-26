import { Request, Response, CookieOptions } from 'express';
import { TokenPair } from './auth-token.service';

const isProduction = process.env.NODE_ENV === 'production';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  path: '/',
};

export const foCookieNames = {
  access: 'fo_access_token',
  refresh: 'fo_refresh_token',
};

export const boCookieNames = {
  access: 'bo_access_token',
  refresh: 'bo_refresh_token',
};

export function setFoTokenCookies(
  response: Response,
  tokenPair: TokenPair,
): void {
  setTokenCookies(
    response,
    foCookieNames.access,
    foCookieNames.refresh,
    tokenPair,
  );
}

export function setBoTokenCookies(
  response: Response,
  tokenPair: TokenPair,
): void {
  setTokenCookies(
    response,
    boCookieNames.access,
    boCookieNames.refresh,
    tokenPair,
  );
}

export function getCookieFromRequest(
  request: Request,
  name: string,
): string | undefined {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookiePart = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookiePart) {
    return undefined;
  }

  return decodeURIComponent(cookiePart.slice(name.length + 1));
}

export function getBearerTokenFromRequest(
  request: Request,
): string | undefined {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }

  const token = authorization.slice('Bearer '.length).trim();

  return token || undefined;
}

function setTokenCookies(
  response: Response,
  accessCookieName: string,
  refreshCookieName: string,
  tokenPair: TokenPair,
): void {
  response.cookie(accessCookieName, tokenPair.accessToken, {
    ...baseCookieOptions,
    maxAge: tokenPair.accessTokenExpiresIn * 1000,
  });

  response.cookie(refreshCookieName, tokenPair.refreshToken, {
    ...baseCookieOptions,
    maxAge: tokenPair.refreshTokenExpiresIn * 1000,
  });
}
