import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Event, EventType } from './entities/event.entity';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister les événements' })
  @ApiPaginatedResponse(Event)
  @ApiQuery({ name: 'status', required: false, enum: ['upcoming', 'ongoing', 'completed'] })
  @ApiQuery({ name: 'type', required: false, enum: EventType })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query() { page = 1, limit = 10 }: PaginationDto,
    @Query('status') status?: 'upcoming' | 'ongoing' | 'completed',
    @Query('type') type?: EventType,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Event>> {
    const res = await this.eventsService.findAll(page, limit, { status, type, search });
    return new PaginationResponseDto(res.data, res.total, res.page, res.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: "Détails d'un événement" })
  @ApiResponse({ status: 200, type: Event })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer un événement' })
  @ApiResponse({ status: 201, type: Event })
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: User): Promise<Event> {
    return this.eventsService.create(dto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour un événement' })
  @ApiResponse({ status: 200, type: Event })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: User,
  ): Promise<Event> {
    return this.eventsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TECH_MANAGER, UserRole.SEC_GENERAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un événement' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.eventsService.remove(id, user);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Rejoindre un événement" })
  async join(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.eventsService.join(id, user);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Quitter un événement" })
  async leave(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    return this.eventsService.leave(id, user);
  }
}
