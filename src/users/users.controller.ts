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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Activity } from '../events/entities/activity.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { 
  AddPointsDto, 
  UserPointsResponseDto,
  AddFavoriteDto,
  RemoveFavoriteDto,
  UserFavoritesResponseDto,
} from './dto/user-points.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lister tous les utilisateurs',
    description: 'Récupère la liste paginée de tous les utilisateurs (admin uniquement)',
  })
  @ApiPaginatedResponse(User)
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto & any): Promise<PaginationResponseDto<User>> {
    return this.usersService.findAll(paginationDto as any);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Créer un utilisateur',
    description: 'Crée un nouvel utilisateur (admin uniquement)',
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou téléphone déjà utilisé',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Profil utilisateur courant',
    description: 'Récupère le profil de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
    type: User,
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Mettre à jour le profil',
    description: 'Met à jour le profil de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: User,
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.update(user.id, updateProfileDto);
  }

  @Get('activities')
  @ApiOperation({
    summary: 'Activités de l\'utilisateur',
    description: 'Récupère les activités de l\'utilisateur connecté',
  })
  @ApiPaginatedResponse(Activity)
  @ApiQuery({ type: PaginationDto })
  async getUserActivities(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<Activity>> {
    return this.usersService.getUserActivities(user.id, paginationDto);
  }

  @Get('points')
  @ApiOperation({
    summary: 'Points de l\'utilisateur',
    description: 'Récupère le nombre de points de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Points récupérés avec succès',
    type: UserPointsResponseDto,
  })
  async getUserPoints(@CurrentUser() user: User): Promise<UserPointsResponseDto> {
    return this.usersService.getUserPoints(user.id);
  }

  @Post('points')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Ajouter des points à l\'utilisateur',
    description: 'Ajoute des points au compte de l\'utilisateur connecté (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Points ajoutés avec succès',
    type: UserPointsResponseDto,
  })
  async addPoints(
    @CurrentUser() user: User,
    @Body() addPointsDto: AddPointsDto,
  ): Promise<UserPointsResponseDto> {
    return this.usersService.addPoints(user.id, addPointsDto);
  }

  @Get('badges')
  @ApiOperation({
    summary: 'Badges de l\'utilisateur',
    description: 'Récupère la liste des badges de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Badges récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        badges: {
          type: 'array',
          items: { type: 'string' },
          example: ['first_login', 'active_member', 'contributor'],
        },
      },
    },
  })
  async getUserBadges(@CurrentUser() user: User): Promise<{ badges: string[] }> {
    const badges = await this.usersService.getUserBadges(user.id);
    return { badges };
  }

  @Post('badges/:badge')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Ajouter un badge',
    description: 'Ajoute un badge à l\'utilisateur connecté (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Badge ajouté avec succès',
    type: User,
  })
  async addBadge(
    @CurrentUser() user: User,
    @Param('badge') badge: string,
  ): Promise<User> {
    return this.usersService.addBadge(user.id, badge);
  }

  @Delete('badges/:badge')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Retirer un badge',
    description: 'Retire un badge de l\'utilisateur connecté (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Badge retiré avec succès',
    type: User,
  })
  async removeBadge(
    @CurrentUser() user: User,
    @Param('badge') badge: string,
  ): Promise<User> {
    return this.usersService.removeBadge(user.id, badge);
  }

  @Get('favorites')
  @ApiOperation({
    summary: 'Favoris de l\'utilisateur',
    description: 'Récupère la liste des favoris de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Favoris récupérés avec succès',
    type: UserFavoritesResponseDto,
  })
  async getUserFavorites(@CurrentUser() user: User): Promise<UserFavoritesResponseDto> {
    const favorites = await this.usersService.getUserFavorites(user.id);
    return {
      favorites,
      count: favorites.length,
    };
  }

  @Post('favorites')
  @ApiOperation({
    summary: 'Ajouter aux favoris',
    description: 'Ajoute un élément aux favoris de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Élément ajouté aux favoris avec succès',
    type: User,
  })
  async addFavorite(
    @CurrentUser() user: User,
    @Body() addFavoriteDto: AddFavoriteDto,
  ): Promise<User> {
    return this.usersService.addFavorite(user.id, addFavoriteDto.itemId);
  }

  @Delete('favorites')
  @ApiOperation({
    summary: 'Retirer des favoris',
    description: 'Retire un élément des favoris de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Élément retiré des favoris avec succès',
    type: User,
  })
  async removeFavorite(
    @CurrentUser() user: User,
    @Body() removeFavoriteDto: RemoveFavoriteDto,
  ): Promise<User> {
    return this.usersService.removeFavorite(user.id, removeFavoriteDto.itemId);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Statistiques utilisateurs',
    description: 'Récupère les statistiques des utilisateurs (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 150 },
        activeUsers: { type: 'number', example: 120 },
        newUsersThisMonth: { type: 'number', example: 15 },
        usersByRole: {
          type: 'object',
          example: {
            visitor: 50,
            member: 80,
            admin: 5,
          },
        },
        usersByStatus: {
          type: 'object',
          example: {
            active: 120,
            pending: 20,
            suspended: 5,
          },
        },
      },
    },
  })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Détails d\'un utilisateur',
    description: 'Récupère les détails d\'un utilisateur par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description: 'Met à jour un utilisateur (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    type: User,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description: 'Supprime un utilisateur (soft delete, admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Changer le rôle d\'un utilisateur',
    description: 'Change le rôle d\'un utilisateur (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Rôle mis à jour avec succès',
    type: User,
  })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
    @CurrentUser() admin: User,
  ): Promise<User> {
    return this.usersService.updateRole(id, role, admin.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Changer le statut d\'un utilisateur',
    description: 'Change le statut d\'un utilisateur (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: User,
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: UserStatus,
    @CurrentUser() admin: User,
  ): Promise<User> {
    return this.usersService.updateStatus(id, status, admin.id);
  }
}