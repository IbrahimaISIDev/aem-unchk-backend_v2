import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { MemberContribution } from './member-contribution.entity';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATED = 'created',
  MARKED_PAID = 'marked_paid',
  STATUS_CHANGED = 'status_changed',
  AMOUNT_UPDATED = 'amount_updated',
  REMINDER_SENT = 'reminder_sent',
}

@Entity('contribution_audits')
@Index(['contribution'])
@Index(['performedBy'])
@Index(['action'])
@Index(['createdAt'])
export class ContributionAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MemberContribution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contribution_id' })
  contribution: MemberContribution;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'json', nullable: true })
  oldValue?: any;

  @Column({ type: 'json', nullable: true })
  newValue?: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
