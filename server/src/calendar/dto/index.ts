import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';

export class UpdateCalendarSettingsDto {
  @IsOptional() @IsArray() workDays?: number[];
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsNumber() slotDuration?: number;
  @IsOptional() @IsNumber() breakDuration?: number;
  @IsOptional() @IsArray() consultTypes?: string[];
  @IsOptional() @IsNumber() onlinePrice?: number;
  @IsOptional() @IsNumber() offlinePrice?: number;
  @IsOptional() @IsNumber() phonePrice?: number;
  @IsOptional() @IsNumber() videoPrice?: number;
  @IsOptional() @IsNumber() maxPatientsDay?: number;
  @IsOptional() @IsString() officeAddress?: string;
  @IsOptional() @IsString() officeName?: string;
  @IsOptional() @IsNumber() officeFloor?: number;
  @IsOptional() @IsString() officeCabinet?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class BookConsultationDto {
  @IsString() doctorId: string;
  @IsString() slotId: string;
  @IsString() consultType: string;
  @IsOptional() @IsString() patientName?: string;
  @IsOptional() @IsString() patientPhone?: string;
  @IsOptional() @IsString() patientEmail?: string;
  @IsOptional() @IsString() reason?: string;
}

export class BlockSlotDto {
  @IsString() date: string;
  @IsString() startTime: string;
  @IsString() endTime: string;
  @IsOptional() @IsString() blockReason?: string;
}
