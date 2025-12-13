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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Media, MediaType, MediaStatus } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { LikeMediaDto, CommentMediaDto, ViewMediaDto, MediaStatsDto } from './dto/media-interactions.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lister les médias',
    description: 'Récupère la liste paginée des médias avec filtres optionnels',
  })
  @ApiPaginatedResponse(Media)
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'type', enum: MediaType, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'isFeatured', type: Boolean, required: false })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: MediaType,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('isFeatured') isFeatured?: boolean,
  ): Promise<PaginationResponseDto<Media>> {
    const filters = {
      type,
      categoryId,
      search,
      isFeatured,
      status: MediaStatus.PUBLISHED,
      isPublic: true,
    };

    return this.mediaService.findAll(paginationDto, filters);
  }

  @Get('featured')
  @Public()
  @ApiOperation({
    summary: 'Médias en vedette',
    description: 'Récupère les médias mis en vedette',
  })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Médias en vedette récupérés avec succès',
    type: [Media],
  })
  async getFeatured(@Query('limit') limit?: number): Promise<Media[]> {
    return this.mediaService.getFeaturedMedia(limit);
  }

  @Get('popular')
  @Public()
  @ApiOperation({
    summary: 'Médias populaires',
    description: 'Récupère les médias les plus populaires',
  })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Médias populaires récupérés avec succès',
    type: [Media],
  })
  async getPopular(@Query('limit') limit?: number): Promise<Media[]> {
    return this.mediaService.getPopularMedia(limit);
  }

  @Get('recent')
  @Public()
  @ApiOperation({
    summary: 'Médias récents',
    description: 'Récupère les médias les plus récents',
  })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Médias récents récupérés avec succès',
    type: [Media],
  })
  async getRecent(@Query('limit') limit?: number): Promise<Media[]> {
    return this.mediaService.getRecentMedia(limit);
  }

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Rechercher des médias',
    description: 'Effectue une recherche textuelle dans les médias',
  })
  @ApiPaginatedResponse(Media)
  @ApiQuery({ name: 'q', type: String, description: 'Terme de recherche' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'type', enum: MediaType, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: MediaType,
    @Query('categoryId') categoryId?: string,
  ): Promise<PaginationResponseDto<Media>> {
    return this.mediaService.searchMedia(query, paginationDto, { type, categoryId });
  }

  @Get('my-media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mes médias',
    description: 'Récupère les médias de l\'utilisateur connecté',
  })
  @ApiPaginatedResponse(Media)
  @ApiQuery({ type: PaginationDto })
  async getMyMedia(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<Media>> {
    return this.mediaService.findAll(paginationDto, { userId: user.id });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lister les médias (admin)',
    description: 'Récupère la liste paginée des médias avec filtres (tous statuts/visibilités)',
  })
  @ApiPaginatedResponse(Media)
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'type', enum: MediaType, required: false })
  @ApiQuery({ name: 'status', enum: MediaStatus, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'isPublic', type: Boolean, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async adminList(
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: MediaType,
    @Query('status') status?: MediaStatus,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: boolean,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Media>> {
    return this.mediaService.findAll(paginationDto, { type, status, categoryId, isPublic, search });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer un média',
    description: 'Crée un nouveau média',
  })
  @ApiResponse({
    status: 201,
    description: 'Média créé avec succès',
    type: Media,
  })
  async create(
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser() user: User,
  ): Promise<Media> {
    return this.mediaService.create(createMediaDto, user);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload un fichier média',
    description: 'Upload un fichier et crée un média associé',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser() user: User,
  ): Promise<Media> {
    // TODO: Implémenter l'upload de fichier et la génération d'URL
    const mediaDto = {
      ...createMediaDto,
      url: `/uploads/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    return this.mediaService.create(mediaDto, user);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SEC_GENERAL, UserRole.TECH_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Statistiques globales des médias',
    description: 'Retourne des statistiques agrégées sur tous les médias (admin uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  async getMediaStatistics() {
    return this.mediaService.getStatistics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Détails d\'un média',
    description: 'Récupère les détails d\'un média par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Média trouvé',
    type: Media,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ): Promise<Media> {
    return this.mediaService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mettre à jour un média',
    description: 'Met à jour un média existant',
  })
  @ApiResponse({
    status: 200,
    description: 'Média mis à jour avec succès',
    type: Media,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser() user: User,
  ): Promise<Media> {
    return this.mediaService.update(id, updateMediaDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer un média',
    description: 'Supprime un média (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Média supprimé avec succès',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.mediaService.remove(id, user);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liker/unliker un média',
    description: 'Aime ou retire le like d\'un média',
  })
  @ApiResponse({
    status: 200,
    description: 'Action effectuée avec succès',
    type: MediaStatsDto,
  })
  async likeMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() likeDto: LikeMediaDto,
    @CurrentUser() user: User,
  ): Promise<MediaStatsDto> {
    return this.mediaService.likeMedia(id, likeDto, user);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Retirer le like d\'un média',
    description: 'Retire le like d\'un média',
  })
  @ApiResponse({
    status: 200,
    description: 'Like retiré avec succès',
    type: MediaStatsDto,
  })
  async unlikeMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<MediaStatsDto> {
    return this.mediaService.likeMedia(id, { action: 'unlike' } as LikeMediaDto, user);
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({
    summary: 'Enregistrer une vue',
    description: 'Enregistre une vue du média',
  })
  @ApiResponse({
    status: 200,
    description: 'Vue enregistrée avec succès',
    type: MediaStatsDto,
  })
  async viewMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() viewDto: ViewMediaDto,
    @CurrentUser() user?: User,
  ): Promise<MediaStatsDto> {
    return this.mediaService.viewMedia(id, viewDto, user);
  }

  @Post(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Télécharger un média',
    description: 'Enregistre un téléchargement du média',
  })
  @ApiResponse({
    status: 200,
    description: 'Téléchargement enregistré avec succès',
    type: MediaStatsDto,
  })
  async downloadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<MediaStatsDto> {
    return this.mediaService.downloadMedia(id, user);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modérer un média',
    description: 'Change le statut de modération d\'un média (admin/scholar uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Média modéré avec succès',
    type: Media,
  })
  async moderateMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: MediaStatus,
    @CurrentUser() user: User,
  ): Promise<Media> {
    return this.mediaService.moderateMedia(id, status, user);
  }
}