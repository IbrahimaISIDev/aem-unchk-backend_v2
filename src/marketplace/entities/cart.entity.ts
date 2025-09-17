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
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'], { unique: true }) // Un utilisateur ne peut avoir qu'un seul panier actif
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 0 })
  itemCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt?: Date; // Panier peut expirer après X temps d'inactivité

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.carts, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true, eager: true })
  items: CartItem[];

  // Méthodes utiles
  calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  calculateItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}