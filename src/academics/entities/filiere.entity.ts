import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { Pole } from './pole.entity';
import { User } from '../../users/entities/user.entity';

@Entity('filieres')
@Index(['name'])
@Index(['code'], { unique: true })
@Unique(['name', 'pole'])
export class Filiere {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  poleId: string;

  @ManyToOne(() => Pole, (p) => p.filieres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poleId' })
  pole: Pole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.filiereRef)
  users: User[];
}
