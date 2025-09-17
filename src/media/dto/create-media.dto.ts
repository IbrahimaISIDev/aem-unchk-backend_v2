import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUUID,
  MaxLength,
  IsUrl,
  Min,
} from 'class-validator';
import { MediaType, MediaStatus } from '../entities/media.entity';

export class CreateMediaDto {
  @ApiProperty({
    description: 'Titre du média',
    example: 'Récitation de la Sourate Al-Fatiha',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Description du média',
    example: 'Récitation magnifique de la Sourate Al-Fatiha par le récitateur...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL du fichier média',
    example: 'https://example.com/media/recitation.mp3',
  })
  @IsString()
  @IsUrl({}, { message: 'URL invalide' })
  url: string;

  @ApiProperty({
    description: 'Type de média',
    enum: MediaType,
    example: MediaType.AUDIO,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({
    description: 'Statut du média',
    enum: MediaStatus,
    default: MediaStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional({
    description: 'Tags associés au média',
    type: [String],
    example: ['coran', 'recitation', 'al-fatiha'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Média public ou privé',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Durée en secondes (pour audio/vidéo)',
    example: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({
    description: 'URL de la miniature',
    example: 'https://example.com/thumbnails/thumb.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'URL de miniature invalide' })
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Taille du fichier en bytes',
    example: 5242880,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'Type MIME du fichier',
    example: 'audio/mpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Source authentique du contenu',
    example: 'Récitateur Ahmed Al-Ajmy',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Transcription du contenu (pour audio/vidéo)',
    example: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...',
  })
  @IsOptional()
  @IsString()
  transcript?: string;

  @ApiPropertyOptional({
    description: 'ID de la catégorie',
    example: 'uuid-of-category',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Média mis en avant',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}