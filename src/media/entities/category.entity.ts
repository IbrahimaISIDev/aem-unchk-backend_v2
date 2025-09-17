import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Media } from './media.entity';

export enum CategoryType {
  GENERAL = 'general',
  CORAN = 'coran',
  HADITH = 'hadith',
  FIQH = 'fiqh',
  SIRA = 'sira',
  AQIDA = 'aqida',
  EDUCATION = 'education',
  COMMUNITY = 'community',
  EVENTS = 'events',
}

@Entity('categories')
@Index(['name'], { unique: true })
@Index(['type'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.GENERAL,
  })
  type: CategoryType;

  @Column({ nullable: true, length: 255 })
  icon?: string;

  @Column({ nullable: true, length: 50 })
  color?: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresModeration: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToMany(() => Media, (media) => media.category)
  media: Media[];
}