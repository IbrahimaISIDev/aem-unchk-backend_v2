import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrayerService {
  private baseUrl: string;
  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get('externalApis.aladhan.baseUrl') || 'https://api.aladhan.com/v1';
  }

  async getTimes(params: { city?: string; country?: string; latitude?: number; longitude?: number; method?: number; date?: string }) {
    const { city, country, latitude, longitude, method = 2, date } = params;
    let url = '';
    let query: any = { method };

    if (city && country) {
      url = `${this.baseUrl}/timingsByCity`;
      query = { ...query, city, country };
    } else if (typeof latitude === 'number' && typeof longitude === 'number') {
      url = `${this.baseUrl}/timings`;
      query = { ...query, latitude, longitude };
    } else {
      // default to Dakar
      url = `${this.baseUrl}/timingsByCity`;
      query = { ...query, city: 'Dakar', country: 'Senegal' };
    }

    if (date) query.date = date;

    const { data } = await axios.get(url, { params: query });
    return data;
  }

  async getCalendar(params: { year: number; month: number; city?: string; country?: string; method?: number }) {
    const { year, month, city = 'Dakar', country = 'Senegal', method = 2 } = params;
    const url = `${this.baseUrl}/calendarByCity/${year}/${month}`;
    const { data } = await axios.get(url, { params: { city, country, method } });
    return data;
  }
}
