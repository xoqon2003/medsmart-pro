import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlagGuard, FeatureFlag } from '../common/feature-flag.guard';
import { TriageService } from './triage.service';
import { MatchRequestDto } from './dto/match-request.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SendToDoctorDto } from './dto/send-to-doctor.dto';
import { SaveNoteDto } from './dto/save-note.dto';
import { ListInboxQueryDto } from './dto/list-inbox-query.dto';

interface AuthRequest extends Request {
  user: { sub: number; role: string };
}

@ApiTags('triage')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  // ─── POST /triage/match ──────────────────────────────────────────────────────

  @Post('match')
  @ApiOperation({ summary: 'Match user symptoms to diseases' })
  match(@Request() req: AuthRequest, @Body() dto: MatchRequestDto) {
    return this.triageService.match(req.user.sub, dto);
  }

  // ─── GET /triage/my-sessions ────────────────────────────────────────────────

  @Get('my-sessions')
  @ApiOperation({
    summary: "Joriy foydalanuvchining triage sessiyalari (bemor 'Mening kasalliklarim' uchun)",
  })
  listMySessions(
    @Request() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.triageService.listMySessions(
      req.user.sub,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  // ─── POST /triage/sessions/:id/update ───────────────────────────────────────

  @Post('sessions/:id/update')
  @ApiOperation({ summary: 'Update session status' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  updateSession(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.triageService.updateSession(req.user, id, dto);
  }

  // ─── POST /triage/sessions/:id/send-to-doctor ───────────────────────────────

  @Post('sessions/:id/send-to-doctor')
  @ApiOperation({ summary: 'Send triage result to a doctor via FHIR message' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  sendToDoctor(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: SendToDoctorDto,
  ) {
    return this.triageService.sendToDoctor(req.user.sub, id, dto);
  }

  // ─── GET /triage/sessions ───────────────────────────────────────────────────

  @Get('sessions')
  @ApiOperation({
    summary: 'List triage sessions for a doctor inbox',
    description:
      'Returns paginated triage sessions assigned to a doctor. ' +
      'Default behaviour lists the caller\'s own inbox (doctorId=me, status=SENT_TO_DOCTOR). ' +
      'Requires DOCTOR / SPECIALIST / MEDICAL_EDITOR / ADMIN role.',
  })
  listSessions(@Request() req: AuthRequest, @Query() query: ListInboxQueryDto) {
    return this.triageService.listDoctorInbox(req.user, query);
  }

  // ─── GET /triage/sessions/:id ───────────────────────────────────────────────

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a triage session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  getSession(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.triageService.getSession(req.user, id);
  }

  // ─── POST /triage/sessions/:id/save-note ────────────────────────────────────

  @Post('sessions/:id/save-note')
  @ApiOperation({ summary: 'Save a personal note for the disease in this session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  saveNote(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: SaveNoteDto,
  ) {
    return this.triageService.saveNote(req.user.sub, id, dto);
  }
}
