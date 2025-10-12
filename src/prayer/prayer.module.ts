import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrayerService } from './prayer.service';
import { PrayerController } from './prayer.controller';
import { PrayerAdminController } from './prayer-admin.controller';
import { PrayerTime } from './entities/prayer-time.entity';
import { PrayerTimeAdjustment } from './entities/prayer-time-adjustment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrayerTime, PrayerTimeAdjustment])],
  controllers: [PrayerController, PrayerAdminController],
  providers: [PrayerService],
})
export class PrayerModule {}
