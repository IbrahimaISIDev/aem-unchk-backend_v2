import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityStatus, ActivityType } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto } from './dto/create-activity.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiPaginatedResponse as ApiPaged } from '../common/decorators/api-paginated-response.decorator';

@ApiTags('Events')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les activités' })
  @ApiPaged(Activity)
  @ApiQuery({ name: 'type', required: false, enum: ActivityType })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus })
  async findAll(
    @Query() { page = 1, limit = 10 }: PaginationDto,
    @Query('type') type?: ActivityType,
    @Query('status') status?: ActivityStatus,
    @Query('userId') userId?: string,
  ): Promise<PaginationResponseDto<Activity>> {
    const res = await this.activitiesService.findAll(page, limit, { type, status, userId });
    return new PaginationResponseDto(res.data, res.total, res.page, res.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: "Détails d'une activité" })
  @ApiResponse({ status: 200, type: Activity })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une activité' })
  @ApiResponse({ status: 201, type: Activity })
  async create(@Body() dto: CreateActivityDto, @CurrentUser() user: User): Promise<Activity> {
    return this.activitiesService.create(dto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une activité' })
  @ApiResponse({ status: 200, type: Activity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
    @CurrentUser() user: User,
  ): Promise<Activity> {
    return this.activitiesService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une activité' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.activitiesService.remove(id, user);
  }
}
