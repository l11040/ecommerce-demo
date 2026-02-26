import { Module } from '@nestjs/common';
import { BoController } from './bo.controller';

@Module({
  controllers: [BoController],
})
export class BoModule {}
