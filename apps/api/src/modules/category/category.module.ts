import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../database/entities/category.entity';
import { CategoryService } from './category.service';
import { CATEGORY_REPOSITORY } from './repositories/category.repository';
import { TypeOrmCategoryRepository } from './repositories/typeorm-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  providers: [
    CategoryService,
    TypeOrmCategoryRepository,
    {
      provide: CATEGORY_REPOSITORY,
      useExisting: TypeOrmCategoryRepository,
    },
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
