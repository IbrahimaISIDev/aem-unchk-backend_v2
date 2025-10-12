import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PedagogicActivityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('pedagogic_activities')
export class PedagogicActivity {
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
  resources?: string[];

  @Column({ type: 'enum', enum: PedagogicActivityStatus, default: PedagogicActivityStatus.DRAFT })
  status: PedagogicActivityStatus;

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
