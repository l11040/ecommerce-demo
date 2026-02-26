import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FoAuthService } from './fo-auth.service';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
import { FoRefreshTokenDto } from './dto/fo-refresh-token.dto';

@ApiTags('FO Auth')
@Controller('fo/auth')
export class FoAuthController {
  constructor(private readonly foAuthService: FoAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'FO email login' })
  login(@Body() payload: FoLoginDto) {
    return this.foAuthService.login(payload);
  }

  @Post('social-login')
  @ApiOperation({ summary: 'FO social login (future-ready placeholder)' })
  socialLogin(@Body() payload: FoSocialLoginDto) {
    return this.foAuthService.socialLogin(payload);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'FO refresh token rotation' })
  refresh(@Body() payload: FoRefreshTokenDto) {
    return this.foAuthService.refresh(payload);
  }
}
