import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { ConclusionsModule } from './conclusions/conclusions.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BookingModule } from './booking/booking.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { KassaModule } from './kassa/kassa.module';
import { DoctorProfileModule } from './doctor-profile/doctor-profile.module';
import { TariffModule } from './tariff/tariff.module';
import { ClinicModule } from './clinic/clinic.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ContactsModule } from './contacts/contacts.module';
import { MessagesModule } from './messages/messages.module';
import { FaqServicesModule } from './faq-services/faq-services.module';
import { ExtrasModule } from './extras/extras.module';
import { CalendarModule } from './calendar/calendar.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { JobsModule } from './jobs/jobs.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { EmrModule } from './emr/emr.module';
import { DiseasesModule } from './diseases/diseases.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { ReferencesModule } from './references/references.module';
import { DiseaseBlocksModule } from './disease-blocks/disease-blocks.module';
import { KbModerationModule } from './kb-moderation/kb-moderation.module';
import { TriageModule } from './triage/triage.module';
import { ClinicalToolsModule } from './clinical-tools/clinical-tools.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // Rate limiting: 100 request/daqiqa per IP
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 daqiqa (ms)
        limit: 100,
      },
    ]),
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ConclusionsModule,
    PaymentsModule,
    NotificationsModule,
    BookingModule,
    ExaminationsModule,
    KassaModule,
    DoctorProfileModule,
    TariffModule,
    ClinicModule,
    PortfolioModule,
    ContactsModule,
    MessagesModule,
    FaqServicesModule,
    ExtrasModule,
    CalendarModule,
    HealthModule,
    CacheModule,
    JobsModule,
    FileStorageModule,
    LaboratoryModule,
    PharmacyModule,
    EmrModule,
    DiseasesModule,
    SymptomsModule,
    ReferencesModule,
    DiseaseBlocksModule,
    KbModerationModule,
    TriageModule,
    ClinicalToolsModule,
    ChatModule,
  ],
  providers: [
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
