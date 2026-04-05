import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmrService } from './emr.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('EMR (Kasallik tarixi)')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('emr')
export class EmrController {
  constructor(private emrService: EmrService) {}

  // ── Kasallik tarixi ─────────────────────────────────────────────────────

  @Post('records')
  @Roles('DOCTOR', 'SPECIALIST', 'RADIOLOG')
  async createRecord(@Body() body: any, @Req() req: any) {
    return this.emrService.createRecord({
      ...body,
      doctorId: req.user.id,
    });
  }

  @Get('patients/:patientId/history')
  async getPatientHistory(
    @Param('patientId') patientId: string,
    @Query('recordType') recordType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.emrService.getPatientHistory(parseInt(patientId, 10), {
      recordType,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('records/:id')
  async findRecord(@Param('id') id: string) {
    return this.emrService.findRecordById(id);
  }

  @Put('records/:id')
  @Roles('DOCTOR', 'SPECIALIST', 'RADIOLOG')
  async updateRecord(@Param('id') id: string, @Body() body: any) {
    return this.emrService.updateRecord(id, body);
  }

  // ── Bemor kartasi ───────────────────────────────────────────────────────

  @Get('patients/:patientId/summary')
  async getPatientSummary(@Param('patientId') patientId: string) {
    return this.emrService.getPatientSummary(parseInt(patientId, 10));
  }

  // ── Allergiyalar ────────────────────────────────────────────────────────

  @Get('patients/:patientId/allergies')
  async getAllergies(@Param('patientId') patientId: string) {
    return this.emrService.getPatientAllergies(parseInt(patientId, 10));
  }

  @Post('patients/:patientId/allergies')
  @Roles('DOCTOR', 'SPECIALIST')
  async addAllergy(@Param('patientId') patientId: string, @Body() body: any) {
    return this.emrService.addAllergy({
      ...body,
      patientId: parseInt(patientId, 10),
    });
  }

  @Delete('allergies/:id')
  @Roles('DOCTOR', 'SPECIALIST', 'ADMIN')
  async removeAllergy(@Param('id') id: string) {
    return this.emrService.removeAllergy(id);
  }

  // ── ICD-10 qidiruv ─────────────────────────────────────────────────────

  @Get('icd/search')
  async searchIcd(@Query('q') query: string) {
    return this.emrService.searchIcdCodes(query || '');
  }
}
