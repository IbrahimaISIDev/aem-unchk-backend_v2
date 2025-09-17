import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
