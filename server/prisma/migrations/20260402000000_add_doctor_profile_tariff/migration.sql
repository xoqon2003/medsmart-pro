-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'RADIOLOG', 'DOCTOR', 'SPECIALIST', 'OPERATOR', 'ADMIN', 'KASSIR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('UZ', 'RU');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('NEW', 'PAID_PENDING', 'ACCEPTED', 'EXTRA_INFO_NEEDED', 'WITH_SPECIALIST', 'CONCLUSION_WRITING', 'DONE', 'FAILED', 'ARCHIVED', 'HV_ONWAY', 'HV_ARRIVED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('AI_RADIOLOG', 'RADIOLOG_ONLY', 'RADIOLOG_SPECIALIST', 'CONSULTATION', 'HOME_VISIT');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PERSONAL_CARD', 'PAYME', 'CLICK', 'UZUM', 'UZCARD', 'HUMO', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ConclusionType" AS ENUM ('AI_ANALYSIS', 'RADIOLOG', 'SPECIALIST', 'DOCTOR');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('DICOM', 'IMAGE', 'PDF', 'OTHER');

-- CreateEnum
CREATE TYPE "KassaTolovUsuli" AS ENUM ('NAQD', 'KARTA', 'PAYME', 'CLICK', 'UZUM', 'UZCARD', 'HUMO', 'TERMINAL');

-- CreateEnum
CREATE TYPE "KassaTolovHolati" AS ENUM ('KUTILMOQDA', 'QABUL_QILINDI', 'BEKOR', 'QAYTARILDI');

-- CreateEnum
CREATE TYPE "SmenaHolati" AS ENUM ('OCHIQ', 'YOPIQ');

