import { Module } from '@nestjs/common';
import { FoController } from './fo.controller';
import { FoAuthController } from './auth/fo-auth.controller';
import { FoAuthService } from './auth/fo-auth.service';
import { AuthTokenService } from '../auth/auth-token.service';

@Module({
  controllers: [FoController, FoAuthController],
  providers: [FoAuthService, AuthTokenService],
})
export class FoModule {}
