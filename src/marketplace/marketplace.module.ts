import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { ProductsAdminController } from './products.admin.controller';
import { OrdersAdminController } from './orders.admin.controller';
import { MarketplaceService } from './marketplace.service';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Review } from './entities/review.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, OrderItem, Review, Cart, CartItem]), AuditModule],
  controllers: [MarketplaceController, ProductsAdminController, OrdersAdminController],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
