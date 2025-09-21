import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { ContributionFilterDto } from './dto/contribution-filter.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GenerateContributionsDto } from './dto/generate-contributions.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { SendRemindersDto } from './dto/send-reminders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Member Contributions')
@ApiBearerAuth('JWT-auth')
@Controller('contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributionsController {
  constructor(private readonly service: ContributionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getContributions(@Query() filterDto: ContributionFilterDto) {
    return this.service.getContributions(filterDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async createContribution(@Body() dto: CreateContributionDto) {
    return this.service.createContribution(dto);
  }

  @Post('generate-monthly')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async generateMonthly(@Body() dto: GenerateContributionsDto) {
    return this.service.generateMonthlyContributions(dto);
  }

  @Put(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.service.markContributionAsPaid(id, dto);
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
}
