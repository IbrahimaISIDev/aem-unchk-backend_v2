import { PartialType } from '@nestjs/swagger';
import { CreateEnoDto } from './create-eno.dto';

export class UpdateEnoDto extends PartialType(CreateEnoDto) {}
