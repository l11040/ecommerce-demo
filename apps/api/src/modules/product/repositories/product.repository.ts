import { CategoryEntity } from '../../../database/entities/category.entity';
import { ProductDescriptionEntity } from '../../../database/entities/product-description.entity';
import { ProductEntity } from '../../../database/entities/product.entity';
import { ProductMediaEntity } from '../../../database/entities/product-media.entity';
import { ProductOptionGroupEntity } from '../../../database/entities/product-option-group.entity';
import { ProductOptionItemEntity } from '../../../database/entities/product-option-item.entity';
import { ProductPriceTierEntity } from '../../../database/entities/product-price-tier.entity';
import { ProductSearchAliasEntity } from '../../../database/entities/product-search-alias.entity';
import { ProductSeoMetaEntity } from '../../../database/entities/product-seo-meta.entity';
import { ProductShippingTierEntity } from '../../../database/entities/product-shipping-tier.entity';
import { ProductSpecGroupEntity } from '../../../database/entities/product-spec-group.entity';
import { ProductSpecEntity } from '../../../database/entities/product-spec.entity';
import { ProductTagEntity } from '../../../database/entities/product-tag.entity';
import { StoreEntity } from '../../../database/entities/store.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ReplaceProductOptionItemInput {
  label: string;
  extraSupplyCost: string;
  extraUnitPrice: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ReplaceProductOptionGroupInput {
  name: string;
  isRequired: boolean;
  selectionType: string;
  sortOrder: number;
  items: ReplaceProductOptionItemInput[];
}

export interface ReplaceProductPriceTierInput {
  customerSegment: string;
  minQty: number;
  marginRate: string;
  unitPriceOverride: string | null;
  computedUnitPrice: string;
  isActive: boolean;
}

export interface UpdateProductInput {
  categoryId?: number | null;
  name?: string;
  slug?: string;
  status?: string;
  isVisible?: boolean;
  moq?: number;
  moqInquiryOnly?: boolean;
  baseSupplyCost?: string;
  vatType?: string;
  vatRate?: string;
  isPrintable?: boolean;
  printMethod?: string | null;
  printArea?: string | null;
  proofLeadTimeDays?: number | null;
  thumbnailUrl?: string | null;
}

export interface ReplaceProductSpecInput {
  label: string;
  value: string;
  sortOrder: number;
}

export interface ReplaceProductSpecGroupInput {
  name: string;
  sortOrder: number;
  specs: ReplaceProductSpecInput[];
}

export interface ReplaceProductShippingTierInput {
  minQty: number;
  shippingFee: string;
  isActive: boolean;
}

export interface ReplaceProductMediaInput {
  type: string;
  sourceType: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ReplaceProductTagInput {
  tag: string;
  sortOrder: number;
}

export interface ReplaceProductSearchAliasInput {
  aliasText: string;
  sortOrder: number;
}

export interface UpsertProductDescriptionInput {
  descriptionHtmlRaw: string;
  descriptionHtmlSanitized: string;
  updatedByAdminId: number | null;
}

export interface UpsertProductSeoMetaInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

export interface ProductListFilter {
  storeIds?: number[];
  storeId?: number;
  categoryId?: number;
  status?: string;
  isVisible?: boolean;
  keyword?: string;
  minMoq?: number;
  maxMoq?: number;
}

export interface FoProductListFilter {
  storeId?: number;
  categoryId?: number;
  keyword?: string;
  minMoq?: number;
  maxMoq?: number;
}

export interface ProductRepository {
  findStoreById(id: number): Promise<StoreEntity | null>;
  findCategoryById(id: number): Promise<CategoryEntity | null>;
  existsSlug(slug: string, excludeId?: number): Promise<boolean>;
  createProduct(data: Partial<ProductEntity>): Promise<ProductEntity>;
  updateProduct(id: number, data: UpdateProductInput): Promise<ProductEntity>;
  findById(id: number): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findAllForBo(filter: ProductListFilter): Promise<ProductEntity[]>;
  findAllForFo(filter: FoProductListFilter): Promise<ProductEntity[]>;
  findFoPublishedById(id: number): Promise<ProductEntity | null>;
  findFoPublishedBySlug(slug: string): Promise<ProductEntity | null>;
  findPriceTiers(
    productId: number,
    customerSegment: string,
  ): Promise<ProductPriceTierEntity[]>;
  findShippingTiers(productId: number): Promise<ProductShippingTierEntity[]>;
  findOptionGroups(productId: number): Promise<ProductOptionGroupEntity[]>;
  findOptionItemsByGroupIds(
    groupIds: number[],
  ): Promise<ProductOptionItemEntity[]>;
  findOptionItemsByIds(ids: number[]): Promise<ProductOptionItemEntity[]>;
  findSpecGroups(productId: number): Promise<ProductSpecGroupEntity[]>;
  findSpecsByGroupIds(groupIds: number[]): Promise<ProductSpecEntity[]>;
  findDescription(productId: number): Promise<ProductDescriptionEntity | null>;
  findSeoMeta(productId: number): Promise<ProductSeoMetaEntity | null>;
  findMedia(productId: number): Promise<ProductMediaEntity[]>;
  findTags(productId: number): Promise<ProductTagEntity[]>;
  findSearchAliases(productId: number): Promise<ProductSearchAliasEntity[]>;
  hasSuperAdminPermission(boAdminId: number): Promise<boolean>;
  hasStorePermission(boAdminId: number, storeId: number): Promise<boolean>;
  findPermittedStoreIds(boAdminId: number): Promise<number[]>;
  replaceOptionGroups(
    productId: number,
    groups: ReplaceProductOptionGroupInput[],
  ): Promise<{
    groups: ProductOptionGroupEntity[];
    items: ProductOptionItemEntity[];
  }>;
  replacePriceTiers(
    productId: number,
    tiers: ReplaceProductPriceTierInput[],
  ): Promise<ProductPriceTierEntity[]>;
  replaceSpecGroups(
    productId: number,
    groups: ReplaceProductSpecGroupInput[],
  ): Promise<{
    groups: ProductSpecGroupEntity[];
    specs: ProductSpecEntity[];
  }>;
  replaceShippingTiers(
    productId: number,
    tiers: ReplaceProductShippingTierInput[],
  ): Promise<ProductShippingTierEntity[]>;
  replaceMedia(
    productId: number,
    media: ReplaceProductMediaInput[],
  ): Promise<ProductMediaEntity[]>;
  replaceTags(
    productId: number,
    tags: ReplaceProductTagInput[],
  ): Promise<ProductTagEntity[]>;
  replaceSearchAliases(
    productId: number,
    aliases: ReplaceProductSearchAliasInput[],
  ): Promise<ProductSearchAliasEntity[]>;
  upsertDescription(
    productId: number,
    input: UpsertProductDescriptionInput,
  ): Promise<ProductDescriptionEntity>;
  upsertSeoMeta(
    productId: number,
    input: UpsertProductSeoMetaInput,
  ): Promise<ProductSeoMetaEntity>;
  createAuditLog(input: {
    productId: number;
    actorAdminId: number | null;
    action: string;
    payload?: Record<string, unknown>;
  }): Promise<void>;
}
