// src/database/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { EventLog } from './analytics/entities/event-log.entity';
import { UserSession } from './analytics/entities/user-session.entity';
import { Announcement } from './announcements/entities/announcement.entity';
import { Activity } from './events/entities/activity.entity';
import { CartItem } from './marketplace/entities/cart-item.entity';
import { Cart } from './marketplace/entities/cart.entity';
import { OrderItem } from './marketplace/entities/order-item.entity';
import { Order } from './marketplace/entities/order.entity';
import { Product } from './marketplace/entities/product.entity';
import { Review } from './marketplace/entities/review.entity';
import { Category } from './media/entities/category.entity';
import { Media } from './media/entities/media.entity';
import { NotificationTemplate } from './notifications/entities/notification-template.entity';
import { User } from './users/entities/user.entity';

// Charge le fichier .env
config();

// Entities

// Configuration TypeORM
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'false',
  logging: process.env.DATABASE_LOGGING === 'true',

  // SSL requis pour Neon
  ssl: {
    rejectUnauthorized: false,
  },

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

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
export { dataSourceOptions };
