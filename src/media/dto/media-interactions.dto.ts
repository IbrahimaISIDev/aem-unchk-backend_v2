import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class LikeMediaDto {
  @ApiProperty({
    description: 'Action à effectuer (like ou unlike)',
    example: 'like',
  })
  @IsString()
  action: 'like' | 'unlike';
}

export class CommentMediaDto {
  @ApiProperty({
    description: 'Contenu du commentaire',
    example: 'Magnifique récitation, qu\'Allah vous récompense !',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    description: 'ID du commentaire parent (pour les réponses)',
    example: 'uuid-of-parent-comment',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class MediaStatsDto {
  @ApiProperty({
    description: 'Nombre de likes',
    example: 42,
  })
  likes: number;

  @ApiProperty({
    description: 'Nombre de vues',
    example: 1250,
  })
  views: number;

  @ApiProperty({
    description: 'Nombre de téléchargements',
    example: 89,
  })
  downloads: number;

  @ApiProperty({
    description: 'Nombre de commentaires',
    example: 15,
  })
  comments?: number;
}

export class ViewMediaDto {
  @ApiPropertyOptional({
    description: 'Durée de visionnage en secondes',
    example: 120,
  })
  @IsOptional()
  watchTime?: number;

  @ApiPropertyOptional({
    description: 'Qualité de lecture',
    example: '720p',
  })
  @IsOptional()
  @IsString()
  quality?: string;
}