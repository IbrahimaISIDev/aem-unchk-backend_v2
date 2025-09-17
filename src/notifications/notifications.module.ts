import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationTemplate])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
