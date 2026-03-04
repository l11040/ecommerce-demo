import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductDomain1700000003000 implements MigrationInterface {
  name = 'CreateProductDomain1700000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT NOT NULL AUTO_INCREMENT,
        code VARCHAR(60) NOT NULL,
        name VARCHAR(120) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_stores_code (code),
        INDEX IDX_stores_status_active (status, is_active),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS store_admin_permissions (
        id INT NOT NULL AUTO_INCREMENT,
        store_id INT NOT NULL,
        bo_admin_id INT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'store_admin',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_store_admin_permissions_store_admin (store_id, bo_admin_id),
        INDEX IDX_store_admin_permissions_admin_role (bo_admin_id, role),
        CONSTRAINT FK_store_admin_permissions_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        CONSTRAINT FK_store_admin_permissions_bo_admin FOREIGN KEY (bo_admin_id) REFERENCES bo_admins(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT NOT NULL AUTO_INCREMENT,
        store_id INT NOT NULL,
        category_id INT NULL,
        name VARCHAR(180) NOT NULL,
        slug VARCHAR(220) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        is_visible TINYINT(1) NOT NULL DEFAULT 0,
        moq INT NOT NULL DEFAULT 1,
        moq_inquiry_only TINYINT(1) NOT NULL DEFAULT 0,
        base_supply_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        vat_type VARCHAR(20) NOT NULL DEFAULT 'exclusive',
        vat_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        is_printable TINYINT(1) NOT NULL DEFAULT 0,
        print_method VARCHAR(120) NULL,
        print_area VARCHAR(120) NULL,
        proof_lead_time_days INT NULL,
        thumbnail_url VARCHAR(700) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_products_slug (slug),
        INDEX IDX_products_store_status_visible (store_id, status, is_visible),
        INDEX IDX_products_category_id (category_id),
        CONSTRAINT FK_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT,
        CONSTRAINT FK_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku VARCHAR(80) NOT NULL,
        name VARCHAR(180) NOT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 1,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_variants_sku (sku),
        INDEX IDX_product_variants_product_id (product_id),
        CONSTRAINT FK_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_media (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        source_type VARCHAR(20) NOT NULL,
        url VARCHAR(700) NOT NULL,
        alt_text VARCHAR(180) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX IDX_product_media_product_type_sort (product_id, type, sort_order),
        CONSTRAINT FK_product_media_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_descriptions (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        description_html_raw LONGTEXT NOT NULL,
        description_html_sanitized LONGTEXT NOT NULL,
        updated_by_admin_id INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_descriptions_product_id (product_id),
        INDEX IDX_product_descriptions_updated_by_admin (updated_by_admin_id),
        CONSTRAINT FK_product_descriptions_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT FK_product_descriptions_admin FOREIGN KEY (updated_by_admin_id) REFERENCES bo_admins(id) ON DELETE SET NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_spec_groups (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        name VARCHAR(120) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX IDX_product_spec_groups_product_sort (product_id, sort_order),
        CONSTRAINT FK_product_spec_groups_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_specs (
        id INT NOT NULL AUTO_INCREMENT,
        spec_group_id INT NOT NULL,
        label VARCHAR(120) NOT NULL,
        value VARCHAR(255) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX IDX_product_specs_group_sort (spec_group_id, sort_order),
        CONSTRAINT FK_product_specs_group FOREIGN KEY (spec_group_id) REFERENCES product_spec_groups(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_option_groups (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        name VARCHAR(120) NOT NULL,
        is_required TINYINT(1) NOT NULL DEFAULT 0,
        selection_type VARCHAR(20) NOT NULL DEFAULT 'single',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX IDX_product_option_groups_product_required_sort (product_id, is_required, sort_order),
        CONSTRAINT FK_product_option_groups_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_option_items (
        id INT NOT NULL AUTO_INCREMENT,
        option_group_id INT NOT NULL,
        label VARCHAR(160) NOT NULL,
        extra_supply_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        extra_unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX IDX_product_option_items_group_sort (option_group_id, sort_order),
        CONSTRAINT FK_product_option_items_group FOREIGN KEY (option_group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_price_tiers (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        customer_segment VARCHAR(20) NOT NULL,
        min_qty INT NOT NULL,
        margin_rate DECIMAL(5,2) NOT NULL,
        unit_price_override DECIMAL(12,2) NULL,
        computed_unit_price DECIMAL(12,2) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_price_tiers_product_segment_qty (product_id, customer_segment, min_qty),
        INDEX IDX_product_price_tiers_product_segment_active (product_id, customer_segment, is_active),
        CONSTRAINT FK_product_price_tiers_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_shipping_tiers (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        min_qty INT NOT NULL,
        shipping_fee DECIMAL(12,2) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_shipping_tiers_product_qty (product_id, min_qty),
        INDEX IDX_product_shipping_tiers_product_active (product_id, is_active),
        CONSTRAINT FK_product_shipping_tiers_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_seo_meta (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        meta_keywords VARCHAR(255) NULL,
        canonical_url VARCHAR(500) NULL,
        robots VARCHAR(120) NULL,
        og_title VARCHAR(255) NULL,
        og_description TEXT NULL,
        og_image VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_seo_meta_product_id (product_id),
        CONSTRAINT FK_product_seo_meta_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        tag VARCHAR(80) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_tags_product_tag (product_id, tag),
        INDEX IDX_product_tags_product_sort (product_id, sort_order),
        CONSTRAINT FK_product_tags_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_search_aliases (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        alias_text VARCHAR(120) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_product_search_aliases_product_alias (product_id, alias_text),
        INDEX IDX_product_search_aliases_product_sort (product_id, sort_order),
        CONSTRAINT FK_product_search_aliases_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_audit_logs (
        id BIGINT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        actor_admin_id INT NULL,
        action VARCHAR(60) NOT NULL,
        payload_json JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX IDX_product_audit_logs_product_created (product_id, created_at),
        INDEX IDX_product_audit_logs_actor_created (actor_admin_id, created_at),
        CONSTRAINT FK_product_audit_logs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT FK_product_audit_logs_actor FOREIGN KEY (actor_admin_id) REFERENCES bo_admins(id) ON DELETE SET NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS product_audit_logs;');
    await queryRunner.query('DROP TABLE IF EXISTS product_search_aliases;');
    await queryRunner.query('DROP TABLE IF EXISTS product_tags;');
    await queryRunner.query('DROP TABLE IF EXISTS product_seo_meta;');
    await queryRunner.query('DROP TABLE IF EXISTS product_shipping_tiers;');
    await queryRunner.query('DROP TABLE IF EXISTS product_price_tiers;');
    await queryRunner.query('DROP TABLE IF EXISTS product_option_items;');
    await queryRunner.query('DROP TABLE IF EXISTS product_option_groups;');
    await queryRunner.query('DROP TABLE IF EXISTS product_specs;');
    await queryRunner.query('DROP TABLE IF EXISTS product_spec_groups;');
    await queryRunner.query('DROP TABLE IF EXISTS product_descriptions;');
    await queryRunner.query('DROP TABLE IF EXISTS product_media;');
    await queryRunner.query('DROP TABLE IF EXISTS product_variants;');
    await queryRunner.query('DROP TABLE IF EXISTS products;');
    await queryRunner.query('DROP TABLE IF EXISTS store_admin_permissions;');
    await queryRunner.query('DROP TABLE IF EXISTS stores;');
  }
}
