import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmModuleOptions } from './config/typeorm.config';
import { FoModule } from './modules/fo/fo.module';
import { BoModule } from './modules/bo/bo.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), FoModule, BoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
