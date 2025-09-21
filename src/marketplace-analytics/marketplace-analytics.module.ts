import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceAnalyticsController } from './marketplace-analytics.controller';
import { MarketplaceAnalyticsService } from './marketplace-analytics.service';
import { Order } from '../marketplace/entities/order.entity';
import { OrderItem } from '../marketplace/entities/order-item.entity';
import { Product } from '../marketplace/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [MarketplaceAnalyticsController],
  providers: [MarketplaceAnalyticsService],
})
export class MarketplaceAnalyticsModule {}
