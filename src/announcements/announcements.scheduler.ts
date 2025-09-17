import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnnouncementsService } from './announcements.service';

@Injectable()
export class AnnouncementsScheduler {
  constructor(private readonly service: AnnouncementsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    await this.service.autoUpdateStatuses();
  }
}
