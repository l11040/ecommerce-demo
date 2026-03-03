import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1700000001100 implements MigrationInterface {
  name = 'SeedCategories1700000001100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // depth 1
    await queryRunner.query(`
      INSERT INTO categories
        (id, parent_id, depth, path, name, slug, sort_order, is_active, is_visible, is_main_exposed)
      VALUES
        (1001, NULL, 1, '1001', '전자기기', 'electronics', 10, 1, 1, 1),
        (1002, NULL, 1, '1002', '패션', 'fashion', 20, 1, 1, 1),
        (1003, NULL, 1, '1003', '홈·리빙', 'home', 30, 1, 1, 1),
        (1004, NULL, 1, '1004', '식품', 'food', 40, 1, 1, 0)
      ON DUPLICATE KEY UPDATE
        parent_id = VALUES(parent_id),
        depth = VALUES(depth),
        path = VALUES(path),
        name = VALUES(name),
        slug = VALUES(slug),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        is_visible = VALUES(is_visible),
        is_main_exposed = VALUES(is_main_exposed);
    `);

    // depth 2
    await queryRunner.query(`
      INSERT INTO categories
        (id, parent_id, depth, path, name, slug, sort_order, is_active, is_visible, is_main_exposed)
      VALUES
        (1101, 1001, 2, '1001.1101', '컴퓨터', 'computers', 10, 1, 1, 1),
        (1102, 1001, 2, '1001.1102', '모바일·태블릿', 'mobile', 20, 1, 1, 1),
        (1103, 1001, 2, '1001.1103', '음향·영상', 'audio-video', 30, 1, 1, 0),
        (1201, 1002, 2, '1002.1201', '남성의류', 'men', 10, 1, 1, 0),
        (1202, 1002, 2, '1002.1202', '여성의류', 'women', 20, 1, 1, 1),
        (1203, 1002, 2, '1002.1203', '신발', 'shoes', 30, 1, 1, 0),
        (1301, 1003, 2, '1003.1301', '가구', 'furniture', 10, 1, 1, 0),
        (1302, 1003, 2, '1003.1302', '주방용품', 'kitchen', 20, 1, 1, 0),
        (1303, 1003, 2, '1003.1303', '인테리어', 'interior', 30, 1, 1, 0),
        (1401, 1004, 2, '1004.1401', '신선식품', 'fresh', 10, 1, 1, 0),
        (1402, 1004, 2, '1004.1402', '가공식품', 'processed', 20, 1, 1, 0)
      ON DUPLICATE KEY UPDATE
        parent_id = VALUES(parent_id),
        depth = VALUES(depth),
        path = VALUES(path),
        name = VALUES(name),
        slug = VALUES(slug),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        is_visible = VALUES(is_visible),
        is_main_exposed = VALUES(is_main_exposed);
    `);

    // depth 3
    await queryRunner.query(`
      INSERT INTO categories
        (id, parent_id, depth, path, name, slug, sort_order, is_active, is_visible, is_main_exposed)
      VALUES
        (1111, 1101, 3, '1001.1101.1111', '노트북', 'laptops', 10, 1, 1, 1),
        (1112, 1101, 3, '1001.1101.1112', '데스크탑', 'desktops', 20, 1, 1, 0),
        (1113, 1101, 3, '1001.1101.1113', '모니터', 'monitors', 30, 1, 1, 0),
        (1121, 1102, 3, '1001.1102.1121', '스마트폰', 'smartphones', 10, 1, 1, 1),
        (1122, 1102, 3, '1001.1102.1122', '태블릿', 'tablets', 20, 1, 1, 0),
        (1211, 1201, 3, '1002.1201.1211', '상의', 'men-tops', 10, 1, 1, 0),
        (1212, 1201, 3, '1002.1201.1212', '하의', 'men-bottoms', 20, 1, 1, 0),
        (1221, 1202, 3, '1002.1202.1221', '상의', 'women-tops', 10, 1, 1, 0),
        (1222, 1202, 3, '1002.1202.1222', '원피스·스커트', 'dresses-skirts', 20, 1, 1, 0)
      ON DUPLICATE KEY UPDATE
        parent_id = VALUES(parent_id),
        depth = VALUES(depth),
        path = VALUES(path),
        name = VALUES(name),
        slug = VALUES(slug),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        is_visible = VALUES(is_visible),
        is_main_exposed = VALUES(is_main_exposed);
    `);

    // depth 4
    await queryRunner.query(`
      INSERT INTO categories
        (id, parent_id, depth, path, name, slug, sort_order, is_active, is_visible, is_main_exposed)
      VALUES
        (11111, 1111, 4, '1001.1101.1111.11111', '게이밍 노트북', 'gaming-laptops', 10, 1, 1, 1),
        (11112, 1111, 4, '1001.1101.1111.11112', '울트라북', 'ultrabooks', 20, 1, 1, 0)
      ON DUPLICATE KEY UPDATE
        parent_id = VALUES(parent_id),
        depth = VALUES(depth),
        path = VALUES(path),
        name = VALUES(name),
        slug = VALUES(slug),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        is_visible = VALUES(is_visible),
        is_main_exposed = VALUES(is_main_exposed);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // depth 4
    await queryRunner.query(
      `DELETE FROM categories WHERE id IN (11111, 11112);`,
    );
    // depth 3
    await queryRunner.query(
      `DELETE FROM categories WHERE id IN (1111, 1112, 1113, 1121, 1122, 1211, 1212, 1221, 1222);`,
    );
    // depth 2
    await queryRunner.query(
      `DELETE FROM categories WHERE id IN (1101, 1102, 1103, 1201, 1202, 1203, 1301, 1302, 1303, 1401, 1402);`,
    );
    // depth 1
    await queryRunner.query(
      `DELETE FROM categories WHERE id IN (1001, 1002, 1003, 1004);`,
    );
  }
}
