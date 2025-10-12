import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateActivitiesModules1697040000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'religious_activities',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'title', type: 'varchar', length: '200' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'startAt', type: 'timestamp with time zone', isNullable: true },
        { name: 'endAt', type: 'timestamp with time zone', isNullable: true },
        { name: 'location', type: 'varchar', length: '200', isNullable: true },
        { name: 'resources', type: 'text', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'draft'` },
        { name: 'authorId', type: 'uuid' },
        { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
      ],
      foreignKeys: [
        { columnNames: ['authorId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
      ],
    }));

    await queryRunner.createTable(new Table({
      name: 'pedagogic_activities',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
        { name: 'title', type: 'varchar', length: '200' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'startAt', type: 'timestamp with time zone', isNullable: true },
        { name: 'endAt', type: 'timestamp with time zone', isNullable: true },
        { name: 'location', type: 'varchar', length: '200', isNullable: true },
        { name: 'resources', type: 'text', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'draft'` },
        { name: 'authorId', type: 'uuid' },
        { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
      ],
      foreignKeys: [
        { columnNames: ['authorId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pedagogic_activities');
    await queryRunner.dropTable('religious_activities');
  }
}
