import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateContactRequestDto, CreateTemplateDto } from './dto';

@Controller()
export class ContactsController {
  constructor(private service: ContactsService) {}

  // ─── Contact Requests ───────────────────────────────────────────────────────

  @Post('contacts/request')
  createRequest(@Body() dto: CreateContactRequestDto) {
    return this.service.createRequest(dto);
  }

  @UseGuards(JwtGuard)
  @Get('contacts/requests')
  getRequests(@Request() req: any, @Query('status') status?: string) {
    return this.service.getRequests(req.user.sub, status);
  }

  @UseGuards(JwtGuard)
  @Patch('contacts/requests/:id')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.service.updateRequestStatus(req.user.sub, id, status);
  }

  @UseGuards(JwtGuard)
  @Post('contacts/requests/:id/reply')
  reply(@Request() req: any, @Param('id') id: string, @Body('reply') reply: string) {
    return this.service.replyToRequest(req.user.sub, id, reply);
  }

  // ─── Message Templates ──────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('templates')
  getTemplates(@Request() req: any) {
    return this.service.getTemplates(req.user.sub);
  }

  @Get('doctors/:id/templates')
  getPublicTemplates(@Param('id') id: string) {
    return this.service.getPublicTemplates(id);
  }

  @UseGuards(JwtGuard)
  @Post('templates')
  createTemplate(@Request() req: any, @Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('templates/:id')
  updateTemplate(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.service.updateTemplate(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('templates/:id')
  deleteTemplate(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteTemplate(req.user.sub, id);
  }
}
