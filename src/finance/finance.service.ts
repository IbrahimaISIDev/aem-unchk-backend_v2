import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { FinanceReportDto } from './dto/finance-report.dto';
import { UsersService } from '../users/users.service';
import ExcelJS from 'exceljs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    private readonly usersService: UsersService,
  ) {}

  async getTransactions(filterDto: TransactionFilterDto) {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.createdBy', 'user');

    if (filterDto.type) qb.andWhere('t.type = :type', { type: filterDto.type });
    if (filterDto.category) qb.andWhere('t.category = :category', { category: filterDto.category });
    if (filterDto.status) qb.andWhere('t.status = :status', { status: filterDto.status });
    if (filterDto.startDate) qb.andWhere('t.date >= :start', { start: filterDto.startDate });
    if (filterDto.endDate) qb.andWhere('t.date <= :end', { end: filterDto.endDate });
    if (filterDto.search) {
      qb.andWhere('(t.description ILIKE :q OR t.category ILIKE :q)', { q: `%${filterDto.search}%` });
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    qb.skip(offset).take(limit).orderBy('t.date', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }


async createTransaction(dto: CreateTransactionDto, createdById: string) {
  const user = await this.usersService.findOne(createdById); // Changed from findById to findOne
  const entity = this.transactionRepository.create({
    ...dto,
    date: new Date(dto.date),
    createdBy: user,
  });
  return this.transactionRepository.save(entity);
}

  async updateTransaction(id: string, dto: UpdateTransactionDto) {
    await this.transactionRepository.update(id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    return this.transactionRepository.findOne({ where: { id } });
  }

  async deleteTransaction(id: string) {
    await this.transactionRepository.delete(id);
    return { success: true };
  }

  async getExpenseCategories() {
    return this.categoryRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async createExpenseCategory(dto: { name: string; description?: string; budgetLimit?: number }) {
    const cat = this.categoryRepository.create(dto);
    return this.categoryRepository.save(cat);
  }

  async getFinancialOverview(reportDto: FinanceReportDto) {
    const { startDate, endDate } = this.getDateRange(reportDto);

    const base = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.date BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('t.status = :status', { status: 'completed' });

    const totalRevenueRow = await base.clone().andWhere("t.type = 'income'").select('SUM(t.amount)', 'total').getRawOne();
    const totalExpensesRow = await base.clone().andWhere("t.type = 'expense'").select('SUM(t.amount)', 'total').getRawOne();

    const revenueByCategory = await base
      .clone()
      .andWhere("t.type = 'income'")
      .select(['t.category AS category', 'SUM(t.amount) AS total'])
      .groupBy('t.category')
      .getRawMany();

    const expensesByCategory = await base
      .clone()
      .andWhere("t.type = 'expense'")
      .select(['t.category AS category', 'SUM(t.amount) AS total'])
      .groupBy('t.category')
      .getRawMany();

    const totalRevenue = parseFloat(totalRevenueRow?.total || '0');
    const totalExpenses = parseFloat(totalExpensesRow?.total || '0');

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      revenueByCategory: revenueByCategory.map((r: any) => ({ category: r.category, total: parseFloat(r.total) })),
      expensesByCategory: expensesByCategory.map((r: any) => ({ category: r.category, total: parseFloat(r.total) })),
      period: { startDate, endDate },
    };
  }

  async getDetailedReport(reportDto: FinanceReportDto) {
    // For now, reuse overview and include raw transactions list within range
    const overview = await this.getFinancialOverview(reportDto);
    const { startDate, endDate } = overview.period;
    const transactions = await this.transactionRepository.find({
      where: { date: Between(startDate as any, endDate as any) } as any,
      order: { date: 'DESC' },
    });
    return { ...overview, transactions };
  }

  async exportReport(reportDto: FinanceReportDto, res: any) {
    const detailed = await this.getDetailedReport(reportDto);
    const { period, totalRevenue, totalExpenses, netProfit, revenueByCategory, expensesByCategory } = detailed as any;
    const transactions: Transaction[] = (detailed as any).transactions || [];

    const fileBase = `finance-report-${this.toISODate(period.startDate)}_to_${this.toISODate(period.endDate)}`;
    const format = (reportDto.exportFormat || 'csv').toLowerCase();

    if (format === 'csv') {
      const lines: string[] = [];
      const toCsv = (v: any) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      lines.push('Section,Metric,Value');
      lines.push(`Overview,Total Revenue,${totalRevenue}`);
      lines.push(`Overview,Total Expenses,${totalExpenses}`);
      lines.push(`Overview,Net Profit,${netProfit}`);
      lines.push('');
      lines.push('Revenue By Category,Category,Total');
      for (const r of revenueByCategory) lines.push(`Revenue,${toCsv(r.category)},${r.total}`);
      lines.push('');
      lines.push('Expenses By Category,Category,Total');
      for (const r of expensesByCategory) lines.push(`Expense,${toCsv(r.category)},${r.total}`);
      lines.push('');
      lines.push('Transactions');
      lines.push('id,type,category,amount,description,date,status,createdBy');
      for (const t of transactions) {
        const createdBy = (t as any).createdBy?.name || (t as any).createdBy?.id || '';
        lines.push([
          toCsv(t.id),
          toCsv(t.type),
          toCsv(t.category),
          toCsv(t.amount),
          toCsv(t.description),
          toCsv(this.toISODate(new Date(t.date))),
          toCsv(t.status),
          toCsv(createdBy),
        ].join(','));
      }
      const csv = lines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.csv"`);
      res.status(200).send('\ufeff' + csv);
      return;
    }

    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const ws1 = workbook.addWorksheet('Overview');
      ws1.addRow(['Metric', 'Value']);
      ws1.addRow(['Total Revenue', totalRevenue]);
      ws1.addRow(['Total Expenses', totalExpenses]);
      ws1.addRow(['Net Profit', netProfit]);
      ws1.addRow(['Start Date', this.toISODate(period.startDate)]);
      ws1.addRow(['End Date', this.toISODate(period.endDate)]);

      const ws2 = workbook.addWorksheet('Revenue By Category');
      ws2.addRow(['Category', 'Total']);
      revenueByCategory.forEach((r: any) => ws2.addRow([r.category, r.total]));

      const ws3 = workbook.addWorksheet('Expenses By Category');
      ws3.addRow(['Category', 'Total']);
      expensesByCategory.forEach((r: any) => ws3.addRow([r.category, r.total]));

      const ws4 = workbook.addWorksheet('Transactions');
      ws4.addRow(['ID', 'Type', 'Category', 'Amount', 'Description', 'Date', 'Status', 'Created By']);
      transactions.forEach((t: any) => {
        ws4.addRow([
          t.id,
          t.type,
          t.category,
          t.amount,
          t.description,
          this.toISODate(new Date(t.date)),
          t.status,
          t.createdBy?.name || t.createdBy?.id || '',
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.xlsx"`);
      res.status(200).send(Buffer.from(buffer));
      return;
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.pdf"`);
      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);
      doc.fontSize(16).text('Rapport Financier', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Période: ${this.toISODate(period.startDate)} → ${this.toISODate(period.endDate)}`);
      doc.text(`Revenus totaux: ${totalRevenue}`);
      doc.text(`Dépenses totales: ${totalExpenses}`);
      doc.text(`Bénéfice net: ${netProfit}`);
      doc.moveDown().text('Revenus par catégorie:');
      revenueByCategory.forEach((r: any) => doc.text(` • ${r.category}: ${r.total}`));
      doc.moveDown().text('Dépenses par catégorie:');
      expensesByCategory.forEach((r: any) => doc.text(` • ${r.category}: ${r.total}`));
      doc.moveDown().text('Transactions (premières 50):');
      transactions.slice(0, 50).forEach((t: any) => {
        doc.text(`${this.toISODate(new Date(t.date))} | ${t.type.toUpperCase()} | ${t.category} | ${t.amount} | ${t.description}`);
      });
      doc.end();
      return;
    }

    // Default to CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.csv"`);
    res.status(200).send('format non supporté — export par défaut CSV');
  }

  async getDashboardStats() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const daily = await this.getFinancialOverview({ startDate: this.toISODate(today), endDate: this.toISODate(today) });
    const monthly = await this.getFinancialOverview({ startDate: this.toISODate(thisMonth), endDate: this.toISODate(today) });
    const yearly = await this.getFinancialOverview({ startDate: this.toISODate(thisYear), endDate: this.toISODate(today) });

    return { daily, monthly, yearly };
  }

  private getDateRange(reportDto: FinanceReportDto) {
    let startDate: Date;
    let endDate: Date = new Date();

    if (reportDto.startDate && reportDto.endDate) {
      startDate = new Date(reportDto.startDate);
      endDate = new Date(reportDto.endDate);
    } else if (reportDto.period) {
      const now = new Date();
      switch (reportDto.period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  private toISODate(d: Date) {
    return d.toISOString().split('T')[0];
  }
}
