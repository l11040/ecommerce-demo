import { Module } from '@nestjs/common';
import { FoController } from './fo.controller';

@Module({
  controllers: [FoController],
})
export class FoModule {}
