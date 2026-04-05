import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';
import { FileStorageController } from './file-storage.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [FileStorageController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
