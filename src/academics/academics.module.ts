import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { Eno } from './entities/eno.entity';
import { Pole } from './entities/pole.entity';
import { Filiere } from './entities/filiere.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Eno, Pole, Filiere])],
  controllers: [AcademicsController],
  providers: [AcademicsService],
  exports: [TypeOrmModule, AcademicsService],
})
export class AcademicsModule implements OnModuleInit {
  constructor(private readonly service: AcademicsService) {}
  async onModuleInit() {
    await this.service.seed();
  }
}
