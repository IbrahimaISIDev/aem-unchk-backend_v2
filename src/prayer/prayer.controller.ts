import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrayerService } from './prayer.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Prayer')
@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('times')
  @Public()
  @ApiOperation({ summary: 'Horaires de prières' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'method', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false, type: String })
  async times(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('method') method?: string,
    @Query('date') date?: string,
  ) {
    return this.prayerService.getTimes({
      city,
      country,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      method: method ? parseInt(method, 10) : undefined,
      date,
    });
  }

  @Get('calendar')
  @Public()
  @ApiOperation({ summary: 'Calendrier islamique mensuel' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: Number })
  async calendar(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('method') method?: string,
  ) {
    return this.prayerService.getCalendar({
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      city,
      country,
      method: method ? parseInt(method, 10) : undefined,
    });
  }
}
