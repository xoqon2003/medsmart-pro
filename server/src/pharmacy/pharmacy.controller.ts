import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('pharmacy')
export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}

  // ── Retseptlar ──────────────────────────────────────────────────────────

  @Post('prescriptions')
  @Roles('DOCTOR')
  async createPrescription(@Body() body: any, @Req() req: any) {
    return this.pharmacyService.createPrescription({
      ...body,
      doctorId: req.user.id,
    });
  }

  @Get('prescriptions')
  async findPrescriptions(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pharmacyService.findPrescriptions({
      patientId: patientId ? parseInt(patientId, 10) : undefined,
      doctorId: doctorId ? parseInt(doctorId, 10) : undefined,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('prescriptions/:id')
  async findPrescription(@Param('id') id: string) {
    return this.pharmacyService.findPrescriptionById(id);
  }

  @Put('prescriptions/items/:itemId/fill')
  @Roles('OPERATOR', 'ADMIN', 'KASSIR')
  async fillItem(@Param('itemId') itemId: string) {
    return this.pharmacyService.fillPrescriptionItem(itemId);
  }

  // ── Dorilar katalogi ────────────────────────────────────────────────────

  @Get('medicines')
  async findMedicines(
    @Query('category') category?: string,
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pharmacyService.findMedicines({
      category,
      query,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('medicines')
  @Roles('ADMIN')
  async createMedicine(@Body() body: any) {
    return this.pharmacyService.createMedicine(body);
  }

  @Put('medicines/:id')
  @Roles('ADMIN')
  async updateMedicine(@Param('id') id: string, @Body() body: any) {
    return this.pharmacyService.updateMedicine(id, body);
  }

  @Put('medicines/:id/stock')
  @Roles('ADMIN', 'OPERATOR')
  async updateStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.pharmacyService.updateStock(id, body.quantity);
  }

  @Get('categories')
  async getCategories() {
    return this.pharmacyService.getCategories();
  }
}
