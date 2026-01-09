import { Body, Controller, Get, Header, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ContributionsService } from './contributions.service';
import { ContributionReportsService } from './services/reports.service';
import { ContributionFilterDto } from './dto/contribution-filter.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GenerateContributionsDto } from './dto/generate-contributions.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { SendRemindersDto } from './dto/send-reminders.dto';
import { SendIndividualReminderDto, SendBulkRemindersDto } from './dto/send-individual-reminder.dto';
import { ExportReportDto, ExportFormat } from './dto/export-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Member Contributions')
@ApiBearerAuth('JWT-auth')
@Controller('contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributionsController {
  constructor(
    private readonly service: ContributionsService,
    private readonly reportsService: ContributionReportsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getContributions(@Query() filterDto: ContributionFilterDto) {
    return this.service.getContributions(filterDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async createContribution(@Body() dto: CreateContributionDto, @CurrentUser() user: User) {
    return this.service.createContribution(dto, user);
  }

  @Post('generate-monthly')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async generateMonthly(@Body() dto: GenerateContributionsDto) {
    return this.service.generateMonthlyContributions(dto);
  }

  @Put(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto, @CurrentUser() user: User) {
    return this.service.markContributionAsPaid(id, dto, user);
  }

  @Get(':id/audit-history')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getAuditHistory(@Param('id') id: string) {
    return this.service.getContributionAuditHistory(id);
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async overdue() {
    return this.service.getOverdueContributions();
  }

  @Post('send-reminders')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async sendReminders(@Body() dto: SendRemindersDto) {
    return this.service.sendContributionReminders(dto);
  }

  @Post('send-reminder/individual')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async sendIndividualReminder(@Body() dto: SendIndividualReminderDto, @CurrentUser() user: User) {
    return this.service.sendIndividualReminder(dto.contributionId, dto.channel, user);
  }

  @Post('send-reminder/bulk')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async sendBulkReminders(@Body() dto: SendBulkRemindersDto, @CurrentUser() user: User) {
    return this.service.sendBulkReminders(dto.contributionIds, dto.channel, user);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getStats(@Query() dto: ExportReportDto) {
    return this.reportsService.getContributionStats({
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
      contributionType: dto.contributionType,
    });
  }

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async exportReport(@Body() dto: ExportReportDto, @Res() res: Response) {
    const filters = {
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
      contributionType: dto.contributionType,
    };

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    if (dto.format === ExportFormat.EXCEL) {
      buffer = await this.reportsService.exportToExcel(filters);
      filename = `rapport-cotisations-${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      buffer = await this.reportsService.exportToPDF(filters);
      filename = `rapport-cotisations-${new Date().toISOString().split('T')[0]}.pdf`;
      contentType = 'application/pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }

  @Get(':id/receipt')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.MEMBER)
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.generateReceipt(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }
}
