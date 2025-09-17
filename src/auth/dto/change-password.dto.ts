import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe',
    example: 'ancienMotDePasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'L\'ancien mot de passe doit contenir au moins 6 caractères' })
  oldPassword: string;

  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'nouveauMotDePasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation du nouveau mot de passe',
    example: 'nouveauMotDePasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La confirmation doit contenir au moins 6 caractères' })
  confirmNewPassword: string;
}