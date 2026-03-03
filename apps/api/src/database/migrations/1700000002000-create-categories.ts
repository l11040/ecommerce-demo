import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1700000002000 implements MigrationInterface {
  name = 'CreateCategories1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT NOT NULL AUTO_INCREMENT,
        parent_id INT NULL,
        depth TINYINT NOT NULL,
        path VARCHAR(255) NOT NULL,
        name VARCHAR(120) NOT NULL,
        slug VARCHAR(140) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        is_main_exposed TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_categories_path (path),
        INDEX IDX_categories_parent_id (parent_id),
        INDEX IDX_categories_depth (depth),
        INDEX IDX_categories_main_exposed (is_main_exposed),
        INDEX IDX_categories_sort_order (sort_order),
        CONSTRAINT FK_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS categories;');
  }
}
