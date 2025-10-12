import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prayer_time_adjustments')
@Unique('uq_prayer_adj_date_location', ['date', 'city', 'country'])
export class PrayerTimeAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 120 })
  city: string;

  @Column({ length: 120 })
  country: string;

  @Column({ type: 'int', nullable: true })
  method?: number;

  @Column({ type: 'int', default: 0 })
  fajrOffset: number;

  @Column({ type: 'int', default: 0 })
  dhuhrOffset: number;

  @Column({ type: 'int', default: 0 })
  asrOffset: number;

  @Column({ type: 'int', default: 0 })
  maghribOffset: number;

  @Column({ type: 'int', default: 0 })
  ishaOffset: number;

  @Column({ length: 5, nullable: true })
  fajrOverride?: string;

  @Column({ length: 5, nullable: true })
  dhuhrOverride?: string;

  @Column({ length: 5, nullable: true })
  asrOverride?: string;

  @Column({ length: 5, nullable: true })
  maghribOverride?: string;

  @Column({ length: 5, nullable: true })
  ishaOverride?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
