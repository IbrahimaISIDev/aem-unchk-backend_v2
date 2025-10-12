import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

@Entity('prayer_times')
@Unique('uq_prayer_times_date_location_method', ['date', 'city', 'country', 'method'])
export class PrayerTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 120 })
  city: string;

  @Column({ length: 120 })
  country: string;

  @Column({ type: 'int', default: 2 })
  method: number;

  @Column({ length: 120, nullable: true })
  timezone?: string;

  @Column({ length: 5 })
  fajr: string;

  @Column({ length: 5 })
  dhuhr: string;

  @Column({ length: 5 })
  asr: string;

  @Column({ length: 5 })
  maghrib: string;

  @Column({ length: 5 })
  isha: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
