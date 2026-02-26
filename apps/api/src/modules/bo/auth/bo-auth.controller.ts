import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoAuthService } from './bo-auth.service';
import { BoLoginDto } from './dto/bo-login.dto';
import { BoRefreshTokenDto } from './dto/bo-refresh-token.dto';

@ApiTags('BO Auth')
@Controller('bo/auth')
export class BoAuthController {
  constructor(private readonly boAuthService: BoAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'BO username login' })
  login(@Body() payload: BoLoginDto) {
    return this.boAuthService.login(payload);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'BO refresh token rotation' })
  refresh(@Body() payload: BoRefreshTokenDto) {
    return this.boAuthService.refresh(payload);
  }
}
