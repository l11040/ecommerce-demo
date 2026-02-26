import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoAuthService } from './fo-auth.service';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
import { FoRefreshTokenDto } from './dto/fo-refresh-token.dto';
import {
  FoAuthLoginDocs,
  FoAuthRefreshDocs,
  FoAuthSocialLoginDocs,
} from './fo-auth.swagger';

@ApiTags('FO Auth')
@Controller('fo/auth')
export class FoAuthController {
  constructor(private readonly foAuthService: FoAuthService) {}

  @Post('login')
  @FoAuthLoginDocs()
  login(@Body() payload: FoLoginDto) {
    return this.foAuthService.login(payload);
  }

  @Post('social-login')
  @FoAuthSocialLoginDocs()
  socialLogin(@Body() payload: FoSocialLoginDto) {
    return this.foAuthService.socialLogin(payload);
  }

  @Post('refresh')
  @FoAuthRefreshDocs()
  refresh(@Body() payload: FoRefreshTokenDto) {
    return this.foAuthService.refresh(payload);
  }
}
