import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueEmailPerEvent1767020508473 implements MigrationInterface {
    name = 'AddUniqueEmailPerEvent1767020508473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e35b3062b9736865ac4ae9586e" ON "event_registrations" ("eventId", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e35b3062b9736865ac4ae9586e"`);
    }

}
