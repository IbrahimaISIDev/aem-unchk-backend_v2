import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type AuditStatus = 'success' | 'fail';

@Entity('audit_logs')
@Index(['createdAt'])
@Index(['entityType'])
@Index(['actorId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  actorId?: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  entityType: string;

  @Column({ nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  before?: any;

  @Column({ type: 'jsonb', nullable: true })
  after?: any;

  @Column({ type: 'varchar', length: 10 })
  status: AuditStatus;

  @Column({ nullable: true, length: 100 })
  ip?: string;

  @Column({ nullable: true, length: 500 })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  context?: any;

  @CreateDateColumn()
  createdAt: Date;
}