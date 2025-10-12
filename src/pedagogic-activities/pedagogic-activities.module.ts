import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedagogicActivity } from './entities/pedagogic-activity.entity';
import { PedagogicActivitiesService } from './pedagogic-activities.service';
import { PedagogicActivitiesController } from './pedagogic-activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PedagogicActivity])],
  providers: [PedagogicActivitiesService],
  controllers: [PedagogicActivitiesController],
})
export class PedagogicActivitiesModule {}
