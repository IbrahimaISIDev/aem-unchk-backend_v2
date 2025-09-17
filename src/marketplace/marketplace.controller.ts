import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { Review } from './entities/review.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiPaginatedResponse as ApiPaged } from '../common/decorators/api-paginated-response.decorator';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  // Products
  @Get('products')
  @Public()
  @ApiOperation({ summary: 'Lister les produits' })
  @ApiPaged(Product)
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async listProducts(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Product>> {
    return this.service.listProducts(pagination, { category, search });
  }

  @Get('products/:id')
  @Public()
  @ApiResponse({ status: 200, type: Product })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getProduct(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    return this.service.createProduct(dto, user);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateProduct(id, dto, user);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.deleteProduct(id, user);
  }

  @Post('products/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Uploader des images produit (multi-fichiers)' })
  async uploadProductImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.service.uploadProductImages(id, files, user);
  }

  // Reviews
  @Get('reviews')
  @Public()
  @ApiOperation({ summary: 'Lister les avis' })
  @ApiPaged(Review)
  @ApiQuery({ name: 'productId', required: false, type: String })
  async listReviews(@Query() pagination: PaginationDto, @Query('productId') productId?: string) {
    return this.service.listReviews(pagination, productId);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.service.createReview(dto, user);
  }

  @Patch('reviews/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  async updateReviewStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateReviewStatus(id, dto, user);
  }

  // Cart
  @Get('cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getCart(@CurrentUser() user: User) {
    return this.service.getCart(user);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async addToCart(@Body() dto: AddToCartDto, @CurrentUser() user: User) {
    return this.service.addToCart(dto, user);
  }

  @Patch('cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async updateCart(@Body() dto: UpdateCartItemDto, @CurrentUser() user: User) {
    return this.service.updateCartItem(dto, user);
  }

  @Delete('cart/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async removeCartItem(@Param('itemId', ParseUUIDPipe) itemId: string, @CurrentUser() user: User) {
    return this.service.removeCartItem(itemId, user);
  }

  // Orders
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async listOrders(@CurrentUser() user: User, @Query() pagination: PaginationDto): Promise<PaginationResponseDto<Order>> {
    return this.service.listOrders(user, pagination);
  }
}
