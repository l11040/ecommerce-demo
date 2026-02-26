import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoController } from './fo.controller';
import { FoAuthController } from './auth/fo-auth.controller';
import { FoAuthService } from './auth/fo-auth.service';
import { AuthTokenService } from '../auth/auth-token.service';
import { FoUserEntity } from '../../database/entities/fo-user.entity';
import { FO_AUTH_REPOSITORY } from './auth/repositories/fo-auth.repository';
import { TypeOrmFoAuthRepository } from './auth/repositories/typeorm-fo-auth.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FoUserEntity])],
  controllers: [FoController, FoAuthController],
  providers: [
    FoAuthService,
    AuthTokenService,
    TypeOrmFoAuthRepository,
    {
      provide: FO_AUTH_REPOSITORY,
      useExisting: TypeOrmFoAuthRepository,
    },
  ],
})
export class FoModule {}
