import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-media.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Media')
@Controller('media/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lister les catégories',
    description: 'Récupère la liste des catégories de médias',
  })
  @ApiQuery({ type: PaginationDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories récupérée avec succès',
  })
  async findAll(@Query() paginationDto?: PaginationDto) {
    if (paginationDto?.page || paginationDto?.limit) {
      return this.categoriesService.findAll(paginationDto);
    }
    return { data: await this.categoriesService.findAll() };
  }

  @Get('active')
  @Public()
  @ApiOperation({
    summary: 'Catégories actives',
    description: 'Récupère uniquement les catégories actives',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégories actives récupérées avec succès',
    type: [Category],
  })
  async getActiveCategories(): Promise<Category[]> {
    return this.categoriesService.getActiveCategories();
  }

  @Get('type/:type')
  @Public()
  @ApiOperation({
    summary: 'Catégories par type',
    description: 'Récupère les catégories filtrées par type',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégories filtrées récupérées avec succès',
    type: [Category],
  })
  async getCategoriesByType(@Param('type') type: string): Promise<Category[]> {
    return this.categoriesService.getCategoriesByType(type);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Statistiques des catégories',
    description: 'Récupère les statistiques des catégories (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalCategories: { type: 'number', example: 25 },
        activeCategories: { type: 'number', example: 20 },
        categoriesByType: {
          type: 'object',
          example: {
            coran: 5,
            hadith: 3,
            general: 12,
          },
        },
        mediaCountByCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              categoryName: { type: 'string', example: 'Coran' },
              mediaCount: { type: 'number', example: 150 },
            },
          },
        },
      },
    },
  })
  async getStatistics() {
    return this.categoriesService.getStatistics();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer une catégorie',
    description: 'Crée une nouvelle catégorie de média (admin uniquement)',
  })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: Category,
  })
  @ApiResponse({
    status: 409,
    description: 'Une catégorie avec ce nom existe déjà',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Détails d\'une catégorie',
    description: 'Récupère les détails d\'une catégorie par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégorie trouvée',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Catégorie introuvable',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mettre à jour une catégorie',
    description: 'Met à jour une catégorie existante (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour avec succès',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Catégorie introuvable',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer une catégorie',
    description: 'Supprime une catégorie (soft delete, admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégorie supprimée avec succès',
  })
  @ApiResponse({
    status: 409,
    description: 'Impossible de supprimer une catégorie contenant des médias',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}