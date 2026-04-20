import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class BlockListQueryDto {
  @ApiPropertyOptional({
    description: 'Auditoriya filtri',
    enum: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'],
  })
  @IsOptional()
  @IsEnum(['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'])
  audience?: string;

  @ApiPropertyOptional({ enum: ['L1', 'L2', 'L3'] })
  @IsOptional()
  @IsEnum(['L1', 'L2', 'L3'])
  level?: string;

  @ApiPropertyOptional({
    description: "Admin uchun: status filtri. Public holatda har doim PUBLISHED",
    enum: ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsEnum(['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Til' })
  @IsOptional()
  @IsString()
  locale?: string;
}
