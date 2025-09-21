// ====================================
// 2. REGISTER DTO - FINAL (SANS @Transform)
// ====================================
// auth/dto/register.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumberString,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nom de famille',
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  prenom: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'jean.dupont@example.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'motdepasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({
    description: 'Confirmation du mot de passe',
    example: 'motdepasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La confirmation du mot de passe doit contenir au moins 6 caractères' })
  confirmer_mot_de_passe: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+33123456789',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  telephone: string;

  @ApiPropertyOptional({
    description: 'Adresse',
    example: '123 rue de la Paix',
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Ville',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Université',
    example: 'Université de Paris',
  })
  @IsOptional()
  @IsString()
  universite?: string;

  @ApiPropertyOptional({
    description: 'ENO de rattachement',
    example: 'ENO001',
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
  @IsNumberString({}, { message: 'L\'année de promotion doit être un nombre' })
  annee_promotion?: string;

  @ApiPropertyOptional({
    description: 'Niveau d\'études',
    example: 'Master 1',
  })
  @IsOptional()
  @IsString()
  niveau?: string;

  @ApiPropertyOptional({
    description: 'Motivation',
    example: 'Développer mes compétences techniques',
  })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiProperty({ description: 'ID de l\'ENO' })
  @IsUUID()
  enoId: string;

  @ApiProperty({ description: 'ID du Pôle' })
  @IsUUID()
  poleId: string;

  @ApiProperty({ description: 'ID de la Filière (appartenant au pôle)' })
  @IsUUID()
  filiereId: string;
}