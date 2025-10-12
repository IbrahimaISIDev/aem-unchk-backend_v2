import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReligiousActivityStatus } from '../entities/religious-activity.entity';

export class CreateReligiousActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  resources?: string[];

  @IsOptional()
  @IsEnum(ReligiousActivityStatus)
  status?: ReligiousActivityStatus;
}

export class UpdateReligiousActivityDto extends CreateReligiousActivityDto {}
