// ===== users/users.module.ts =====
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersAdminController } from './users.admin.controller';
import { User } from './entities/user.entity';
import { Activity } from '../events/entities/activity.entity';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Activity]),
    EmailModule,
    NotificationsModule,
    AuditModule, 
  ],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}