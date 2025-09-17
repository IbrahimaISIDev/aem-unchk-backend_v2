import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { EventLog } from './entities/event-log.entity';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventLog, UserSession])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
