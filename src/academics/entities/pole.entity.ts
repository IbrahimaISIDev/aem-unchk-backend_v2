import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Filiere } from './filiere.entity';
import { User } from '../../users/entities/user.entity';

@Entity('poles')
@Index(['name'], { unique: true })
@Index(['code'], { unique: true })
export class Pole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Filiere, (f) => f.pole)
  filieres: Filiere[];

  @OneToMany(() => User, (user) => user.pole)
  users: User[];
}
