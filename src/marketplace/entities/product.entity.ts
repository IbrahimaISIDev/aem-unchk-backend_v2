import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Review } from './review.entity';
import { CartItem } from './cart-item.entity';

export enum ProductCategory {
  BOOKS = 'books',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  HOME_DECOR = 'home_decor',
  FOOD = 'food',
  GIFTS = 'gifts',
  EDUCATION = 'education',
  HEALTH = 'health',
  SERVICES = 'services',
  DIGITAL = 'digital',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
@Index(['category'])
@Index(['status'])
@Index(['price'])
@Index(['createdAt'])
@Index(['name'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice?: number; // Prix avant réduction

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  minStock?: number; // Seuil d'alerte stock

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.BOOKS,
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ length: 100, nullable: true })
  brand?: string;

  @Column({ length: 100, nullable: true })
  model?: string;

  @Column({ nullable: true })
  weight?: number; // en grammes

  @Column({ type: 'json', nullable: true })
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @Column({ default: false })
  isDigital: boolean;

  @Column({ default: false })
  requiresShipping: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  sales: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column('uuid')
  sellerId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}