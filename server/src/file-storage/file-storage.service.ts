import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/dicom',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  CONCLUSIONS: 'conclusions',
  PORTFOLIO: 'portfolio',
} as const;

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (url && key && !url.includes('YOUR_PROJECT')) {
      this.supabase = createClient(url, key);
      this.logger.log('Supabase Storage initialized');
    } else {
      this.logger.warn('Supabase credentials not set. File storage disabled.');
    }
  }

  /**
   * Fayl yuklash
   */
  async upload(
    file: UploadedFile,
    bucket: string,
    folder?: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    if (!this.supabase) {
      throw new BadRequestException('File storage is not configured');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const key = folder ? `${folder}/${uniqueName}` : uniqueName;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new BadRequestException(`Fayl yuklashda xatolik: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(key);

    return {
      url: urlData.publicUrl,
      key,
      bucket,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Avatar yuklash
   */
  async uploadAvatar(file: UploadedFile, userId: number): Promise<UploadResult> {
    return this.upload(file, BUCKETS.AVATARS, `user-${userId}`);
  }

  /**
   * Hujjat yuklash (PDF, DICOM)
   */
  async uploadDocument(file: UploadedFile, applicationId: string): Promise<UploadResult> {
    return this.upload(file, BUCKETS.DOCUMENTS, `app-${applicationId}`);
  }

  /**
   * Xulosa hujjati yuklash
   */
  async uploadConclusion(file: UploadedFile, conclusionId: string): Promise<UploadResult> {
    return this.upload(file, BUCKETS.CONCLUSIONS, `conclusion-${conclusionId}`);
  }

  /**
   * Portfolio rasm yuklash
   */
  async uploadPortfolioImage(file: UploadedFile, doctorId: string): Promise<UploadResult> {
    return this.upload(file, BUCKETS.PORTFOLIO, `doctor-${doctorId}`);
  }

  /**
   * Fayl o'chirish
   */
  async delete(bucket: string, key: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([key]);

    if (error) {
      this.logger.error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Vaqtinchalik URL olish (signed URL)
   */
  async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('File storage is not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(key, expiresIn);

    if (error) {
      throw new BadRequestException(`Signed URL olishda xatolik: ${error.message}`);
    }

    return data.signedUrl;
  }

  private validateFile(file: UploadedFile): void {
    if (!file) {
      throw new BadRequestException('Fayl yuklanmadi');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`Fayl hajmi ${MAX_FILE_SIZE / 1024 / 1024}MB dan oshmasligi kerak`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Ruxsat etilgan formatlar: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }
}
