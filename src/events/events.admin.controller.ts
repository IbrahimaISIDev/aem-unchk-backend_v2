import { Controller, Get, Post, Delete, Param, ParseUUIDPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Response } from 'express';
import { toCSV, toXLSX } from '../common/utils/export.util';
import { AuditService } from '../audit/audit.service';

@ApiTags('Admin Events')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class EventsAdminController {
  constructor(private readonly events: EventsService, private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Admin index route for events' })
  index() { return { ok: true }; }

  @Get('trash')
  @ApiOperation({ summary: 'List soft-deleted events' })
  async trash(@Query() { page = 1, limit = 20, search, type }: PaginationDto & any): Promise<PaginationResponseDto<any>> {
    const res = await this.events.findTrashed(page, limit, { search, type });
    return new PaginationResponseDto(res.data, res.total, res.page, res.limit);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted event' })
  async restore(@Param('id', ParseUUIDPipe) id: string) { await this.events.restore(id); await this.audit.log({ action: 'restore', entityType: 'Event', entityId: id, status: 'success' }); return { restored: true }; }

  @Delete(':id/purge')
  @ApiOperation({ summary: 'Permanently delete event' })
  async purge(@Param('id', ParseUUIDPipe) id: string) { await this.events.purge(id); await this.audit.log({ action: 'purge', entityType: 'Event', entityId: id, status: 'success' }); return { purged: true }; }

  @Get('export')
  @ApiOperation({ summary: 'Export events (CSV/XLSX)' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: true })
  async export(@Res() res: Response, @Query() query: any) {
    const format = (query.format || 'csv').toLowerCase();
    const rows = await this.events.exportAll({ search: query.search, type: query.type });
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const suffix = query.type ? `_${query.type}` : `_${yyyy}-${MM}-${dd}`;
    const filename = `events_export_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}${suffix}.${format}`;

    if (format === 'xlsx') {
      const buf = await toXLSX(rows, 'Events');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await this.audit.log({ action: 'export', entityType: 'Event', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    } else {
      const buf = toCSV(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await this.audit.log({ action: 'export', entityType: 'Event', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    }
  }
}