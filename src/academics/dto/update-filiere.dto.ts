import { PartialType } from '@nestjs/swagger';
import { CreateFiliereDto } from './create-filiere.dto';

export class UpdateFiliereDto extends PartialType(CreateFiliereDto) {}
