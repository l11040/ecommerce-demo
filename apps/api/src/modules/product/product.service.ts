import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  calculateProductQuote,
  ProductQuoteRuleError,
} from '@ecommerce/product-domain';
import { ProductEntity } from '../../database/entities/product.entity';
import { PRODUCT_REPOSITORY } from './repositories/product.repository';
import type {
  ProductRepository,
  ReplaceProductMediaInput as ReplaceProductMediaRepositoryInput,
  ReplaceProductOptionGroupInput,
  ReplaceProductPriceTierInput,
  ReplaceProductSearchAliasInput as ReplaceProductSearchAliasRepositoryInput,
  ReplaceProductShippingTierInput,
  ReplaceProductSpecGroupInput,
  ReplaceProductTagInput as ReplaceProductTagRepositoryInput,
} from './repositories/product.repository';

export interface CreateProductInput {
  actorAdminId?: number;
  storeId: number;
  categoryId?: number | null;
  name: string;
  slug: string;
  status?: string;
  isVisible?: boolean;
  moq?: number;
  moqInquiryOnly?: boolean;
  baseSupplyCost?: number;
  vatType?: string;
  vatRate?: number;
  isPrintable?: boolean;
  printMethod?: string | null;
  printArea?: string | null;
  proofLeadTimeDays?: number | null;
  thumbnailUrl?: string | null;
}

export interface ProductQuoteInput {
  quantity: number;
  customerSegment?: string;
  selectedOptionItemIds?: number[];
}

export interface ReplaceProductOptionsInput {
  optionGroups: {
    name: string;
    isRequired?: boolean;
    selectionType?: string;
    sortOrder?: number;
    items: {
      label: string;
      extraSupplyCost?: number;
      extraUnitPrice?: number;
      sortOrder?: number;
      isActive?: boolean;
    }[];
  }[];
}

export interface ReplaceProductPriceTiersInput {
  guest: {
    minQty: number;
    marginRate: number;
    unitPriceOverride?: number | null;
    isActive?: boolean;
  }[];
  member: {
    minQty: number;
    marginRate: number;
    unitPriceOverride?: number | null;
    isActive?: boolean;
  }[];
}

export interface UpdateProductInput {
  categoryId?: number | null;
  name?: string;
  slug?: string;
  status?: string;
  isVisible?: boolean;
  moq?: number;
  moqInquiryOnly?: boolean;
  baseSupplyCost?: number;
  vatType?: string;
  vatRate?: number;
  isPrintable?: boolean;
  printMethod?: string | null;
  printArea?: string | null;
  proofLeadTimeDays?: number | null;
  thumbnailUrl?: string | null;
}

export interface ReplaceProductSpecsInput {
  specGroups: {
    name: string;
    sortOrder?: number;
    specs: {
      label: string;
      value: string;
      sortOrder?: number;
    }[];
  }[];
}

export interface ReplaceProductShippingTiersInput {
  shippingTiers: {
    minQty: number;
    shippingFee: number;
    isActive?: boolean;
  }[];
}

export interface ReplaceProductMediaInput {
  media: {
    type?: string;
    sourceType?: string;
    url: string;
    altText?: string | null;
    sortOrder?: number;
  }[];
}

export interface ReplaceProductTagsInput {
  tags: {
    tag: string;
    sortOrder?: number;
  }[];
}

export interface ReplaceProductSearchAliasesInput {
  aliases: {
    aliasText: string;
    sortOrder?: number;
  }[];
}

export interface UpsertProductDescriptionInput {
  descriptionHtmlRaw: string;
  descriptionHtmlSanitized?: string;
}

export interface UpsertProductSeoInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

export interface BoProductListInput {
  storeId?: number;
  categoryId?: number;
  status?: string;
  isVisible?: boolean;
  keyword?: string;
  minMoq?: number;
  maxMoq?: number;
}

export interface FoProductListInput {
  storeId?: number;
  categoryId?: number;
  keyword?: string;
  minMoq?: number;
  maxMoq?: number;
}

type QuoteTarget = 'fo' | 'bo';

