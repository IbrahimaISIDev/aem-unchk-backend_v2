import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MarkPaidDto {
  @IsDateString()
  paidDate: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
