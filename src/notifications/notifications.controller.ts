import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiPaginatedResponse as ApiPaged } from '../common/decorators/api-paginated-response.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les notifications de l\'utilisateur' })
  @ApiPaged(Notification)
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  async findAll(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ): Promise<PaginationResponseDto<Notification>> {
    const readBool = typeof read !== 'undefined' ? read === 'true' || read === '1' : undefined;
    return this.notificationsService.findAllForUser(user.id, pagination, { read: readBool, type });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une notification (admin)' })
  @ApiResponse({ status: 201, type: Notification })
  async create(@Body() dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
