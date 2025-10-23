import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAdminController } from './media.admin.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Media } from './entities/media.entity';
import { Category } from './entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Category]),
    AuthModule,
    AuditModule, 
  ],
  controllers: [MediaController, CategoriesController, MediaAdminController],
  providers: [MediaService, CategoriesService],
  exports: [MediaService, CategoriesService, TypeOrmModule],
})
export class MediaModule {}