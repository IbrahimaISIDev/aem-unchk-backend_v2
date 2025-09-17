import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

export enum AnnouncementType {
  MEETING = 'meeting',
  GENERAL_ASSEMBLY = 'general_assembly',
  EVENT = 'event',
  ACTIVITY = 'activity',
  INFO = 'info',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('announcements')
@Index(['status'])
@Index(['type'])
@Index(['startAt'])
@Index(['endAt'])
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: AnnouncementType, default: AnnouncementType.EVENT })
  type: AnnouncementType;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endAt?: Date;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ length: 500, nullable: true })
  link?: string;

  @Column({ type: 'enum', enum: AnnouncementStatus, default: AnnouncementStatus.DRAFT })
  status: AnnouncementStatus;

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
}
