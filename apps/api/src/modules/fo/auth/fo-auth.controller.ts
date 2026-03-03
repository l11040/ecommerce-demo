import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { FoAuthService } from './fo-auth.service';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
import {
  FoAuthLoginDocs,
  FoAuthMeDocs,
  FoAuthRefreshDocs,
  FoAuthSocialLoginDocs,
} from './fo-auth.swagger';
import {
  foCookieNames,
  getBearerTokenFromRequest,
  getCookieFromRequest,
  setFoTokenCookies,
} from '../../auth/auth-cookie.util';

@ApiTags('FO Auth')
@Controller('fo/auth')
export class FoAuthController {
  constructor(private readonly foAuthService: FoAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @FoAuthLoginDocs()
  async login(
    @Body() payload: FoLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.foAuthService.login(payload);
    setFoTokenCookies(response, result.tokenPair);
    return result.data;
  }

  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @FoAuthSocialLoginDocs()
  socialLogin(
    @Body() payload: FoSocialLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = this.foAuthService.socialLogin(payload);
    setFoTokenCookies(response, result.tokenPair);
    return result.data;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @FoAuthRefreshDocs()
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookieFromRequest(request, foCookieNames.refresh);
    const tokenPair = this.foAuthService.refresh(refreshToken ?? '');
    setFoTokenCookies(response, tokenPair);
    return { refreshed: true };
  }

  @Get('me')
  @FoAuthMeDocs()
  me(@Req() request: Request) {
    const accessToken =
      getCookieFromRequest(request, foCookieNames.access) ??
      getBearerTokenFromRequest(request);
    return this.foAuthService.me(accessToken);
  }
}
