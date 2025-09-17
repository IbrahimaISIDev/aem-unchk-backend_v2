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

// Interface pour les événements Server-Sent Events
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
    return this.service.listActive(limit || 5);
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
    return this.service.list(pagination, { status, type, search, includeArchived: false });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail annonce' })
  @ApiResponse({ status: 200, type: Announcement })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<Announcement> {
    return this.service.get(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeAnnouncementStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.service.changeStatus(id, dto.status, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user);
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