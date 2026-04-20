import { IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ChatMessageType {
  TEXT = 'TEXT',
  TRIAGE_RESULT = 'TRIAGE_RESULT',
  FILE = 'FILE',
}

export class SendMessageDto {
  @ApiProperty({ example: 'consultation_42', description: 'Room identifikatori' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roomId: string;

  @ApiProperty({ example: 'Salom, doktor!', description: 'Xabar matni' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;

  @ApiProperty({ enum: ChatMessageType, default: ChatMessageType.TEXT })
  @IsEnum(ChatMessageType)
  type: ChatMessageType = ChatMessageType.TEXT;
}
