import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CategoryEntity } from '../../../database/entities/category.entity';
import { CategoryListFilter, CategoryRepository } from './category.repository';

@Injectable()
export class TypeOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  findById(id: number): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  findAll(filter?: CategoryListFilter): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      where: {
        ...(filter?.parentId !== undefined
          ? { parentId: filter.parentId }
          : {}),
        ...(filter?.depth !== undefined ? { depth: filter.depth } : {}),
        ...(filter?.isActive !== undefined
          ? { isActive: filter.isActive }
          : {}),
        ...(filter?.isVisible !== undefined
          ? { isVisible: filter.isVisible }
          : {}),
        ...(filter?.isMainExposed !== undefined
          ? { isMainExposed: filter.isMainExposed }
          : {}),
      },
      order: {
        depth: 'ASC',
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  findMainExposed(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      where: {
        isActive: true,
        isVisible: true,
        isMainExposed: true,
      },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  async hasChildren(id: number): Promise<boolean> {
    const count = await this.categoryRepository.count({
      where: {
        parentId: id,
      },
    });

    return count > 0;
  }

  async existsSiblingSlug(
    parentId: number | null,
    slug: string,
    excludeId?: number,
  ): Promise<boolean> {
    const where = {
      parentId: parentId === null ? IsNull() : parentId,
      slug,
      ...(excludeId ? { id: Not(excludeId) } : {}),
    };

    const count = await this.categoryRepository.count({ where });
    return count > 0;
  }

  create(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    await this.categoryRepository.update(id, data);
    return this.categoryRepository.findOneByOrFail({ id });
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
