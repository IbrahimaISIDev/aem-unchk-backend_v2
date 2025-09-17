import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, NotificationChannel } from './notification.entity';

@Entity('notification_templates')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['isActive'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'simple-array',
  })
  channels: NotificationChannel[];

  @Column({ type: 'text', nullable: true })
  emailTemplate?: string;

  @Column({ type: 'text', nullable: true })
  smsTemplate?: string;

  @Column({ type: 'text', nullable: true })
  pushTemplate?: string;

  @Column({ type: 'simple-array', nullable: true })
  variables?: string[]; // Liste des variables utilisables comme {{userName}}, {{eventTitle}}

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}