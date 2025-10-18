import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Informations de l\'utilisateur',
    type: () => User,
    required: false,
  })
  user?: User;

  @ApiProperty({
    description: 'Token d\'accès JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  access_token?: string;

  @ApiProperty({
    description: 'Token d\'accès (alias)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  token?: string;

  @ApiProperty({
    description: 'Token de rafraîchissement',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Message de réponse',
    example: 'Inscription réussie',
  })
  message: string;

  @ApiProperty({
    description: 'Indique si l\'activation est requise',
    example: true,
    required: false,
  })
  requiresActivation?: boolean;
}