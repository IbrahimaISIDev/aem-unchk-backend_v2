import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationPriority, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async findAllForUser(userId: string, { page = 1, limit = 10 }: PaginationDto, filters?: { read?: boolean; type?: string }) {
    const skip = (page - 1) * limit;
    let qb = this.notifRepo.createQueryBuilder('n').where('n.userId = :userId', { userId });
    if (typeof filters?.read === 'boolean') qb = qb.andWhere('n.read = :read', { read: filters.read });
    if (filters?.type) qb = qb.andWhere('n.type = :type', { type: filters.type });

    const [data, total] = await qb.orderBy('n.createdAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Notification>(data, total, page, limit);
  }

  async create(dto: CreateNotificationDto) {
    const notif = this.notifRepo.create({
      ...dto,
      user_id: dto.userId || undefined,
      userId: dto.userId || undefined,
      type: dto.type || NotificationType.INFO,
      priority: dto.priority || NotificationPriority.NORMAL,
      read: false,
      sent: false,
    });
    return this.notifRepo.save(notif);
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification introuvable');
    if (notif.userId !== userId) throw new ForbiddenException('Action non autorisée');
    if (!notif.read) {
      notif.read = true;
      notif.readAt = new Date();
      await this.notifRepo.save(notif);
    }
  }

  async markAllAsRead(userId: string) {
    await this.notifRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true, readAt: () => 'CURRENT_TIMESTAMP' as any })
      .where('userId = :userId AND read = false', { userId })
      .execute();
  }
}
