import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Informations de l\'utilisateur connecté',
    type: () => User,
  })
  user: User;

  @ApiProperty({
    description: 'Token d\'accès JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token d\'accès (alias pour compatibilité frontend)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Token de rafraîchissement',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}