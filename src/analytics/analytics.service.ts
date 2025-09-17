import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog, EventType } from './entities/event-log.entity';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(EventLog)
    private readonly eventRepo: Repository<EventLog>,
  ) {}

  async recordEvent(dto: CreateEventLogDto, user?: User, ip?: string, ua?: string) {
    const log = this.eventRepo.create({
      ...dto,
      timestamp: new Date(),
      userId: user?.id,
      ipAddress: ip,
      userAgent: ua,
    });
    return this.eventRepo.save(log);
  }

  async listEvents(pagination: PaginationDto, filters?: { type?: EventType }) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    let qb = this.eventRepo.createQueryBuilder('e');
    if (filters?.type) qb = qb.andWhere('e.eventType = :type', { type: filters.type });
    const [data, total] = await qb.orderBy('e.timestamp', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<EventLog>(data, total, page, limit);
  }

  async metrics() {
    // Métriques minimalistes (peuvent être enrichies)
    const totalEvents = await this.eventRepo.count();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24h = await this.eventRepo
      .createQueryBuilder('e')
      .where('e.timestamp >= :since', { since: since24h })
      .getCount();

    const top = await this.eventRepo
      .createQueryBuilder('e')
      .select('e.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.eventType')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalEvents,
      last24h,
      byType: top.reduce((acc, r) => ({ ...acc, [r.type]: parseInt(r.count, 10) }), {} as Record<string, number>),
    };
  }

  async listSessions(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    // For now, return empty list (to be implemented with real tracking)
    return new PaginationResponseDto<any>([], 0, page, limit);
  }
}
