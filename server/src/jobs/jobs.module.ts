import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JOBS_QUEUE, JobsProcessor } from './jobs.processor';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        // Lazy connect — ilova boot paytida Redis ga darhol ulanmaydi.
        // Birinchi queue operatsiyasi (add/process) da ulanadi.
        // Bu OpenAPI codegen uchun muhim: NestFactory.create() Redis
        // mavjud bo'lmaganda ham hang bo'lmaydi.
        lazyConnect: true,
        // Ulanish muvaffaqiyatsiz bo'lsa cheksiz retry qilmaslik
        maxRetriesPerRequest: process.env.SKIP_DB_CONNECT === 'true' ? 0 : 3,
      },
    }),
    BullModule.registerQueue({
      name: JOBS_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100, // oxirgi 100 ta completed job saqlash
        removeOnFail: 200,
      },
    }),
  ],
  providers: [JobsProcessor, JobsService],
  exports: [JobsService],
})
export class JobsModule implements OnModuleInit {
  constructor(private jobsService: JobsService) {}

  async onModuleInit() {
    // OpenAPI codegen da recurring jobs kerak emas (Redis ulanmagan)
    if (process.env.SKIP_DB_CONNECT === 'true') return;
    await this.jobsService.setupRecurringJobs();
  }
}
