/**
 * OpenAPI spec generator.
 *
 * Nima qiladi?
 *   1. NestJS app ni boot qiladi (lekin `.listen()` chaqirmaydi — port ochilmaydi)
 *   2. SwaggerModule orqali OpenAPI 3.0 hujjatini hosil qiladi
 *   3. `server/openapi.json` ga yozib qo'yadi
 *   4. Frontend `openapi-typescript` bilan shu fayldan TS type generate qiladi
 *
 * Ishlatish:
 *   cd server && npm run openapi:generate
 *
 * Natija:
 *   server/openapi.json    ← 400+ KB, barcha endpointlar + DTO schema lari
 *   src/types/api.d.ts     ← frontend codegen natijasi
 */

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from '../src/app.module';

async function generateOpenAPI() {
  // DB ga ulanishni o'tkazib yuboramiz — codegen static tahlil.
  process.env.SKIP_DB_CONNECT = 'true';

  // Codegen uchun kuchli JWT_SECRET kerak bo'lmaydi, lekin AuthModule
  // JwtModule.register() paytida uni o'qiydi. Placeholder beramiz —
  // bu token yaratish uchun ishlatilmaydi, faqat modul init uchun.
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'codegen-only-placeholder-' + Date.now();
  }

  console.log('[OpenAPI] Booting NestFactory...');
  // Logger ni o'chirib qo'yamiz — codegen paytida log shart emas.
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  console.log('[OpenAPI] App booted. Building Swagger document...');
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('MedSmart Pro API')
    .setDescription('Tibbiy axborot tizimi API hujjatlari')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autentifikatsiya')
    .addTag('users', 'Foydalanuvchilar')
    .addTag('applications', 'Arizalar')
    .addTag('payments', "To'lovlar")
    .addTag('booking', 'Qabulga yozilish')
    .addTag('notifications', 'Bildirishnomalar')
    .addTag('doctor-profile', 'Shifokor profili')
    .addTag('kassa', 'Kassa operatsiyalari')
    .addTag('health', 'Tizim holati')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // server/ ildizidan bir pog'ona yuqori (loyiha ildizi) ga yozamiz,
  // shunda frontend ham, backend ham bir xil fayldan o'qiy oladi.
  const outputPath = resolve(__dirname, '..', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

  const stats = {
    endpoints: Object.keys(document.paths ?? {}).length,
    schemas: Object.keys(document.components?.schemas ?? {}).length,
    sizeKb: Math.round(JSON.stringify(document).length / 1024),
  };

  console.log('[OpenAPI] Generated:', outputPath);
  console.log(`[OpenAPI] ${stats.endpoints} endpoints, ${stats.schemas} DTO schemas, ${stats.sizeKb} KB`);

  await app.close();
}

generateOpenAPI().catch((err) => {
  console.error('[OpenAPI] Generation failed:', err);
  process.exit(1);
});
