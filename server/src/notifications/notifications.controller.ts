import { Controller, Get, Patch, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    if (userId) return this.service.findByUserId(+userId);
    return this.service.findAll();
  }

  @Patch(':id/read')
  async markRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.markRead(id);
  }

  @UseGuards(JwtGuard)
  @Patch('read-all')
  async markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.sub);
  }
}
