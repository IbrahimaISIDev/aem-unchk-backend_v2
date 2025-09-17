import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nom de famille',
    example: 'Diallo',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nom: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Ibrahima',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  prenom: string;

  @ApiProperty({
    description: 'Adresse email unique',
    example: 'ibrahima.diallo@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'motdepasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+221785619115',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Adresse complète',
    example: 'Sicap Sacré Cœur 1',
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({
    description: 'Ville de résidence',
    example: 'Dakar',
  })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Université ou établissement',
    example: 'Université Numérique Cheikh Hamidou Kane',
  })
  @IsOptional()
  @IsString()
  universite?: string;

  @ApiPropertyOptional({
    description: 'ENO de rattachement',
    example: 'ENO Mermoz',
  })
  @IsOptional()
  @IsString()
  eno_rattachement?: string;

  @ApiPropertyOptional({
    description: 'Filière d\'études',
    example: 'IDA',
  })
  @IsOptional()
  @IsString()
  filiere?: string;

  @ApiPropertyOptional({
    description: 'Année de promotion',
    example: '2022',
  })
  @IsOptional()
  @IsString()
  annee_promotion?: string;

  @ApiPropertyOptional({
    description: 'Niveau d\'études',
    example: 'Licence 2',
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
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Statut de l\'utilisateur',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

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