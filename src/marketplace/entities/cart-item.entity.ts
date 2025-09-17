import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
@Index(['cartId', 'productId'], { unique: true }) // Un produit ne peut être qu'une fois dans le même panier
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Prix unitaire au moment de l'ajout

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // prix * quantité

  @Column({ nullable: true })
  addedAt: Date;

  @Column({ type: 'json', nullable: true })
  options?: Record<string, any>; // Options du produit (couleur, taille, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column('uuid')
  cartId: string;

  @ManyToOne(() => Product, (product) => product.cartItems, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid')
  productId: string;

  // Méthode pour recalculer le total
  updateTotalPrice(): void {
    this.totalPrice = this.price * this.quantity;
  }
}