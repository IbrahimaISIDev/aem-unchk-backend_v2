import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrayerTime } from './entities/prayer-time.entity';
import { PrayerTimeAdjustment } from './entities/prayer-time-adjustment.entity';
import { UpdatePrayerAdjustmentDto } from './dto/update-prayer-adjustment.dto';
import * as moment from 'moment';
import 'moment-hijri';

type Timings = { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };

@Injectable()
export class PrayerService {
  private baseUrl: string;
  private readonly logger = new Logger(PrayerService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PrayerTime) private timesRepo: Repository<PrayerTime>,
    @InjectRepository(PrayerTimeAdjustment) private adjRepo: Repository<PrayerTimeAdjustment>,
  ) {
    this.baseUrl = this.config.get('externalApis.aladhan.baseUrl') || 'https://api.aladhan.com/v1';
    this.logger.log(`Prayer Service initialized with base URL: ${this.baseUrl}`);
  }

  private normalizeTime(input: string | undefined | null): string {
    if (!input) return '00:00';
    const m = input.match(/(\d{1,2}):(\d{2})/);
    if (!m) return '00:00';
    const hh = String(Math.min(23, parseInt(m[1], 10))).padStart(2, '0');
    const mm = String(Math.min(59, parseInt(m[2], 10))).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private addMinutes(time: string, offset: number): string {
    const [h, m] = time.split(':').map((x) => parseInt(x, 10));
    let total = h * 60 + m + (offset || 0);
    total = ((total % 1440) + 1440) % 1440;
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private todayYMD(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private async fetchFromApi(params: { city: string; country: string; method?: number; date?: string }): Promise<{ timings: Timings; timezone?: string }> {
    const { city, country, method = 2, date } = params;
    try {
      let url = `${this.baseUrl}/timingsByCity`;
      const query: any = { city, country, method };
      if (date) query.date = date;
      const { data } = await axios.get(url, { params: query, timeout: 10000, headers: { Accept: 'application/json' } });
      const timings = data?.data?.timings || {};
      const tz = data?.data?.meta?.timezone || undefined;
      const normalized: Timings = {
        Fajr: this.normalizeTime(timings.Fajr),
        Dhuhr: this.normalizeTime(timings.Dhuhr),
        Asr: this.normalizeTime(timings.Asr),
        Maghrib: this.normalizeTime(timings.Maghrib),
        Isha: this.normalizeTime(timings.Isha),
      };
      return { timings: normalized, timezone: tz };
    } catch (error: any) {
      this.logger.error(`Failed to fetch prayer times: ${error?.message}`);
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || 'Failed to fetch prayer times from external API',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException('Internal server error while fetching prayer times', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async upsertRaw(params: { date: string; city: string; country: string; method?: number }): Promise<PrayerTime> {
    const { date, city, country, method = 2 } = params;
    let existing = await this.timesRepo.findOne({ where: { date, city, country, method } });
    if (existing) return existing;
    const { timings, timezone } = await this.fetchFromApi({ city, country, method, date });
    const entity = this.timesRepo.create({
      date,
      city,
      country,
      method,
      timezone,
      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
    });
    return this.timesRepo.save(entity);
  }

  private async getRaw(params: { date: string; city: string; country: string; method?: number }): Promise<PrayerTime> {
    const { date, city, country, method = 2 } = params;
    let row = await this.timesRepo.findOne({ where: { date, city, country, method } });
    if (!row) row = await this.upsertRaw({ date, city, country, method });
    return row;
  }

  private async getAdjustment(params: { date: string; city: string; country: string }): Promise<PrayerTimeAdjustment | null> {
    const { date, city, country } = params;
    return this.adjRepo.findOne({ where: { date, city, country } });
  }

  private applyAdjustment(raw: Timings, adj?: PrayerTimeAdjustment | null): Timings {
    if (!adj) return raw;
    return {
      Fajr: adj.fajrOverride ? adj.fajrOverride : this.addMinutes(raw.Fajr, adj.fajrOffset || 0),
      Dhuhr: adj.dhuhrOverride ? adj.dhuhrOverride : this.addMinutes(raw.Dhuhr, adj.dhuhrOffset || 0),
      Asr: adj.asrOverride ? adj.asrOverride : this.addMinutes(raw.Asr, adj.asrOffset || 0),
      Maghrib: adj.maghribOverride ? adj.maghribOverride : this.addMinutes(raw.Maghrib, adj.maghribOffset || 0),
      Isha: adj.ishaOverride ? adj.ishaOverride : this.addMinutes(raw.Isha, adj.ishaOffset || 0),
    };
  }

  async getTimes(params: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    method?: number;
    date?: string;
  }) {
    const { city: c, country: co, method = 2 } = params;
    const city = c || 'Dakar';
    const country = co || 'Senegal';
    const dateYMD = params.date && params.date.includes('-') && params.date.length >= 8 ? params.date : this.todayYMD();

    const raw = await this.getRaw({ date: dateYMD, city, country, method });
    const adj = await this.getAdjustment({ date: raw.date, city: raw.city, country: raw.country });
    const adjusted = this.applyAdjustment(
      { Fajr: raw.fajr, Dhuhr: raw.dhuhr, Asr: raw.asr, Maghrib: raw.maghrib, Isha: raw.isha },
      adj,
    );

    return {
      code: 200,
      status: 'OK',
      data: {
        timings: adjusted,
        date: (() => {
          const m = moment(raw.date, 'YYYY-MM-DD');
          const hijriDay = m.date();
          const hijriMonthNumber = m.month() + 1;
          const hijriYear = m.year();
          const monthEn = m.clone().locale('en').format('iMMMM');
          const weekdayAr = m.clone().locale('ar').format('dddd');
          return {
            readable: raw.date,
            hijri: {
              day: String(hijriDay).padStart(2, '0'),
              month: { number: hijriMonthNumber, en: monthEn },
              year: String(hijriYear),
              weekday: { ar: weekdayAr },
            },
          };
        })(),
        meta: { timezone: raw.timezone, method, originalTimings: { Fajr: raw.fajr, Dhuhr: raw.dhuhr, Asr: raw.asr, Maghrib: raw.maghrib, Isha: raw.isha } },
      },
    };
  }

  async getCalendar(params: { year: number; month: number; city?: string; country?: string; method?: number }) {
    const { year, month, city = 'Dakar', country = 'Senegal', method = 2 } = params;
    try {
      const url = `${this.baseUrl}/calendarByCity/${year}/${month}`;
      const { data } = await axios.get(url, { params: { city, country, method }, timeout: 10000, headers: { Accept: 'application/json' } });
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch calendar: ${error.message}`);
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || 'Failed to fetch calendar from external API',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException('Internal server error while fetching calendar', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdminDay(params: { date: string; city: string; country: string; method?: number }) {
    const { date, city, country, method = 2 } = params;
    const raw = await this.getRaw({ date, city, country, method });
    const adj = await this.getAdjustment({ date, city, country });
    const adjusted = this.applyAdjustment(
      { Fajr: raw.fajr, Dhuhr: raw.dhuhr, Asr: raw.asr, Maghrib: raw.maghrib, Isha: raw.isha },
      adj,
    );
    const offsets = {
      fajrOffset: adj?.fajrOffset || 0,
      dhuhrOffset: adj?.dhuhrOffset || 0,
      asrOffset: adj?.asrOffset || 0,
      maghribOffset: adj?.maghribOffset || 0,
      ishaOffset: adj?.ishaOffset || 0,
    };
    const overrides = {
      fajrOverride: adj?.fajrOverride || null,
      dhuhrOverride: adj?.dhuhrOverride || null,
      asrOverride: adj?.asrOverride || null,
      maghribOverride: adj?.maghribOverride || null,
      ishaOverride: adj?.ishaOverride || null,
    } as const;

    return {
      date: raw.date,
      location: { city: raw.city, country: raw.country },
      method,
      apiTimings: { Fajr: raw.fajr, Dhuhr: raw.dhuhr, Asr: raw.asr, Maghrib: raw.maghrib, Isha: raw.isha },
      adjustedTimings: adjusted,
      offsets,
      overrides,
      timezone: raw.timezone,
    };
  }

  async saveAdminDay(dto: UpdatePrayerAdjustmentDto) {
    const { date, city, country } = dto;
    let row = await this.adjRepo.findOne({ where: { date, city, country } });
    if (!row) row = this.adjRepo.create({ date, city, country });

    row.method = dto.method ?? row.method;
    if (dto.fajrOffset !== undefined) row.fajrOffset = dto.fajrOffset;
    if (dto.dhuhrOffset !== undefined) row.dhuhrOffset = dto.dhuhrOffset;
    if (dto.asrOffset !== undefined) row.asrOffset = dto.asrOffset;
    if (dto.maghribOffset !== undefined) row.maghribOffset = dto.maghribOffset;
    if (dto.ishaOffset !== undefined) row.ishaOffset = dto.ishaOffset;

    if (dto.fajrOverride !== undefined) row.fajrOverride = dto.fajrOverride || null as any;
    if (dto.dhuhrOverride !== undefined) row.dhuhrOverride = dto.dhuhrOverride || null as any;
    if (dto.asrOverride !== undefined) row.asrOverride = dto.asrOverride || null as any;
    if (dto.maghribOverride !== undefined) row.maghribOverride = dto.maghribOverride || null as any;
    if (dto.ishaOverride !== undefined) row.ishaOverride = dto.ishaOverride || null as any;

    await this.adjRepo.save(row);

    const after = await this.getAdminDay({ date, city, country, method: dto.method });
    return after;
  }
}
