import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsAdminController } from './events.admin.controller';
import { ActivitiesController } from './activities.controller';
import { EventsService } from './events.service';
import { ActivitiesService } from './activities.service';
import { Event } from './entities/event.entity';
import { Activity } from './entities/activity.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Activity]), AuditModule],
  controllers: [EventsController, ActivitiesController, EventsAdminController],
  providers: [EventsService, ActivitiesService],
  exports: [],
})
export class EventsModule {}
