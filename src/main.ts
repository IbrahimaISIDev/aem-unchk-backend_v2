// src/main.ts
import * as dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Swagger
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

// Prefer IPv4 first to avoid IPv6 connection issues with some SMTP providers
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api';

  // Middleware de sécurité
  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // --- CORS avec plusieurs origines ---
  const allowedOrigins = [
    'https://aem-unchk-connect.vercel.app', // frontend en prod
    'https://aem-unchk-backend-v2.onrender.com', // backend Render (⚠️ ajouté ici)
    'http://localhost:3000',  
    'http://localhost:8080',              // frontend local dev
    'http://localhost:5173',               // frontend Vite local
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`❌ Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
  });

  // Préfixe global API
  app.setGlobalPrefix(apiPrefix);

  // Interceptors & filters globaux
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      const messages = errors.flatMap((e) => Object.values(e.constraints || {}));
      return new BadRequestException(messages.join(', '));
    },
  }));

  // --- Swagger config ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Islamic Platform API')
    .setDescription('Documentation de l’API de la plateforme communautaire islamique')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Lancement serveur
  await app.listen(port);
  console.log(`🚀 AEM_UNCHK API running on port ${port}`);
  console.log(`📚 Documentation available at http://localhost:${port}/docs`);
  console.log(`🌍 Environment: ${configService.get<string>('nodeEnv')}`);
  console.log(`🔗 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`✅ SSE endpoint available at http://localhost:${port}/${apiPrefix}/announcements/stream`);
}

bootstrap();