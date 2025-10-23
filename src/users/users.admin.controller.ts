import { Controller, Get, Post, Delete, Param, Query, UseGuards, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Response } from 'express';
import { toCSV, toXLSX } from '../common/utils/export.util';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class UsersAdminController {
  constructor(private readonly users: UsersService, private readonly config: ConfigService, private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Admin index route for users' })
  index() {
    return { ok: true };
  }

  @Get('trash')
  @ApiOperation({ summary: 'List soft-deleted users' })
  async trash(@Query() pagination: PaginationDto & any): Promise<PaginationResponseDto<any>> {
    return this.users.findTrashed(pagination);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    await this.users.restore(id);
    await this.audit.log({ action: 'restore', entityType: 'User', entityId: id, status: 'success' });
    return { restored: true };
  }

  @Delete(':id/purge')
  @ApiOperation({ summary: 'Permanently delete a user' })
  async purge(@Param('id', ParseUUIDPipe) id: string) {
    await this.users.purge(id);
    await this.audit.log({ action: 'purge', entityType: 'User', entityId: id, status: 'success' });
    return { purged: true };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export users (CSV/XLSX)' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: true })
  async export(@Res() res: Response, @Query() query: any) {
    const format = (query.format || 'csv').toLowerCase();
    const rows = await this.users.exportAll(query);
    const tz = this.config.get<string>('timezone') || 'Europe/Paris';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const suffix = query.role ? `_${query.role}` : query.status ? `_${query.status}` : `_${yyyy}-${MM}-${dd}`;
    const filename = `users_export_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}${suffix}.${format}`;

    if (format === 'xlsx') {
      const buf = await toXLSX(rows, 'Users');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await this.audit.log({ action: 'export', entityType: 'User', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    } else {
      const buf = toCSV(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await this.audit.log({ action: 'export', entityType: 'User', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    }
  }
}