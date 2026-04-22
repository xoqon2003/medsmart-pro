import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CONSULT_TYPES = ['OFFLINE', 'ONLINE', 'PHONE', 'VIDEO'] as const;

/**
 * PHI siyosati: patientName, patientPhone, patientEmail DTO'dan olib tashlangan.
 * Backend avtomatik ravishda JWT'dagi userId orqali User profilidan oladi.
 * CLAUDE.md qoida #6 — Supabase prod'da PHI yozilmaydi.
 */
export class CreateConsultationDto {
  @ApiProperty() @IsString()
  doctorId!: string;

  @ApiProperty() @IsString()
  slotId!: string;

  @ApiProperty({ enum: CONSULT_TYPES })
  @IsIn(CONSULT_TYPES as unknown as string[])
  consultType!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  reason?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  price?: number;
}
