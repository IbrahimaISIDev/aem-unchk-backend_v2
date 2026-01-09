import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { ContributionNotificationService } from './services/notification.service';
import { ContributionReportsService } from './services/reports.service';
import { ReceiptService } from './services/receipt.service';
import { MemberContribution } from './entities/member-contribution.entity';
import { ContributionAudit } from './entities/contribution-audit.entity';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberContribution, ContributionAudit]),
    UsersModule,
    EmailModule,
  ],
  controllers: [ContributionsController],
  providers: [
    ContributionsService,
    ContributionNotificationService,
    ContributionReportsService,
    ReceiptService,
  ],
  exports: [
    ContributionsService,
    ContributionNotificationService,
    ContributionReportsService,
    ReceiptService,
  ],
})
export class ContributionsModule {}
