import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
@Index(['sessionId'], { unique: true })
@Index(['startTime'])
@Index(['endTime'])
@Index(['userId'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  sessionId: string;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime?: Date;

  @Column({ nullable: true })
  duration?: number; // en secondes

  @Column({ default: 0 })
  pageViews: number;

  @Column({ length: 100, nullable: true })
  device?: string;

  @Column({ length: 100, nullable: true })
  browser?: string;

  @Column({ length: 50, nullable: true })
  operatingSystem?: string;

  @Column({ length: 50, nullable: true })
  ipAddress?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 500, nullable: true })
  referrer?: string;

  @Column({ length: 500, nullable: true })
  landingPage?: string;

  @Column({ length: 500, nullable: true })
  exitPage?: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.sessions, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;
}