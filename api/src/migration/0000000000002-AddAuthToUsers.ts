import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthToUsers0000000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password and role columns (safe if not exist)
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password varchar(255) NULL,
        ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'user';
    `);

    // If there are users without role (older data), set to 'user'
    await queryRunner.query(`
      UPDATE users SET role = 'user' WHERE role IS NULL;
    `);

    // Add index on role for quick role-based queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS password,
        DROP COLUMN IF EXISTS role;
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role;`);
  }
}