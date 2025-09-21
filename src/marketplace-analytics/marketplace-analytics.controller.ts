import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MarketplaceAnalyticsService } from './marketplace-analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Marketplace Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('marketplace-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketplaceAnalyticsController {
  constructor(private readonly service: MarketplaceAnalyticsService) {}

  @Get('sales-overview')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getSalesOverview(@Query() filterDto: AnalyticsFilterDto) {
    return this.service.getSalesOverview(filterDto);
  }

  @Get('top-products')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getTopProducts(@Query() filterDto: AnalyticsFilterDto) {
    return this.service.getTopProducts(filterDto);
  }

  @Get('customer-analytics')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getCustomerAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.service.getCustomerAnalytics(filterDto);
  }

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getOrders(@Query() filterDto: OrderFilterDto) {
    return this.service.getOrders(filterDto);
  }

  @Get('revenue-by-category')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async getRevenueByCategory(@Query() filterDto: AnalyticsFilterDto) {
    return this.service.getRevenueByCategory(filterDto);
  }
}
