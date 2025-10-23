import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from './audit.service';

@Injectable()
export class AuditRetentionScheduler {
  constructor(private readonly audit: AuditService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleRetention() {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 24);
    await this.audit.purgeOlderThan(cutoff);
  }
}