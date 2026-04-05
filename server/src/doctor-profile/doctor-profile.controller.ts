import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';
import { JwtGuard } from '../auth/jwt.guard';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  AddClinicDto,
  AddOperationTypeDto,
} from './dto';

@Controller('doctors')
export class DoctorProfileController {
  constructor(private service: DoctorProfileService) {}

  // ─── Public endpoints ───────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('specialty') specialty?: string,
  ) {
    return this.service.findAll(+page, +limit, specialty);
  }

  @Get('url/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // ─── Authenticated endpoints ────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('me/profile')
  findMyProfile(@Request() req: any) {
    return this.service.findMyProfile(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('profile')
  create(@Request() req: any, @Body() dto: CreateDoctorProfileDto) {
    return this.service.create(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('profile')
  update(@Request() req: any, @Body() dto: UpdateDoctorProfileDto) {
    return this.service.update(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Post('clinics')
  addClinic(@Request() req: any, @Body() dto: AddClinicDto) {
    return this.service.addClinic(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('clinics/:id')
  removeClinic(@Request() req: any, @Param('id') id: string) {
    return this.service.removeClinic(req.user.sub, id);
  }

  @UseGuards(JwtGuard)
  @Post('operations')
  addOperationType(@Request() req: any, @Body() dto: AddOperationTypeDto) {
    return this.service.addOperationType(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Post('subscribe')
  subscribe(@Request() req: any, @Body('tariffCode') tariffCode: string) {
    return this.service.updateTariff(req.user.sub, tariffCode);
  }

  // ─── Admin endpoints ────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Patch('admin/verify-clinic/:id')
  verifyClinic(@Param('id') id: string, @Request() req: any) {
    return this.service.verifyClinic(id, req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('admin/verify-license/:id')
  verifyLicense(@Param('id') id: string, @Request() req: any) {
    return this.service.verifyLicense(id, req.user.sub);
  }
}
