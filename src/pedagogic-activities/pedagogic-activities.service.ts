import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedagogicActivity } from './entities/pedagogic-activity.entity';
import { CreatePedagogicActivityDto, UpdatePedagogicActivityDto } from './dto/pedagogic-activity.dto';

@Injectable()
export class PedagogicActivitiesService {
  constructor(
    @InjectRepository(PedagogicActivity) private repo: Repository<PedagogicActivity>,
  ) {}

  async list(): Promise<PedagogicActivity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async get(id: string): Promise<PedagogicActivity> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Activité pédagogique introuvable');
    return item;
  }

  async create(dto: CreatePedagogicActivityDto, authorId: string) {
    const entity = this.repo.create({
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      authorId,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdatePedagogicActivityDto) {
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
