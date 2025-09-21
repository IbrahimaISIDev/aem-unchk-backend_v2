import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateFiliereDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty()
  @IsUUID()
  poleId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
