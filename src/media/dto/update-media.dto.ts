import { PartialType } from '@nestjs/swagger';
import { CreateMediaDto } from './create-media.dto';
import { CreateCategoryDto } from './create-category.dto'; // Ajoutez cet import

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}