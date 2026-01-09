import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationChannel } from '../services/notification.service';

export class SendIndividualReminderDto {
  @IsUUID()
  contributionId: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel; // défaut: both
}

export class SendBulkRemindersDto {
  @IsUUID('4', { each: true })
  contributionIds: string[];

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel; // défaut: both
}
