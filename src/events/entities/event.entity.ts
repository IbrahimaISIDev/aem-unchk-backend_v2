import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  PRAYER = 'prayer',
  STUDY_CIRCLE = 'study_circle',
  COMMUNITY_GATHERING = 'community_gathering',
  CHARITY = 'charity',
  RAMADAN = 'ramadan',
  EID = 'eid',
  HAJJ_UMRAH = 'hajj_umrah',
  ONLINE = 'online',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ONGOING = 'ongoing',
}

@Entity('events')
@Index(['type'])
@Index(['status'])
@Index(['isPublic'])
@Index(['date'])
@Index(['endDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @Column({ nullable: true, length: 255 })
  address?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.COMMUNITY_GATHERING,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true, length: 500 })
  onlineLink?: string;

  @Column({ nullable: true })
  maxParticipants?: number;

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ default: false })
  requiresRegistration: boolean;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true, length: 500 })
  banner?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.organizedEvents, { eager: true })
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column('uuid')
  organizerId: string;

  @OneToMany(() => Activity, (activity) => activity.event)
  activities: Activity[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'event_participants',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];
}