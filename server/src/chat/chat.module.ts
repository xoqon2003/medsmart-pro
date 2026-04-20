import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

/**
 * ChatModule — real-time doctor↔patient chat (Socket.io + Prisma).
 *
 * Feature flag: APP_FEATURE_CHAT (default: false prod da)
 *
 * Namespace: /chat
 * Events:
 *   client → server: join_room(roomId), send_message(SendMessageDto), typing(roomId)
 *   server → client: room_history(ChatMessageResponseDto[]), receive_message(ChatMessageResponseDto),
 *                    typing_indicator(TypingIndicatorDto), error({message})
 */
@Module({
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
