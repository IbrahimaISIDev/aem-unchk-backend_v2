import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../marketplace/entities/order.entity';
import { OrderItem } from '../marketplace/entities/order-item.entity';
import { Product } from '../marketplace/entities/product.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { OrderFilterDto } from './dto/order-filter.dto';

@Injectable()
export class MarketplaceAnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  private getDateRange(filter: AnalyticsFilterDto | OrderFilterDto) {
    let startDate: Date;
    let endDate: Date = new Date();
    if (filter.startDate && filter.endDate) {
      startDate = new Date(filter.startDate);
      endDate = new Date(filter.endDate);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    return { startDate, endDate };
  }

  async getSalesOverview(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);
    const totalOrdersRow = await this.orders
      .createQueryBuilder('o')
      .where('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .select('COUNT(o.id)', 'count')
      .addSelect('SUM(o.totalAmount)', 'revenue')
      .getRawOne();

    const topCustomers = await this.orders
      .createQueryBuilder('o')
      .select('o.userId', 'userId')
      .addSelect('COUNT(o.id)', 'orders')
      .addSelect('SUM(o.totalAmount)', 'amount')
      .where('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('o.userId')
      .orderBy('amount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalOrders: parseInt(totalOrdersRow?.count || '0', 10),
      totalRevenue: parseFloat(totalOrdersRow?.revenue || '0'),
      topCustomers: topCustomers.map((c) => ({ userId: c.userId, orders: parseInt(c.orders, 10), amount: parseFloat(c.amount) })),
      period: { startDate, endDate },
    };
  }

  async getTopProducts(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    const rows = await this.orderItems
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'o')
      .leftJoin('oi.product', 'p')
      .where('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .select('oi.productId', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('SUM(oi.quantity)', 'qty')
      .addSelect('SUM(oi.totalPrice)', 'revenue')
      .groupBy('oi.productId')
      .addGroupBy('p.name')
      .orderBy('qty', 'DESC')
      .limit(10)
      .getRawMany();

    return rows.map((r) => ({ productId: r.productId, name: r.name, quantity: parseInt(r.qty, 10), revenue: parseFloat(r.revenue) }));
  }

  async getCustomerAnalytics(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);

    const rows = await this.orders
      .createQueryBuilder('o')
      .select('o.userId', 'userId')
      .addSelect('COUNT(o.id)', 'orders')
      .addSelect('SUM(o.totalAmount)', 'amount')
      .where('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('o.userId')
      .orderBy('amount', 'DESC')
      .getRawMany();

    return rows.map((r) => ({ userId: r.userId, orders: parseInt(r.orders, 10), amount: parseFloat(r.amount) }));
  }

  async getOrders(filter: OrderFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);
    const qb = this.orders.createQueryBuilder('o').leftJoinAndSelect('o.items', 'items');
    if (filter.status) qb.andWhere('o.status = :status', { status: filter.status });
    if (filter.paymentStatus) qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus: filter.paymentStatus });
    if (filter.userId) qb.andWhere('o.userId = :userId', { userId: filter.userId });
    qb.andWhere('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate });

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit).orderBy('o.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRevenueByCategory(filter: AnalyticsFilterDto) {
    const { startDate, endDate } = this.getDateRange(filter);
    const rows = await this.orderItems
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'o')
      .leftJoin('oi.product', 'p')
      .where('o.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .select('p.category', 'category')
      .addSelect('SUM(oi.totalPrice)', 'revenue')
      .groupBy('p.category')
      .orderBy('revenue', 'DESC')
      .getRawMany();
    return rows.map((r) => ({ category: r.category, revenue: parseFloat(r.revenue) }));
  }
}
