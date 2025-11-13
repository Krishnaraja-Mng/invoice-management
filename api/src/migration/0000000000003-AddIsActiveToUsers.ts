import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToUsers0000000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add is_active column for soft delete functionality
        await queryRunner.query(`
            ALTER TABLE users
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
        `);

        // Create index for better query performance on active users
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
        `);

        // Update system user to be always active (should already be, but explicit is good)
        await queryRunner.query(`
            UPDATE users 
            SET is_active = true 
            WHERE id = '00000000-0000-0000-0000-000000000000';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active;`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS is_active;`);
    }
}
