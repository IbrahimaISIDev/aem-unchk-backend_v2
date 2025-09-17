import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'John',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+33123456789',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Adresse complète',
    example: '123 Rue de la Paix',
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Ville de résidence',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Université ou établissement',
    example: 'Université de Paris',
  })
  @IsOptional()
  @IsString()
  universite?: string;

  @ApiPropertyOptional({
    description: 'ENO de rattachement',
    example: 'AEM-UNCHK Paris',
  })
  @IsOptional()
  @IsString()
  eno_rattachement?: string;

  @ApiPropertyOptional({
    description: 'Filière d\'études',
    example: 'Informatique',
  })
  @IsOptional()
  @IsString()
  filiere?: string;

  @ApiPropertyOptional({
    description: 'Année de promotion',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  annee_promotion?: string;

  @ApiPropertyOptional({
    description: 'Niveau d\'études',
    example: 'Master 1',
  })
  @IsOptional()
  @IsString()
  niveau?: string;

  @ApiPropertyOptional({
    description: 'Motivation pour rejoindre la plateforme',
    example: 'Participer aux activités communautaires et enrichir mes connaissances islamiques',
  })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiPropertyOptional({
    description: 'Biographie de l\'utilisateur',
    example: 'Passionné par les sciences islamiques et l\'informatique',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL de l\'avatar',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}