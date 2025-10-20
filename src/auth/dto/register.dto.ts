// ====================================
// REGISTER DTO - CORRIGÉ ET ALIGNÉ AVEC LE FRONTEND
// ====================================
// src/auth/dto/register.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class RegisterDto {
  // ===== ÉTAPE 1: INFORMATIONS PERSONNELLES =====
  
  @ApiProperty({
    description: 'Nom de famille',
    example: 'Dupont',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Jean',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  prenom: string;

  @ApiProperty({
    description: 'Adresse email institutionnelle',
    example: 'jean.dupont@unchk.edu.sn',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (min 8 caractères)',
    example: 'Motdepasse#2025',
    minLength: 8,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({
    description: 'Confirmation du mot de passe',
    example: 'Motdepasse#2025',
    minLength: 8,
  })
  @IsString({ message: 'La confirmation doit être une chaîne de caractères' })
  @MinLength(8, { message: 'La confirmation du mot de passe doit contenir au moins 8 caractères' })
  confirmer_mot_de_passe: string;

  // ===== ÉTAPE 2: COORDONNÉES =====
  
  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+221771234567',
  })
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  telephone: string;

  @ApiProperty({
    description: 'Adresse complète',
    example: 'Cité Keur Gorgui, Dakar',
  })
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'L\'adresse est requise' })
  adresse: string;

  @ApiProperty({
    description: 'Ville de résidence',
    example: 'Dakar',
  })
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La ville est requise' })
  ville: string;

  // ===== ÉTAPE 3: ÉTUDES =====
  
  @ApiPropertyOptional({
    description: 'Nom de l\'université',
    example: 'Université Numérique Cheikh Hamidou Kane',
  })
  @IsOptional()
  @IsString({ message: 'L\'université doit être une chaîne de caractères' })
  universite?: string;

  @ApiPropertyOptional({
    description: 'Nom de l\'ENO de rattachement',
    example: 'ENO Dakar',
  })
  @IsOptional()
  @IsString({ message: 'L\'ENO de rattachement doit être une chaîne de caractères' })
  eno_rattachement?: string;

  @ApiPropertyOptional({
    description: 'Nom de la filière d\'études',
    example: 'Génie Logiciel',
  })
  @IsOptional()
  @IsString({ message: 'La filière doit être une chaîne de caractères' })
  filiere?: string;

  @ApiProperty({
    description: 'Année de promotion',
    example: '2024-2025',
  })
  @IsString({ message: 'L\'année de promotion doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'L\'année de promotion est requise' })
  @Matches(/^\d{4}(-\d{4})?$/, {
    message: 'Format d\'année invalide. Utilisez YYYY ou YYYY-YYYY (ex: 2024 ou 2024-2025)',
  })
  annee_promotion: string;

  @ApiProperty({
    description: 'Niveau d\'études actuel',
    example: 'L3',
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat', 'Autre'],
  })
  @IsString({ message: 'Le niveau doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le niveau est requis' })
  niveau: string;

  // ===== IDs DES RELATIONS (REQUIS) =====
  
  @ApiProperty({
    description: 'UUID de l\'ENO',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'L\'ID de l\'ENO doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID de l\'ENO est requis' })
  enoId: string;

  @ApiProperty({
    description: 'UUID du Pôle',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'L\'ID du Pôle doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID du Pôle est requis' })
  poleId: string;

  @ApiProperty({
    description: 'UUID de la Filière',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4', { message: 'L\'ID de la Filière doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID de la Filière est requis' })
  filiereId: string;

  // ===== ÉTAPE 4: MOTIVATION (OPTIONNEL) =====
  
  @ApiPropertyOptional({
    description: 'Lettre de motivation',
    example: 'Je souhaite rejoindre l\'AEM-UNCHK pour contribuer au développement de la communauté étudiante musulmane...',
  })
  @IsOptional()
  @IsString({ message: 'La motivation doit être une chaîne de caractères' })
  motivation?: string;
}