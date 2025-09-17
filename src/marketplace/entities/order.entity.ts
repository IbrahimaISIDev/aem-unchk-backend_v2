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

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CRYPTO = 'crypto',
}

@Entity('orders')
@Index(['status'])
@Index(['paymentStatus'])
@Index(['createdAt'])
@Index(['userId'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod;

  @Column({ nullable: true, length: 255 })
  paymentTransactionId?: string;

  @Column({ nullable: true })
  paidAt?: Date;

  // Adresse de livraison
  @Column({ nullable: true, length: 255 })
  shippingAddress?: string;

  @Column({ nullable: true, length: 100 })
  shippingCity?: string;

  @Column({ nullable: true, length: 20 })
  shippingPostalCode?: string;

  @Column({ nullable: true, length: 100 })
  shippingCountry?: string;

  @Column({ nullable: true, length: 20 })
  shippingPhone?: string;

  // Adresse de facturation
  @Column({ nullable: true, length: 255 })
  billingAddress?: string;

  @Column({ nullable: true, length: 100 })
  billingCity?: string;

  @Column({ nullable: true, length: 20 })
  billingPostalCode?: string;

  @Column({ nullable: true, length: 100 })
  billingCountry?: string;

  @Column({ nullable: true, length: 20 })
  billingPhone?: string;

  @Column({ nullable: true, length: 255 })
  trackingNumber?: string;

  @Column({ nullable: true, length: 100 })
  shippingCarrier?: string;

  @Column({ nullable: true })
  shippedAt?: Date;

  @Column({ nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];
}