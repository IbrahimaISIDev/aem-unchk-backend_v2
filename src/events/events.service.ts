import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus, EventType } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    filters?: { status?: 'upcoming' | 'ongoing' | 'completed'; type?: EventType; search?: string }
  ) {
    const skip = (page - 1) * limit;
    let qb = this.eventRepo.createQueryBuilder('event').leftJoinAndSelect('event.organizer', 'organizer');

    if (filters?.type) qb = qb.andWhere('event.type = :type', { type: filters.type });
    if (filters?.search) qb = qb.andWhere('(event.title ILIKE :q OR event.description ILIKE :q)', { q: `%${filters.search}%` });

    const now = new Date();
    if (filters?.status === 'upcoming') qb = qb.andWhere('event.date >= :now AND event.status IN (:...st)', { now, st: [EventStatus.PUBLISHED, EventStatus.ONGOING] });
    if (filters?.status === 'ongoing') qb = qb.andWhere('event.status = :st', { st: EventStatus.ONGOING });
    if (filters?.status === 'completed') qb = qb.andWhere('event.status = :st', { st: EventStatus.COMPLETED });

    const [data, total] = await qb.orderBy('event.date', 'ASC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  async create(dto: CreateEventDto, user: User) {
    const event = this.eventRepo.create({
      ...dto,
      date: new Date(dto.date),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      organizerId: user.id,
      status: dto.status ?? EventStatus.DRAFT,
      isPublic: dto.isPublic ?? true,
    });
    return this.eventRepo.save(event);
  }

  async update(id: string, dto: UpdateEventDto, user: User) {
    const event = await this.findOne(id);
    if (event.organizerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Action non autorisée');
    }
    Object.assign(event, {
      ...dto,
      date: dto.date ? new Date(dto.date) : event.date,
      endDate: dto.endDate ? new Date(dto.endDate) : event.endDate,
    });
    return this.eventRepo.save(event);
  }

  async remove(id: string, user: User) {
    const event = await this.findOne(id);
    if (event.organizerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Action non autorisée');
    }
    await this.eventRepo.softDelete(id);
  }

  async join(id: string, user: User) {
    const event = await this.eventRepo.findOne({ where: { id }, relations: ['participants'] });
    if (!event) throw new NotFoundException('Événement introuvable');
    event.participants = event.participants || [];
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new BadRequestException('Capacité atteinte');
    }
    if (!event.participants.find(p => p.id === user.id)) {
      event.participants.push({ id: user.id } as any);
      event.currentParticipants += 1;
      await this.eventRepo.save(event);
    }
  }

  async leave(id: string, user: User) {
    const event = await this.eventRepo.findOne({ where: { id }, relations: ['participants'] });
    if (!event) throw new NotFoundException('Événement introuvable');
    event.participants = (event.participants || []).filter(p => p.id !== user.id);
    event.currentParticipants = Math.max(0, (event.currentParticipants || 0) - 1);
    await this.eventRepo.save(event);
  }

  async findTrashed(page = 1, limit = 20, filters?: { type?: EventType; search?: string }) {
    const skip = (page - 1) * limit;
    let qb = this.eventRepo.createQueryBuilder('event').withDeleted().where('event.deletedAt IS NOT NULL');
    if (filters?.type) qb = qb.andWhere('event.type = :type', { type: filters.type });
    if (filters?.search) qb = qb.andWhere('(event.title ILIKE :q OR event.description ILIKE :q)', { q: `%${filters.search}%` });
    const [data, total] = await qb.orderBy('event.deletedAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async restore(id: string) { await this.eventRepo.restore(id); }
  async purge(id: string) { await this.eventRepo.delete(id); }

  async exportAll(filters?: { type?: EventType; search?: string }) {
    let qb = this.eventRepo.createQueryBuilder('event');
    if (filters?.type) qb = qb.andWhere('event.type = :type', { type: filters.type });
    if (filters?.search) qb = qb.andWhere('(event.title ILIKE :q OR event.description ILIKE :q)', { q: `%${filters.search}%` });
    const events = await qb.orderBy('event.date', 'DESC').getMany();
    return events.map((e) => ({ id: e.id, title: e.title, type: e.type, status: e.status, date: e.date, city: e.city, isPublic: e.isPublic }));
  }
}
