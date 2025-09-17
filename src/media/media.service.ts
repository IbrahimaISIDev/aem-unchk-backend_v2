import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Media, MediaType, MediaStatus } from './entities/media.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { LikeMediaDto, CommentMediaDto, ViewMediaDto, MediaStatsDto } from './dto/media-interactions.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    filters?: {
      type?: MediaType;
      status?: MediaStatus;
      categoryId?: string;
      isPublic?: boolean;
      isFeatured?: boolean;
      search?: string;
      userId?: string;
    },
  ): Promise<PaginationResponseDto<Media>> {
    const { page, limit, skip } = paginationDto;
    const where: FindOptionsWhere<Media> = {};

    // Appliquer les filtres
    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    let queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.author', 'author')
      .leftJoinAndSelect('media.category', 'category');

    // Appliquer les conditions where
    Object.keys(where).forEach(key => {
      if (where[key] !== undefined) {
        queryBuilder = queryBuilder.andWhere(`media.${key} = :${key}`, { [key]: where[key] });
      }
    });

    // Recherche textuelle
    if (filters?.search) {
      queryBuilder = queryBuilder.andWhere(
        '(media.title ILIKE :search OR media.description ILIKE :search OR media.tags::text ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Pagination et tri
    const [media, total] = await queryBuilder
      .orderBy('media.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginationResponseDto(media, total, page, limit);
  }

  async findOne(id: string, user?: User): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!media) {
      throw new NotFoundException('Média introuvable');
    }

    // Vérifier les permissions d'accès
    if (!media.isPublic && (!user || (user.id !== media.userId && user.role !== UserRole.ADMIN))) {
      throw new ForbiddenException('Accès refusé à ce média privé');
    }

    return media;
  }

  async create(createMediaDto: CreateMediaDto, user: User): Promise<Media> {
    const media = this.mediaRepository.create({
      ...createMediaDto,
      userId: user.id,
      status: createMediaDto.status || MediaStatus.DRAFT,
    });

    return this.mediaRepository.save(media);
  }

  async update(id: string, updateMediaDto: UpdateMediaDto, user: User): Promise<Media> {
    const media = await this.findOne(id, user);

    // Vérifier les permissions de modification
    if (media.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce média');
    }

    Object.assign(media, updateMediaDto);
    return this.mediaRepository.save(media);
  }

  async remove(id: string, user: User): Promise<void> {
    const media = await this.findOne(id, user);

    // Vérifier les permissions de suppression
    if (media.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce média');
    }

    await this.mediaRepository.softDelete(id);
  }

  async likeMedia(id: string, likeDto: LikeMediaDto, user: User): Promise<MediaStatsDto> {
    const media = await this.findOne(id, user);

    if (likeDto.action === 'like') {
      media.likes += 1;
    } else if (likeDto.action === 'unlike' && media.likes > 0) {
      media.likes -= 1;
    }

    await this.mediaRepository.save(media);

    return {
      likes: media.likes,
      views: media.views,
      downloads: media.downloads,
    };
  }

  async viewMedia(id: string, viewDto: ViewMediaDto, user?: User): Promise<MediaStatsDto> {
    const media = await this.mediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Média introuvable');
    }

    // Vérifier les permissions d'accès pour les médias privés
    if (!media.isPublic && (!user || (user.id !== media.userId && user.role !== UserRole.ADMIN))) {
      throw new ForbiddenException('Accès refusé à ce média privé');
    }

    media.views += 1;
    await this.mediaRepository.save(media);

    return {
      likes: media.likes,
      views: media.views,
      downloads: media.downloads,
    };
  }

  async downloadMedia(id: string, user?: User): Promise<MediaStatsDto> {
    const media = await this.findOne(id, user);

    media.downloads += 1;
    await this.mediaRepository.save(media);

    return {
      likes: media.likes,
      views: media.views,
      downloads: media.downloads,
    };
  }

  async getFeaturedMedia(limit: number = 10): Promise<Media[]> {
    return this.mediaRepository.find({
      where: {
        isFeatured: true,
        isPublic: true,
        status: MediaStatus.PUBLISHED,
      },
      relations: ['author', 'category'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  async getPopularMedia(limit: number = 10): Promise<Media[]> {
    return this.mediaRepository.find({
      where: {
        isPublic: true,
        status: MediaStatus.PUBLISHED,
      },
      relations: ['author', 'category'],
      order: {
        views: 'DESC',
        likes: 'DESC',
      },
      take: limit,
    });
  }

  async getRecentMedia(limit: number = 10): Promise<Media[]> {
    return this.mediaRepository.find({
      where: {
        isPublic: true,
        status: MediaStatus.PUBLISHED,
      },
      relations: ['author', 'category'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  async moderateMedia(id: string, status: MediaStatus, user: User): Promise<Media> {
    // Seuls les admins et scholars peuvent modérer
    if (![UserRole.ADMIN, UserRole.SCHOLAR].includes(user.role)) {
      throw new ForbiddenException('Permissions insuffisantes pour la modération');
    }

    const media = await this.findOne(id);
    media.status = status;

    if (status === MediaStatus.PUBLISHED) {
      media.isVerified = true;
    }

    return this.mediaRepository.save(media);
  }

  async getStatistics(): Promise<{
    totalMedia: number;
    publishedMedia: number;
    pendingModeration: number;
    mediaByType: Record<string, number>;
    mediaByStatus: Record<string, number>;
    topCategories: Array<{ categoryName: string; count: number }>;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
  }> {
    const totalMedia = await this.mediaRepository.count();
    
    const publishedMedia = await this.mediaRepository.count({
      where: { status: MediaStatus.PUBLISHED },
    });

    const pendingModeration = await this.mediaRepository.count({
      where: { status: MediaStatus.MODERATION },
    });

    // Statistiques par type
    const typeStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('media.type')
      .getRawMany();

    const mediaByType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistiques par statut
    const statusStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('media.status')
      .getRawMany();

    const mediaByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // Top catégories
    const categoryStats = await this.mediaRepository
      .createQueryBuilder('media')
      .leftJoin('media.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(media.id)', 'count')
      .where('media.status = :status', { status: MediaStatus.PUBLISHED })
      .groupBy('category.id, category.name')
      .orderBy('COUNT(media.id)', 'DESC')
      .limit(10)
      .getRawMany();

    const topCategories = categoryStats.map(stat => ({
      categoryName: stat.categoryName || 'Sans catégorie',
      count: parseInt(stat.count),
    }));

    // Statistiques d'engagement
    const engagementStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('SUM(media.views)', 'totalViews')
      .addSelect('SUM(media.likes)', 'totalLikes')
      .addSelect('SUM(media.downloads)', 'totalDownloads')
      .getRawOne();

    return {
      totalMedia,
      publishedMedia,
      pendingModeration,
      mediaByType,
      mediaByStatus,
      topCategories,
      totalViews: parseInt(engagementStats.totalViews) || 0,
      totalLikes: parseInt(engagementStats.totalLikes) || 0,
      totalDownloads: parseInt(engagementStats.totalDownloads) || 0,
    };
  }

  async searchMedia(
    query: string,
    paginationDto: PaginationDto,
    filters?: {
      type?: MediaType;
      categoryId?: string;
    },
  ): Promise<PaginationResponseDto<Media>> {
    const { page, limit, skip } = paginationDto;

    let queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.author', 'author')
      .leftJoinAndSelect('media.category', 'category')
      .where('media.isPublic = :isPublic', { isPublic: true })
      .andWhere('media.status = :status', { status: MediaStatus.PUBLISHED })
      .andWhere(
        '(media.title ILIKE :query OR media.description ILIKE :query OR media.tags::text ILIKE :query)',
        { query: `%${query}%` },
      );

    if (filters?.type) {
      queryBuilder = queryBuilder.andWhere('media.type = :type', { type: filters.type });
    }

    if (filters?.categoryId) {
      queryBuilder = queryBuilder.andWhere('media.categoryId = :categoryId', { 
        categoryId: filters.categoryId 
      });
    }

    const [media, total] = await queryBuilder
      .orderBy('media.views', 'DESC')
      .addOrderBy('media.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginationResponseDto(media, total, page, limit);
  }
}