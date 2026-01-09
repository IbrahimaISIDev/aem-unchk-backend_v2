import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
}

export class ExportReportDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'overdue'])
  status?: 'pending' | 'paid' | 'overdue';

  @IsOptional()
  @IsEnum(['monthly', 'quarterly', 'annual'])
  contributionType?: 'monthly' | 'quarterly' | 'annual';
}
