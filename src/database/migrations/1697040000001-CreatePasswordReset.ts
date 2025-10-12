import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreatePasswordReset1697040000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_resets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'tokenHash', type: 'varchar', length: '128', isNullable: false },
          { name: 'expiresAt', type: 'timestamp with time zone', isNullable: false },
          { name: 'usedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('password_resets', new TableIndex({ name: 'idx_password_reset_user', columnNames: ['userId'] }));
    await queryRunner.createUniqueConstraint('password_resets', new TableUnique({ name: 'uq_password_reset_token', columnNames: ['tokenHash'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('password_resets', 'uq_password_reset_token');
    await queryRunner.dropIndex('password_resets', 'idx_password_reset_user');
    await queryRunner.dropTable('password_resets');
  }
}