@Injectable()
export class ProductService {
  private readonly allowedStatuses = new Set([
    'draft',
    'published',
    'soldout',
    'stopped',
  ]);
  private readonly allowedVatTypes = new Set(['exclusive', 'inclusive']);
  private readonly allowedSegments = new Set(['guest', 'member']);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async create(input: CreateProductInput) {
    const normalizedName = input.name.trim();

    if (normalizedName.length === 0) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_NAME',
        message: 'Product name is required',
      });
    }

    const normalizedSlug = this.normalizeSlug(input.slug);
    const status = input.status ?? 'draft';
    const moq = input.moq ?? 1;
    const vatType = input.vatType ?? 'exclusive';
    const vatRate = input.vatRate ?? 10;

    if (!this.allowedStatuses.has(status)) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_STATUS',
        message: 'Invalid product status',
      });
    }

    if (!this.allowedVatTypes.has(vatType)) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_VAT_TYPE',
        message: 'Invalid VAT type',
      });
    }

    if (!Number.isInteger(moq) || moq < 1) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_MOQ',
        message: 'MOQ must be at least 1',
      });
    }

    if (vatRate < 0 || vatRate > 100) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_VAT_RATE',
        message: 'VAT rate must be between 0 and 100',
      });
    }

    const store = await this.productRepository.findStoreById(input.storeId);

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: 'Store not found',
      });
    }

    if (input.actorAdminId !== undefined) {
      await this.assertBoAdminCanManageStore(input.actorAdminId, input.storeId);
    }

    if (input.categoryId !== undefined && input.categoryId !== null) {
      const category = await this.productRepository.findCategoryById(
        input.categoryId,
      );

      if (!category) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        });
      }
    }

    const exists = await this.productRepository.existsSlug(normalizedSlug);

    if (exists) {
      throw new ConflictException({
        code: 'PRODUCT_SLUG_DUPLICATED',
        message: 'Product slug already exists',
      });
    }

    if (
      input.proofLeadTimeDays !== undefined &&
      input.proofLeadTimeDays !== null &&
      input.proofLeadTimeDays < 0
    ) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_LEAD_TIME',
        message: 'Proof lead time must be zero or positive',
      });
    }

    const created = await this.productRepository.createProduct({
      storeId: input.storeId,
      categoryId: input.categoryId ?? null,
      name: normalizedName,
      slug: normalizedSlug,
      status,
      isVisible: input.isVisible ?? false,
      moq,
      moqInquiryOnly: input.moqInquiryOnly ?? false,
      baseSupplyCost: String(input.baseSupplyCost ?? 0),
      vatType,
      vatRate: String(vatRate),
      isPrintable: input.isPrintable ?? false,
      printMethod: input.printMethod ?? null,
      printArea: input.printArea ?? null,
      proofLeadTimeDays: input.proofLeadTimeDays ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
    });

    if (input.actorAdminId !== undefined) {
      await this.productRepository.createAuditLog({
        productId: created.id,
        actorAdminId: input.actorAdminId,
        action: 'PRODUCT_CREATED',
        payload: {
          storeId: created.storeId,
          status: created.status,
          moq: created.moq,
        },
      });
    }

    return this.toBoProductSummary(created);
  }

  async updateProduct(
    productId: number,
    input: UpdateProductInput,
    actorAdminId: number,
  ) {
    const product = await this.assertBoAdminCanManageProduct(
      actorAdminId,
      productId,
    );

    const patch: {
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
    } = {};

    if (input.categoryId !== undefined) {
      if (input.categoryId !== null) {
        const category = await this.productRepository.findCategoryById(
          input.categoryId,
        );

        if (!category) {
          throw new NotFoundException({
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          });
        }
      }

      patch.categoryId = input.categoryId;
    }

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (name.length === 0) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_NAME',
          message: 'Product name is required',
        });
      }

      patch.name = name;
    }

    if (input.slug !== undefined) {
      const slug = this.normalizeSlug(input.slug);
      const exists = await this.productRepository.existsSlug(slug, productId);

      if (exists) {
        throw new ConflictException({
          code: 'PRODUCT_SLUG_DUPLICATED',
          message: 'Product slug already exists',
        });
      }

      patch.slug = slug;
    }

    if (input.status !== undefined) {
      if (!this.allowedStatuses.has(input.status)) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_STATUS',
          message: 'Invalid product status',
        });
      }

      patch.status = input.status;
    }

    if (input.moq !== undefined) {
      if (!Number.isInteger(input.moq) || input.moq < 1) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_MOQ',
          message: 'MOQ must be at least 1',
        });
      }

      patch.moq = input.moq;
    }

    if (input.baseSupplyCost !== undefined) {
      if (input.baseSupplyCost < 0) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_BASE_SUPPLY_COST',
          message: 'Base supply cost must be zero or positive',
        });
      }

      patch.baseSupplyCost = String(input.baseSupplyCost);
    }

    if (input.vatType !== undefined) {
      if (!this.allowedVatTypes.has(input.vatType)) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_VAT_TYPE',
          message: 'Invalid VAT type',
        });
      }

      patch.vatType = input.vatType;
    }

    if (input.vatRate !== undefined) {
      if (input.vatRate < 0 || input.vatRate > 100) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_VAT_RATE',
          message: 'VAT rate must be between 0 and 100',
        });
      }

      patch.vatRate = String(input.vatRate);
    }

    if (input.proofLeadTimeDays !== undefined) {
      if (input.proofLeadTimeDays !== null && input.proofLeadTimeDays < 0) {
        throw new BadRequestException({
          code: 'PRODUCT_INVALID_LEAD_TIME',
          message: 'Proof lead time must be zero or positive',
        });
      }

      patch.proofLeadTimeDays = input.proofLeadTimeDays;
    }

    if (input.isVisible !== undefined) {
      patch.isVisible = input.isVisible;
    }

    if (input.moqInquiryOnly !== undefined) {
      patch.moqInquiryOnly = input.moqInquiryOnly;
    }

    if (input.isPrintable !== undefined) {
      patch.isPrintable = input.isPrintable;
    }

    if (input.printMethod !== undefined) {
      patch.printMethod = input.printMethod;
    }

    if (input.printArea !== undefined) {
      patch.printArea = input.printArea;
    }

    if (input.thumbnailUrl !== undefined) {
      patch.thumbnailUrl = input.thumbnailUrl;
    }

    if (Object.keys(patch).length === 0) {
      return this.toBoProductSummary(product);
    }

    const updated = await this.productRepository.updateProduct(
      productId,
      patch,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_UPDATED',
      payload: {
        updatedFields: Object.keys(patch),
      },
    });

    return this.toBoProductSummary(updated);
  }

  async updateProductStatus(
    productId: number,
    status: string,
    actorAdminId: number,
  ) {
    return this.updateProduct(productId, { status }, actorAdminId);
  }

  async getFoDetailBySlug(slug: string) {
    const product = await this.productRepository.findFoPublishedBySlug(
      this.normalizeSlug(slug),
    );

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    return this.buildProductDetail(product);
  }

  async listForFo(filter: FoProductListInput) {
    const products = await this.productRepository.findAllForFo(filter);

    return products.map((product) => ({
      id: product.id,
      storeId: product.storeId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      moq: product.moq,
      moqInquiryOnly: product.moqInquiryOnly,
      vatType: product.vatType,
      vatRate: Number(product.vatRate),
      isPrintable: product.isPrintable,
      printMethod: product.printMethod,
      printArea: product.printArea,
      proofLeadTimeDays: product.proofLeadTimeDays,
      thumbnailUrl: product.thumbnailUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }

  async quoteForFo(productId: number, input: ProductQuoteInput) {
    const product = await this.productRepository.findFoPublishedById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    return this.calculateQuote(product, input, 'fo');
  }

  async quotePreviewForBo(
    productId: number,
    input: ProductQuoteInput,
    actorAdminId: number,
  ) {
    const product = await this.assertBoAdminCanManageProduct(
      actorAdminId,
      productId,
    );

    const quote = await this.calculateQuote(product, input, 'bo');

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_QUOTE_PREVIEW',
      payload: {
        quantity: input.quantity,
        customerSegment: input.customerSegment ?? 'guest',
      },
    });

    return quote;
  }

  async listForBo(actorAdminId: number, filter: BoProductListInput) {
    const isSuperAdmin =
      await this.productRepository.hasSuperAdminPermission(actorAdminId);

    if (!isSuperAdmin && filter.storeId !== undefined) {
      await this.assertBoAdminCanManageStore(actorAdminId, filter.storeId);
    }

    const permittedStoreIds = isSuperAdmin
      ? undefined
      : await this.productRepository.findPermittedStoreIds(actorAdminId);

    if (
      !isSuperAdmin &&
      (!permittedStoreIds || permittedStoreIds.length === 0)
    ) {
      return [];
    }

    const products = await this.productRepository.findAllForBo({
      ...(permittedStoreIds ? { storeIds: permittedStoreIds } : {}),
      ...filter,
    });

    return products.map((product) => this.toBoProductSummary(product));
  }

  async getBoDetail(productId: number, actorAdminId: number) {
    const product = await this.assertBoAdminCanManageProduct(
      actorAdminId,
      productId,
    );

    return this.buildProductDetail(product);
  }

  private toBoProductSummary(product: ProductEntity) {
    return {
      id: product.id,
      storeId: product.storeId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      status: product.status,
      isVisible: product.isVisible,
      moq: product.moq,
      moqInquiryOnly: product.moqInquiryOnly,
      baseSupplyCost: Number(product.baseSupplyCost),
      vatType: product.vatType,
      vatRate: Number(product.vatRate),
      isPrintable: product.isPrintable,
      printMethod: product.printMethod,
      printArea: product.printArea,
      proofLeadTimeDays: product.proofLeadTimeDays,
      thumbnailUrl: product.thumbnailUrl,
      updatedAt: product.updatedAt,
      createdAt: product.createdAt,
    };
  }

  async replaceOptions(
    productId: number,
    input: ReplaceProductOptionsInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const normalizedGroups: ReplaceProductOptionGroupInput[] =
      input.optionGroups.map((group, groupIndex) => {
        const name = group.name.trim();

        if (name.length === 0) {
          throw new BadRequestException({
            code: 'PRODUCT_OPTION_GROUP_INVALID',
            message: `Option group name is required at index ${groupIndex}`,
          });
        }

        const selectionType = (group.selectionType ?? 'single').toLowerCase();

        if (selectionType !== 'single' && selectionType !== 'multi') {
          throw new BadRequestException({
            code: 'PRODUCT_OPTION_GROUP_INVALID',
            message: `selectionType must be single or multi at group ${groupIndex}`,
          });
        }

        if (group.items.length === 0) {
          throw new BadRequestException({
            code: 'PRODUCT_OPTION_ITEM_INVALID',
            message: `Option group ${groupIndex} must have at least one item`,
          });
        }

        return {
          name,
          isRequired: group.isRequired ?? false,
          selectionType,
          sortOrder: group.sortOrder ?? groupIndex,
          items: group.items.map((item, itemIndex) => {
            const label = item.label.trim();

            if (label.length === 0) {
              throw new BadRequestException({
                code: 'PRODUCT_OPTION_ITEM_INVALID',
                message: `Option item label is required at group ${groupIndex}, index ${itemIndex}`,
              });
            }

            const extraSupplyCost = item.extraSupplyCost ?? 0;
            const extraUnitPrice = item.extraUnitPrice ?? 0;

            if (extraSupplyCost < 0 || extraUnitPrice < 0) {
              throw new BadRequestException({
                code: 'PRODUCT_OPTION_ITEM_INVALID',
                message: `Option item costs must be zero or positive at group ${groupIndex}, index ${itemIndex}`,
              });
            }

            return {
              label,
              extraSupplyCost: String(extraSupplyCost),
              extraUnitPrice: String(extraUnitPrice),
              sortOrder: item.sortOrder ?? itemIndex,
              isActive: item.isActive ?? true,
            };
          }),
        };
      });

    const replaced = await this.productRepository.replaceOptionGroups(
      productId,
      normalizedGroups,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_OPTIONS_REPLACED',
      payload: {
        groupCount: normalizedGroups.length,
      },
    });

    const itemsByGroupId = this.groupBy(
      replaced.items,
      (item) => item.optionGroupId,
    );

    return replaced.groups.map((group) => ({
      id: group.id,
      productId: group.productId,
      name: group.name,
      isRequired: group.isRequired,
      selectionType: group.selectionType,
      sortOrder: group.sortOrder,
      items: (itemsByGroupId.get(group.id) ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        extraSupplyCost: Number(item.extraSupplyCost),
        extraUnitPrice: Number(item.extraUnitPrice),
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      })),
    }));
  }

  async replacePriceTiers(
    productId: number,
    input: ReplaceProductPriceTiersInput,
    actorAdminId: number,
  ) {
    const product = await this.assertBoAdminCanManageProduct(
      actorAdminId,
      productId,
    );

    const baseSupplyCost = this.toNumber(product.baseSupplyCost);
    const guestTiers = this.normalizeSegmentTiers(
      'guest',
      input.guest,
      baseSupplyCost,
    );
    const memberTiers = this.normalizeSegmentTiers(
      'member',
      input.member,
      baseSupplyCost,
    );

    const replaced = await this.productRepository.replacePriceTiers(productId, [
      ...guestTiers,
      ...memberTiers,
    ]);

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_PRICE_TIERS_REPLACED',
      payload: {
        guestTierCount: guestTiers.length,
        memberTierCount: memberTiers.length,
      },
    });

    return {
      guest: replaced
        .filter((tier) => tier.customerSegment === 'guest')
        .map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          marginRate: Number(tier.marginRate),
          unitPriceOverride:
            tier.unitPriceOverride === null
              ? null
              : Number(tier.unitPriceOverride),
          computedUnitPrice: Number(tier.computedUnitPrice),
          isActive: tier.isActive,
        })),
      member: replaced
        .filter((tier) => tier.customerSegment === 'member')
        .map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          marginRate: Number(tier.marginRate),
          unitPriceOverride:
            tier.unitPriceOverride === null
              ? null
              : Number(tier.unitPriceOverride),
          computedUnitPrice: Number(tier.computedUnitPrice),
          isActive: tier.isActive,
        })),
    };
  }

  async replaceSpecs(
    productId: number,
    input: ReplaceProductSpecsInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const normalizedGroups: ReplaceProductSpecGroupInput[] =
      input.specGroups.map((group, groupIndex) => {
        const name = group.name.trim();

        if (name.length === 0) {
          throw new BadRequestException({
            code: 'PRODUCT_SPEC_GROUP_INVALID',
            message: `Spec group name is required at index ${groupIndex}`,
          });
        }

        if (group.specs.length === 0) {
          throw new BadRequestException({
            code: 'PRODUCT_SPEC_INVALID',
            message: `Spec group ${groupIndex} must have at least one spec`,
          });
        }

        return {
          name,
          sortOrder: group.sortOrder ?? groupIndex,
          specs: group.specs.map((spec, specIndex) => {
            const label = spec.label.trim();
            const value = spec.value.trim();

            if (label.length === 0 || value.length === 0) {
              throw new BadRequestException({
                code: 'PRODUCT_SPEC_INVALID',
                message: `Spec label/value is required at group ${groupIndex}, index ${specIndex}`,
              });
            }

            return {
              label,
              value,
              sortOrder: spec.sortOrder ?? specIndex,
            };
          }),
        };
      });

    const replaced = await this.productRepository.replaceSpecGroups(
      productId,
      normalizedGroups,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_SPECS_REPLACED',
      payload: {
        groupCount: normalizedGroups.length,
      },
    });

    const specsByGroupId = this.groupBy(
      replaced.specs,
      (spec) => spec.specGroupId,
    );

    return replaced.groups.map((group) => ({
      id: group.id,
      productId: group.productId,
      name: group.name,
      sortOrder: group.sortOrder,
      specs: (specsByGroupId.get(group.id) ?? []).map((spec) => ({
        id: spec.id,
        label: spec.label,
        value: spec.value,
        sortOrder: spec.sortOrder,
      })),
    }));
  }

  async replaceShippingTiers(
    productId: number,
    input: ReplaceProductShippingTiersInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const tiers: ReplaceProductShippingTierInput[] = input.shippingTiers
      .map((tier, tierIndex) => {
        if (!Number.isInteger(tier.minQty) || tier.minQty < 1) {
          throw new BadRequestException({
            code: 'PRODUCT_SHIPPING_TIER_INVALID',
            message: `minQty must be at least 1 at index ${tierIndex}`,
          });
        }

        if (tier.shippingFee < 0) {
          throw new BadRequestException({
            code: 'PRODUCT_SHIPPING_TIER_INVALID',
            message: `shippingFee must be zero or positive at index ${tierIndex}`,
          });
        }

        return {
          minQty: tier.minQty,
          shippingFee: String(tier.shippingFee),
          isActive: tier.isActive ?? true,
        };
      })
      .sort((a, b) => a.minQty - b.minQty);

    const uniqueMinQty = new Set(tiers.map((tier) => tier.minQty));

    if (uniqueMinQty.size !== tiers.length) {
      throw new BadRequestException({
        code: 'PRODUCT_SHIPPING_TIER_INVALID',
        message: 'Duplicate minQty is not allowed in shipping tiers',
      });
    }

    const replaced = await this.productRepository.replaceShippingTiers(
      productId,
      tiers,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_SHIPPING_TIERS_REPLACED',
      payload: {
        tierCount: tiers.length,
      },
    });

    return replaced.map((tier) => ({
      id: tier.id,
      minQty: tier.minQty,
      shippingFee: Number(tier.shippingFee),
      isActive: tier.isActive,
    }));
  }

  async replaceMedia(
    productId: number,
    input: ReplaceProductMediaInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const normalizedMedia: ReplaceProductMediaRepositoryInput[] =
      input.media.map((item, index) => {
        const url = item.url.trim();

        if (url.length === 0) {
          throw new BadRequestException({
            code: 'PRODUCT_MEDIA_INVALID',
            message: `Media URL is required at index ${index}`,
          });
        }

        const type = (item.type ?? 'image').trim().toLowerCase();
        if (!['image', 'video', 'file'].includes(type)) {
          throw new BadRequestException({
            code: 'PRODUCT_MEDIA_INVALID',
            message: `Media type must be image|video|file at index ${index}`,
          });
        }

        const sourceType = (item.sourceType ?? 'internal').trim().toLowerCase();
        if (!['internal', 'external'].includes(sourceType)) {
          throw new BadRequestException({
            code: 'PRODUCT_MEDIA_INVALID',
            message: `sourceType must be internal|external at index ${index}`,
          });
        }

        if (sourceType === 'internal' && !url.startsWith('/uploads/')) {
          throw new BadRequestException({
            code: 'PRODUCT_MEDIA_INVALID',
            message:
              'Internal media URL must start with /uploads/. Upload image first.',
          });
        }

        const altText = item.altText?.trim();

        return {
          type,
          sourceType,
          url,
          altText: altText && altText.length > 0 ? altText : null,
          sortOrder: item.sortOrder ?? index,
        };
      });

    const replaced = await this.productRepository.replaceMedia(
      productId,
      normalizedMedia,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_MEDIA_REPLACED',
      payload: {
        mediaCount: normalizedMedia.length,
      },
    });

    return replaced.map((item) => ({
      id: item.id,
      type: item.type,
      sourceType: item.sourceType,
      url: item.url,
      altText: item.altText,
      sortOrder: item.sortOrder,
    }));
  }

  async replaceTags(
    productId: number,
    input: ReplaceProductTagsInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const deduplicated = new Set<string>();
    const normalizedTags: ReplaceProductTagRepositoryInput[] = [];

    input.tags.forEach((item, index) => {
      const tag = item.tag.trim();

      if (tag.length === 0) {
        throw new BadRequestException({
          code: 'PRODUCT_TAG_INVALID',
          message: `Tag is required at index ${index}`,
        });
      }

      const dedupeKey = tag.toLowerCase();
      if (deduplicated.has(dedupeKey)) {
        return;
      }

      deduplicated.add(dedupeKey);
      normalizedTags.push({
        tag,
        sortOrder: item.sortOrder ?? index,
      });
    });

    const replaced = await this.productRepository.replaceTags(
      productId,
      normalizedTags,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_TAGS_REPLACED',
      payload: {
        tagCount: normalizedTags.length,
      },
    });

    return replaced.map((item) => ({
      id: item.id,
      tag: item.tag,
      sortOrder: item.sortOrder,
    }));
  }

  async replaceSearchAliases(
    productId: number,
    input: ReplaceProductSearchAliasesInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const deduplicated = new Set<string>();
    const normalizedAliases: ReplaceProductSearchAliasRepositoryInput[] = [];

    input.aliases.forEach((item, index) => {
      const aliasText = item.aliasText.trim();

      if (aliasText.length === 0) {
        throw new BadRequestException({
          code: 'PRODUCT_SEARCH_ALIAS_INVALID',
          message: `Alias is required at index ${index}`,
        });
      }

      const dedupeKey = aliasText.toLowerCase();
      if (deduplicated.has(dedupeKey)) {
        return;
      }

      deduplicated.add(dedupeKey);
      normalizedAliases.push({
        aliasText,
        sortOrder: item.sortOrder ?? index,
      });
    });

    const replaced = await this.productRepository.replaceSearchAliases(
      productId,
      normalizedAliases,
    );

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_SEARCH_ALIASES_REPLACED',
      payload: {
        aliasCount: normalizedAliases.length,
      },
    });

    return replaced.map((item) => ({
      id: item.id,
      aliasText: item.aliasText,
      sortOrder: item.sortOrder,
    }));
  }

  async upsertDescription(
    productId: number,
    input: UpsertProductDescriptionInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const descriptionHtmlRaw = input.descriptionHtmlRaw;
    const descriptionHtmlSanitized =
      input.descriptionHtmlSanitized ?? input.descriptionHtmlRaw;

    const saved = await this.productRepository.upsertDescription(productId, {
      descriptionHtmlRaw,
      descriptionHtmlSanitized,
      updatedByAdminId: actorAdminId,
    });

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_DESCRIPTION_UPSERTED',
      payload: {
        rawLength: descriptionHtmlRaw.length,
        sanitizedLength: descriptionHtmlSanitized.length,
      },
    });

    return {
      productId: saved.productId,
      descriptionHtmlRaw: saved.descriptionHtmlRaw,
      descriptionHtmlSanitized: saved.descriptionHtmlSanitized,
      updatedByAdminId: saved.updatedByAdminId,
      updatedAt: saved.updatedAt,
    };
  }

  async upsertSeo(
    productId: number,
    input: UpsertProductSeoInput,
    actorAdminId: number,
  ) {
    await this.assertBoAdminCanManageProduct(actorAdminId, productId);

    const normalize = (value: string | null | undefined) => {
      if (value === undefined || value === null) {
        return null;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    };

    const saved = await this.productRepository.upsertSeoMeta(productId, {
      metaTitle: normalize(input.metaTitle),
      metaDescription: normalize(input.metaDescription),
      metaKeywords: normalize(input.metaKeywords),
      canonicalUrl: normalize(input.canonicalUrl),
      robots: normalize(input.robots),
      ogTitle: normalize(input.ogTitle),
      ogDescription: normalize(input.ogDescription),
      ogImage: normalize(input.ogImage),
    });

    await this.productRepository.createAuditLog({
      productId,
      actorAdminId,
      action: 'PRODUCT_SEO_UPSERTED',
    });

    return {
      productId: saved.productId,
      metaTitle: saved.metaTitle,
      metaDescription: saved.metaDescription,
      metaKeywords: saved.metaKeywords,
      canonicalUrl: saved.canonicalUrl,
      robots: saved.robots,
      ogTitle: saved.ogTitle,
      ogDescription: saved.ogDescription,
      ogImage: saved.ogImage,
      updatedAt: saved.updatedAt,
    };
  }

  private async assertBoAdminCanManageProduct(
    boAdminId: number,
    productId: number,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    await this.assertBoAdminCanManageStore(boAdminId, product.storeId);
    return product;
  }

  private async assertBoAdminCanManageStore(
    boAdminId: number,
    storeId: number,
  ): Promise<void> {
    const isSuperAdmin =
      await this.productRepository.hasSuperAdminPermission(boAdminId);

    if (isSuperAdmin) {
      return;
    }

    const hasStorePermission = await this.productRepository.hasStorePermission(
      boAdminId,
      storeId,
    );

    if (hasStorePermission) {
      return;
    }

    throw new ForbiddenException({
      code: 'PRODUCT_STORE_FORBIDDEN',
      message: 'No permission to manage this store product',
    });
  }

  private async buildProductDetail(product: ProductEntity) {
    const [
      guestPriceTiers,
      memberPriceTiers,
      shippingTiers,
      optionGroups,
      specGroups,
      description,
      seoMeta,
      tags,
      searchAliases,
      media,
    ] = await Promise.all([
      this.productRepository.findPriceTiers(product.id, 'guest'),
      this.productRepository.findPriceTiers(product.id, 'member'),
      this.productRepository.findShippingTiers(product.id),
      this.productRepository.findOptionGroups(product.id),
      this.productRepository.findSpecGroups(product.id),
      this.productRepository.findDescription(product.id),
      this.productRepository.findSeoMeta(product.id),
      this.productRepository.findTags(product.id),
      this.productRepository.findSearchAliases(product.id),
      this.productRepository.findMedia(product.id),
    ]);

    const optionItems = await this.productRepository.findOptionItemsByGroupIds(
      optionGroups.map((group) => group.id),
    );
    const specs = await this.productRepository.findSpecsByGroupIds(
      specGroups.map((group) => group.id),
    );

    const optionItemsByGroupId = this.groupBy(
      optionItems,
      (item) => item.optionGroupId,
    );
    const specsByGroupId = this.groupBy(specs, (spec) => spec.specGroupId);

    return {
      id: product.id,
      storeId: product.storeId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      status: product.status,
      isVisible: product.isVisible,
      moq: product.moq,
      moqInquiryOnly: product.moqInquiryOnly,
      baseSupplyCost: Number(product.baseSupplyCost),
      vatType: product.vatType,
      vatRate: Number(product.vatRate),
      isPrintable: product.isPrintable,
      printMethod: product.printMethod,
      printArea: product.printArea,
      proofLeadTimeDays: product.proofLeadTimeDays,
      thumbnailUrl: product.thumbnailUrl,
      media: media.map((m) => ({
        id: m.id,
        type: m.type,
        sourceType: m.sourceType,
        url: m.url,
        altText: m.altText,
        sortOrder: m.sortOrder,
      })),
      descriptionHtml: description?.descriptionHtmlSanitized ?? '',
      seo: seoMeta
        ? {
            metaTitle: seoMeta.metaTitle,
            metaDescription: seoMeta.metaDescription,
            metaKeywords: seoMeta.metaKeywords,
            canonicalUrl: seoMeta.canonicalUrl,
            robots: seoMeta.robots,
            ogTitle: seoMeta.ogTitle,
            ogDescription: seoMeta.ogDescription,
            ogImage: seoMeta.ogImage,
          }
        : null,
      tags: tags.map((tag) => tag.tag),
      searchAliases: searchAliases.map((alias) => alias.aliasText),
      optionGroups: optionGroups.map((group) => ({
        id: group.id,
        name: group.name,
        isRequired: group.isRequired,
        selectionType: group.selectionType,
        sortOrder: group.sortOrder,
        items: (optionItemsByGroupId.get(group.id) ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          extraSupplyCost: Number(item.extraSupplyCost),
          extraUnitPrice: Number(item.extraUnitPrice),
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        })),
      })),
      specGroups: specGroups.map((group) => ({
        id: group.id,
        name: group.name,
        sortOrder: group.sortOrder,
        specs: (specsByGroupId.get(group.id) ?? []).map((spec) => ({
          id: spec.id,
          label: spec.label,
          value: spec.value,
          sortOrder: spec.sortOrder,
        })),
      })),
      priceTiers: {
        guest: guestPriceTiers.map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          marginRate: Number(tier.marginRate),
          unitPrice: Number(
            tier.unitPriceOverride ?? tier.computedUnitPrice ?? '0',
          ),
        })),
        member: memberPriceTiers.map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          marginRate: Number(tier.marginRate),
          unitPrice: Number(
            tier.unitPriceOverride ?? tier.computedUnitPrice ?? '0',
          ),
        })),
      },
      shippingTiers: shippingTiers.map((tier) => ({
        id: tier.id,
        minQty: tier.minQty,
        shippingFee: Number(tier.shippingFee),
        isActive: tier.isActive,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private async calculateQuote(
    product: ProductEntity,
    input: ProductQuoteInput,
    target: QuoteTarget,
  ) {
    const quantity = input.quantity;
    const customerSegment = this.normalizeSegment(input.customerSegment);
    const selectedOptionItemIds = input.selectedOptionItemIds ?? [];

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_QUANTITY',
        message: 'Quantity must be a positive integer',
      });
    }

    if (quantity < product.moq) {
      const code = product.moqInquiryOnly
        ? 'PRODUCT_INQUIRY_ONLY'
        : 'PRODUCT_INVALID_MOQ';
      const message = product.moqInquiryOnly
        ? `Quantity below MOQ (${product.moq}) is inquiry only`
        : `Minimum order quantity is ${product.moq}`;

      throw new BadRequestException({ code, message });
    }

    const [tiers, shippingTiers, optionGroups] = await Promise.all([
      this.productRepository.findPriceTiers(product.id, customerSegment),
      this.productRepository.findShippingTiers(product.id),
      this.productRepository.findOptionGroups(product.id),
    ]);

    if (tiers.length === 0) {
      throw new BadRequestException({
        code: 'PRODUCT_PRICE_TIER_INVALID',
        message: `No active price tier for segment "${customerSegment}"`,
      });
    }

    const optionItems = await this.productRepository.findOptionItemsByGroupIds(
      optionGroups.map((group) => group.id),
    );
    const optionItemsById = new Map(optionItems.map((item) => [item.id, item]));
    const selectedItems = selectedOptionItemIds.map((id) =>
      optionItemsById.get(id),
    );
    const selectedValidItems = selectedItems.filter(
      (item): item is NonNullable<(typeof selectedItems)[number]> =>
        item !== undefined,
    );

    if (selectedValidItems.length !== selectedItems.length) {
      throw new BadRequestException({
        code: 'PRODUCT_OPTION_INVALID',
        message: 'Selected option item is invalid',
      });
    }

    this.validateRequiredOptions(optionGroups, selectedValidItems);
    this.validateSingleSelection(optionGroups, selectedValidItems);

    const optionExtraUnitPrice = selectedValidItems.reduce(
      (sum, item) => sum + this.toNumber(item.extraUnitPrice),
      0,
    );
    const optionExtraSupplyCost = selectedValidItems.reduce(
      (sum, item) => sum + this.toNumber(item.extraSupplyCost),
      0,
    );

    const normalizedPriceTiers = tiers.map((tier) => ({
      id: tier.id,
      minQty: tier.minQty,
      marginRate: this.toNumber(tier.marginRate),
      unitPrice: this.toNumber(
        tier.unitPriceOverride ?? tier.computedUnitPrice,
      ),
    }));
    const normalizedShippingTiers = shippingTiers.map((tier) => ({
      id: tier.id,
      minQty: tier.minQty,
      shippingFee: this.toNumber(tier.shippingFee),
    }));

    const vatRate = this.toNumber(product.vatRate);
    const baseSupplyCost = this.toNumber(product.baseSupplyCost);
    const baseUnitPrice =
      normalizedPriceTiers.length > 0 ? normalizedPriceTiers[0].unitPrice : 0;

    let quote;

    try {
      quote = calculateProductQuote({
        quantity,
        moq: product.moq,
        moqInquiryOnly: product.moqInquiryOnly,
        vatType: product.vatType as 'exclusive' | 'inclusive',
        vatRate,
        baseUnitPrice,
        baseSupplyCost,
        optionExtraUnitPrice,
        optionExtraSupplyCost,
        priceTiers: normalizedPriceTiers,
        shippingTiers: normalizedShippingTiers,
      });
    } catch (error) {
      if (error instanceof ProductQuoteRuleError) {
        throw new BadRequestException({
          code: error.code,
          message: error.message,
        });
      }

      throw error;
    }

    return {
      target,
      productId: product.id,
      productName: product.name,
      customerSegment,
      selectedOptionItemIds,
      ...quote,
    };
  }

  private validateRequiredOptions(
    optionGroups: { id: number; isRequired: boolean }[],
    selectedItems: { optionGroupId: number }[],
  ) {
    const selectedByGroupId = this.countBy(
      selectedItems,
      (item) => item.optionGroupId,
    );

    for (const group of optionGroups) {
      if (!group.isRequired) {
        continue;
      }

      if (!selectedByGroupId.has(group.id)) {
        throw new BadRequestException({
          code: 'PRODUCT_REQUIRED_OPTION_MISSING',
          message: `Required option group ${group.id} is not selected`,
        });
      }
    }
  }

  private validateSingleSelection(
    optionGroups: { id: number; selectionType: string }[],
    selectedItems: { optionGroupId: number }[],
  ) {
    const selectedByGroupId = this.countBy(
      selectedItems,
      (item) => item.optionGroupId,
    );

    for (const group of optionGroups) {
      if (group.selectionType !== 'single') {
        continue;
      }

      const selectedCount = selectedByGroupId.get(group.id) ?? 0;

      if (selectedCount > 1) {
        throw new BadRequestException({
          code: 'PRODUCT_OPTION_SELECTION_INVALID',
          message: `Option group ${group.id} allows only one selection`,
        });
      }
    }
  }

  private normalizeSlug(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (normalized.length === 0) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_SLUG',
        message: 'Invalid product slug',
      });
    }

    return normalized;
  }

  private normalizeSegment(value?: string): string {
    const segment = (value ?? 'guest').trim().toLowerCase();

    if (!this.allowedSegments.has(segment)) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_CUSTOMER_SEGMENT',
        message: 'Customer segment must be "guest" or "member"',
      });
    }

    return segment;
  }

  private normalizeSegmentTiers(
    segment: 'guest' | 'member',
    tiers: {
      minQty: number;
      marginRate: number;
      unitPriceOverride?: number | null;
      isActive?: boolean;
    }[],
    baseSupplyCost: number,
  ): ReplaceProductPriceTierInput[] {
    if (tiers.length === 0) {
      throw new BadRequestException({
        code: 'PRODUCT_PRICE_TIER_INVALID',
        message: `At least one ${segment} price tier is required`,
      });
    }

    const seen = new Set<number>();
    let lastMinQty = 0;

    return tiers.map((tier, index) => {
      if (!Number.isInteger(tier.minQty) || tier.minQty < 1) {
        throw new BadRequestException({
          code: 'PRODUCT_PRICE_TIER_INVALID',
          message: `${segment} tier minQty must be a positive integer at index ${index}`,
        });
      }

      if (seen.has(tier.minQty)) {
        throw new BadRequestException({
          code: 'PRODUCT_PRICE_TIER_INVALID',
          message: `${segment} tier minQty must be unique`,
        });
      }
      seen.add(tier.minQty);

      if (tier.minQty < lastMinQty) {
        throw new BadRequestException({
          code: 'PRODUCT_PRICE_TIER_INVALID',
          message: `${segment} tiers must be sorted by minQty`,
        });
      }
      lastMinQty = tier.minQty;

      if (tier.marginRate < 0 || tier.marginRate > 100) {
        throw new BadRequestException({
          code: 'PRODUCT_PRICE_TIER_INVALID',
          message: `${segment} tier marginRate must be between 0 and 100`,
        });
      }

      if (
        tier.unitPriceOverride !== undefined &&
        tier.unitPriceOverride !== null
      ) {
        if (tier.unitPriceOverride < 0) {
          throw new BadRequestException({
            code: 'PRODUCT_PRICE_TIER_INVALID',
            message: `${segment} tier unitPriceOverride must be zero or positive`,
          });
        }
      }

      const computedUnitPrice =
        tier.unitPriceOverride !== undefined && tier.unitPriceOverride !== null
          ? tier.unitPriceOverride
          : Math.round(baseSupplyCost * (1 + tier.marginRate / 100));

      return {
        customerSegment: segment,
        minQty: tier.minQty,
        marginRate: String(tier.marginRate),
        unitPriceOverride:
          tier.unitPriceOverride !== undefined &&
          tier.unitPriceOverride !== null
            ? String(tier.unitPriceOverride)
            : null,
        computedUnitPrice: String(computedUnitPrice),
        isActive: tier.isActive ?? true,
      };
    });
  }

  private toNumber(value: string | number): number {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new BadRequestException({
        code: 'PRODUCT_INVALID_NUMBER_FORMAT',
        message: 'Numeric value format is invalid',
      });
    }

    return parsed;
  }

  private groupBy<T>(rows: T[], getKey: (row: T) => number): Map<number, T[]> {
    const grouped = new Map<number, T[]>();

    for (const row of rows) {
      const groupKey = getKey(row);

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }

      grouped.get(groupKey)?.push(row);
    }

    return grouped;
  }

  private countBy<T>(
    rows: T[],
    getKey: (row: T) => number,
  ): Map<number, number> {
    const counted = new Map<number, number>();

    for (const row of rows) {
      const groupKey = getKey(row);
      const current = counted.get(groupKey) ?? 0;
      counted.set(groupKey, current + 1);
    }

    return counted;
  }
}
