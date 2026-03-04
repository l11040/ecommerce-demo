import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductDomain1700000001200 implements MigrationInterface {
  name = 'SeedProductDomain1700000001200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO stores (code, name, status, is_active)
      VALUES ('demo-store', 'Demo Store', 'active', 1)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        status = VALUES(status),
        is_active = VALUES(is_active);
    `);

    await queryRunner.query(`
      INSERT INTO store_admin_permissions (store_id, bo_admin_id, role)
      SELECT
        (SELECT id FROM stores WHERE code = 'demo-store' LIMIT 1),
        (SELECT id FROM bo_admins WHERE username = 'test' LIMIT 1),
        'super_admin'
      WHERE (SELECT COUNT(*) FROM stores WHERE code = 'demo-store') > 0
        AND (SELECT COUNT(*) FROM bo_admins WHERE username = 'test') > 0
      ON DUPLICATE KEY UPDATE role = VALUES(role);
    `);

    await queryRunner.query(`
      INSERT INTO products (
        store_id,
        category_id,
        name,
        slug,
        status,
        is_visible,
        moq,
        moq_inquiry_only,
        base_supply_cost,
        vat_type,
        vat_rate,
        is_printable,
        print_method,
        print_area,
        proof_lead_time_days,
        thumbnail_url
      )
      VALUES (
        (SELECT id FROM stores WHERE code = 'demo-store' LIMIT 1),
        (SELECT id FROM categories ORDER BY id ASC LIMIT 1),
        'N트래블 엔보우 워시백 (22x18x9 cm)',
        'demo-ntravel-washbag-22x18x9',
        'published',
        1,
        30,
        0,
        4200,
        'exclusive',
        10,
        1,
        '실크 1도 인쇄(흰색)',
        '80 x 70 mm',
        4,
        '/uploads/products/washbag-main.jpg'
      )
      ON DUPLICATE KEY UPDATE
        store_id = VALUES(store_id),
        category_id = VALUES(category_id),
        name = VALUES(name),
        status = VALUES(status),
        is_visible = VALUES(is_visible),
        moq = VALUES(moq),
        moq_inquiry_only = VALUES(moq_inquiry_only),
        base_supply_cost = VALUES(base_supply_cost),
        vat_type = VALUES(vat_type),
        vat_rate = VALUES(vat_rate),
        is_printable = VALUES(is_printable),
        print_method = VALUES(print_method),
        print_area = VALUES(print_area),
        proof_lead_time_days = VALUES(proof_lead_time_days),
        thumbnail_url = VALUES(thumbnail_url);
    `);

    await queryRunner.query(`
      DELETE poi
      FROM product_option_items poi
      JOIN product_option_groups pog ON pog.id = poi.option_group_id
      WHERE pog.product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_price_tiers
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_shipping_tiers
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE ps
      FROM product_specs ps
      JOIN product_spec_groups psg ON psg.id = ps.spec_group_id
      WHERE psg.product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_spec_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_tags
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_search_aliases
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_media
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);

    await queryRunner.query(`
      INSERT INTO product_media (product_id, type, source_type, url, alt_text, sort_order)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'image', 'uploaded', '/uploads/products/washbag-main.jpg', 'N트래블 워시백 메인', 0),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'image', 'uploaded', '/uploads/products/washbag-gray.jpg', 'N트래블 워시백 그레이', 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'image', 'uploaded', '/uploads/products/washbag-navy.jpg', 'N트래블 워시백 네이비', 2),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'image', 'uploaded', '/uploads/products/washbag-detail.jpg', 'N트래블 워시백 디테일', 3),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'image', 'uploaded', '/uploads/products/washbag-lifestyle.jpg', 'N트래블 워시백 라이프스타일', 4);
    `);

    await queryRunner.query(`
      INSERT INTO product_option_groups (product_id, name, is_required, selection_type, sort_order)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '제품 색상 선택', 1, 'single', 0),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '인쇄 옵션 선택', 1, 'single', 1);
    `);

    await queryRunner.query(`
      INSERT INTO product_option_items (
        option_group_id,
        label,
        extra_supply_cost,
        extra_unit_price,
        sort_order,
        is_active
      )
      SELECT
        id AS option_group_id,
        '그레이' AS label,
        0 AS extra_supply_cost,
        0 AS extra_unit_price,
        0 AS sort_order,
        1 AS is_active
      FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
        AND name = '제품 색상 선택'
      UNION ALL
      SELECT
        id AS option_group_id,
        '네이비' AS label,
        0 AS extra_supply_cost,
        0 AS extra_unit_price,
        1 AS sort_order,
        1 AS is_active
      FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
        AND name = '제품 색상 선택'
      UNION ALL
      SELECT
        id AS option_group_id,
        '인쇄 없음(투명라벨 부착)' AS label,
        0 AS extra_supply_cost,
        0 AS extra_unit_price,
        0 AS sort_order,
        1 AS is_active
      FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
        AND name = '인쇄 옵션 선택'
      UNION ALL
      SELECT
        id AS option_group_id,
        '라벨 인쇄 (1000개 단위 주문) 무료' AS label,
        0 AS extra_supply_cost,
        0 AS extra_unit_price,
        1 AS sort_order,
        1 AS is_active
      FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
        AND name = '인쇄 옵션 선택';
    `);

    await queryRunner.query(`
      INSERT INTO product_price_tiers (
        product_id,
        customer_segment,
        min_qty,
        margin_rate,
        unit_price_override,
        computed_unit_price,
        is_active
      )
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 30, 31, 6075, 6075, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 50, 28, 5850, 5850, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 100, 25, 5670, 5670, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 300, 23, 5490, 5490, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 500, 21, 5310, 5310, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 1000, 19, 5175, 5175, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'guest', 3000, 16, 5085, 5085, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 30, 28, 5850, 5850, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 50, 25, 5670, 5670, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 100, 23, 5490, 5490, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 300, 21, 5310, 5310, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 500, 19, 5175, 5175, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 1000, 17, 5085, 5085, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'member', 3000, 14, 4995, 4995, 1);
    `);

    await queryRunner.query(`
      INSERT INTO product_shipping_tiers (product_id, min_qty, shipping_fee, is_active)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 1, 0, 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 3000, 12000, 1);
    `);

    await queryRunner.query(`
      INSERT INTO product_spec_groups (product_id, name, sort_order)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '기본정보', 0);
    `);
    await queryRunner.query(`
      INSERT INTO product_specs (spec_group_id, label, value, sort_order)
      VALUES
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '납품기간',
          '시안 확정 후 4~6일',
          0
        ),
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '인쇄여부',
          '가능',
          1
        ),
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '인쇄공간',
          '80 x 70 mm',
          2
        ),
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '제품색상',
          '그레이, 네이비',
          3
        ),
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '제품크기',
          '220 x 180 x 90 mm',
          4
        ),
        (
          (SELECT id FROM product_spec_groups
            WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1)
              AND name = '기본정보'
            LIMIT 1),
          '최소주문수량',
          '30개',
          5
        );
    `);

    await queryRunner.query(`
      INSERT INTO product_descriptions (
        product_id,
        description_html_raw,
        description_html_sanitized,
        updated_by_admin_id
      )
      VALUES (
        (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1),
        '<h2>N트래블 엔보우 워시백</h2><p>판촉물 전용 샘플 상세입니다.</p>',
        '<h2>N트래블 엔보우 워시백</h2><p>판촉물 전용 샘플 상세입니다.</p>',
        (SELECT id FROM bo_admins WHERE username = 'test' LIMIT 1)
      )
      ON DUPLICATE KEY UPDATE
        description_html_raw = VALUES(description_html_raw),
        description_html_sanitized = VALUES(description_html_sanitized),
        updated_by_admin_id = VALUES(updated_by_admin_id);
    `);

    await queryRunner.query(`
      INSERT INTO product_seo_meta (
        product_id,
        meta_title,
        meta_description,
        meta_keywords,
        canonical_url,
        robots,
        og_title,
        og_description,
        og_image
      )
      VALUES (
        (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1),
        'N트래블 엔보우 워시백 판촉물',
        '인쇄 옵션과 수량별 단가를 제공하는 판촉물 상품',
        '판촉물,워시백,인쇄,대량주문',
        'https://demo.example.com/products/demo-ntravel-washbag-22x18x9',
        'index,follow',
        'N트래블 엔보우 워시백',
        'B2B 판촉물 샘플 상품',
        '/uploads/products/washbag-main.jpg'
      )
      ON DUPLICATE KEY UPDATE
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        meta_keywords = VALUES(meta_keywords),
        canonical_url = VALUES(canonical_url),
        robots = VALUES(robots),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        og_image = VALUES(og_image);
    `);

    await queryRunner.query(`
      INSERT INTO product_tags (product_id, tag, sort_order)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '판촉물', 0),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '워시백', 1),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '인쇄가능', 2);
    `);

    await queryRunner.query(`
      INSERT INTO product_search_aliases (product_id, alias_text, sort_order)
      VALUES
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), 'N트래블 파우치', 0),
        ((SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1), '세면 파우치', 1);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM product_tags
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_search_aliases
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_media
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_seo_meta
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_descriptions
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_shipping_tiers
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_price_tiers
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);

    await queryRunner.query(`
      DELETE poi
      FROM product_option_items poi
      JOIN product_option_groups pog ON pog.id = poi.option_group_id
      WHERE pog.product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_option_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);

    await queryRunner.query(`
      DELETE ps
      FROM product_specs ps
      JOIN product_spec_groups psg ON psg.id = ps.spec_group_id
      WHERE psg.product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);
    await queryRunner.query(`
      DELETE FROM product_spec_groups
      WHERE product_id = (SELECT id FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9' LIMIT 1);
    `);

    await queryRunner.query(`
      DELETE FROM products WHERE slug = 'demo-ntravel-washbag-22x18x9';
    `);

    await queryRunner.query(`
      DELETE FROM store_admin_permissions
      WHERE store_id = (SELECT id FROM stores WHERE code = 'demo-store' LIMIT 1)
        AND bo_admin_id = (SELECT id FROM bo_admins WHERE username = 'test' LIMIT 1);
    `);

    await queryRunner.query(`
      DELETE FROM stores WHERE code = 'demo-store';
    `);
  }
}
