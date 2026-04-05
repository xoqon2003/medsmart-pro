import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateContactRequestDto {
  @IsString()
  doctorId: string;

  @IsOptional()
  @IsNumber()
  patientId?: number;

  @IsString()
  patientName: string;

  @IsString()
  patientPhone: string;

  @IsOptional()
  @IsEmail()
  patientEmail?: string;

  @IsString()
  requestType: string; // CONSULTATION, COMPLAINT, FOLLOW_UP, OTHER

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  templateUsed?: string;
}
