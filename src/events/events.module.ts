import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { ActivitiesController } from './activities.controller';
import { EventsService } from './events.service';
import { ActivitiesService } from './activities.service';
import { Event } from './entities/event.entity';
import { Activity } from './entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Activity])],
  controllers: [EventsController, ActivitiesController],
  providers: [EventsService, ActivitiesService],
  exports: [],
})
export class EventsModule {}
