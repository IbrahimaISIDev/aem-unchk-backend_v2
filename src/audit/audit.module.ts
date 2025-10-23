import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditRetentionScheduler } from './audit.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, AuditRetentionScheduler],
  exports: [AuditService],
})
export class AuditModule {}