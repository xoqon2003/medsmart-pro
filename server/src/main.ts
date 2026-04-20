import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';
import { validateEnv } from './common/env-validator';

async function bootstrap() {
  // Muhim: AppModule yaratishdan OLDIN muhit o'zgaruvchilarini tekshiramiz.
  // JwtModule.register(...) process.env.JWT_SECRET ni AppModule yaratilishida o'qiydi —
  // shuning uchun validatsiya shu nuqtada bo'lishi shart.
  validateEnv();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — faqat ruxsat berilgan origin lar
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://medsmart-pro.vercel.app',
      'https://web.telegram.org',
      // Telegram Mini App — faqat ma'lum subdomainlar (web, k, z, a, oauth).
      // Eski wildcard .* evil.telegram.org kabi begona subdomainlarni ham o'tkazar edi.
      /^https:\/\/(web|k|z|a|oauth)\.telegram\.org$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedSmart Pro API')
    .setDescription('Tibbiy axborot tizimi API hujjatlari')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autentifikatsiya')
    .addTag('users', 'Foydalanuvchilar')
    .addTag('applications', 'Arizalar')
    .addTag('payments', 'To\'lovlar')
    .addTag('booking', 'Qabulga yozilish')
    .addTag('notifications', 'Bildirishnomalar')
    .addTag('doctor-profile', 'Shifokor profili')
    .addTag('kassa', 'Kassa operatsiyalari')
    .addTag('health', 'Tizim holati')
    .addTag('diseases', 'Kasalliklar bazasi')
    .addTag('symptoms', 'Simptomlar lug\'ati')
    .addTag('references', 'Tibbiy manbalar')
    .addTag('disease-blocks', 'Kasallik bloklari')
    .addTag('markers', 'Canonical marker katalogi')
    .addTag('icd', 'ICD-10/ICD-11 qidiruv')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`MedSmart Pro API: http://localhost:${port}/api/v1`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
