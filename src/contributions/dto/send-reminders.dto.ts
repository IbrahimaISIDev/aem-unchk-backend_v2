import { IsNumber, IsOptional } from 'class-validator';

export class SendRemindersDto {
  @IsOptional()
  @IsNumber()
  daysBeforeDue?: number; // défaut via env
}
