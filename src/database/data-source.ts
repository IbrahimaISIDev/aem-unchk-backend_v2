// src/database/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Charge le fichier .env
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
