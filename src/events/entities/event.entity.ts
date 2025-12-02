import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';
import { Registration } from './registration.entity';
import { EventDetails } from './event-details.entity';

// Types d'événements selon cahier des charges
export enum EventType {
  RELIGIOUS = 'religious',        // Religieux: Cours de Coran, Halaqas, Célébrations religieuses
  PEDAGOGICAL = 'pedagogical',    // Pédagogique: Conférences, Ateliers, Séminaires
  SOCIAL = 'social',              // Social: Sorties, Rencontres, Excursions
  HUMANITARIAN = 'humanitarian',  // Humanitaire: Collectes, Actions caritatives
  SPORTS = 'sports',              // Sportif: Tournois, Activités sportives
  CULTURAL = 'cultural',          // Culturel: Expositions, Événements artistiques
  OTHER = 'other',                // Autre: Non classé

  // Anciens types (pour compatibilité)
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

export enum EventVisibility {
  PUBLIC = 'public',           // Tous les visiteurs
  MEMBERS_ONLY = 'members_only', // Membres uniquement
  PRIVATE = 'private',         // Sur invitation
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

  @Column({
    type: 'enum',
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
  })
  visibility: EventVisibility;

  @Column({ length: 300, nullable: true })
  shortDescription: string;

  @Column({ length: 250, unique: true, nullable: true })
  slug: string;

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

  // Nouvelles relations pour système d'inscriptions
  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  @OneToOne(() => EventDetails, (details) => details.event, { cascade: true })
  details: EventDetails;

  // Computed properties
  get availableSpots(): number | null {
    if (!this.maxParticipants) return null;
    return Math.max(0, this.maxParticipants - this.currentParticipants);
  }

  get isFull(): boolean {
    if (!this.maxParticipants) return false;
    return this.currentParticipants >= this.maxParticipants;
  }

  get fillRate(): number {
    if (!this.maxParticipants) return 0;
    return (this.currentParticipants / this.maxParticipants) * 100;
  }

  get isUpcoming(): boolean {
    return new Date(this.date) > new Date();
  }

  get isPast(): boolean {
    const endDate = this.endDate || this.date;
    return new Date(endDate) < new Date();
  }
}