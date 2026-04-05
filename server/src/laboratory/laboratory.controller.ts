import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Laboratory')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('laboratory')
export class LaboratoryController {
  constructor(private labService: LaboratoryService) {}

  @Post('orders')
  @Roles('DOCTOR', 'OPERATOR', 'ADMIN')
  async createOrder(@Body() body: any, @Req() req: any) {
    return this.labService.createOrder({
      ...body,
      doctorId: body.doctorId || req.user.id,
    });
  }

  @Get('orders')
  async findOrders(
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.labService.findOrders({
      patientId: patientId ? parseInt(patientId, 10) : undefined,
      status: status as any,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('orders/:id')
  async findOrder(@Param('id') id: string) {
    return this.labService.findOrderById(id);
  }

  @Put('orders/:id/collect-sample')
  @Roles('OPERATOR', 'ADMIN')
  async collectSample(@Param('id') id: string) {
    return this.labService.collectSample(id);
  }

  @Put('orders/:id/start')
  @Roles('OPERATOR', 'ADMIN')
  async startProcessing(@Param('id') id: string) {
    return this.labService.startProcessing(id);
  }

  @Put('tests/:testId/result')
  @Roles('OPERATOR', 'ADMIN')
  async updateTestResult(@Param('testId') testId: string, @Body() body: any) {
    return this.labService.updateTestResult(testId, body);
  }

  @Put('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.labService.cancelOrder(id);
  }

  @Get('categories')
  async getCategories() {
    return this.labService.getCategories();
  }
}
