import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from './product.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reviews')
@Index(['rating'])
@Index(['status'])
@Index(['createdAt'])
@Index(['productId', 'userId'], { unique: true }) // Un utilisateur ne peut faire qu'un avis par produit
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number; // 1.0 à 5.0

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ default: 0 })
  helpfulCount: number; // Nombre de personnes qui ont trouvé l'avis utile

  @Column({ type: 'simple-array', nullable: true })
  images?: string[]; // Images jointes à l'avis

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.reviews, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Product, (product) => product.reviews, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid')
  productId: string;
}