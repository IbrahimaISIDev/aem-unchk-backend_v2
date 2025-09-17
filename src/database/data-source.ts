// src/database/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
config();

// Entities
import { User } from '../users/entities/user.entity';
import { Media } from '../media/entities/media.entity';
import { Category } from '../media/entities/category.entity';
import { Event } from '../events/entities/event.entity';
import { Activity } from '../events/entities/activity.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationTemplate } from '../notifications/entities/notification-template.entity';
import { EventLog } from '../analytics/entities/event-log.entity';
import { UserSession } from '../analytics/entities/user-session.entity';
import { Product } from '../marketplace/entities/product.entity';
import { Order } from '../marketplace/entities/order.entity';
import { OrderItem } from '../marketplace/entities/order-item.entity';
import { Review } from '../marketplace/entities/review.entity';
import { Cart } from '../marketplace/entities/cart.entity';
import { CartItem } from '../marketplace/entities/cart-item.entity';
import { Announcement } from '../announcements/entities/announcement.entity';

// Fonction qui retourne les options TypeORM
export const dataSourceOptions = (configService?: ConfigService): DataSourceOptions => {
  const get = (key: string) => {
    if (configService) return configService.get(key);
    // fallback sur process.env si ConfigService n'est pas fourni
    const envVars: Record<string, any> = {
      'database.host': process.env.DATABASE_HOST,
      'database.port': parseInt(process.env.DATABASE_PORT || '5432', 10),
      'database.username': process.env.DATABASE_USERNAME,
      'database.password': process.env.DATABASE_PASSWORD,
      'database.name': process.env.DATABASE_NAME,
      'database.synchronize': process.env.DATABASE_SYNCHRONIZE === 'true',
      'database.logging': process.env.DATABASE_LOGGING === 'true',
    };
    return envVars[key];
  };

  return {
    type: 'postgres',
    host: get('database.host'),
    port: get('database.port'),
    username: get('database.username'),
    password: get('database.password'),
    database: get('database.name'),
    synchronize: get('database.synchronize'),
    logging: get('database.logging'),
    ssl: { rejectUnauthorized: false }, // requis pour Neon

    entities: [
      User,
      Media,
      Category,
      Event,
      Activity,
      Notification,
      NotificationTemplate,
      EventLog,
      UserSession,
      Product,
      Order,
      OrderItem,
      Review,
      Cart,
      CartItem,
      Announcement,
    ],

    migrations: ['src/database/migrations/*.ts'],
  };
};

// DataSource principal
const dataSource = new DataSource(dataSourceOptions());
export default dataSource;
