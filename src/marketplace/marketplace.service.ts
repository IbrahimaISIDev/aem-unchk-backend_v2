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
  async listProducts({ page = 1, limit = 20 }: PaginationDto, filters?: { category?: string; search?: string }) {
    const skip = (page - 1) * limit;
    let qb = this.productRepo.createQueryBuilder('p').where('p.status = :st', { st: ProductStatus.ACTIVE });
    if (filters?.category) qb = qb.andWhere('p.category = :cat', { cat: filters.category });
    if (filters?.search) qb = qb.andWhere('(p.name ILIKE :q OR p.description ILIKE :q)', { q: `%${filters.search}%` });
    const [data, total] = await qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Product>(data, total, page, limit);
  }

  // Admin Orders
  async listAllOrders({ page = 1, limit = 20 }: PaginationDto, filters?: { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
    const skip = (page - 1) * limit;
    let qb = this.orderRepo.createQueryBuilder('o').leftJoinAndSelect('o.items', 'items').leftJoinAndSelect('o.user', 'user');
    if (filters?.status) qb = qb.andWhere('o.status = :st', { st: filters.status });
    if (filters?.paymentStatus) qb = qb.andWhere('o.paymentStatus = :ps', { ps: filters.paymentStatus });
    const [data, total] = await qb.orderBy('o.createdAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Order>(data, total, page, limit);
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.paymentStatus = paymentStatus;
    if (paymentStatus === PaymentStatus.PAID && !order.paidAt) order.paidAt = new Date();
    return this.orderRepo.save(order);
  }

  async payOrder(orderId: string, user: User, dto?: { method?: string; transactionRef?: string }) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== user.id && user.role !== UserRole.ADMIN) throw new ForbiddenException();

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.CONFIRMED;
    order.paidAt = new Date();
    order.paymentMethod = (dto?.method as any) ?? order.paymentMethod;
    order.paymentTransactionId = dto?.transactionRef || `SIM-${Date.now()}`;

    return this.orderRepo.save(order);
  }

  async createOrder(user: User, dto: any) {
    const cart = await this.getOrCreateCart(user.id);
    if (!cart.items || cart.items.length === 0) {
      throw new NotFoundException('Panier vide');
    }

    // Calcul des totaux
    const subtotal = cart.items.reduce((sum, it) => sum + it.totalPrice, 0);
    const shippingCost = cart.items.reduce((sum, it) => {
      const p = it.product;
      const requires = Boolean(p?.requiresShipping);
      const ship = Number(p?.shippingCost || 0);
      return sum + (requires ? ship * it.quantity : 0);
    }, 0);
    const taxAmount = 0; // Pas de TVA pour l'instant
    const discountAmount = 0;
    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

    // Générer un numéro de commande simple
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const orderNumber = `CMD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${now.getTime()}`;

    // Créer l'entité Order
    const order = this.orderRepo.create({
      orderNumber,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      totalAmount,
      userId: user.id,
      shippingAddress: dto?.shippingAddress,
      shippingCity: dto?.shippingCity,
      shippingPostalCode: dto?.shippingPostalCode,
      shippingCountry: dto?.shippingCountry,
      shippingPhone: dto?.shippingPhone,
      billingAddress: dto?.billingAddress,
      billingCity: dto?.billingCity,
      billingPostalCode: dto?.billingPostalCode,
      billingCountry: dto?.billingCountry,
      billingPhone: dto?.billingPhone,
      notes: dto?.notes,
      metadata: dto?.metadata,
    });

    // Transformer les items du panier en items de commande
    order.items = cart.items.map((ci) => {
      const p = ci.product;
      const oi = this.orderItemRepo.create({
        productId: p.id,
        quantity: ci.quantity,
        price: ci.price,
        totalPrice: ci.totalPrice,
        productName: p.name,
        productDescription: p.description,
        productImage: Array.isArray(p.images) && p.images.length ? p.images[0] : undefined,
        productMetadata: {
          category: p.category,
          brand: p.brand,
          model: p.model,
          isDigital: p.isDigital,
        },
      });
      return oi;
    });

    // Sauvegarder la commande (cascade pour items)
    const saved = await this.orderRepo.save(order);

    // Décrémenter le stock des produits
    for (const ci of cart.items) {
      const p = await this.productRepo.findOne({ where: { id: ci.productId } });
      if (p) {
        p.stock = Math.max(0, Number(p.stock || 0) - ci.quantity);
        await this.productRepo.save(p);
      }
    }

    // Vider le panier
    if (cart.items?.length) {
      await this.cartItemRepo.remove(cart.items);
    }
    cart.totalAmount = 0;
    cart.itemCount = 0;
    await this.cartRepo.save(cart);

    return saved;
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
  async listReviews({ page = 1, limit = 20 }: PaginationDto, productId?: string) {
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
    const { page = 1, limit = 20 } = pagination;
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

  async listProductsTrashed(pagination: PaginationDto, filters?: { category?: string; search?: string }) {
    const { page = 1, limit = 20, skip } = pagination;
    let qb = this.productRepo.createQueryBuilder('p').withDeleted().where('p.deletedAt IS NOT NULL');
    if (filters?.category) qb = qb.andWhere('p.category = :cat', { cat: filters.category });
    if (filters?.search) qb = qb.andWhere('(p.name ILIKE :q OR p.description ILIKE :q)', { q: `%${filters.search}%` });
    const [data, total] = await qb.orderBy('p.deletedAt', 'DESC').skip(skip).take(limit).getManyAndCount();
    return new PaginationResponseDto<Product>(data, total, page, limit);
  }

  async restoreProduct(id: string) { await this.productRepo.restore(id); }
  async purgeProduct(id: string) { await this.productRepo.delete(id); }

  async exportProducts(filters?: { category?: string; search?: string }) {
    let qb = this.productRepo.createQueryBuilder('p');
    if (filters?.category) qb = qb.andWhere('p.category = :cat', { cat: filters.category });
    if (filters?.search) qb = qb.andWhere('(p.name ILIKE :q OR p.description ILIKE :q)', { q: `%${filters.search}%` });
    const items = await qb.orderBy('p.createdAt', 'DESC').getMany();
    return items.map((p) => ({ id: p.id, name: p.name, price: p.price, status: p.status, stock: p.stock, category: p.category, createdAt: p.createdAt }));
  }
}
