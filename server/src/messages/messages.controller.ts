import {
  Controller, Get, Post, Patch,
  Param, Body, Query, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from '../auth/jwt.guard';
import { SendMessageDto } from './dto';

@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @UseGuards(JwtGuard)
  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.service.getConversations(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  getMessages(
    @Request() req: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.service.getMessages(req.user.sub, userId, +page, +limit);
  }

  @UseGuards(JwtGuard)
  @Post()
  sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.service.sendMessage(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/read')
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.service.markAsRead(req.user.sub, id);
  }

  // ─── Permission ─────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('permission/check/:doctorId')
  checkPermission(@Request() req: any, @Param('doctorId') doctorId: string) {
    return this.service.checkPermission(req.user.sub, doctorId);
  }

  @UseGuards(JwtGuard)
  @Post('permission/request')
  requestPermission(@Request() req: any, @Body('doctorId') doctorId: string) {
    return this.service.requestPermission(req.user.sub, doctorId);
  }

  @UseGuards(JwtGuard)
  @Patch('permission/:id/grant')
  grantPermission(
    @Request() req: any,
    @Param('id') id: string,
    @Body('durationDays') durationDays: number,
  ) {
    return this.service.grantPermission(req.user.sub, id, durationDays ?? 3);
  }

  @UseGuards(JwtGuard)
  @Patch('permission/:id/revoke')
  revokePermission(@Request() req: any, @Param('id') id: string) {
    return this.service.revokePermission(req.user.sub, id);
  }
}
