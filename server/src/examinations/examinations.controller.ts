import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExaminationsService } from './examinations.service';

@Controller('examinations')
export class ExaminationsController {
  constructor(private service: ExaminationsService) {}

  @Get('centers')
  async getCenters(@Query('region') region?: string, @Query('district') district?: string) {
    return this.service.getCenters({ region, district });
  }

  @Get('exams/:category')
  async getExamsByCategory(@Param('category') category: string) {
    return this.service.getExamsByCategory(category);
  }
}
