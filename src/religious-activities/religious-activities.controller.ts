import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReligiousActivitiesService } from './religious-activities.service';
import { CreateReligiousActivityDto, UpdateReligiousActivityDto } from './dto/religious-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Religious Activities')
@Controller('religious-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReligiousActivitiesController {
  constructor(private service: ReligiousActivitiesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ISLAMIC_MANAGER)
  @ApiOperation({ summary: 'Lister les activités religieuses' })
  list() {
    return this.service.list();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ISLAMIC_MANAGER)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ISLAMIC_MANAGER)
  create(@Body() dto: CreateReligiousActivityDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ISLAMIC_MANAGER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReligiousActivityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ISLAMIC_MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
