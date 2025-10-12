import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PedagogicActivityStatus } from '../entities/pedagogic-activity.entity';

export class CreatePedagogicActivityDto {
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
  @IsEnum(PedagogicActivityStatus)
  status?: PedagogicActivityStatus;
}

export class UpdatePedagogicActivityDto extends CreatePedagogicActivityDto {}
