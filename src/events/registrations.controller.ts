import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { EventStatsService } from './event-stats.service';
import { EventNotificationsService } from './event-notifications.service';
import { RegisterEventDto } from './dto/register-event.dto';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { EventStatsDto } from './dto/event-stats.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';

@ApiTags('Event Registrations')
@Controller('events')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly statsService: EventStatsService,
    private readonly notificationsService: EventNotificationsService,
  ) {}

  /**
   * S'inscrire à un événement (Public ou Membre connecté)
   */
  @Post(':eventId/register')
  @Public()
  @ApiOperation({ summary: 'S\'inscrire à un événement' })
  @ApiResponse({ status: 201, description: 'Inscription créée', type: Registration })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Événement introuvable' })
  @ApiResponse({ status: 409, description: 'Déjà inscrit' })
  async register(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: RegisterEventDto,
    @CurrentUser() user?: User,
  ): Promise<Registration> {
    return this.registrationsService.register(eventId, dto, user);
  }

  /**
   * Liste des inscriptions d'un événement (Admin)
   */
  @Get(':eventId/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Liste des inscriptions d\'un événement' })
  @ApiPaginatedResponse(Registration)
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getEventRegistrations(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: RegistrationStatus,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Registration>> {
    const { page = 1, limit = 50 } = pagination;
    const result = await this.registrationsService.findByEvent(eventId, page, limit, {
      status,
      search,
    });

    return new PaginationResponseDto(
      result.data,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Statistiques d'un événement (Admin)
   */
  @Get(':eventId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Statistiques d\'un événement' })
  @ApiResponse({ status: 200, type: EventStatsDto })
  async getEventStats(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventStatsDto> {
    return this.statsService.getEventStats(eventId);
  }

  /**
   * Détail d'une inscription
   */
  @Get('registrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Détail d\'une inscription' })
  @ApiResponse({ status: 200, type: Registration })
  async getRegistration(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Registration> {
    return this.registrationsService.findOne(id);
  }

  /**
   * Mes inscriptions (Membre)
   */
  @Get('registrations/my/list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mes inscriptions' })
  @ApiPaginatedResponse(Registration)
  async getMyRegistrations(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResponseDto<Registration>> {
    const { page = 1, limit = 20 } = pagination;
    const result = await this.registrationsService.findByUser(user.id, page, limit);

    return new PaginationResponseDto(
      result.data,
      result.total,
      result.page,
      result.limit,
    );
  }

  /**
   * Check-in manuel d'un participant (Admin)
   */
  @Patch('registrations/:id/check-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check-in manuel d\'un participant' })
  @ApiResponse({ status: 200, description: 'Check-in effectué', type: Registration })
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Registration> {
    return this.registrationsService.checkIn(id, user);
  }

  /**
   * Annuler une inscription
   */
  @Delete('registrations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Annuler une inscription' })
  @ApiResponse({ status: 200, description: 'Inscription annulée' })
  async cancelRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
    @CurrentUser() user?: User,
  ): Promise<Registration> {
    return this.registrationsService.cancel(id, reason, user);
  }

  /**
   * Envoyer un email groupé aux participants (Admin)
   */
  @Post(':eventId/send-bulk-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Envoyer un email groupé aux participants' })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  async sendBulkEmail(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body('subject') subject: string,
    @Body('content') content: string,
    @Query('status') status?: RegistrationStatus,
  ): Promise<{ sent: number; failed: number }> {
    return this.notificationsService.sendBulkEmail(eventId, subject, content, {
      status,
    });
  }
}
