import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendUserRoleEnum1697040000002 implements MigrationInterface {
  name = 'ExtendUserRoleEnum1697040000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
        CREATE TYPE "users_role_enum" AS ENUM ('visitor','member','admin','scholar','imam','finance_manager','treasurer');
      END IF;
    END $$;`);
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'tech_manager';`);
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'sec_general';`);
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'islamic_manager';`);
    await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'pedagogic_manager';`);
  }

  public async down(): Promise<void> {
    // Enum value removal is non-trivial; keep as no-op
  }
}
