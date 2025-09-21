import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GenerateContributionsDto {
  @IsEnum(['monthly', 'quarterly', 'annual'])
  contributionType: 'monthly' | 'quarterly' | 'annual';

  @IsOptional()
  @IsNumber()
  defaultAmount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string; // si non fourni, calcule par type
}
