import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoController } from './bo.controller';
import { BoAuthController } from './auth/bo-auth.controller';
import { BoAuthService } from './auth/bo-auth.service';
import { AuthTokenService } from '../auth/auth-token.service';
import { BoAdminEntity } from '../../database/entities/bo-admin.entity';
import { BO_AUTH_REPOSITORY } from './auth/repositories/bo-auth.repository';
import { TypeOrmBoAuthRepository } from './auth/repositories/typeorm-bo-auth.repository';
import { CategoryModule } from '../category/category.module';
import { BoCategoriesController } from './categories/bo-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BoAdminEntity]), CategoryModule],
  controllers: [BoController, BoAuthController, BoCategoriesController],
  providers: [
    BoAuthService,
    AuthTokenService,
    TypeOrmBoAuthRepository,
    {
      provide: BO_AUTH_REPOSITORY,
      useExisting: TypeOrmBoAuthRepository,
    },
  ],
})
export class BoModule {}
