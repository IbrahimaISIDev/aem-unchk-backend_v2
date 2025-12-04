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
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

export enum RegistrationStatus {
  CONFIRMED = 'confirmed',
  WAITLIST = 'waitlist',
  CANCELLED = 'cancelled',
  PRESENT = 'present',
  ABSENT = 'absent',
}

@Entity('event_registrations')
@Index(['eventId', 'userId'], { unique: true })
@Index(['eventId'])
@Index(['userId'])
@Index(['status'])
@Index(['email'])
@Index(['registrationNumber'], { unique: true })
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  registrationNumber: string; // Format: AEM-2024-INT-001234

  // Relations
  @Column('uuid')
  eventId: string;

  @ManyToOne(() => Event, (event) => event.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column('uuid', { nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Informations du participant
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 150, nullable: true })
  university: string;

  @Column({ length: 100, nullable: true })
  eno: string;

  @Column({ length: 100, nullable: true })
  pole: string;

  @Column({ length: 100, nullable: true })
  filiere: string;

  @Column({ length: 50, nullable: true })
  level: string;

  // Informations complémentaires
  @Column({ length: 100, nullable: true })
  dietaryPreference: string; // végétarien, sans gluten, etc.

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  specialNeeds: string;

  // Réponses aux questions personnalisées de l'événement
  @Column({ type: 'jsonb', nullable: true })
  customResponses: Record<string, any>;

  // Statut et suivi
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.CONFIRMED,
  })
  status: RegistrationStatus;

  @Column({ nullable: true, length: 500 })
  qrCodeUrl: string;

  @Column({ nullable: true })
  checkedInAt: Date;

  @Column('uuid', { nullable: true })
  checkedInBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'checkedInBy' })
  checkedInByUser: User;

  // Annulation
  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Notifications
  @Column({ default: false })
  confirmationEmailSent: boolean;

  @Column({ default: false })
  reminderJ7Sent: boolean;

  @Column({ default: false })
  reminderJ1Sent: boolean;

  @Column({ default: false })
  reminderDayOfSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isPresent(): boolean {
    return this.status === RegistrationStatus.PRESENT;
  }

  // Alias pour compatibilité frontend
  get checkedIn(): boolean {
    return this.isPresent;
  }

  get isCancelled(): boolean {
    return this.status === RegistrationStatus.CANCELLED;
  }

  get isConfirmed(): boolean {
    return this.status === RegistrationStatus.CONFIRMED;
  }

  // Méthode pour sérialiser les getters dans les réponses JSON
  toJSON() {
    return {
      ...this,
      checkedIn: this.isPresent,
      isPresent: this.isPresent,
      isCancelled: this.isCancelled,
      isConfirmed: this.isConfirmed,
      fullName: this.fullName,
    };
  }
}
