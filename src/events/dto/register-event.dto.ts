import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  // IsObject, // Désactivé pour V1 - utilisé pour customResponses
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterEventDto {
  @ApiProperty({ description: 'Prénom du participant', example: 'Ahmed' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Nom du participant', example: 'FALL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Email du participant', example: 'ahmed.fall@unchk.sn' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Téléphone (format sénégalais)', example: '+221771234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+221[0-9]{9}$/, {
    message: 'Le numéro doit être au format sénégalais: +221XXXXXXXXX',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Adresse du participant', example: 'Cité Keur Gorgui, Dakar' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Université', example: 'UN-CHK' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  university?: string;

  @ApiPropertyOptional({ description: 'ENO de rattachement', example: 'Dakar' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  eno?: string;

  @ApiPropertyOptional({ description: 'Pôle', example: 'Informatique' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pole?: string;

  @ApiPropertyOptional({ description: 'Filière', example: 'Génie Logiciel' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  filiere?: string;

  @ApiPropertyOptional({ description: 'Niveau', example: 'L3' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  level?: string;

  // ⚠️ CHAMPS DÉSACTIVÉS POUR V1 - Gardés pour compatibilité future (V2)
  // Ces champs restent dans l'entity Registration mais ne sont plus requis dans le formulaire

  // @ApiPropertyOptional({ description: 'Préférence alimentaire', example: 'Végétarien' })
  // @IsString()
  // @IsOptional()
  // @MaxLength(100)
  // dietaryPreference?: string;

  // @ApiPropertyOptional({ description: 'Allergies alimentaires' })
  // @IsString()
  // @IsOptional()
  // allergies?: string;

  // @ApiPropertyOptional({ description: 'Besoins spéciaux' })
  // @IsString()
  // @IsOptional()
  // specialNeeds?: string;

  // @ApiPropertyOptional({
  //   description: 'Réponses aux questions personnalisées',
  //   example: { transport: 'Oui', taille_tshirt: 'L' },
  // })
  // @IsObject()
  // @IsOptional()
  // customResponses?: Record<string, any>;
}
