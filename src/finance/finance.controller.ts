import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinanceReportDto } from './dto/finance-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Finance')
@ApiBearerAuth('JWT-auth')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Transactions
  @Get('transactions')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getTransactions(@Query() filterDto: TransactionFilterDto) {
    return this.financeService.getTransactions(filterDto);
  }

  @Post('transactions')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async createTransaction(@Body() dto: CreateTransactionDto, @CurrentUser() user: User) {
    return this.financeService.createTransaction(dto, user.id);
  }

  @Put('transactions/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async updateTransaction(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.financeService.updateTransaction(id, dto);
  }

  @Delete('transactions/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async deleteTransaction(@Param('id') id: string) {
    return this.financeService.deleteTransaction(id);
  }

  // Reports
  @Get('reports/overview')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getFinancialOverview(@Query() reportDto: FinanceReportDto) {
    return this.financeService.getFinancialOverview(reportDto);
  }

  @Get('reports/detailed')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getDetailed(@Query() reportDto: FinanceReportDto) {
    return this.financeService.getDetailedReport(reportDto);
  }

  @Post('reports/export')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async export(@Body() reportDto: FinanceReportDto, @Res() res: any) {
    return this.financeService.exportReport(reportDto, res);
  }

  // Dashboard
  @Get('dashboard/stats')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async dashboardStats() {
    return this.financeService.getDashboardStats();
  }

  // Categories
  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getCategories() {
    return this.financeService.getExpenseCategories();
  }

  @Post('categories')
  @Roles(UserRole.ADMIN)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.financeService.createExpenseCategory(dto);
  }
}
