// ====================================
// 1. LOGIN DTO - FINAL (SANS @Transform)
// ====================================
// auth/dto/login.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email de l\'utilisateur',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @ValidateIf((o) => !o.telephone || o.email)
  email?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de l\'utilisateur',
    example: '+33123456789',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.email || o.telephone)
  telephone?: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'motdepasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}