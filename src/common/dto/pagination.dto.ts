import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Max, IsString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number (starts from 1)', minimum: 1, default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 20, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Global search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort expression (e.g., "createdAt:desc")', required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  get skip(): number {
    const pageNum = typeof this.page === 'string' ? parseInt(this.page) : this.page;
    const limitNum = typeof this.limit === 'string' ? parseInt(this.limit) : this.limit;
    const result = (pageNum - 1) * limitNum;
    console.log('🔍 SKIP CALCULATION:', { page: this.page, limit: this.limit, pageNum, limitNum, skip: result });
    return result;
  }
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationResponseDto<T> {
  data: T[];
  meta: PaginatedMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit || 1);
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}