import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReligiousActivity } from './entities/religious-activity.entity';
import { CreateReligiousActivityDto, UpdateReligiousActivityDto } from './dto/religious-activity.dto';

@Injectable()
export class ReligiousActivitiesService {
  constructor(
    @InjectRepository(ReligiousActivity) private repo: Repository<ReligiousActivity>,
  ) {}

  async list(): Promise<ReligiousActivity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async get(id: string): Promise<ReligiousActivity> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Activité religieuse introuvable');
    return item;
  }

  async create(dto: CreateReligiousActivityDto, authorId: string) {
    const entity = this.repo.create({
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      authorId,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateReligiousActivityDto) {
    const item = await this.get(id);
    Object.assign(item, {
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : item.startAt,
      endAt: dto.endAt ? new Date(dto.endAt) : item.endAt,
    });
    return this.repo.save(item);
  }

  async remove(id: string) {
    await this.repo.delete(id);
  }
}
