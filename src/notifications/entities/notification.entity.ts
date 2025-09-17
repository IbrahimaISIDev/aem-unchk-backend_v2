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

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  PRAYER_REMINDER = 'prayer_reminder',
  EVENT_REMINDER = 'event_reminder',
  NEW_CONTENT = 'new_content',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
@Index(['type'])
@Index(['read'])
@Index(['priority'])
@Index(['scheduledFor'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({
    type: 'simple-array',
    default: [NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  scheduledFor?: Date;

  @Column({ default: false })
  sent: boolean;

  @Column({ nullable: true })
  sentAt?: Date;

  @Column({ type: 'json', nullable: true })
  data?: Record<string, any>;

  @Column({ nullable: true, length: 500 })
  actionUrl?: string;

  @Column({ nullable: true, length: 100 })
  actionText?: string;

  @Column({ nullable: true, length: 500 })
  imageUrl?: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  userId: string;
}