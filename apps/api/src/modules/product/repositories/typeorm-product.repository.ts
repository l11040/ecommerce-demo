import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CategoryEntity } from '../../../database/entities/category.entity';
import { ProductDescriptionEntity } from '../../../database/entities/product-description.entity';
import { ProductEntity } from '../../../database/entities/product.entity';
import { ProductMediaEntity } from '../../../database/entities/product-media.entity';
import { ProductOptionGroupEntity } from '../../../database/entities/product-option-group.entity';
import { ProductOptionItemEntity } from '../../../database/entities/product-option-item.entity';
import { ProductPriceTierEntity } from '../../../database/entities/product-price-tier.entity';
import { ProductAuditLogEntity } from '../../../database/entities/product-audit-log.entity';
import { ProductSearchAliasEntity } from '../../../database/entities/product-search-alias.entity';
import { ProductSeoMetaEntity } from '../../../database/entities/product-seo-meta.entity';
import { ProductShippingTierEntity } from '../../../database/entities/product-shipping-tier.entity';
import { ProductSpecGroupEntity } from '../../../database/entities/product-spec-group.entity';
import { ProductSpecEntity } from '../../../database/entities/product-spec.entity';
import { ProductTagEntity } from '../../../database/entities/product-tag.entity';
import { StoreAdminPermissionEntity } from '../../../database/entities/store-admin-permission.entity';
import { StoreEntity } from '../../../database/entities/store.entity';
import {
  FoProductListFilter,
  ProductRepository,
  ReplaceProductMediaInput,
  ProductListFilter,
  ReplaceProductSearchAliasInput,
  ReplaceProductOptionGroupInput,
  ReplaceProductPriceTierInput,
  ReplaceProductShippingTierInput,
  ReplaceProductSpecGroupInput,
  ReplaceProductTagInput,
  UpdateProductInput,
  UpsertProductDescriptionInput,
  UpsertProductSeoMetaInput,
} from './product.repository';

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(StoreAdminPermissionEntity)
    private readonly storeAdminPermissionRepository: Repository<StoreAdminPermissionEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductPriceTierEntity)
    private readonly productPriceTierRepository: Repository<ProductPriceTierEntity>,
    @InjectRepository(ProductAuditLogEntity)
    private readonly productAuditLogRepository: Repository<ProductAuditLogEntity>,
    @InjectRepository(ProductShippingTierEntity)
    private readonly productShippingTierRepository: Repository<ProductShippingTierEntity>,
    @InjectRepository(ProductOptionGroupEntity)
    private readonly productOptionGroupRepository: Repository<ProductOptionGroupEntity>,
    @InjectRepository(ProductOptionItemEntity)
    private readonly productOptionItemRepository: Repository<ProductOptionItemEntity>,
    @InjectRepository(ProductSpecGroupEntity)
    private readonly productSpecGroupRepository: Repository<ProductSpecGroupEntity>,
    @InjectRepository(ProductSpecEntity)
    private readonly productSpecRepository: Repository<ProductSpecEntity>,
    @InjectRepository(ProductDescriptionEntity)
    private readonly productDescriptionRepository: Repository<ProductDescriptionEntity>,
    @InjectRepository(ProductSeoMetaEntity)
    private readonly productSeoMetaRepository: Repository<ProductSeoMetaEntity>,
    @InjectRepository(ProductTagEntity)
    private readonly productTagRepository: Repository<ProductTagEntity>,
    @InjectRepository(ProductSearchAliasEntity)
    private readonly productSearchAliasRepository: Repository<ProductSearchAliasEntity>,
    @InjectRepository(ProductMediaEntity)
    private readonly productMediaRepository: Repository<ProductMediaEntity>,
  ) {}

  findStoreById(id: number): Promise<StoreEntity | null> {
    return this.storeRepository.findOne({ where: { id } });
  }

  findCategoryById(id: number): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async existsSlug(slug: string, excludeId?: number): Promise<boolean> {
    const count = await this.productRepository.count({
      where: {
        slug,
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });

    return count > 0;
  }

  createProduct(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async updateProduct(
    id: number,
    data: UpdateProductInput,
  ): Promise<ProductEntity> {
    await this.productRepository.update({ id }, data);

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found after update');
    }

    return product;
  }

  findById(id: number): Promise<ProductEntity | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({ where: { slug } });
  }

  async findAllForBo(filter: ProductListFilter): Promise<ProductEntity[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (filter.storeIds && filter.storeIds.length > 0) {
      query.andWhere('product.store_id IN (:...storeIds)', {
        storeIds: filter.storeIds,
      });
    }

    if (filter.storeId !== undefined) {
      query.andWhere('product.store_id = :storeId', {
        storeId: filter.storeId,
      });
    }

    if (filter.categoryId !== undefined) {
      query.andWhere('product.category_id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    if (filter.status) {
      query.andWhere('product.status = :status', {
        status: filter.status,
      });
    }

    if (filter.isVisible !== undefined) {
      query.andWhere('product.is_visible = :isVisible', {
        isVisible: filter.isVisible,
      });
    }

    if (filter.keyword) {
      query.andWhere(
        '(product.name LIKE :keyword OR product.slug LIKE :keyword)',
        { keyword: `%${filter.keyword}%` },
      );
    }

    if (filter.minMoq !== undefined) {
      query.andWhere('product.moq >= :minMoq', {
        minMoq: filter.minMoq,
      });
    }

    if (filter.maxMoq !== undefined) {
      query.andWhere('product.moq <= :maxMoq', {
        maxMoq: filter.maxMoq,
      });
    }

    return query
      .orderBy('product.updated_at', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .getMany();
  }

  async findAllForFo(filter: FoProductListFilter): Promise<ProductEntity[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .innerJoin(StoreEntity, 'store', 'store.id = product.store_id')
      .andWhere('product.status = :status', { status: 'published' })
      .andWhere('product.is_visible = :isVisible', { isVisible: true })
      .andWhere('store.is_active = :isActive', { isActive: true });

    if (filter.storeId !== undefined) {
      query.andWhere('product.store_id = :storeId', {
        storeId: filter.storeId,
      });
    }

    if (filter.categoryId !== undefined) {
      query.andWhere('product.category_id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    if (filter.keyword) {
      query.andWhere(
        '(product.name LIKE :keyword OR product.slug LIKE :keyword)',
        { keyword: `%${filter.keyword}%` },
      );
    }

    if (filter.minMoq !== undefined) {
      query.andWhere('product.moq >= :minMoq', {
        minMoq: filter.minMoq,
      });
    }

    if (filter.maxMoq !== undefined) {
      query.andWhere('product.moq <= :maxMoq', {
        maxMoq: filter.maxMoq,
      });
    }

    return query
      .orderBy('product.updated_at', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .getMany();
  }

  findFoPublishedById(id: number): Promise<ProductEntity | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .innerJoin(StoreEntity, 'store', 'store.id = product.store_id')
      .where('product.id = :id', { id })
      .andWhere('product.status = :status', { status: 'published' })
      .andWhere('product.is_visible = :isVisible', { isVisible: true })
      .andWhere('store.is_active = :isActive', { isActive: true })
      .getOne();
  }

  findFoPublishedBySlug(slug: string): Promise<ProductEntity | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .innerJoin(StoreEntity, 'store', 'store.id = product.store_id')
      .where('product.slug = :slug', { slug })
      .andWhere('product.status = :status', { status: 'published' })
      .andWhere('product.is_visible = :isVisible', { isVisible: true })
      .andWhere('store.is_active = :isActive', { isActive: true })
      .getOne();
  }

  findPriceTiers(
    productId: number,
    customerSegment: string,
  ): Promise<ProductPriceTierEntity[]> {
    return this.productPriceTierRepository.find({
      where: {
        productId,
        customerSegment,
        isActive: true,
      },
      order: {
        minQty: 'ASC',
      },
    });
  }

  findShippingTiers(productId: number): Promise<ProductShippingTierEntity[]> {
    return this.productShippingTierRepository.find({
      where: {
        productId,
        isActive: true,
      },
      order: {
        minQty: 'ASC',
      },
    });
  }

  findOptionGroups(productId: number): Promise<ProductOptionGroupEntity[]> {
    return this.productOptionGroupRepository.find({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findOptionItemsByGroupIds(
    groupIds: number[],
  ): Promise<ProductOptionItemEntity[]> {
    if (groupIds.length === 0) {
      return [];
    }

    return this.productOptionItemRepository
      .createQueryBuilder('item')
      .where('item.option_group_id IN (:...groupIds)', { groupIds })
      .andWhere('item.is_active = :isActive', { isActive: true })
      .orderBy('item.sort_order', 'ASC')
      .addOrderBy('item.id', 'ASC')
      .getMany();
  }

  async findOptionItemsByIds(
    ids: number[],
  ): Promise<ProductOptionItemEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.productOptionItemRepository
      .createQueryBuilder('item')
      .where('item.id IN (:...ids)', { ids })
      .andWhere('item.is_active = :isActive', { isActive: true })
      .getMany();
  }

  findSpecGroups(productId: number): Promise<ProductSpecGroupEntity[]> {
    return this.productSpecGroupRepository.find({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findSpecsByGroupIds(groupIds: number[]): Promise<ProductSpecEntity[]> {
    if (groupIds.length === 0) {
      return [];
    }

    return this.productSpecRepository
      .createQueryBuilder('spec')
      .where('spec.spec_group_id IN (:...groupIds)', { groupIds })
      .orderBy('spec.sort_order', 'ASC')
      .addOrderBy('spec.id', 'ASC')
      .getMany();
  }

  findDescription(productId: number): Promise<ProductDescriptionEntity | null> {
    return this.productDescriptionRepository.findOne({ where: { productId } });
  }

  findSeoMeta(productId: number): Promise<ProductSeoMetaEntity | null> {
    return this.productSeoMetaRepository.findOne({ where: { productId } });
  }

  findMedia(productId: number): Promise<ProductMediaEntity[]> {
    return this.productMediaRepository.find({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  findTags(productId: number): Promise<ProductTagEntity[]> {
    return this.productTagRepository.find({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  findSearchAliases(productId: number): Promise<ProductSearchAliasEntity[]> {
    return this.productSearchAliasRepository.find({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        id: 'ASC',
      },
    });
  }

  async hasSuperAdminPermission(boAdminId: number): Promise<boolean> {
    const count = await this.storeAdminPermissionRepository.count({
      where: {
        boAdminId,
        role: 'super_admin',
      },
    });

    return count > 0;
  }

  async hasStorePermission(
    boAdminId: number,
    storeId: number,
  ): Promise<boolean> {
    const count = await this.storeAdminPermissionRepository.count({
      where: {
        boAdminId,
        storeId,
      },
    });

    return count > 0;
  }

  async findPermittedStoreIds(boAdminId: number): Promise<number[]> {
    const rows = await this.storeAdminPermissionRepository.find({
      select: {
        storeId: true,
      },
      where: {
        boAdminId,
      },
    });

    return [...new Set(rows.map((row) => row.storeId))];
  }

  async replaceOptionGroups(
    productId: number,
    groups: ReplaceProductOptionGroupInput[],
  ): Promise<{
    groups: ProductOptionGroupEntity[];
    items: ProductOptionItemEntity[];
  }> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductOptionGroupEntity, { productId });

      const savedGroups: ProductOptionGroupEntity[] = [];
      const savedItems: ProductOptionItemEntity[] = [];

      for (const group of groups) {
        const createdGroup = manager.create(ProductOptionGroupEntity, {
          productId,
          name: group.name,
          isRequired: group.isRequired,
          selectionType: group.selectionType,
          sortOrder: group.sortOrder,
        });
        const savedGroup = await manager.save(
          ProductOptionGroupEntity,
          createdGroup,
        );
        savedGroups.push(savedGroup);

        if (group.items.length === 0) {
          continue;
        }

        const createdItems = group.items.map((item) =>
          manager.create(ProductOptionItemEntity, {
            optionGroupId: savedGroup.id,
            label: item.label,
            extraSupplyCost: item.extraSupplyCost,
            extraUnitPrice: item.extraUnitPrice,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          }),
        );

        const newItems = await manager.save(
          ProductOptionItemEntity,
          createdItems,
        );
        savedItems.push(...newItems);
      }

      return {
        groups: savedGroups,
        items: savedItems,
      };
    });
  }

  async replacePriceTiers(
    productId: number,
    tiers: ReplaceProductPriceTierInput[],
  ): Promise<ProductPriceTierEntity[]> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductPriceTierEntity, { productId });

      if (tiers.length === 0) {
        return [];
      }

      const created = tiers.map((tier) =>
        manager.create(ProductPriceTierEntity, {
          productId,
          customerSegment: tier.customerSegment,
          minQty: tier.minQty,
          marginRate: tier.marginRate,
          unitPriceOverride: tier.unitPriceOverride,
          computedUnitPrice: tier.computedUnitPrice,
          isActive: tier.isActive,
        }),
      );

      const saved = await manager.save(ProductPriceTierEntity, created);
      const ids = saved.map((item) => item.id);

      return manager.find(ProductPriceTierEntity, {
        where: { id: In(ids) },
        order: {
          customerSegment: 'ASC',
          minQty: 'ASC',
        },
      });
    });
  }

  async replaceSpecGroups(
    productId: number,
    groups: ReplaceProductSpecGroupInput[],
  ): Promise<{
    groups: ProductSpecGroupEntity[];
    specs: ProductSpecEntity[];
  }> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductSpecGroupEntity, { productId });

      const savedGroups: ProductSpecGroupEntity[] = [];
      const savedSpecs: ProductSpecEntity[] = [];

      for (const group of groups) {
        const createdGroup = manager.create(ProductSpecGroupEntity, {
          productId,
          name: group.name,
          sortOrder: group.sortOrder,
        });

        const savedGroup = await manager.save(
          ProductSpecGroupEntity,
          createdGroup,
        );
        savedGroups.push(savedGroup);

        if (group.specs.length === 0) {
          continue;
        }

        const createdSpecs = group.specs.map((spec) =>
          manager.create(ProductSpecEntity, {
            specGroupId: savedGroup.id,
            label: spec.label,
            value: spec.value,
            sortOrder: spec.sortOrder,
          }),
        );

        const newSpecs = await manager.save(ProductSpecEntity, createdSpecs);
        savedSpecs.push(...newSpecs);
      }

      return {
        groups: savedGroups,
        specs: savedSpecs,
      };
    });
  }

  async replaceShippingTiers(
    productId: number,
    tiers: ReplaceProductShippingTierInput[],
  ): Promise<ProductShippingTierEntity[]> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductShippingTierEntity, { productId });

      if (tiers.length === 0) {
        return [];
      }

      const created = tiers.map((tier) =>
        manager.create(ProductShippingTierEntity, {
          productId,
          minQty: tier.minQty,
          shippingFee: tier.shippingFee,
          isActive: tier.isActive,
        }),
      );

      const saved = await manager.save(ProductShippingTierEntity, created);
      const ids = saved.map((item) => item.id);

      return manager.find(ProductShippingTierEntity, {
        where: { id: In(ids) },
        order: {
          minQty: 'ASC',
        },
      });
    });
  }

  async replaceMedia(
    productId: number,
    media: ReplaceProductMediaInput[],
  ): Promise<ProductMediaEntity[]> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductMediaEntity, { productId });

      if (media.length === 0) {
        return [];
      }

      const created = media.map((item) =>
        manager.create(ProductMediaEntity, {
          productId,
          type: item.type,
          sourceType: item.sourceType,
          url: item.url,
          altText: item.altText,
          sortOrder: item.sortOrder,
        }),
      );

      const saved = await manager.save(ProductMediaEntity, created);
      const ids = saved.map((item) => item.id);

      return manager.find(ProductMediaEntity, {
        where: { id: In(ids) },
        order: {
          sortOrder: 'ASC',
          id: 'ASC',
        },
      });
    });
  }

  async replaceTags(
    productId: number,
    tags: ReplaceProductTagInput[],
  ): Promise<ProductTagEntity[]> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductTagEntity, { productId });

      if (tags.length === 0) {
        return [];
      }

      const created = tags.map((item) =>
        manager.create(ProductTagEntity, {
          productId,
          tag: item.tag,
          sortOrder: item.sortOrder,
        }),
      );

      const saved = await manager.save(ProductTagEntity, created);
      const ids = saved.map((item) => item.id);

      return manager.find(ProductTagEntity, {
        where: { id: In(ids) },
        order: {
          sortOrder: 'ASC',
          id: 'ASC',
        },
      });
    });
  }

  async replaceSearchAliases(
    productId: number,
    aliases: ReplaceProductSearchAliasInput[],
  ): Promise<ProductSearchAliasEntity[]> {
    return this.productRepository.manager.transaction(async (manager) => {
      await manager.delete(ProductSearchAliasEntity, { productId });

      if (aliases.length === 0) {
        return [];
      }

      const created = aliases.map((item) =>
        manager.create(ProductSearchAliasEntity, {
          productId,
          aliasText: item.aliasText,
          sortOrder: item.sortOrder,
        }),
      );

      const saved = await manager.save(ProductSearchAliasEntity, created);
      const ids = saved.map((item) => item.id);

      return manager.find(ProductSearchAliasEntity, {
        where: { id: In(ids) },
        order: {
          sortOrder: 'ASC',
          id: 'ASC',
        },
      });
    });
  }

  async upsertDescription(
    productId: number,
    input: UpsertProductDescriptionInput,
  ): Promise<ProductDescriptionEntity> {
    const existing = await this.productDescriptionRepository.findOne({
      where: { productId },
    });

    if (existing) {
      existing.descriptionHtmlRaw = input.descriptionHtmlRaw;
      existing.descriptionHtmlSanitized = input.descriptionHtmlSanitized;
      existing.updatedByAdminId = input.updatedByAdminId;
      return this.productDescriptionRepository.save(existing);
    }

    const created = this.productDescriptionRepository.create({
      productId,
      descriptionHtmlRaw: input.descriptionHtmlRaw,
      descriptionHtmlSanitized: input.descriptionHtmlSanitized,
      updatedByAdminId: input.updatedByAdminId,
    });

    return this.productDescriptionRepository.save(created);
  }

  async upsertSeoMeta(
    productId: number,
    input: UpsertProductSeoMetaInput,
  ): Promise<ProductSeoMetaEntity> {
    const existing = await this.productSeoMetaRepository.findOne({
      where: { productId },
    });

    if (existing) {
      existing.metaTitle = input.metaTitle ?? null;
      existing.metaDescription = input.metaDescription ?? null;
      existing.metaKeywords = input.metaKeywords ?? null;
      existing.canonicalUrl = input.canonicalUrl ?? null;
      existing.robots = input.robots ?? null;
      existing.ogTitle = input.ogTitle ?? null;
      existing.ogDescription = input.ogDescription ?? null;
      existing.ogImage = input.ogImage ?? null;
      return this.productSeoMetaRepository.save(existing);
    }

    const created = this.productSeoMetaRepository.create({
      productId,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      metaKeywords: input.metaKeywords ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      robots: input.robots ?? null,
      ogTitle: input.ogTitle ?? null,
      ogDescription: input.ogDescription ?? null,
      ogImage: input.ogImage ?? null,
    });

    return this.productSeoMetaRepository.save(created);
  }

  async createAuditLog(input: {
    productId: number;
    actorAdminId: number | null;
    action: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    const log = this.productAuditLogRepository.create({
      productId: input.productId,
      actorAdminId: input.actorAdminId,
      action: input.action,
      payloadJson: input.payload ?? null,
    });

    await this.productAuditLogRepository.save(log);
  }
}
