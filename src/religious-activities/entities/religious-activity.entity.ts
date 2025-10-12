import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReligiousActivityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('religious_activities')
export class ReligiousActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endAt?: Date;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({ type: 'simple-array', nullable: true })
  resources?: string[]; // URLs vers audio/vidéo/pdf

  @Column({ type: 'enum', enum: ReligiousActivityStatus, default: ReligiousActivityStatus.DRAFT })
  status: ReligiousActivityStatus;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'authorId' })
  author?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