-- CreateEnum
CREATE TYPE "TariffCode" AS ENUM ('FREE', 'START', 'LITE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "OperationComplexity" AS ENUM ('SIMPLE', 'MEDIUM', 'COMPLEX', 'VERY_COMPLEX');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT,
    "username" TEXT,
    "phone" TEXT NOT NULL,
    "pin" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "gender" "Gender",
    "birthDate" TEXT,
    "city" TEXT,
    "chronicDiseases" TEXT,
    "language" "Language" NOT NULL DEFAULT 'UZ',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "license" TEXT,
    "specialty" TEXT,
    "experience" INTEGER,
    "rating" DOUBLE PRECISION,
    "totalConclusions" INTEGER DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "profileUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "arizaNumber" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "radiologId" INTEGER,
    "specialistId" INTEGER,
    "doctorId" INTEGER,
    "status" "AppStatus" NOT NULL DEFAULT 'NEW',
    "serviceType" "ServiceType" NOT NULL,
    "urgency" "Urgency" NOT NULL DEFAULT 'NORMAL',
    "scanType" TEXT,
    "organ" TEXT,
    "scanDate" TEXT,
    "scanFacility" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "deadlineAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hvClinicName" TEXT,
    "hvDoctorName" TEXT,
    "hvDoctorSpeciality" TEXT,
    "hvVisitDay" TEXT,
    "hvTimeSlot" TEXT,
    "hvAddress" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anamnez" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "complaint" TEXT NOT NULL,
    "duration" TEXT,
    "hasPain" BOOLEAN NOT NULL DEFAULT false,
    "painLevel" INTEGER,
    "previousTreatment" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "additionalInfo" TEXT,

    CONSTRAINT "Anamnez_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileRecord" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "fileType" "FileType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "preview" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerTransactionId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conclusion" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "conclusionType" "ConclusionType" NOT NULL,
    "description" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "impression" TEXT NOT NULL,
    "recommendations" TEXT,
    "source" TEXT,
    "aiAnalysis" JSONB,
    "pdfUrl" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" INTEGER,
    "actorRole" TEXT,
    "actorName" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Examination" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "instrumentalType" TEXT,
    "labTypes" TEXT[],
    "organ" TEXT,
    "dateStatus" TEXT NOT NULL DEFAULT 'unknown',
    "dateYmd" TEXT,
    "approxYear" TEXT,
    "facility" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Examination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KassaSmena" (
    "id" SERIAL NOT NULL,
    "kassirId" INTEGER NOT NULL,
    "kassirIsmi" TEXT NOT NULL,
    "ochilganVaqt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yopilganVaqt" TIMESTAMP(3),
    "boshlanghichQoldiq" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "naqd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "karta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "onlayn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "jami" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tolovlarSoni" INTEGER NOT NULL DEFAULT 0,
    "holati" "SmenaHolati" NOT NULL DEFAULT 'OCHIQ',

    CONSTRAINT "KassaSmena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KassaTolov" (
    "id" SERIAL NOT NULL,
    "smenaId" INTEGER NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "invoiceRaqam" TEXT NOT NULL,
    "bemorIsmi" TEXT NOT NULL,
    "xizmatNomi" TEXT NOT NULL,
    "summa" DECIMAL(12,2) NOT NULL,
    "chegirma" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tolashKerak" DECIMAL(12,2) NOT NULL,
    "tolanganSumma" DECIMAL(12,2) NOT NULL,
    "qaytim" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tolovUsuli" "KassaTolovUsuli" NOT NULL,
    "holati" "KassaTolovHolati" NOT NULL DEFAULT 'KUTILMOQDA',
    "kassirId" INTEGER NOT NULL,
    "izoh" TEXT,
    "sanaVaqt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KassaTolov_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExaminationCenter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "distanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ExaminationCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSlot" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'free',

    CONSTRAINT "BookingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" "TariffCode" NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "birthDate" TIMESTAMP(3),
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "subSpecialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualificationCategory" TEXT,
    "qualificationDocUrl" TEXT,
    "licenseNumber" TEXT,
    "licenseDocUrl" TEXT,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "qualificationVerified" BOOLEAN NOT NULL DEFAULT false,
    "socialLinks" JSONB,
    "profileUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isBusinessAccount" BOOLEAN NOT NULL DEFAULT false,
    "tariffId" TEXT,
    "totalConsultations" INTEGER NOT NULL DEFAULT 0,
    "totalOperations" INTEGER NOT NULL DEFAULT 0,
    "onlineConsultations" INTEGER NOT NULL DEFAULT 0,
    "offlineConsultations" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "overallRank" INTEGER,
    "specialtyRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorClinic" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "cabinet" TEXT,
    "floor" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorClinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorOperationType" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "operationCode" TEXT NOT NULL,
    "operationName" TEXT NOT NULL,
    "operationNameRu" TEXT,
    "category" TEXT NOT NULL,
    "complexity" "OperationComplexity" NOT NULL DEFAULT 'MEDIUM',
    "avgDurationMin" INTEGER,
    "description" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorOperationType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileUrl_key" ON "User"("profileUrl");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Application_arizaNumber_key" ON "Application"("arizaNumber");

-- CreateIndex
CREATE INDEX "Application_patientId_idx" ON "Application"("patientId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_radiologId_idx" ON "Application"("radiologId");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Anamnez_applicationId_key" ON "Anamnez"("applicationId");

-- CreateIndex
CREATE INDEX "FileRecord_applicationId_idx" ON "FileRecord"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_applicationId_key" ON "Payment"("applicationId");

-- CreateIndex
CREATE INDEX "Conclusion_applicationId_idx" ON "Conclusion"("applicationId");

-- CreateIndex
CREATE INDEX "AuditEvent_applicationId_idx" ON "AuditEvent"("applicationId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "KassaSmena_kassirId_idx" ON "KassaSmena"("kassirId");

-- CreateIndex
CREATE UNIQUE INDEX "KassaTolov_invoiceRaqam_key" ON "KassaTolov"("invoiceRaqam");

-- CreateIndex
CREATE INDEX "ExaminationCenter_region_district_idx" ON "ExaminationCenter"("region", "district");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSlot_doctorId_date_time_key" ON "BookingSlot"("doctorId", "date", "time");

-- CreateIndex
CREATE UNIQUE INDEX "Tariff_code_key" ON "Tariff"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_profileUrl_key" ON "DoctorProfile"("profileUrl");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorClinic_doctorId_clinicId_key" ON "DoctorClinic"("doctorId", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorOperationType_doctorId_operationCode_key" ON "DoctorOperationType"("doctorId", "operationCode");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_radiologId_fkey" FOREIGN KEY ("radiologId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anamnez" ADD CONSTRAINT "Anamnez_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileRecord" ADD CONSTRAINT "FileRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conclusion" ADD CONSTRAINT "Conclusion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conclusion" ADD CONSTRAINT "Conclusion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examination" ADD CONSTRAINT "Examination_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaSmena" ADD CONSTRAINT "KassaSmena_kassirId_fkey" FOREIGN KEY ("kassirId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaTolov" ADD CONSTRAINT "KassaTolov_smenaId_fkey" FOREIGN KEY ("smenaId") REFERENCES "KassaSmena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaTolov" ADD CONSTRAINT "KassaTolov_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaTolov" ADD CONSTRAINT "KassaTolov_kassirId_fkey" FOREIGN KEY ("kassirId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorClinic" ADD CONSTRAINT "DoctorClinic_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorClinic" ADD CONSTRAINT "DoctorClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorOperationType" ADD CONSTRAINT "DoctorOperationType_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
