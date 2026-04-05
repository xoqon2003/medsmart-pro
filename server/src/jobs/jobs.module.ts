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
    await this.jobsService.setupRecurringJobs();
  }
}
