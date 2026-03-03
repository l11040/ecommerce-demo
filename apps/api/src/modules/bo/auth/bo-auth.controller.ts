import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BoAuthService } from './bo-auth.service';
import { BoLoginDto } from './dto/bo-login.dto';
import {
  BoAuthLogoutDocs,
  BoAuthLoginDocs,
  BoAuthMeDocs,
  BoAuthRefreshDocs,
} from './bo-auth.swagger';
import {
  boCookieNames,
  clearBoTokenCookies,
  getBearerTokenFromRequest,
  getCookieFromRequest,
  setBoTokenCookies,
} from '../../auth/auth-cookie.util';

@ApiTags('BO Auth')
@Controller('bo/auth')
export class BoAuthController {
  constructor(private readonly boAuthService: BoAuthService) {}

  @Post('login')
  @BoAuthLoginDocs()
  async login(
    @Body() payload: BoLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.boAuthService.login(payload);
    setBoTokenCookies(response, result.tokenPair);
    return result.data;
  }

  @Post('refresh')
  @BoAuthRefreshDocs()
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookieFromRequest(request, boCookieNames.refresh);
    const tokenPair = this.boAuthService.refresh(refreshToken ?? '');
    setBoTokenCookies(response, tokenPair);
    return { refreshed: true };
  }

  @Get('me')
  @BoAuthMeDocs()
  me(@Req() request: Request) {
    const accessToken =
      getCookieFromRequest(request, boCookieNames.access) ??
      getBearerTokenFromRequest(request);
    return this.boAuthService.me(accessToken);
  }

  @Post('logout')
  @BoAuthLogoutDocs()
  logout(@Res({ passthrough: true }) response: Response) {
    clearBoTokenCookies(response);
    return { loggedOut: true };
  }
}
