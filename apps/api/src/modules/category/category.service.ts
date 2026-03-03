import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryEntity } from '../../database/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryListFilter,
} from './repositories/category.repository';
import type { CategoryRepository } from './repositories/category.repository';

interface CreateCategoryInput {
  parentId?: number;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isMainExposed?: boolean;
}

interface UpdateCategoryInput {
  parentId?: number | null;
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isMainExposed?: boolean;
}

export interface CategoryTreeNode {
  id: number;
  parentId: number | null;
  depth: number;
  path: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  isMainExposed: boolean;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const normalizedSlug = this.normalizeSlug(input.slug);
    const parent = await this.resolveParent(input.parentId);

    const duplicate = await this.categoryRepository.existsSiblingSlug(
      parent?.id ?? null,
      normalizedSlug,
    );

    if (duplicate) {
      throw new ConflictException('Category slug already exists in same level');
    }

    const created = await this.categoryRepository.create({
      parentId: parent?.id ?? null,
      depth: parent ? parent.depth + 1 : 1,
      path: 'pending',
      name: input.name,
      slug: normalizedSlug,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      isVisible: input.isVisible ?? true,
      isMainExposed: input.isMainExposed ?? false,
    });

    const path = parent ? `${parent.path}.${created.id}` : `${created.id}`;
    return this.categoryRepository.update(created.id, { path });
  }

  async update(
    id: number,
    input: UpdateCategoryInput,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const nextParent =
      input.parentId !== undefined
        ? await this.resolveParent(input.parentId)
        : category.parentId
          ? await this.categoryRepository.findById(category.parentId)
          : null;
    const nextParentId = nextParent?.id ?? null;

    if (nextParentId === category.id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const allCategories = await this.categoryRepository.findAll();
    const descendants = allCategories.filter((candidate) =>
      candidate.path.startsWith(`${category.path}.`),
    );
    const descendantIdSet = new Set(
      descendants.map((descendant) => descendant.id),
    );
    descendantIdSet.add(category.id);

    if (nextParent && descendantIdSet.has(nextParent.id)) {
      throw new BadRequestException('Category parent cannot be a descendant');
    }

    const subtreeDepthOffset = descendants.reduce(
      (maxOffset, descendant) =>
        Math.max(maxOffset, descendant.depth - category.depth),
      0,
    );

    const nextDepth = nextParent ? nextParent.depth + 1 : 1;

    if (nextDepth + subtreeDepthOffset > 4) {
      throw new BadRequestException('Category depth cannot exceed 4');
    }

    const nextSlug = input.slug
      ? this.normalizeSlug(input.slug)
      : category.slug;

    if (nextSlug !== category.slug || nextParentId !== category.parentId) {
      const duplicate = await this.categoryRepository.existsSiblingSlug(
        nextParentId,
        nextSlug,
        category.id,
      );

      if (duplicate) {
        throw new ConflictException(
          'Category slug already exists in same level',
        );
      }
    }

    const nextPath = nextParent
      ? `${nextParent.path}.${category.id}`
      : `${category.id}`;
    const depthDelta = nextDepth - category.depth;
    const pathChanged = nextPath !== category.path;

    const updated = await this.categoryRepository.update(id, {
      ...input,
      parentId: nextParentId,
      depth: nextDepth,
      path: nextPath,
      ...(input.slug ? { slug: nextSlug } : {}),
    });

    if (pathChanged || depthDelta !== 0) {
      for (const descendant of descendants) {
        const suffix = descendant.path.slice(category.path.length);
        const descendantPath = `${nextPath}${suffix}`;

        await this.categoryRepository.update(descendant.id, {
          path: descendantPath,
          depth: descendant.depth + depthDelta,
        });
      }
    }

    return updated;
  }

  async setMainExposure(
    id: number,
    isMainExposed: boolean,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.update(id, { isMainExposed });
  }

  async delete(id: number): Promise<{ id: number; deleted: boolean }> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasChildren = await this.categoryRepository.hasChildren(id);

    if (hasChildren) {
      throw new ConflictException(
        'Cannot delete category with child categories',
      );
    }

    await this.categoryRepository.delete(id);

    return {
      id,
      deleted: true,
    };
  }

  list(filter?: CategoryListFilter): Promise<CategoryEntity[]> {
    return this.categoryRepository.findAll(filter);
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryRepository.findAll({
      isActive: true,
      isVisible: true,
    });

    const nodeMap = new Map<number, CategoryTreeNode>();

    for (const category of categories) {
      nodeMap.set(category.id, {
        id: category.id,
        parentId: category.parentId,
        depth: category.depth,
        path: category.path,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        isVisible: category.isVisible,
        isMainExposed: category.isMainExposed,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];

    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortRecursively = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      for (const node of nodes) {
        sortRecursively(node.children);
      }
    };

    sortRecursively(roots);
    return roots;
  }

  getMainCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.findMainExposed();
  }

  private normalizeSlug(slug: string): string {
    const normalized = slug.trim().toLowerCase();

    if (!normalized) {
      throw new BadRequestException('Category slug is required');
    }

    return normalized;
  }

  private async resolveParent(
    parentId?: number | null,
  ): Promise<CategoryEntity | null> {
    if (parentId === undefined || parentId === null) {
      return null;
    }

    const parent = await this.categoryRepository.findById(parentId);

    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }

    if (parent.depth >= 4) {
      throw new BadRequestException('Category depth cannot exceed 4');
    }

    return parent;
  }
}
