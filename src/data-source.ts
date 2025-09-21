// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Entities
import { EventLog } from './analytics/entities/event-log.entity';
import { UserSession } from './analytics/entities/user-session.entity';
import { Announcement } from './announcements/entities/announcement.entity';
import { Event } from './events/entities/event.entity';
import { Activity } from './events/entities/activity.entity';
import { CartItem } from './marketplace/entities/cart-item.entity';
import { Cart } from './marketplace/entities/cart.entity';
import { OrderItem } from './marketplace/entities/order-item.entity';
import { Order } from './marketplace/entities/order.entity';
import { Product } from './marketplace/entities/product.entity';
import { Review } from './marketplace/entities/review.entity';
import { Category } from './media/entities/category.entity';
import { Media } from './media/entities/media.entity';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationTemplate } from './notifications/entities/notification-template.entity';
import { User } from './users/entities/user.entity';
import { Transaction } from './finance/entities/transaction.entity';
import { MemberContribution } from './contributions/entities/member-contribution.entity';
import { ExpenseCategory } from './finance/entities/expense-category.entity';

// Load env
config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',

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
  ],

  migrations: process.env.NODE_ENV === 'production' ? ['dist/database/migrations/*.js'] : [],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
export { dataSourceOptions };
