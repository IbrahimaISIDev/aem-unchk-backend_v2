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
import { Category } from './category.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  PODCAST = 'podcast',
  LIVE = 'live',
}

export enum MediaStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  MODERATION = 'moderation',
  REJECTED = 'rejected',
}

@Entity('media')
@Index(['type'])
@Index(['status'])
@Index(['isPublic'])
@Index(['createdAt'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  url: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.DRAFT,
  })
  status: MediaStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  downloads: number;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  duration?: number; // en secondes pour audio/video

  @Column({ nullable: true, length: 500 })
  thumbnail?: string;

  @Column({ nullable: true })
  fileSize?: number; // en bytes

  @Column({ nullable: true, length: 100 })
  mimeType?: string;

  @Column({ nullable: true, length: 255 })
  source?: string; // Source authentique pour contenu religieux

  @Column({ default: false })
  isVerified: boolean; // Validation scientifique

  @Column({ type: 'text', nullable: true })
  transcript?: string; // Transcription pour audio/video

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.media, { eager: true })
  @JoinColumn({ name: 'userId' })
  author: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Category, (category) => category.media, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId?: string;
}