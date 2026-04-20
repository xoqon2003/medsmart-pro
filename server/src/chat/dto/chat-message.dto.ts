import { ApiProperty } from '@nestjs/swagger';
import { ChatMessageType } from './send-message.dto';

export class ChatMessageResponseDto {
  @ApiProperty({ example: 'cuid_abc123' })
  id: string;

  @ApiProperty({ example: 'consultation_42' })
  roomId: string;

  @ApiProperty({ example: 42 })
  senderId: number;

  @ApiProperty({ example: 'Dr. Aliyev Bobur' })
  senderName: string;

  @ApiProperty({ example: 'Salom, doktor!' })
  content: string;

  @ApiProperty({ enum: ChatMessageType })
  type: ChatMessageType;

  @ApiProperty({ example: '2026-04-18T10:30:00.000Z' })
  createdAt: string;
}

export class TypingIndicatorDto {
  @ApiProperty({ example: 'consultation_42' })
  roomId: string;

  @ApiProperty({ example: 42 })
  userId: number;

  @ApiProperty({ example: 'Dr. Aliyev Bobur' })
  userName: string;
}
