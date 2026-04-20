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
import { ReferencesService } from './references.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { ReferenceListQueryDto } from './dto/reference-list-query.dto';
import {
  ReferenceListResponseDto,
  ReferenceResponseDto,
} from './dto/reference-response.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

@ApiTags('references')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('references')
export class ReferencesController {
  constructor(private readonly service: ReferencesService) {}

  @Get()
  @ApiOperation({ summary: "Manbalar ro'yxati" })
  @ApiResponse({ status: 200, type: ReferenceListResponseDto })
  async list(@Query() query: ReferenceListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta manba' })
  @ApiResponse({ status: 200, type: ReferenceResponseDto })
  async one(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi manba' })
  @ApiResponse({ status: 201, type: ReferenceResponseDto })
  async create(
    @Body() dto: CreateReferenceDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.create(dto, { id: req.user.sub, role: req.user.role });
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manbani yangilash' })
  @ApiResponse({ status: 200, type: ReferenceResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReferenceDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.update(id, dto, { id: req.user.sub, role: req.user.role });
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Manbani o'chirish (agar ishlatilmagan bo'lsa)" })
  @ApiResponse({ status: 409, description: 'Reference is in use by N blocks' })
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.remove(id, { id: req.user.sub, role: req.user.role });
  }
}
