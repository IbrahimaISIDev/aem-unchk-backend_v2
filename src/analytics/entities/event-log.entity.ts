import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EventType {
  PAGE_VIEW = 'page_view',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  MEDIA_VIEW = 'media_view',
  MEDIA_LIKE = 'media_like',
  MEDIA_DOWNLOAD = 'media_download',
  EVENT_JOIN = 'event_join',
  EVENT_LEAVE = 'event_leave',
  PRAYER_TIME_VIEW = 'prayer_time_view',
  MARKETPLACE_VIEW = 'marketplace_view',
  PRODUCT_VIEW = 'product_view',
  ORDER_CREATE = 'order_create',
  ORDER_COMPLETE = 'order_complete',
  SEARCH = 'search',
  CLICK = 'click',
  ERROR = 'error',
}

@Entity('event_logs')
@Index(['eventType'])
@Index(['timestamp'])
@Index(['userId'])
@Index(['sessionId'])
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column({ type: 'json' })
  data: Record<string, any>;

  @Column()
  timestamp: Date;

  @Column({ nullable: true, length: 100 })
  sessionId?: string;

  @Column({ nullable: true, length: 50 })
  ipAddress?: string;

  @Column({ nullable: true, length: 500 })
  userAgent?: string;

  @Column({ nullable: true, length: 500 })
  referrer?: string;

  @Column({ nullable: true, length: 255 })
  page?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('uuid', { nullable: true })
  userId?: string;
}