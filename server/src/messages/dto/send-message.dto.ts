import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  messageType?: string; // TEXT, IMAGE, FILE, VOICE

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  consultId?: string;
}
