import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Recherche globale (nom, prénom, email, téléphone, université, eno)', example: 'diallo' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Nom', example: 'Diallo' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ description: 'Prénom', example: 'Ibrahima' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'user@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone', example: '+221770000000' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Université', example: 'UCAD' })
  @IsOptional()
  @IsString()
  universite?: string;

  @ApiPropertyOptional({ description: 'ENO de rattachement', example: 'ENO-001' })
  @IsOptional()
  @IsString()
  eno_rattachement?: string;

  @ApiPropertyOptional({ description: 'Rôle', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Statut', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'Création - à partir de (ISO date)', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: 'Création - jusqu\'à (ISO date)', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
