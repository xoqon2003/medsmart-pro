import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtGuard } from '../auth/jwt.guard';
import { UpdateCalendarSettingsDto, BookConsultationDto, BlockSlotDto } from './dto';

@Controller()
export class CalendarController {
  constructor(private service: CalendarService) {}

  // ─── Public: Calendar View ──────────────────────────────────────────────────

  @Get('calendar/:doctorId')
  getCalendar(
    @Param('doctorId') doctorId: string,
    @Query('year') year = String(new Date().getFullYear()),
    @Query('month') month = String(new Date().getMonth() + 1),
  ) {
    return this.service.getCalendar(doctorId, +year, +month);
  }

  @Get('calendar/:doctorId/slots')
  getSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) {
    return this.service.getSlots(doctorId, date);
  }

  // ─── Doctor: Settings ───────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('calendar/settings/me')
  getSettings(@Request() req: any) {
    return this.service.getSettings(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('calendar/settings')
  upsertSettings(@Request() req: any, @Body() dto: UpdateCalendarSettingsDto) {
    return this.service.upsertSettings(req.user.sub, dto);
  }

  // ─── Doctor: Generate Slots ──────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('calendar/generate')
  generateSlots(
    @Request() req: any,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.service.generateSlots(req.user.sub, startDate, endDate);
  }

  // ─── Doctor: Block/Unblock ──────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('calendar/block')
  blockSlot(@Request() req: any, @Body() dto: BlockSlotDto) {
    return this.service.blockSlot(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('calendar/block/:slotId')
  unblockSlot(@Request() req: any, @Param('slotId') slotId: string) {
    return this.service.unblockSlot(req.user.sub, slotId);
  }

  // ─── Consultation Booking ───────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('consultations/book')
  bookConsultation(@Request() req: any, @Body() dto: BookConsultationDto) {
    return this.service.bookConsultation(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('consultations/:id/cancel')
  cancelConsultation(
    @Request() req: any,
    @Param('id') id: string,
    @Body('cancelReason') cancelReason: string,
    @Body('cancelledBy') cancelledBy: string,
  ) {
    return this.service.cancelConsultation(req.user.sub, id, cancelReason, cancelledBy);
  }

  @UseGuards(JwtGuard)
  @Patch('consultations/:id/complete')
  completeConsultation(@Request() req: any, @Param('id') id: string) {
    return this.service.completeConsultation(req.user.sub, id);
  }

  @UseGuards(JwtGuard)
  @Post('consultations/:id/rate')
  rateConsultation(@Param('id') id: string, @Body('rating') rating: number, @Body('comment') comment?: string) {
    return this.service.rateConsultation(id, rating, comment);
  }

  @UseGuards(JwtGuard)
  @Patch('consultations/:id/reschedule')
  rescheduleConsultation(@Request() req: any, @Param('id') id: string, @Body('newSlotId') newSlotId: string) {
    return this.service.rescheduleConsultation(req.user.sub, id, newSlotId);
  }
}
