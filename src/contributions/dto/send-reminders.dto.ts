import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { NotificationChannel } from '../services/notification.service';

export class SendRemindersDto {
  @IsOptional()
  @IsNumber()
  daysBeforeDue?: number; // défaut: 7 jours

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel; // défaut: both
}
