import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const ALLOWED_STATUSES = ['ACTIVE', 'SENT_TO_DOCTOR', 'EXPIRED', 'ARCHIVED'] as const;
export type InboxStatus = (typeof ALLOWED_STATUSES)[number];

export class ListInboxQueryDto {
  @ApiPropertyOptional({
    description:
      'Doctor filter. Use "me" (default) to list sessions assigned to the authenticated user; ' +
      'a numeric user id requires ADMIN role.',
    example: 'me',
    default: 'me',
  })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Session status filter.',
    enum: ALLOWED_STATUSES,
    default: 'SENT_TO_DOCTOR',
  })
  @IsOptional()
  @IsIn(ALLOWED_STATUSES)
  status?: InboxStatus;

  @ApiPropertyOptional({ description: 'Page number (1-based).', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size.', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
