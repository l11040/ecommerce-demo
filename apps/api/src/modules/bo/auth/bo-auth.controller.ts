import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BoAuthService } from './bo-auth.service';
import { BoLoginDto } from './dto/bo-login.dto';
import { BoRefreshTokenDto } from './dto/bo-refresh-token.dto';
import { BoAuthLoginDocs, BoAuthRefreshDocs } from './bo-auth.swagger';

@ApiTags('BO Auth')
@Controller('bo/auth')
export class BoAuthController {
  constructor(private readonly boAuthService: BoAuthService) {}

  @Post('login')
  @BoAuthLoginDocs()
  login(@Body() payload: BoLoginDto) {
    return this.boAuthService.login(payload);
  }

  @Post('refresh')
  @BoAuthRefreshDocs()
  refresh(@Body() payload: BoRefreshTokenDto) {
    return this.boAuthService.refresh(payload);
  }
}
