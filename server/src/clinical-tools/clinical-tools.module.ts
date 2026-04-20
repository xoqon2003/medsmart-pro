import { Module } from '@nestjs/common';
import { ClinicalToolsController } from './clinical-tools.controller';
import { ClinicalToolsAdminController } from './clinical-tools.admin.controller';
import { ClinicalToolsService } from './clinical-tools.service';

/**
 * ClinicalTools module (GAP-05d).
 *
 * Houses the universal tool catalogue (SCORE / QUESTIONNAIRE / CRITERIA /
 * DOSE / STAGING). Split from `TriageModule` because:
 *   1. Tools serve multiple call sites beyond triage (disease detail,
 *      consultation, patient dashboard).
 *   2. Admin CRUD has its own role gates that don't belong inside triage.
 *
 * The RED-FLAG rule registry stays in `TriageModule` since it's
 * triage-specific evaluation logic.
 */
@Module({
  controllers: [ClinicalToolsController, ClinicalToolsAdminController],
  providers: [ClinicalToolsService],
  exports: [ClinicalToolsService],
})
export class ClinicalToolsModule {}
