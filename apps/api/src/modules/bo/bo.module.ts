import { Module } from '@nestjs/common';
import { BoController } from './bo.controller';
import { BoAuthController } from './auth/bo-auth.controller';
import { BoAuthService } from './auth/bo-auth.service';
import { AuthTokenService } from '../auth/auth-token.service';

@Module({
  controllers: [BoController, BoAuthController],
  providers: [BoAuthService, AuthTokenService],
})
export class BoModule {}
