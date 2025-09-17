import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddPointsDto {
  @ApiProperty({
    description: 'Nombre de points à ajouter',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiPropertyOptional({
    description: 'Raison de l\'ajout de points',
    example: 'Participation à un événement',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserPointsResponseDto {
  @ApiProperty({
    description: 'Nombre total de points de l\'utilisateur',
    example: 150,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Points ajoutés lors de cette opération',
    example: 10,
  })
  addedPoints?: number;

  @ApiProperty({
    description: 'Raison de l\'ajout',
    example: 'Participation à un événement',
  })
  reason?: string;
}

export class AddFavoriteDto {
  @ApiProperty({
    description: 'ID de l\'élément à ajouter aux favoris',
    example: 'uuid-of-media-or-event',
  })
  @IsString()
  itemId: string;

  @ApiPropertyOptional({
    description: 'Type d\'élément (media, event, etc.)',
    example: 'media',
  })
  @IsOptional()
  @IsString()
  itemType?: string;
}

export class RemoveFavoriteDto {
  @ApiProperty({
    description: 'ID de l\'élément à retirer des favoris',
    example: 'uuid-of-media-or-event',
  })
  @IsString()
  itemId: string;
}

export class UserFavoritesResponseDto {
  @ApiProperty({
    description: 'Liste des IDs des éléments favoris',
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  favorites: string[];

  @ApiProperty({
    description: 'Nombre total de favoris',
    example: 3,
  })
  count: number;
}