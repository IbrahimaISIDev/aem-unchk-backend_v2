import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

export enum ActivityType {
  ATTENDANCE = 'attendance',
  PARTICIPATION = 'participation',
  CONTRIBUTION = 'contribution',
  DONATION = 'donation',
  VOLUNTEER = 'volunteer',
  FEEDBACK = 'feedback',
  COMPLETION = 'completion',
}

export enum ActivityStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('activities')
@Index(['type'])
@Index(['status'])
@Index(['date'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  date: Date;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.PARTICIPATION,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.PENDING,
  })
  status: ActivityStatus;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.activities, { eager: true })
  @JoinColumn({ name: 'participantId' })
  participant: User;

  @Column('uuid')
  participantId: string;

  @ManyToOne(() => Event, (event) => event.activities, { eager: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column('uuid', { nullable: true })
  eventId?: string;
}