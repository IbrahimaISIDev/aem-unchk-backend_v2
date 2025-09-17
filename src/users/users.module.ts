// ===== users/users.module.ts =====
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Activity } from '../events/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Activity]),
    // Suppression de AuthModule pour éviter la dépendance circulaire
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}