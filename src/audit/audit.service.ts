import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditStatus } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  async log(entry: Partial<AuditLog>) {
    const e = this.repo.create({ ...entry });
    return this.repo.save(e);
  }

  async purgeOlderThan(cutoff: Date) {
    await this.repo.createQueryBuilder().delete().from(AuditLog).where('createdAt < :cutoff', { cutoff }).execute();
  }
}