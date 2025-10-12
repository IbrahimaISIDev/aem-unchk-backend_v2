import { IsDateString, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdatePrayerAdjustmentDto {
  @IsDateString()
  date: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsInt()
  method?: number;

  @IsOptional()
  @IsInt()
  @Min(-180)
  @Max(180)
  fajrOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(-180)
  @Max(180)
  dhuhrOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(-180)
  @Max(180)
  asrOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(-180)
  @Max(180)
  maghribOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(-180)
  @Max(180)
  ishaOffset?: number;

  @IsOptional()
  @IsString()
  @Length(4, 5)
  fajrOverride?: string;

  @IsOptional()
  @IsString()
  @Length(4, 5)
  dhuhrOverride?: string;

  @IsOptional()
  @IsString()
  @Length(4, 5)
  asrOverride?: string;

  @IsOptional()
  @IsString()
  @Length(4, 5)
  maghribOverride?: string;

  @IsOptional()
  @IsString()
  @Length(4, 5)
  ishaOverride?: string;
}
