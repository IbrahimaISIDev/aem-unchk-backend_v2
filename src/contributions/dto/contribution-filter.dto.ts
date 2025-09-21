import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class ContributionFilterDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'overdue'])
  status?: 'pending' | 'paid' | 'overdue';

  @IsOptional()
  @IsEnum(['monthly', 'quarterly', 'annual'])
  contributionType?: 'monthly' | 'quarterly' | 'annual';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
