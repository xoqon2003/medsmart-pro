import { Controller, Get, Param, Query, ParseIntPipe, ParseFloatPipe } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private service: BookingService) {}

  @Get('doctors')
  async getDoctors(@Query('query') query?: string, @Query('specialties') specialties?: string) {
    return this.service.getDoctors({
      query,
      specialties: specialties ? specialties.split(',') : undefined,
    });
  }

  @Get('doctors/:id/slots')
  async getSlots(@Param('id', ParseIntPipe) id: number, @Query('date') date: string) {
    return this.service.getSlots(id, date);
  }

  @Get('geo')
  async getGeo() {
    return this.service.getGeo();
  }

  @Get('specialties')
  async getSpecialties() {
    return this.service.getSpecialties();
  }

  /* ── TT-001: Klinika endpointlari ── */

  @Get('clinics/search')
  async searchClinics(
    @Query('q') q?: string,
    @Query('region') region?: string,
    @Query('district') district?: string,
    @Query('minServices') minServices?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchClinics({
      q,
      region,
      district,
      minServices: minServices ? parseInt(minServices, 10) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('clinics/nearby')
  async getNearbyClinics(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius') radius?: string,
  ) {
    return this.service.getNearbyClinics(lat, lng, radius ? parseFloat(radius) : 10);
  }

  @Get('clinics/top')
  async getTopClinics(@Query('limit') limit?: string) {
    return this.service.getTopClinics(limit ? parseInt(limit, 10) : 10);
  }
}
