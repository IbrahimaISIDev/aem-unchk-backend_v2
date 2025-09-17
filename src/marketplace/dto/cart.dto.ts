import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
