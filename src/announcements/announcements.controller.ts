// announcements.controller.ts
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, ChangeAnnouncementStatusDto } from './dto/create-announcement.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Announcement, AnnouncementStatus, AnnouncementType } from './entities/announcement.entity';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Observable, map } from 'rxjs';

interface MessageEvent<T = any> {
  data: T;
  id?: string;
  type?: string;
  retry?: number;
}

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Annonces actives pour la bannière' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async active(@Query('limit') limit?: number): Promise<Announcement[]> {
    try {
      const result = await this.service.listActive(limit || 5);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les annonces' })
  @ApiQuery({ name: 'status', required: false, enum: [...Object.values(AnnouncementStatus), 'all'] })
  @ApiQuery({ name: 'type', required: false, enum: AnnouncementType })
  @ApiQuery({ name: 'search', required: false, type: String })
  async list(
    @Query() pagination: PaginationDto,
    @Query('status') status?: AnnouncementStatus | 'all',
    @Query('type') type?: AnnouncementType,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Announcement>> {
    try {
      const result = await this.service.list(pagination, { status, type, search, includeArchived: false });
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail annonce' })
  @ApiResponse({ status: 200, type: Announcement })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<Announcement> {
    console.log(`GET /announcements/${id}`);
    try {
      const result = await this.service.get(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle annonce' })
  @ApiResponse({ status: 201, type: Announcement })
  async create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: User) {
    try {
      const result = await this.service.create(dto, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une annonce' })
  @ApiResponse({ status: 200, type: Announcement })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser() user: User,
  ) {
    try {
      const result = await this.service.update(id, dto, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Changer le statut d\'une annonce' })
  @ApiResponse({ status: 200, type: Announcement })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeAnnouncementStatusDto,
    @CurrentUser() user: User,
  ) {
    try {
      const result = await this.service.changeStatus(id, dto.status, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une annonce' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    try {
      await this.service.remove(id, user);
    } catch (error) {
      throw error;
    }
  }

  @Sse('stream')
  @Public()
  @ApiOperation({ summary: 'Stream temps réel des annonces' })
  @ApiResponse({ status: 200, description: 'Flux SSE des annonces en temps réel' })
  stream(): Observable<MessageEvent> {
    return this.service.stream.pipe(
      map((announcement) => ({
        data: announcement,
        type: 'announcement-update',
        id: Date.now().toString(),
      } as MessageEvent))
    );
  }
}