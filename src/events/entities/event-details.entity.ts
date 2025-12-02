import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';

export interface Speaker {
  name: string;
  title: string;
  bio?: string;
  photo?: string;
}

export interface Partner {
  name: string;
  logo?: string;
  website?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Document {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Pour select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

@Entity('event_details')
export class EventDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  eventId: string;

  @OneToOne(() => Event, (event) => event.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  // Programme détaillé
  @Column({ type: 'text', nullable: true })
  program: string; // Markdown ou HTML

  @Column({ type: 'text', nullable: true })
  prerequisites: string;

  // Intervenants
  @Column({ type: 'jsonb', nullable: true })
  speakers: Speaker[];

  // Partenaires
  @Column({ type: 'jsonb', nullable: true })
  partners: Partner[];

  // FAQs
  @Column({ type: 'jsonb', nullable: true })
  faqs: FAQ[];

  // Documents à télécharger
  @Column({ type: 'jsonb', nullable: true })
  documents: Document[];

  // Champs personnalisés du formulaire d'inscription
  @Column({ type: 'jsonb', nullable: true })
  customFormFields: CustomFormField[];

  // Messages personnalisés
  @Column({ type: 'text', nullable: true })
  confirmationMessage: string;

  @Column({ type: 'text', nullable: true })
  cancellationPolicy: string;

  @Column({ type: 'text', nullable: true })
  importantNotes: string; // "À savoir" - tenue, documents à apporter, etc.

  // Liens
  @Column({ length: 500, nullable: true })
  videoUrl: string; // YouTube, Vimeo, etc.

  @Column({ length: 500, nullable: true })
  mapUrl: string; // Google Maps embed

  // Contact organisateur
  @Column({ length: 255, nullable: true })
  contactEmail: string;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactName: string;

  // Paramètres d'inscription
  @Column({ nullable: true })
  registrationOpenDate: Date;

  @Column({ nullable: true })
  registrationCloseDate: Date;

  @Column({ type: 'int', nullable: true })
  reservedSpots: number; // Places réservées pour invités

  @Column({ default: true })
  enableWaitlist: boolean;

  @Column({ default: true })
  allowCancellation: boolean;

  @Column({ type: 'int', nullable: true })
  cancellationDeadlineHours: number; // Heures avant l'événement

  // Métadonnées
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
