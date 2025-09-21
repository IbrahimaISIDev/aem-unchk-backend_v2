import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcryptjs";
import { Media } from "../../media/entities/media.entity";
import { Event } from "../../events/entities/event.entity";
import { Activity } from "../../events/entities/activity.entity";
import { Notification } from "../../notifications/entities/notification.entity";
import { UserSession } from "../../analytics/entities/user-session.entity";
import { Order } from "../../marketplace/entities/order.entity";
import { Review } from "../../marketplace/entities/review.entity";
import { Cart } from "../../marketplace/entities/cart.entity";
import { Eno } from "../../academics/entities/eno.entity";
import { Pole } from "../../academics/entities/pole.entity";
import { Filiere } from "../../academics/entities/filiere.entity";

export enum UserRole {
  VISITOR = "visitor",
  MEMBER = "member",
  ADMIN = "admin",
  SCHOLAR = "scholar",
  IMAM = "imam",
  FINANCE_MANAGER = "finance_manager",
  TREASURER = "treasurer",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

@Entity("users")
@Index(["email"], { unique: true })
@Index(["telephone"], { unique: true, where: "telephone IS NOT NULL" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  // Getter pour le nom complet - plus simple et plus sûr
  get name(): string {
    return `${this.nom} ${this.prenom}`.trim();
  }

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 20 })
  telephone?: string;

  @Column({ nullable: true, length: 255 })
  adresse?: string;

  @Column({ nullable: true, length: 100 })
  ville?: string;

  @Column({ nullable: true, length: 150 })
  universite?: string;

  @Column({ nullable: true, length: 100 })
  eno_rattachement?: string;

  @Column({ nullable: true, length: 100 })
  filiere?: string;

  @Column({ nullable: true, length: 50 })
  annee_promotion?: string;

  @Column({ nullable: true, length: 50 })
  niveau?: string;

  @Column({ type: "text", nullable: true })
  motivation?: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.VISITOR,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true, length: 255 })
  avatar?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ default: 0 })
  points: number;

  @Column({ type: "simple-array", nullable: true })
  badges?: string[];

  @Column({ type: "simple-array", nullable: true })
  favorites?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: "uuid", nullable: true })
  enoId?: string;

  @ManyToOne(() => Eno, (eno) => eno.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enoId' })
  eno?: Eno;

  @Column({ type: "uuid", nullable: true })
  poleId?: string;

  @ManyToOne(() => Pole, (pole) => pole.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'poleId' })
  pole?: Pole;

  @Column({ type: "uuid", nullable: true })
  filiereId?: string;

  @ManyToOne(() => Filiere, (filiere) => filiere.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'filiereId' })
  filiereRef?: Filiere;

  @CreateDateColumn()
  date_inscription: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToMany(() => Media, (media) => media.author)
  media: Media[];

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @OneToMany(() => Activity, (activity) => activity.participant)
  activities: Activity[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @BeforeInsert()
  @BeforeUpdate()
  async prepareForSave() {
    if (this.email) this.email = this.email.toLowerCase().trim();
    if (this.telephone) this.telephone = this.telephone.trim();

    if (!this.password) return;
    const alreadyHashed =
      this.password.startsWith('$2a$') ||
      this.password.startsWith('$2b$') ||
      this.password.startsWith('$2y$');
    if (alreadyHashed) return;

    this.password = await bcrypt.hash(this.password, 12);
  }

  async validatePassword(password: string): Promise<boolean> {
    console.log(
      "🔐 User.validatePassword - Début pour utilisateur:",
      this.email
    );
    console.log("🔐 Données de validation:", {
      inputPasswordLength: password?.length,
      storedPasswordLength: this.password?.length,
      storedPasswordPreview: this.password?.substring(0, 10) + "...",
    });

    try {
      const isValid = await bcrypt.compare(password, this.password);
      console.log("🔐 Résultat bcrypt.compare:", { isValid });
      return isValid;
    } catch (error) {
      console.error("❌ Erreur dans validatePassword:", error);
      return false;
    }
  }

  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}
