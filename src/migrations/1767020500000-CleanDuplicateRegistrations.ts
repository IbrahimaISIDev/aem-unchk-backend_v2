import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanDuplicateRegistrations1767020500000 implements MigrationInterface {
    name = 'CleanDuplicateRegistrations1767020500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les doublons en gardant seulement la première inscription pour chaque (eventId, email)
        await queryRunner.query(`
            DELETE FROM event_registrations
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM event_registrations
                GROUP BY "eventId", email
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Pas de rollback possible pour cette migration
        // Les doublons supprimés ne peuvent pas être restaurés
    }

}
