import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe',
    example: 'AncienMotDePasse#2024',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'L\'ancien mot de passe doit contenir au moins 8 caractères' })
  oldPassword: string;

  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'NouveauMotDePasse#2025',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation du nouveau mot de passe',
    example: 'NouveauMotDePasse#2025',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La confirmation doit contenir au moins 8 caractères' })
  confirmNewPassword: string;
}