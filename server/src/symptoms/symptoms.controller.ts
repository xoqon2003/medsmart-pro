import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SymptomListQueryDto } from './dto/symptom-list-query.dto';
import {
  SymptomListResponseDto,
  SymptomResponseDto,
} from './dto/symptom-response.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

@ApiTags('symptoms')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly service: SymptomsService) {}

  @Get()
  @ApiOperation({ summary: "Simptomlar ro'yxati va qidiruv (FTS)" })
  @ApiResponse({ status: 200, type: SymptomListResponseDto })
  @ApiResponse({ status: 404, description: 'Feature disabled' })
  async list(@Query() query: SymptomListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta simptom' })
  @ApiResponse({ status: 200, type: SymptomResponseDto })
  async one(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi simptom' })
  @ApiResponse({ status: 201, type: SymptomResponseDto })
  async create(
    @Body() dto: CreateSymptomDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.create(dto, { id: req.user.sub, role: req.user.role });
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simptomni yangilash' })
  @ApiResponse({ status: 200, type: SymptomResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSymptomDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.update(id, dto, { id: req.user.sub, role: req.user.role });
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Simptomni o'chirish (hard delete, ADMIN only)" })
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.remove(id, { id: req.user.sub, role: req.user.role });
  }
}
