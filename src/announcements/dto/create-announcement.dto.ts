import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { AnnouncementStatus, AnnouncementType } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiProperty({ description: 'ISO 8601' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ description: 'ISO 8601' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ enum: AnnouncementStatus })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional({ description: 'ISO 8601' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ description: 'ISO 8601' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ChangeAnnouncementStatusDto {
  @ApiProperty({ enum: AnnouncementStatus })
  @IsEnum(AnnouncementStatus)
  status: AnnouncementStatus;
}
