import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginationResponseDto<T> {
  @ApiPropertyOptional({
    description: 'Array of items',
    type: [Object],
  })
  data: T[];

  @ApiPropertyOptional({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiPropertyOptional({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiPropertyOptional({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevious: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}