import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtGuard } from '../auth/jwt.guard';
import {
  CreateEducationDto,
  CreateExperienceDto,
  CreateAchievementDto,
  CreateCertificateDto,
} from './dto';

@Controller()
export class PortfolioController {
  constructor(private service: PortfolioService) {}

  // ─── Public: portfolio olish ────────────────────────────────────────────────

  @Get('doctors/:id/portfolio')
  getPortfolio(@Param('id') id: string) {
    return this.service.getPortfolio(id);
  }

  // ─── Education ──────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('portfolio/education')
  addEducation(@Request() req: any, @Body() dto: CreateEducationDto) {
    return this.service.addEducation(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('portfolio/education/:id')
  updateEducation(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateEducationDto>) {
    return this.service.updateEducation(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('portfolio/education/:id')
  deleteEducation(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteEducation(req.user.sub, id);
  }

  // ─── WorkExperience ─────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('portfolio/experience')
  addExperience(@Request() req: any, @Body() dto: CreateExperienceDto) {
    return this.service.addExperience(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('portfolio/experience/:id')
  updateExperience(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateExperienceDto>) {
    return this.service.updateExperience(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('portfolio/experience/:id')
  deleteExperience(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteExperience(req.user.sub, id);
  }

  // ─── Achievement ────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('portfolio/achievements')
  addAchievement(@Request() req: any, @Body() dto: CreateAchievementDto) {
    return this.service.addAchievement(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('portfolio/achievements/:id')
  updateAchievement(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateAchievementDto>) {
    return this.service.updateAchievement(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('portfolio/achievements/:id')
  deleteAchievement(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteAchievement(req.user.sub, id);
  }

  // ─── Certificate ────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Post('portfolio/certificates')
  addCertificate(@Request() req: any, @Body() dto: CreateCertificateDto) {
    return this.service.addCertificate(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('portfolio/certificates/:id')
  updateCertificate(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateCertificateDto>) {
    return this.service.updateCertificate(req.user.sub, id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('portfolio/certificates/:id')
  deleteCertificate(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteCertificate(req.user.sub, id);
  }
}
