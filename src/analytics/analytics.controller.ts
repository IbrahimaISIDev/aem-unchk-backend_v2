import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { EventLog, EventType } from './entities/event-log.entity';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @Public()
  @ApiOperation({ summary: 'Enregistrer un événement analytique' })
  async recordEvent(@Body() dto: CreateEventLogDto, @Req() req: any, @CurrentUser() user?: User) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const ua = req.headers['user-agent'];
    return this.analyticsService.recordEvent(dto, user, ip, ua);
  }

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les événements analytiques' })
  @ApiQuery({ name: 'type', required: false, enum: EventType })
  async listEvents(
    @Query() pagination: PaginationDto,
    @Query('type') type?: EventType,
  ): Promise<PaginationResponseDto<EventLog>> {
    return this.analyticsService.listEvents(pagination, { type });
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer des métriques agrégées' })
  async metrics() {
    return this.analyticsService.metrics();
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les sessions utilisateurs' })
  async listSessions(@Query() pagination: PaginationDto) {
    return this.analyticsService.listSessions(pagination);
  }
}
