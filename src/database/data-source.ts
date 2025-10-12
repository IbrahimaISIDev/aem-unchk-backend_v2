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
import { Transaction } from '../finance/entities/transaction.entity';
import { MemberContribution } from '../contributions/entities/member-contribution.entity';
import { ExpenseCategory } from '../finance/entities/expense-category.entity';
import { Eno } from '../academics/entities/eno.entity';
import { Pole } from '../academics/entities/pole.entity';
import { Filiere } from '../academics/entities/filiere.entity';
import { PrayerTime } from '../prayer/entities/prayer-time.entity';
import { PrayerTimeAdjustment } from '../prayer/entities/prayer-time-adjustment.entity';
import { PasswordReset } from '../auth/entities/password-reset.entity';
import { ReligiousActivity } from '../religious-activities/entities/religious-activity.entity';
import { PedagogicActivity } from '../pedagogic-activities/entities/pedagogic-activity.entity';

// Fonction qui retourne les options TypeORM
export const dataSourceOptions = (configService?: ConfigService): DataSourceOptions => {
  const get = (key: string) => {
    if (configService) return configService.get(key);
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
    ssl: { rejectUnauthorized: false },

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
      Transaction,
      ExpenseCategory,
      MemberContribution,
      Eno,
      Pole,
      Filiere,
      PrayerTime,
      PrayerTimeAdjustment,
      PasswordReset,
      ReligiousActivity,
      PedagogicActivity,
    ],

    migrations: ['src/database/migrations/*.ts'],
  };
};

const dataSource = new DataSource(dataSourceOptions());
export default dataSource;
