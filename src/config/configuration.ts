// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "production",
  apiPrefix: process.env.API_PREFIX || "api",
  corsOrigin: process.env.CORS_ORIGIN || "https://aem-unchk-connect.vercel.app",

  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "false",
    logging: process.env.DATABASE_LOGGING === "true",
    ssl: {
      rejectUnauthorized: false, // requis pour Neon
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    expiresIn: process.env.JWT_EXPIRATION || "1h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "your-super-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },

  email: {
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST || "",
    port: parseInt(
      process.env.EMAIL_PORT || process.env.SMTP_PORT || "587",
      10
    ),
    user: process.env.EMAIL_USER || process.env.SMTP_USER || "",
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || "",
    from:
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      "noreply@islamic-platform.com",
  },

  admin: {
    email: process.env.ADMIN_NOTIFICATION_EMAIL || "",
  },

  frontend: {
    url: process.env.FRONTEND_URL || "https://aem-unchk-connect.vercel.app",
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || "60", 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || "10", 10),
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  externalApis: {
    aladhan: {
      baseUrl: process.env.ALADHAN_API_URL || "https://api.aladhan.com/v1",
    },
    islamicCalendar: {
      baseUrl:
        process.env.ISLAMIC_CALENDAR_API_URL ||
        "https://api.islamicfinder.us/v1",
    },
  },

  finance: {
    enabled: (process.env.FINANCE_MODULE_ENABLED || "true") === "true",
    exportMaxRecords: parseInt(
      process.env.FINANCE_EXPORT_MAX_RECORDS || "10000",
      10
    ),
    backupEnabled: (process.env.FINANCE_BACKUP_ENABLED || "true") === "true",
    notificationEmail: process.env.FINANCE_NOTIFICATION_EMAIL || "",
    contributionReminderDays: parseInt(
      process.env.CONTRIBUTION_REMINDER_DAYS || "7",
      10
    ),
    defaultContributionAmount: parseFloat(
      process.env.CONTRIBUTION_DEFAULT_AMOUNT || "50"
    ),
    exportTempDir: process.env.EXPORT_TEMP_DIR || "/tmp/exports",
    exportMaxFileSize: process.env.EXPORT_MAX_FILE_SIZE || "10MB",
    analyticsCacheTtl: parseInt(process.env.ANALYTICS_CACHE_TTL || "300", 10),
    analyticsBatchSize: parseInt(
      process.env.ANALYTICS_BATCH_SIZE || "1000",
      10
    ),
  },
});
