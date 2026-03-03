import { CategoryEntity } from '../../../database/entities/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface CategoryListFilter {
  parentId?: number;
  depth?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isMainExposed?: boolean;
}

export interface CategoryRepository {
  findById(id: number): Promise<CategoryEntity | null>;
  findAll(filter?: CategoryListFilter): Promise<CategoryEntity[]>;
  findMainExposed(): Promise<CategoryEntity[]>;
  hasChildren(id: number): Promise<boolean>;
  existsSiblingSlug(
    parentId: number | null,
    slug: string,
    excludeId?: number,
  ): Promise<boolean>;
  create(data: Partial<CategoryEntity>): Promise<CategoryEntity>;
  update(id: number, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
}
