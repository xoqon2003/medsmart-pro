import { Module } from '@nestjs/common';
import { DoctorProfileController } from './doctor-profile.controller';
import { DoctorProfileService } from './doctor-profile.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DoctorProfileController],
  providers: [DoctorProfileService],
  exports: [DoctorProfileService],
})
export class DoctorProfileModule {}
