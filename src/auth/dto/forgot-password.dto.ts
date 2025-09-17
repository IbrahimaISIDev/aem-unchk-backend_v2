import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Adresse email pour la réinitialisation',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de réinitialisation',
    example: 'abc123def456',
  })
  token: string;

  @ApiPropertyOptional({
    description: 'Alias français du nouveau mot de passe',
    example: 'nouveauMotDePasse123',
  })
  @IsOptional()
  nouveau_mot_de_passe?: string;

  @ApiPropertyOptional({
    description: 'Alias français de confirmation du mot de passe',
    example: 'nouveauMotDePasse123',
  })
  @IsOptional()
  confirmer_mot_de_passe?: string;

  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'nouveauMotDePasse123',
    minLength: 6,
  })
  @Transform(({ value, obj }) => value ?? obj?.nouveau_mot_de_passe)
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation du nouveau mot de passe',
    example: 'nouveauMotDePasse123',
    minLength: 6,
  })
  @Transform(({ value, obj }) => value ?? obj?.confirmer_mot_de_passe ?? obj?.newPassword)
  confirmNewPassword: string;
}