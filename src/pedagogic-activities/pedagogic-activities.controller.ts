import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PedagogicActivitiesService } from './pedagogic-activities.service';
import { CreatePedagogicActivityDto, UpdatePedagogicActivityDto } from './dto/pedagogic-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Pedagogic Activities')
@Controller('pedagogic-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PedagogicActivitiesController {
  constructor(private service: PedagogicActivitiesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PEDAGOGIC_MANAGER)
  @ApiOperation({ summary: 'Lister les activités pédagogiques' })
  list() {
    return this.service.list();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PEDAGOGIC_MANAGER)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PEDAGOGIC_MANAGER)
  create(@Body() dto: CreatePedagogicActivityDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PEDAGOGIC_MANAGER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePedagogicActivityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PEDAGOGIC_MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
