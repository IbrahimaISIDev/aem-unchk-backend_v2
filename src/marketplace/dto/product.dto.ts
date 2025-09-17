import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProductCategory, ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'Stock disponible' })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ description: 'Mise en avant' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProductDto extends CreateProductDto {}
