import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrayerService {
  private baseUrl: string;
  private readonly logger = new Logger(PrayerService.name);

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get('externalApis.aladhan.baseUrl') || 'https://api.aladhan.com/v1';
    this.logger.log(`Prayer Service initialized with base URL: ${this.baseUrl}`);
  }

  async getTimes(params: { 
    city?: string; 
    country?: string; 
    latitude?: number; 
    longitude?: number; 
    method?: number; 
    date?: string 
  }) {
    const { city, country, latitude, longitude, method = 2, date } = params;
    
    try {
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

      this.logger.log(`Fetching prayer times: ${url} with params: ${JSON.stringify(query)}`);

      const { data } = await axios.get(url, { 
        params: query,
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });

      this.logger.log(`Prayer times fetched successfully for ${city || 'Dakar'}`);
      return data;

    } catch (error) {
      this.logger.error(`Failed to fetch prayer times: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error details: ${JSON.stringify(error.response?.data)}`);
        throw new HttpException(
          error.response?.data?.message || 'Failed to fetch prayer times from external API',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Internal server error while fetching prayer times',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCalendar(params: { 
    year: number; 
    month: number; 
    city?: string; 
    country?: string; 
    method?: number 
  }) {
    const { year, month, city = 'Dakar', country = 'Senegal', method = 2 } = params;
    
    try {
      const url = `${this.baseUrl}/calendarByCity/${year}/${month}`;
      
      this.logger.log(`Fetching calendar: ${url}`);
      
      const { data } = await axios.get(url, { 
        params: { city, country, method },
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      this.logger.log(`Calendar fetched successfully`);
      return data;

    } catch (error) {
      this.logger.error(`Failed to fetch calendar: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || 'Failed to fetch calendar from external API',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Internal server error while fetching calendar',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}