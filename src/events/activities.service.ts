import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityStatus, ActivityType } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto } from './dto/create-activity.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async findAll(page: number, limit: number, filters?: { type?: ActivityType; status?: ActivityStatus; userId?: string }) {
    const skip = (page - 1) * limit;

    let qb = this.activityRepo.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.participant', 'participant')
      .leftJoinAndSelect('activity.event', 'event');

    if (filters?.type) qb = qb.andWhere('activity.type = :type', { type: filters.type });
    if (filters?.status) qb = qb.andWhere('activity.status = :status', { status: filters.status });
    if (filters?.userId) qb = qb.andWhere('activity.participantId = :userId', { userId: filters.userId });

    const [data, total] = await qb.orderBy('activity.date', 'DESC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  async create(dto: CreateActivityDto, user: User) {
    const activity = this.activityRepo.create({
      ...dto,
      date: new Date(dto.date),
      participantId: user.id,
    });
    return this.activityRepo.save(activity);
  }

  async update(id: string, dto: UpdateActivityDto, user: User) {
    const activity = await this.findOne(id);
    if (activity.participantId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Action non autorisée');
    }
    Object.assign(activity, {
      ...dto,
      date: dto.date ? new Date(dto.date) : activity.date,
    });
    return this.activityRepo.save(activity);
  }

  async remove(id: string, user: User) {
    const activity = await this.findOne(id);
    if (activity.participantId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Action non autorisée');
    }
    await this.activityRepo.softDelete(id);
  }
}
