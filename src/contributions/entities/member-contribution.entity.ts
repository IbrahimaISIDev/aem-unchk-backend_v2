import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type ContributionStatus = 'pending' | 'paid' | 'overdue';
export type ContributionType = 'monthly' | 'quarterly' | 'annual';

@Entity('member_contributions')
@Index(['member'])
@Index(['status'])
@Index(['dueDate'])
export class MemberContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'overdue'], default: 'pending' })
  status: ContributionStatus;

  @Column({ type: 'enum', enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' })
  contributionType: ContributionType;

  @Column({ nullable: true })
  transactionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
