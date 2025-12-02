import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsAdminController } from './events.admin.controller';
import { ActivitiesController } from './activities.controller';
import { RegistrationsController } from './registrations.controller';
import { EventsService } from './events.service';
import { ActivitiesService } from './activities.service';
import { RegistrationsService } from './registrations.service';
import { EventStatsService } from './event-stats.service';
import { EventNotificationsService } from './event-notifications.service';
import { EventExportsService } from './event-exports.service';
import { Event } from './entities/event.entity';
import { Activity } from './entities/activity.entity';
import { Registration } from './entities/registration.entity';
import { EventDetails } from './entities/event-details.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Activity, Registration, EventDetails]),
    AuditModule,
  ],
  controllers: [
    EventsController,
    ActivitiesController,
    EventsAdminController,
    RegistrationsController,
  ],
  providers: [
    EventsService,
    ActivitiesService,
    RegistrationsService,
    EventStatsService,
    EventNotificationsService,
    EventExportsService,
  ],
  exports: [EventsService, RegistrationsService, EventStatsService],
})
export class EventsModule {}
