import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Prix unitaire au moment de la commande

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // prix * quantité

  @Column({ length: 255 })
  productName: string; // Sauvegarde du nom au moment de la commande

  @Column({ type: 'text', nullable: true })
  productDescription?: string;

  @Column({ nullable: true, length: 500 })
  productImage?: string;

  @Column({ type: 'json', nullable: true })
  productMetadata?: Record<string, any>; // Snapshot des propriétés du produit

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid')
  productId: string;
}