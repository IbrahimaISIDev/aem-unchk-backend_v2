import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDate,
  IsNumber,
  IsArray,
  IsObject,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus, EventVisibility } from '../entities/event.entity';
import {
  Speaker,
  Partner,
  FAQ,
  Document,
  CustomFormField,
} from '../entities/event-details.entity';

export class CreateEventFullDto {
  // Informations de base
  @ApiProperty({ description: 'Titre de l\'événement', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Description courte', maxLength: 300 })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type d\'événement', enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Date de début', type: String, example: '2024-12-15T09:00:00Z' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({ description: 'Date de fin', type: String })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Nom du lieu', example: 'Campus ENO Dakar' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Adresse complète' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Dakar' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Statut', enum: EventStatus, default: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Visibilité', enum: EventVisibility, default: EventVisibility.PUBLIC })
  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @ApiPropertyOptional({ description: 'Événement en ligne', default: false })
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @ApiPropertyOptional({ description: 'Lien en ligne (Zoom, Meet, etc.)' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  onlineLink?: string;

  @ApiPropertyOptional({ description: 'Image de couverture (URL)' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  banner?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Événement à la une', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  // Paramètres d'inscription
  @ApiPropertyOptional({ description: 'Inscription requise', default: true })
  @IsBoolean()
  @IsOptional()
  requiresRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Capacité maximale' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional({ description: 'Prix (0 si gratuit)', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  // Détails supplémentaires
  @ApiPropertyOptional({ description: 'Programme détaillé (Markdown/HTML)' })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiPropertyOptional({ description: 'Prérequis' })
  @IsString()
  @IsOptional()
  prerequisites?: string;

  @ApiPropertyOptional({ description: 'Intervenants', type: 'array' })
  @IsArray()
  @IsOptional()
  speakers?: Speaker[];

  @ApiPropertyOptional({ description: 'Partenaires', type: 'array' })
  @IsArray()
  @IsOptional()
  partners?: Partner[];

  @ApiPropertyOptional({ description: 'FAQs', type: 'array' })
  @IsArray()
  @IsOptional()
  faqs?: FAQ[];

  @ApiPropertyOptional({ description: 'Documents à télécharger', type: 'array' })
  @IsArray()
  @IsOptional()
  documents?: Document[];

  @ApiPropertyOptional({ description: 'Champs personnalisés du formulaire', type: 'array' })
  @IsArray()
  @IsOptional()
  customFormFields?: CustomFormField[];

  @ApiPropertyOptional({ description: 'Message de confirmation personnalisé' })
  @IsString()
  @IsOptional()
  confirmationMessage?: string;

  @ApiPropertyOptional({ description: 'Politique d\'annulation' })
  @IsString()
  @IsOptional()
  cancellationPolicy?: string;

  @ApiPropertyOptional({ description: 'Notes importantes' })
  @IsString()
  @IsOptional()
  importantNotes?: string;

  @ApiPropertyOptional({ description: 'URL vidéo (YouTube, Vimeo)' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'URL Google Maps' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  mapUrl?: string;

  @ApiPropertyOptional({ description: 'Email de contact' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Téléphone de contact' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Nom du contact' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Date d\'ouverture des inscriptions', type: String })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationOpenDate?: Date;

  @ApiPropertyOptional({ description: 'Date de clôture des inscriptions', type: String })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationCloseDate?: Date;

  @ApiPropertyOptional({ description: 'Places réservées pour invités' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reservedSpots?: number;

  @ApiPropertyOptional({ description: 'Activer la liste d\'attente', default: true })
  @IsBoolean()
  @IsOptional()
  enableWaitlist?: boolean;

  @ApiPropertyOptional({ description: 'Autoriser l\'annulation', default: true })
  @IsBoolean()
  @IsOptional()
  allowCancellation?: boolean;

  @ApiPropertyOptional({ description: 'Délai d\'annulation (heures avant événement)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cancellationDeadlineHours?: number;

  @ApiPropertyOptional({ description: 'Métadonnées supplémentaires', type: 'object' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateEventFullDto {
  // Tous les champs sont optionnels pour l'update
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  // Autres champs optionnels au besoin
}
