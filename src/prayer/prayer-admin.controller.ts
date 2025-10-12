import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdatePrayerAdjustmentDto } from './dto/update-prayer-adjustment.dto';
import { PrayerService } from './prayer.service';

@ApiTags('Prayer Admin')
@ApiBearerAuth('JWT-auth')
@Controller('prayer/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TECH_MANAGER)
export class PrayerAdminController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('day')
  @ApiOperation({ summary: 'Obtenir horaires API, ajustements et heures ajustées pour un jour' })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiQuery({ name: 'city', required: true, type: String })
  @ApiQuery({ name: 'country', required: true, type: String })
  @ApiQuery({ name: 'method', required: false, type: Number })
  async getDay(
    @Query('date') date: string,
    @Query('city') city: string,
    @Query('country') country: string,
    @Query('method') method?: string,
  ) {
    return this.prayerService.getAdminDay({ date, city, country, method: method ? parseInt(method, 10) : undefined });
  }

  @Put('day')
  @ApiOperation({ summary: 'Enregistrer des offsets/overrides pour un jour' })
  async saveDay(@Body() dto: UpdatePrayerAdjustmentDto) {
    return this.prayerService.saveAdminDay(dto);
  }
}
