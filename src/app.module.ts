import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrayerModule } from './prayer/prayer.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { FinanceModule } from './finance/finance.module';
import { ContributionsModule } from './contributions/contributions.module';
import { MarketplaceAnalyticsModule } from './marketplace-analytics/marketplace-analytics.module';
import { AcademicsModule } from './academics/academics.module';
import { EmailModule } from './email/email.module';
import { ReligiousActivitiesModule } from './religious-activities/religious-activities.module';
import { AuditModule } from './audit/audit.module';
import { PedagogicActivitiesModule } from './pedagogic-activities/pedagogic-activities.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './common/controllers/health.controller';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DatabaseModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('throttle.ttl') * 1000,
          limit: configService.get('throttle.limit'),
        },
      ],
    }),

    // Health checks
    TerminusModule,

    // Caching
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: 300, // 5 minutes
        max: 100, // maximum number of items in cache
      }),
      isGlobal: true,
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // File upload
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get('upload.uploadDir'),
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
        limits: {
          fileSize: configService.get('upload.maxFileSize'),
        },
      }),
    }),

    // Business modules
    AuthModule,
    UsersModule,
    MediaModule,
    EventsModule,
    NotificationsModule,
    AnalyticsModule,
    PrayerModule,
    MarketplaceModule,
    AnnouncementsModule,
    FinanceModule,
    ContributionsModule,
    MarketplaceAnalyticsModule,
    AcademicsModule,
    ReligiousActivitiesModule,
    PedagogicActivitiesModule,
    AdminModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}