import { join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { env } from './env';
import { FoUserEntity } from '../database/entities/fo-user.entity';
import { BoAdminEntity } from '../database/entities/bo-admin.entity';
import { CategoryEntity } from '../database/entities/category.entity';
import { StoreEntity } from '../database/entities/store.entity';
import { StoreAdminPermissionEntity } from '../database/entities/store-admin-permission.entity';
import { ProductEntity } from '../database/entities/product.entity';
import { ProductVariantEntity } from '../database/entities/product-variant.entity';
import { ProductMediaEntity } from '../database/entities/product-media.entity';
import { ProductDescriptionEntity } from '../database/entities/product-description.entity';
import { ProductSpecGroupEntity } from '../database/entities/product-spec-group.entity';
import { ProductSpecEntity } from '../database/entities/product-spec.entity';
import { ProductOptionGroupEntity } from '../database/entities/product-option-group.entity';
import { ProductOptionItemEntity } from '../database/entities/product-option-item.entity';
import { ProductPriceTierEntity } from '../database/entities/product-price-tier.entity';
import { ProductShippingTierEntity } from '../database/entities/product-shipping-tier.entity';
import { ProductSeoMetaEntity } from '../database/entities/product-seo-meta.entity';
import { ProductTagEntity } from '../database/entities/product-tag.entity';
import { ProductSearchAliasEntity } from '../database/entities/product-search-alias.entity';
import { ProductAuditLogEntity } from '../database/entities/product-audit-log.entity';

const migrationPaths = [join(__dirname, '../database/migrations/*{.ts,.js}')];

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [
    FoUserEntity,
    BoAdminEntity,
    CategoryEntity,
    StoreEntity,
    StoreAdminPermissionEntity,
    ProductEntity,
    ProductVariantEntity,
    ProductMediaEntity,
    ProductDescriptionEntity,
    ProductSpecGroupEntity,
    ProductSpecEntity,
    ProductOptionGroupEntity,
    ProductOptionItemEntity,
    ProductPriceTierEntity,
    ProductShippingTierEntity,
    ProductSeoMetaEntity,
    ProductTagEntity,
    ProductSearchAliasEntity,
    ProductAuditLogEntity,
  ],
  migrations: migrationPaths,
  migrationsRun: true,
  synchronize: false,
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [
    FoUserEntity,
    BoAdminEntity,
    CategoryEntity,
    StoreEntity,
    StoreAdminPermissionEntity,
    ProductEntity,
    ProductVariantEntity,
    ProductMediaEntity,
    ProductDescriptionEntity,
    ProductSpecGroupEntity,
    ProductSpecEntity,
    ProductOptionGroupEntity,
    ProductOptionItemEntity,
    ProductPriceTierEntity,
    ProductShippingTierEntity,
    ProductSeoMetaEntity,
    ProductTagEntity,
    ProductSearchAliasEntity,
    ProductAuditLogEntity,
  ],
  migrations: migrationPaths,
  synchronize: false,
};
