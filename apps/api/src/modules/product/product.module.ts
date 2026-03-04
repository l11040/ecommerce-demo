import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ProductDescriptionEntity } from '../../database/entities/product-description.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { ProductMediaEntity } from '../../database/entities/product-media.entity';
import { ProductAuditLogEntity } from '../../database/entities/product-audit-log.entity';
import { ProductOptionGroupEntity } from '../../database/entities/product-option-group.entity';
import { ProductOptionItemEntity } from '../../database/entities/product-option-item.entity';
import { ProductPriceTierEntity } from '../../database/entities/product-price-tier.entity';
import { ProductSearchAliasEntity } from '../../database/entities/product-search-alias.entity';
import { ProductSeoMetaEntity } from '../../database/entities/product-seo-meta.entity';
import { ProductShippingTierEntity } from '../../database/entities/product-shipping-tier.entity';
import { ProductSpecGroupEntity } from '../../database/entities/product-spec-group.entity';
import { ProductSpecEntity } from '../../database/entities/product-spec.entity';
import { ProductTagEntity } from '../../database/entities/product-tag.entity';
import { StoreAdminPermissionEntity } from '../../database/entities/store-admin-permission.entity';
import { StoreEntity } from '../../database/entities/store.entity';
import { ProductAssetService } from './product-asset.service';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from './repositories/product.repository';
import { TypeOrmProductRepository } from './repositories/typeorm-product.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreEntity,
      CategoryEntity,
      ProductEntity,
      ProductMediaEntity,
      ProductAuditLogEntity,
      ProductPriceTierEntity,
      ProductShippingTierEntity,
      ProductOptionGroupEntity,
      ProductOptionItemEntity,
      ProductSpecGroupEntity,
      ProductSpecEntity,
      ProductDescriptionEntity,
      ProductSeoMetaEntity,
      ProductTagEntity,
      ProductSearchAliasEntity,
      StoreAdminPermissionEntity,
    ]),
  ],
  providers: [
    ProductService,
    ProductAssetService,
    TypeOrmProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: TypeOrmProductRepository,
    },
  ],
  exports: [ProductService, ProductAssetService],
})
export class ProductModule {}
