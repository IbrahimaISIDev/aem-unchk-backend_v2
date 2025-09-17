import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Review, ReviewStatus } from './entities/review.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  // Products
  async listProducts({ page = 1, limit = 10 }: PaginationDto, filters?: { category?: string; search?: string }) {
    const skip = (page - 1) * limit;
    let qb = this.productRepo.createQueryBuilder('p').where('p.status = :st', { st: ProductStatus.ACTIVE });
    if (filters?.category) qb = qb.andWhere('p.category = :cat', { cat: filters.category });
    if (filters?.search) qb = qb.andWhere('(p.name ILIKE :q OR p.description ILIKE :q)', { q: `%${filters.search}%` });
    const [data, total] = await qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Product>(data, total, page, limit);
  }

  async uploadProductImages(id: string, files: Express.Multer.File[], user: User) {
    const p = await this.getProduct(id);
    if (user.role !== UserRole.ADMIN && p.sellerId !== user.id) throw new ForbiddenException();
    const urls = (files || []).map((f) => `/uploads/${f.filename}`);
    const current = Array.isArray(p.images) ? p.images : [];
    p.images = [...current, ...urls];
    return this.productRepo.save(p);
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async createProduct(dto: CreateProductDto, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    const product = this.productRepo.create({ ...dto, sellerId: user.id, status: dto.status ?? ProductStatus.ACTIVE });
    return this.productRepo.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto, user: User) {
    const p = await this.getProduct(id);
    if (user.role !== UserRole.ADMIN && p.sellerId !== user.id) throw new ForbiddenException();
    Object.assign(p, dto);
    return this.productRepo.save(p);
  }

  async deleteProduct(id: string, user: User) {
    const p = await this.getProduct(id);
    if (user.role !== UserRole.ADMIN && p.sellerId !== user.id) throw new ForbiddenException();
    await this.productRepo.softDelete(id);
  }

  // Reviews
  async listReviews({ page = 1, limit = 10 }: PaginationDto, productId?: string) {
    const skip = (page - 1) * limit;
    let qb = this.reviewRepo.createQueryBuilder('r');
    if (productId) qb = qb.andWhere('r.productId = :pid', { pid: productId });
    const [data, total] = await qb.orderBy('r.createdAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Review>(data, total, page, limit);
  }

  async createReview(dto: CreateReviewDto, user: User) {
    const review = this.reviewRepo.create({ ...dto, userId: user.id });
    return this.reviewRepo.save(review);
  }

  async updateReviewStatus(id: string, dto: UpdateReviewStatusDto, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException();
    const r = await this.reviewRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Avis introuvable');
    r.status = dto.status;
    return this.reviewRepo.save(r);
  }

  // Cart
  async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  async getCart(user: User) {
    const cart = await this.getOrCreateCart(user.id);
    cart.totalAmount = cart.calculateTotal();
    cart.itemCount = cart.calculateItemCount();
    return this.cartRepo.save(cart);
  }

  async addToCart(dto: AddToCartDto, user: User) {
    const cart = await this.getOrCreateCart(user.id);
    const product = await this.getProduct(dto.productId);
    let item = await this.cartItemRepo.findOne({ where: { cartId: cart.id, productId: product.id } });
    if (!item) {
      item = this.cartItemRepo.create({
        cartId: cart.id,
        productId: product.id,
        quantity: dto.quantity,
        price: product.price,
        totalPrice: product.price * dto.quantity,
        addedAt: new Date(),
      });
    } else {
      item.quantity += dto.quantity;
      item.updateTotalPrice();
    }
    await this.cartItemRepo.save(item);
    return this.getCart(user);
  }

  async updateCartItem(dto: UpdateCartItemDto, user: User) {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.cartItemRepo.findOne({ where: { id: dto.itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Élément introuvable');
    item.quantity = dto.quantity;
    item.updateTotalPrice();
    await this.cartItemRepo.save(item);
    return this.getCart(user);
  }

  async removeCartItem(itemId: string, user: User) {
    const cart = await this.getOrCreateCart(user.id);
    const item = await this.cartItemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (item) await this.cartItemRepo.remove(item);
    return this.getCart(user);
  }

  // Orders (simplifié)
  async listOrders(user: User, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.userId = :uid', { uid: user.id })
      .orderBy('o.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return new PaginationResponseDto<Order>(data, total, page, limit);
  }
}
