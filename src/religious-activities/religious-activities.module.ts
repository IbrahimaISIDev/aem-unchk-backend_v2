import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReligiousActivity } from './entities/religious-activity.entity';
import { ReligiousActivitiesService } from './religious-activities.service';
import { ReligiousActivitiesController } from './religious-activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReligiousActivity])],
  providers: [ReligiousActivitiesService],
  controllers: [ReligiousActivitiesController],
})
export class ReligiousActivitiesModule {}
