import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreatePrayerTables1697040000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prayer_times',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'date', type: 'date', isNullable: false },
          { name: 'city', type: 'varchar', length: '120', isNullable: false },
          { name: 'country', type: 'varchar', length: '120', isNullable: false },
          { name: 'method', type: 'int', isNullable: false, default: 2 },
          { name: 'timezone', type: 'varchar', length: '120', isNullable: true },
          { name: 'fajr', type: 'varchar', length: '5', isNullable: false },
          { name: 'dhuhr', type: 'varchar', length: '5', isNullable: false },
          { name: 'asr', type: 'varchar', length: '5', isNullable: false },
          { name: 'maghrib', type: 'varchar', length: '5', isNullable: false },
          { name: 'isha', type: 'varchar', length: '5', isNullable: false },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'prayer_times',
      new TableUnique({ name: 'uq_prayer_times_date_location_method', columnNames: ['date', 'city', 'country', 'method'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'prayer_time_adjustments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'date', type: 'date', isNullable: false },
          { name: 'city', type: 'varchar', length: '120', isNullable: false },
          { name: 'country', type: 'varchar', length: '120', isNullable: false },
          { name: 'method', type: 'int', isNullable: true },
          { name: 'fajrOffset', type: 'int', default: 0 },
          { name: 'dhuhrOffset', type: 'int', default: 0 },
          { name: 'asrOffset', type: 'int', default: 0 },
          { name: 'maghribOffset', type: 'int', default: 0 },
          { name: 'ishaOffset', type: 'int', default: 0 },
          { name: 'fajrOverride', type: 'varchar', length: '5', isNullable: true },
          { name: 'dhuhrOverride', type: 'varchar', length: '5', isNullable: true },
          { name: 'asrOverride', type: 'varchar', length: '5', isNullable: true },
          { name: 'maghribOverride', type: 'varchar', length: '5', isNullable: true },
          { name: 'ishaOverride', type: 'varchar', length: '5', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'prayer_time_adjustments',
      new TableUnique({ name: 'uq_prayer_adj_date_location', columnNames: ['date', 'city', 'country'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('prayer_time_adjustments', 'uq_prayer_adj_date_location');
    await queryRunner.dropTable('prayer_time_adjustments');
    await queryRunner.dropUniqueConstraint('prayer_times', 'uq_prayer_times_date_location_method');
    await queryRunner.dropTable('prayer_times');
  }
}
