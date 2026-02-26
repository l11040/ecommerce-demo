import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAuthUsers1700000001000 implements MigrationInterface {
  name = 'SeedAuthUsers1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO fo_users (email, password_hash, display_name)
      VALUES ('test@test.test', 'test', 'FO Test User')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        display_name = VALUES(display_name);
    `);

    await queryRunner.query(`
      INSERT INTO bo_admins (username, password_hash, display_name)
      VALUES ('test', 'test', 'BO Test Admin')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        display_name = VALUES(display_name);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM fo_users WHERE email = 'test@test.test';`,
    );
    await queryRunner.query(`DELETE FROM bo_admins WHERE username = 'test';`);
  }
}
