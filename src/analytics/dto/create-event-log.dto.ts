import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EventType } from '../entities/event-log.entity';

export class CreateEventLogDto {
  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiPropertyOptional({ description: 'Payload JSON sérialisé' })
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;
}
