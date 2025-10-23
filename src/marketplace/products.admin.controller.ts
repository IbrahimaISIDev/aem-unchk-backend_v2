import { Controller, Get, Post, Delete, Param, ParseUUIDPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MarketplaceService } from './marketplace.service';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Response } from 'express';
import { toCSV, toXLSX } from '../common/utils/export.util';
import { AuditService } from '../audit/audit.service';

@ApiTags('Admin Products')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class ProductsAdminController {
  constructor(private readonly marketplace: MarketplaceService, private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Admin index route for products' })
  index() { return { ok: true }; }

  @Get('trash')
  @ApiOperation({ summary: 'List soft-deleted products' })
  async trash(@Query() pagination: PaginationDto & any): Promise<PaginationResponseDto<any>> {
    return this.marketplace.listProductsTrashed(pagination, pagination);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted product' })
  async restore(@Param('id', ParseUUIDPipe) id: string) { await this.marketplace.restoreProduct(id); await this.audit.log({ action: 'restore', entityType: 'Product', entityId: id, status: 'success' }); return { restored: true }; }

  @Delete(':id/purge')
  @ApiOperation({ summary: 'Permanently delete product' })
  async purge(@Param('id', ParseUUIDPipe) id: string) { await this.marketplace.purgeProduct(id); await this.audit.log({ action: 'purge', entityType: 'Product', entityId: id, status: 'success' }); return { purged: true }; }

  @Get('export')
  @ApiOperation({ summary: 'Export products (CSV/XLSX)' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: true })
  async export(@Res() res: Response, @Query() query: any) {
    const format = (query.format || 'csv').toLowerCase();
    const rows = await this.marketplace.exportProducts({ category: query.category, search: query.search });
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const suffix = query.category ? `_${query.category}` : `_${yyyy}-${MM}-${dd}`;
    const filename = `products_export_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}${suffix}.${format}`;

    if (format === 'xlsx') {
      const buf = await toXLSX(rows, 'Products');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      await this.audit.log({ action: 'export', entityType: 'Product', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    } else {
      const buf = toCSV(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      await this.audit.log({ action: 'export', entityType: 'Product', status: 'success', context: { format, filters: query } });
      return res.send(buf);
    }
  }
}