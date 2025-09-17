// src/main.ts
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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const corsOrigin = configService.get<string>('corsOrigin') || '*';
  const apiPrefix = configService.get<string>('apiPrefix') || 'api';

  // Middleware de sécurité
  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Préfixe global API
  app.setGlobalPrefix(apiPrefix);

  // Interceptors & filters globaux
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- Swagger config ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Islamic Platform API')
    .setDescription('Documentation de l’API de la plateforme communautaire islamique')
    .setVersion('1.0')
    .addBearerAuth() // JWT Auth si tu en utilises
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // garde le token après refresh
    },
  });

  // Lancement serveur
  await app.listen(port);
  console.log(`🚀 AEM_UNCHK API running on port ${port}`);
  console.log(`📚 Documentation available at http://localhost:${port}/docs`);
  console.log(`🌍 Environment: ${configService.get<string>('nodeEnv')}`);
  console.log(`🔗 CORS enabled for origins: ${corsOrigin}`);
  console.log(`✅ SSE endpoint available at http://localhost:${port}/${apiPrefix}/announcements/stream`);
}

bootstrap();
