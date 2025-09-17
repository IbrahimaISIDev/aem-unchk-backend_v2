import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Coran et Tafsir',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Description de la catégorie',
    example: 'Contenu lié au Coran et aux commentaires',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type de catégorie',
    enum: CategoryType,
    default: CategoryType.GENERAL,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    description: 'Icône de la catégorie',
    example: 'book-open',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Couleur de la catégorie (code hex)',
    example: '#4CAF50',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Catégorie active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Nécessite une modération',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresModeration?: boolean;
}