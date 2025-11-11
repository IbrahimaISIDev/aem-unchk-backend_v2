import { Controller, Get, Patch, Param, ParseUUIDPipe, Query, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MarketplaceService } from './marketplace.service';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';

@ApiTags('Admin Orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class OrdersAdminController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les commandes (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  async listAll(@Query() pagination: PaginationDto & { status?: OrderStatus; paymentStatus?: PaymentStatus }): Promise<PaginationResponseDto<Order>> {
    const { status, paymentStatus, ...page } = pagination as any;
    return this.marketplace.listAllOrders(page, { status, paymentStatus });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut de la commande' })
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: OrderStatus }) {
    return this.marketplace.updateOrderStatus(id, body.status);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Mettre à jour le statut de paiement' })
  async updatePayment(@Param('id', ParseUUIDPipe) id: string, @Body() body: { paymentStatus: PaymentStatus }) {
    return this.marketplace.updatePaymentStatus(id, body.paymentStatus);
  }
}
