import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-media.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(paginationDto?: PaginationDto): Promise<PaginationResponseDto<Category> | Category[]> {
    if (paginationDto) {
      const { page, limit, skip } = paginationDto;

      const [categories, total] = await this.categoriesRepository.findAndCount({
        skip,
        take: limit,
        order: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
        relations: ['media'],
      });

      return new PaginationResponseDto(categories, total, page, limit);
    }

    return this.categoriesRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
      relations: ['media'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Vérifier si le nom existe déjà
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Vérifier si le nouveau nom existe déjà (si changé)
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Vérifier s'il y a des médias associés
    if (category.media && category.media.length > 0) {
      throw new ConflictException(
        'Impossible de supprimer une catégorie contenant des médias',
      );
    }

    await this.categoriesRepository.softDelete(id);
  }

  async getActiveCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { 
        type: type as any,
        isActive: true,
      },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async getStatistics(): Promise<{
    totalCategories: number;
    activeCategories: number;
    categoriesByType: Record<string, number>;
    mediaCountByCategory: Array<{ categoryName: string; mediaCount: number }>;
  }> {
    const totalCategories = await this.categoriesRepository.count();
    
    const activeCategories = await this.categoriesRepository.count({
      where: { isActive: true },
    });

    // Statistiques par type
    const typeStats = await this.categoriesRepository
      .createQueryBuilder('category')
      .select('category.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.type')
      .getRawMany();

    const categoriesByType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Nombre de médias par catégorie
    const mediaCountStats = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.media', 'media')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(media.id)', 'mediaCount')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id, category.name')
      .orderBy('COUNT(media.id)', 'DESC')
      .getRawMany();

    const mediaCountByCategory = mediaCountStats.map(stat => ({
      categoryName: stat.categoryName,
      mediaCount: parseInt(stat.mediaCount),
    }));

    return {
      totalCategories,
      activeCategories,
      categoriesByType,
      mediaCountByCategory,
    };
  }
}