import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { FaqServicesService } from './faq-services.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateFaqDto, CreateMedicalServiceDto } from './dto';

@Controller()
export class FaqServicesController {
  constructor(private service: FaqServicesService) {}

  // ─── FAQ (public) ───────────────────────────────────────────────────────────

  @Get('doctors/:id/faq')
  getPublicFaq(@Param('id') id: string, @Query('category') category?: string) {
    return this.service.getPublicFaq(id, category);
  }

  @UseGuards(JwtGuard)
  @Post('faq')
  createFaq(@Request() req: any, @Body() dto: CreateFaqDto) {
    return this.service.createFaq(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('faq/:id')
  updateFaq(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateFaqDto>) {
    return this.service.updateFaq(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('faq/:id')
  deleteFaq(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteFaq(req.user.sub, id);
  }

  // ─── Medical Services (public) ─────────────────────────────────────────────

  @Get('doctors/:id/services')
  getPublicServices(@Param('id') id: string, @Query('category') category?: string) {
    return this.service.getPublicServices(id, category);
  }

  @UseGuards(JwtGuard)
  @Post('services')
  createService(@Request() req: any, @Body() dto: CreateMedicalServiceDto) {
    return this.service.createService(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('services/:id')
  updateService(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateMedicalServiceDto>) {
    return this.service.updateService(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('services/:id')
  deleteService(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteService(req.user.sub, id);
  }
}
