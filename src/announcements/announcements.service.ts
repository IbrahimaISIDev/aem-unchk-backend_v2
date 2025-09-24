// announcements.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan, IsNull } from 'typeorm';
import { Announcement, AnnouncementStatus, AnnouncementType } from './entities/announcement.entity';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/create-announcement.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Subject } from 'rxjs';

@Injectable()
export class AnnouncementsService {
  private updates$ = new Subject<Announcement>();

  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
  ) {}

  get stream() {
    return this.updates$.asObservable();
  }

  async listActive(limit = 5) {
    const now = new Date();
    return this.repo.find({
      where: [
        { status: In([AnnouncementStatus.PUBLISHED, AnnouncementStatus.ONGOING]), endAt: MoreThan(now) },
        { status: In([AnnouncementStatus.PUBLISHED, AnnouncementStatus.ONGOING]), endAt: IsNull() },
      ],
      order: { startAt: 'ASC' },
      take: limit,
    });
  }

  async list(pagination: PaginationDto, filters?: { status?: AnnouncementStatus | 'all'; type?: AnnouncementType; search?: string; includeArchived?: boolean }) {
    const { page = 1, limit = 10, skip } = pagination;
    const where: any = {};
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.includeArchived === false) where.status = In([AnnouncementStatus.DRAFT, AnnouncementStatus.PUBLISHED, AnnouncementStatus.ONGOING, AnnouncementStatus.COMPLETED]);

    let qb = this.repo.createQueryBuilder('a').where(where);
    if (filters?.search) qb = qb.andWhere('(a.title ILIKE :q OR a.description ILIKE :q)', { q: `%${filters.search}%` });

    const [data, total] = await qb.orderBy('a.startAt', 'ASC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Announcement>(data, total, page, limit);
  }

  async get(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Annonce introuvable');
    return item;
  }

  async create(dto: CreateAnnouncementDto, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    
    console.log('Creating announcement:', JSON.stringify(dto, null, 2));
    
    try {
      const entity = this.repo.create({
        title: dto.title,
        description: dto.description,
        type: dto.type ?? AnnouncementType.EVENT,
        startAt: new Date(dto.startAt),
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        location: dto.location,
        link: dto.link,
        isFeatured: !!dto.isFeatured,
        status: dto.status ?? AnnouncementStatus.DRAFT,
      });
      
      const saved = await this.repo.save(entity);
      console.log('Announcement created successfully:', saved.id);
      this.updates$.next(saved);
      return saved;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateAnnouncementDto, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    
    console.log(`Updating announcement ${id}:`, JSON.stringify(dto, null, 2));
    
    const entity = await this.get(id);
    
    try {
      Object.assign(entity, {
        title: dto.title ?? entity.title,
        description: dto.description ?? entity.description,
        type: dto.type ?? entity.type,
        startAt: dto.startAt ? new Date(dto.startAt) : entity.startAt,
        endAt: dto.endAt ? new Date(dto.endAt) : (dto.endAt === null ? null : entity.endAt),
        location: dto.location ?? entity.location,
        link: dto.link ?? entity.link,
        isFeatured: typeof dto.isFeatured === 'boolean' ? dto.isFeatured : entity.isFeatured,
        status: dto.status ?? entity.status,
      });
      
      const saved = await this.repo.save(entity);
      console.log(`Announcement ${id} updated successfully`);
      this.updates$.next(saved);
      return saved;
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw error;
    }
  }

  async changeStatus(id: string, status: AnnouncementStatus, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    
    console.log(`Changing status of announcement ${id} to ${status}`);
    
    const entity = await this.get(id);
    entity.status = status;
    
    try {
      const saved = await this.repo.save(entity);
      console.log(`Announcement ${id} status changed to ${status}`);
      this.updates$.next(saved);
      return saved;
    } catch (error) {
      console.error(`Error changing status of announcement ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    
    console.log(`Deleting announcement ${id}`);
    
    try {
      await this.repo.softDelete(id);
      console.log(`Announcement ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      throw error;
    }
  }

  async autoUpdateStatuses() {
    const now = new Date();
    const toOngoing = await this.repo.find({ where: { status: AnnouncementStatus.PUBLISHED, startAt: LessThan(now), endAt: MoreThan(now) } });
    for (const a of toOngoing) {
      a.status = AnnouncementStatus.ONGOING;
      await this.repo.save(a);
      this.updates$.next(a);
    }
    const toCompleted = await this.repo.find({ where: { status: In([AnnouncementStatus.PUBLISHED, AnnouncementStatus.ONGOING]), endAt: LessThan(now) } });
    for (const a of toCompleted) {
      a.status = AnnouncementStatus.COMPLETED;
      await this.repo.save(a);
      this.updates$.next(a);
    }
  }
}