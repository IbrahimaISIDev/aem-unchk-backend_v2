import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddressToRegistrations1733151600000 implements MigrationInterface {
  name = 'AddAddressToRegistrations1733151600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne address à la table event_registrations
    await queryRunner.addColumn(
      'event_registrations',
      new TableColumn({
        name: 'address',
        type: 'varchar',
        length: '255',
        isNullable: true,
        comment: 'Adresse du participant',
      }),
    );

    console.log('✅ Colonne "address" ajoutée à la table event_registrations');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la colonne address
    await queryRunner.dropColumn('event_registrations', 'address');

    console.log('✅ Colonne "address" supprimée de la table event_registrations');
  }
}
