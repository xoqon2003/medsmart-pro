export type ViewMode = 'card' | 'table';

export type UserRole = 'patient' | 'radiolog' | 'operator' | 'admin' | 'specialist' | 'doctor' | 'kassir';

export type ApplicantType = 'self' | 'relative' | 'doctor' | 'organization';

export interface RelativeInfo {
  id?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthYear: string;
  gender: 'male' | 'female';
  phone?: string;
  saveForFuture?: boolean;
}

export interface DoctorReferralInfo {
  toSpecialty: string;
  reason?: string;
  patient?: SavedPatient;
}

export interface SavedPatient {
  id?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthYear: string;
  gender: 'male' | 'female';
  phone?: string;
  diagnosis?: string;
  saveForFuture?: boolean;
}

export type ApplicationStatus =
  | 'new'
  | 'booked'
  | 'paid_pending'
  | 'accepted'
  | 'extra_info_needed'
  | 'with_specialist'
  | 'conclusion_writing'
  | 'done'
  | 'failed'
  | 'archived'
  // ── Uyga chaqirish ──
  | 'hv_onway'     // Yo'lga chiqdi
  | 'hv_arrived';  // Yetib keldi / Bajarildi

export type ScanType = 'MRT' | 'MSKT' | 'Rentgen' | 'USG' | 'Boshqa';
export type Organ = string;
export type ServiceType = 'ai_radiolog' | 'radiolog_only' | 'radiolog_specialist' | 'consultation' | 'home_visit';
export type Urgency = 'normal' | 'urgent' | 'emergency';
export type PaymentProvider = 'personal_card' | 'payme' | 'click' | 'uzum' | 'uzcard' | 'humo' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type ConclusionType = 'ai_analysis' | 'radiolog' | 'specialist' | 'doctor';

// ── Kassa Moduli ─────────────────────────────────────────────────────────────

export type KassaTolovHolati = 'kutilmoqda' | 'qabul_qilindi' | 'bekor' | 'qaytarildi';
export type KassaTolovUsuli  = 'naqd' | 'karta' | 'payme' | 'click' | 'uzum' | 'uzcard' | 'humo' | 'terminal';

export interface KassaTolov {
  id: number;
  applicationId: number;
  invoiceRaqam: string;       // INV-2026-XXXXX
  bemorIsmi: string;
  xizmatNomi: string;
  summa: number;
  chegirma: number;           // so'mda
  tolashKerak: number;        // summa - chegirma
  tolanganSumma: number;
  qaytim: number;             // qaytim pul (naqd uchun)
  tolovUsuli: KassaTolovUsuli;
  holati: KassaTolovHolati;
  kassirId: number;
  kassirIsmi?: string;
  sanaVaqt: string;           // ISO
  izoh?: string;
}

export interface KassaSmena {
  id: number;
  kassirId: number;
  kassirIsmi: string;
  ochilganVaqt: string;       // ISO
  yopilganVaqt?: string;      // ISO
  boshlanghichQoldiq: number; // smena boshlangandagi naqd
  naqd: number;               // naqd to'lovlar jami
  karta: number;              // karta to'lovlar jami
  onlayn: number;             // onlayn to'lovlar jami
  jami: number;               // barcha to'lovlar
  tolovlarSoni: number;
  holati: 'ochiq' | 'yopiq';
}

export interface KassaStatistika {
  bugun: { naqd: number; karta: number; onlayn: number; jami: number; soni: number };
  hafta:  { naqd: number; karta: number; onlayn: number; jami: number; soni: number };
  oy:     { naqd: number; karta: number; onlayn: number; jami: number; soni: number };
}

// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'APPLICATION_CREATED'
  | 'STATUS_CHANGED'
  | 'PAYMENT_CHANGED'
  | 'CONCLUSION_ADDED'
  | 'CONCLUSION_UPDATED'
  | 'EXAMINATION_ADDED'
  | 'EXAMINATION_UPDATED'
  | 'EXAMINATION_DELETED';

export interface ExaminationAttachment {
  name: string;
  size: number;
  type: string;
  isDicom?: boolean;
}

export interface ExaminationInfo {
  id: number;
  category: 'instrumental' | 'laboratory';
  instrumentalType?: string;
  labTypes?: string[];
  organ?: string;
  dateStatus: 'known' | 'unknown' | 'to_clarify';
  dateYmd?: string; // known
  approxYear?: string; // unknown
  facility?: string;
  attachments?: ExaminationAttachment[];
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  applicationId: number;
  action: AuditAction;
  actorId: number | null;
  actorRole?: UserRole;
  actorName?: string;
  at: string; // ISO
  details?: Record<string, unknown>;
}

export interface User {
  id: number;
  telegramId: number;
  username: string;
  role: UserRole;
  fullName: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  city: string;
  chronicDiseases?: string;
  language: 'uz' | 'ru';
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  license?: string;
  specialty?: string;
  experience?: number;
  rating?: number;
  totalConclusions?: number;
}

export interface Anamnez {
  id: number;
  applicationId: number;
  complaint: string;
  duration: string;
  hasPain: boolean;
  painLevel?: number;
  previousTreatment?: string;
  medications?: string;
  allergies?: string;
  additionalInfo?: string;
}

export interface FileRecord {
  id: number;
  applicationId: number;
  fileType: 'dicom' | 'image' | 'pdf' | 'other';
  originalName: string;
  s3Key: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  preview?: string;
}

export interface Payment {
  id: number;
  applicationId: number;
  amount: number;
  provider: PaymentProvider;
  providerTransactionId?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface Conclusion {
  id: number;
  applicationId: number;
  authorId: number;
  authorName?: string;
  conclusionType: ConclusionType;
  description: string;
  findings: string;
  impression: string;
  recommendations?: string;
  source?: 'editor' | 'upload';
  attachment?: {
    name: string;
    mimeType: string;
    url: string; // object URL in demo
  };
  aiAnalysis?: {
    anomalies: string[];
    regions: string[];
    confidence: number;
    notes: string;
  };
  pdfUrl?: string;
  signedAt: string;
}

export interface Application {
  id: number;
  arizaNumber: string;
  patientId: number;
  patient?: User;
  radiologId?: number;
  radiolog?: User;
  specialistId?: number;
  specialist?: User;
  doctorId?: number;
  doctor?: User;
  status: ApplicationStatus;
  scanType: string;
  organ: string;
  serviceType: ServiceType;
  urgency: Urgency;
  scanDate: string;
  scanFacility?: string;
  price: number;
  deadlineAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  anamnez?: Anamnez;
  files?: FileRecord[];
  payment?: Payment;
  conclusions?: Conclusion[];
  rating?: number;
  ratingComment?: string;
  auditLog?: AuditEvent[];
  slotLockExpiresAt?: string; // ISO, KNS/TKS uchun 15 min lock (demo)
  examinations?: ExaminationInfo[]; // Bemor kiritgan tekshiruv ma'lumotlari
  // ── Uyga chaqirish (HV) ──────────────────────────────────────────────
  hvClinicName?: string;        // Tayinlangan klinika nomi
  hvDoctorName?: string;        // Tayinlangan shifokor F.I.O.
  hvDoctorSpeciality?: string;  // Shifokor mutaxassisligi
  hvVisitDay?: string;
  hvTimeSlot?: string;
  hvAddress?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  applicationId?: number;
}

export interface PricingConfig {
  ai_radiolog: number;
  radiolog_only: number;
  radiolog_specialist: number;
  urgencyMultiplier: {
    normal: number;
    urgent: number;
    emergency: number;
  };
}

export interface DraftApplication {
  // Arizachi (kim uchun)
  applicantType?: ApplicantType;
  relativeInfo?: RelativeInfo;
  doctorReferral?: DoctorReferralInfo;

  // Tasvir yuklash (1-bosqich) — Aqlli qayta ishlash (demo)
  examCategory?: 'instrumental' | 'laboratory';
  instrumentalType?: 'MRT' | 'MSKT' | 'Rentgen' | 'UZI' | 'EKG' | 'EXO-KG' | 'Boshqa';
  instrumentalOtherName?: string;
  labTypes?: Array<'Umumiy qon' | 'Umumiy peshob' | 'Gepatit' | 'Fermentlar' | 'Gormonal' | 'Biokimyo' | 'Boshqa'>;
  labOtherName?: string;
  organ?: string; // Instrumental: MRT/MSKT/Rentgen/UZI/EXO-KG uchun kerak bo'lishi mumkin

  examDateStatus?: 'known' | 'unknown' | 'to_clarify';
  examDateYmd?: string; // YYYY-MM-DD (known)
  examDateApproxYear?: string; // unknown holatida taxminiy yil (mas: ~2022)

  // Legacy maydonlar (radiologiya oqimidagi keyingi bosqichlar bilan moslik uchun)
  scanType?: string;
  serviceType?: ServiceType;
  urgency?: Urgency;
  scanDate?: string; // examDateYmd bilan sinxron (known holatida)
  scanFacility?: string;
  files?: Array<{ name: string; size: number; type: string; preview?: string; isDicom?: boolean }>;
  complaint?: string;
  duration?: string;
  hasPain?: boolean;
  painLevel?: number;
  previousTreatment?: string;
  medications?: string;
  allergies?: string;
  additionalInfo?: string;
}

export interface DraftConsultation {
  mode?: 'online' | 'offline';
  onlineType?: 'video' | 'phone' | 'chat';
  offlineType?: 'clinic' | 'home' | 'inpatient' | 'sanatorium';
  specialityFilters?: string[];
  query?: string;
  region?: string;
  district?: string;
  clinic?: string;
  clinicName?: string;
  clinicAddress?: string;
  selectedDoctorId?: number;
  selectedDate?: string; // YYYY-MM-DD
  selectedSlot?: string; // HH:mm
  price?: number;
  phone?: string;
  address?: string;
  // ── Murojaat sababi / Anamnez ─────────────────────────────
  complaint?: string;
  complaintDuration?: string;
  takingMedication?: boolean;
  medicationName?: string;
  // ── Sanatoriya / Reabilitatsiya oqimi ────────────────────
  sanatoriumId?: number;
  sanatoriumName?: string;
  sanatoriumRelief?: 'mountain' | 'water' | 'plain' | 'sea';
  sanatoriumRegion?: string;
  sanatoriumDistrict?: string;
  sanatoriumConditions?: string[];
  sanatoriumServices?: string[];
  sanatoriumRoomType?: 'single' | 'double' | 'family';
  sanatoriumDuration?: number;       // kunlar soni
  sanatoriumPricePerDay?: number;    // 1 kun narxi (so'm)
  sanatoriumChildPrice?: boolean;    // bola narximi?
  // ── Uyga chaqirish 5-qadam oqimi ──────────────────────────
  hvRegion?: string;
  hvDistrict?: string;
  hvStreet?: string;
  hvHouseNum?: string;
  hvApartment?: string;
  hvLandmark?: string;
  hvLat?: number;
  hvLng?: number;
  hvPhone?: string;
  hvFirstName?: string;
  hvLastName?: string;
  hvBirthDate?: string;
  hvExtraPhone?: string;
  hvTelegram?: string;
  hvVisitDay?: 'today' | 'tomorrow' | 'day-after';
  hvTimeSlot?: string;
  hvPresenceConfirmed?: boolean;
  hvVisitNote?: string;
  hvSpeciality?: string;
  hvComplaintsText?: string;
  hvSymptoms?: string[];
  hvDuration?: string;
  hvChronicDiseases?: string[];
}

export interface DraftExamination {
  category?: 'visual' | 'ultrasound' | 'laboratory' | 'functional' | 'endoscopy';
  examinationName?: string;
  region?: string;
  district?: string;
  centerId?: number;
  selectedDate?: string; // YYYY-MM-DD
  selectedSlot?: string; // HH:mm
  price?: number;
}

// ── TZ-01: Shifokor Profili va Tarif Tizimi ──────────────────────────────────

export type TariffCode = 'FREE' | 'START' | 'LITE' | 'PREMIUM';
export type OperationComplexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'VERY_COMPLEX';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Tariff {
  id: string;
  name: string;
  code: TariffCode;
  price: number;
  features: TariffFeatures;
  isActive: boolean;
  sortOrder: number;
  description?: string;
}

export interface TariffFeatures {
  maxPatients: number; // -1 = cheksiz
  hasPortfolio: boolean;
  portfolioType?: 'basic' | 'full';
  hasCalendar: boolean;
  hasFaq: boolean;
  faqLimit: number; // -1 = cheksiz
  hasServices: boolean;
  servicesLimit: number; // -1 = cheksiz
  hasMessaging: boolean;
  hasAnonymousNumber: boolean;
  hasTelegramBot: boolean;
  showAds: boolean;
  canChangeTemplate: boolean;
  profileUrl: boolean;
  profileUrlCustom?: boolean;
  setupLimit: number; // -1 = cheksiz
  callTimeLimit: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
  isVerified: boolean;
  latitude?: number;
  longitude?: number;
  servicesCount?: number;
  isTop?: boolean;
  topPriority?: number;
  logoUrl?: string;
  rating?: number;
  description?: string;
}

export interface ClinicFilters {
  query?: string;
  region?: string;
  district?: string;
  nearbyEnabled?: boolean;
  userLat?: number;
  userLng?: number;
  minServices?: number;
}

export interface ClinicSearchResult {
  id: string;
  name: string;
  address: string;
  region?: string;
  city?: string;
  servicesCount: number;
  rating: number;
  logoUrl?: string;
  isTop: boolean;
  description?: string;
  doctorsCount: number;
  distance?: number;
}

export interface DoctorClinic {
  id: string;
  doctorId: string;
  clinicId: string;
  clinic: Clinic;
  position?: string;
  department?: string;
  cabinet?: string;
  floor?: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface DoctorOperationType {
  id: string;
  operationCode: string;
  operationName: string;
  operationNameRu?: string;
  category: string;
  complexity: OperationComplexity;
  avgDurationMin?: number;
  description?: string;
  count: number;
}

// ── TZ-03: Calendar & Booking Types ───────────────────────────────────────

export type ConsultType = 'OFFLINE' | 'ONLINE' | 'PHONE' | 'VIDEO';
export type SlotStatus = 'FREE' | 'BOOKED' | 'BLOCKED' | 'CANCELLED';
export type ConsultationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface CalendarSetting {
  id: string;
  doctorId: string;
  workDays: number[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakDuration: number;
  consultTypes: string[];
  onlinePrice: number;
  offlinePrice: number;
  phonePrice: number;
  videoPrice: number;
  maxPatientsDay: number;
  officeAddress?: string;
  officeName?: string;
  officeFloor?: number;
  officeCabinet?: string;
  isActive: boolean;
}

export interface CalendarSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  blockedBy?: string;
  blockReason?: string;
}

export interface ConsultationRequest {
  id: string;
  patientId: number;
  doctorId: string;
  slotId: string;
  slot?: CalendarSlot;
  consultType: ConsultType;
  status: ConsultationStatus;
  patientName?: string;
  patientPhone?: string;
  reason?: string;
  cancelReason?: string;
  cancelledBy?: string;
  meetingUrl?: string;
  price: number;
  isPaid: boolean;
  rating?: number;
  comment?: string;
  createdAt: string;
}

// ── TZ-07: Additional Features Types ──────────────────────────────────────

export interface AnonymousNumber {
  id: string;
  doctorId: string;
  virtualNumber?: string;
  realNumber?: string;
  provider?: string;
  isActive: boolean;
}

export interface CallSchedule {
  id: string;
  doctorId: string;
  workDays: number[];
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  isActive: boolean;
}

export interface TelegramBotConfig {
  id: string;
  doctorId: string;
  botToken?: string;
  channelId?: string;
  channelUrl?: string;
  isOwnBot: boolean;
  autoPost: boolean;
}

export interface AdSetting {
  id: string;
  doctorId: string;
  showBannerAds: boolean;
  showPopupAds: boolean;
  showInFeedAds: boolean;
  adFrequency: string;
}

// ── TZ-06: FAQ & Medical Service Types ────────────────────────────────────

export type FaqCategory = 'OPERATION' | 'RECOVERY' | 'COSTS' | 'CONSULTATION' | 'DIAGNOSTICS';
export type ServiceCategory = 'INSTRUMENTAL' | 'LABORATORY' | 'OPERATION' | 'CONSULTATION' | 'DIAGNOSTICS';

export interface FAQ {
  id: string;
  doctorId: string;
  question: string;
  questionRu?: string;
  answer: string;
  answerRu?: string;
  category: FaqCategory;
  sortOrder: number;
  isActive: boolean;
  viewCount: number;
}

export interface MedicalService {
  id: string;
  doctorId: string;
  name: string;
  nameRu?: string;
  category: ServiceCategory;
  price?: number;
  priceFrom?: number;
  priceTo?: number;
  description?: string;
  descriptionRu?: string;
  targetAudience?: string;
  preparation?: string;
  duration?: string;
  isActive: boolean;
  sortOrder: number;
}

// ── TZ-05: Message Types ──────────────────────────────────────────────────

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
export type PermissionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'REQUESTED';

export interface ChatMessage {
  id: string;
  senderId: number;
  receiverId: number;
  content?: string;
  messageType: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: string;
  consultId?: string;
  createdAt: string;
  sender?: { id: number; fullName: string; avatar?: string };
  receiver?: { id: number; fullName: string; avatar?: string };
}

export interface MessagePermission {
  id: string;
  patientId: number;
  doctorId: string;
  consultationId?: string;
  grantedBy: string;
  status: PermissionStatus;
  expiresAt: string;
}

export interface Conversation {
  partnerId: number;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// ── TZ-04: Contact & Template Types ───────────────────────────────────────

export type ContactRequestType = 'CONSULTATION' | 'COMPLAINT' | 'FOLLOW_UP' | 'OTHER';
export type ContactRequestStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';

export interface ContactRequest {
  id: string;
  doctorId: string;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  requestType: ContactRequestType;
  message: string;
  templateUsed?: string;
  status: ContactRequestStatus;
  doctorReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  doctorId: string;
  category: string;
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  usageCount: number;
}

// ── TZ-02: Portfolio Types ─────────────────────────────────────────────────

export type DegreeType = 'BACHELOR' | 'MASTER' | 'PHD' | 'DSC' | 'RESIDENCY' | 'ORDINATURA';
export type AchievementGroup = 'SCIENTIFIC' | 'PRACTICAL' | 'ORGANIZATIONAL' | 'INTERNATIONAL' | 'STATE';
export type StickerType = 'GOLD' | 'SILVER' | 'BRONZE' | 'SPECIAL';

export interface Education {
  id: string;
  doctorId: string;
  institutionName: string;
  faculty?: string;
  degree: DegreeType;
  startYear: number;
  endYear?: number;
  diplomaNumber?: string;
  isVerified: boolean;
}

export interface WorkExperience {
  id: string;
  doctorId: string;
  organizationName: string;
  position: string;
  department?: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface Achievement {
  id: string;
  doctorId: string;
  name: string;
  nameRu?: string;
  group: AchievementGroup;
  year: number;
  description?: string;
  documentUrl?: string;
  stickerType?: StickerType;
  isVerified: boolean;
}

export interface Certificate {
  id: string;
  doctorId: string;
  name: string;
  nameRu?: string;
  organization: string;
  direction: string;
  year: number;
  certificateNum?: string;
  documentUrl?: string;
  expiresAt?: string;
  isVerified: boolean;
}

export interface DoctorProfile {
  id: string;
  userId: number;
  bio?: string;
  birthDate?: string;
  experienceYears: number;
  subSpecialties: string[];
  qualificationCategory?: string;
  qualificationDocUrl?: string;
  licenseNumber?: string;
  licenseDocUrl?: string;
  licenseVerified: boolean;
  qualificationVerified: boolean;
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
  };
  profileUrl?: string;
  isPublic: boolean;
  isBusinessAccount: boolean;
  tariffId?: string;
  tariff?: Tariff;
  clinics: DoctorClinic[];
  operationTypes: DoctorOperationType[];
  education?: Education[];
  workExperience?: WorkExperience[];
  achievements?: Achievement[];
  certificates?: Certificate[];
  totalConsultations: number;
  totalOperations: number;
  onlineConsultations: number;
  offlineConsultations: number;
  averageRating: number;
  totalRatings: number;
  overallRank?: number;
  specialtyRank?: number;
  user?: {
    id: number;
    fullName: string;
    specialty?: string;
    avatar?: string;
    isOnline: boolean;
    lastSeenAt?: string;
    phone?: string;
    verificationStatus?: VerificationStatus;
  };
}

export type Screen =
  | 'splash'
  | 'role_select'
  | 'patient_profile'
  | 'patient_home'
  | 'patient_upload'
  | 'patient_anamnez'
  | 'patient_service'
  | 'patient_contract'
  | 'patient_payment'
  | 'patient_status'
  | 'patient_conclusion'
  | 'patient_konsultatsiya'
  | 'patient_tekshiruv'
  | 'patient_kons_type'
  | 'patient_kons_subtype'
  | 'patient_kons_doctor'
  | 'patient_kons_calendar'
  | 'patient_kons_sanatorium'
  | 'patient_kons_anamnez'
  | 'patient_kons_confirm'
  | 'patient_tks_category'
  | 'patient_tks_exam'
  | 'patient_tks_center'
  | 'patient_tks_calendar'
  | 'patient_tks_confirm'
  | 'home_visit_address'
  | 'home_visit_contact'
  | 'home_visit_time'
  | 'home_visit_specialist'
  | 'home_visit_confirm'
  | 'radiolog_dashboard'
  | 'radiolog_view'
  | 'radiolog_conclude'
  | 'radiolog_specialist'
  | 'operator_dashboard'
  | 'admin_dashboard'
  | 'specialist_dashboard'
  | 'doctor_dashboard'
  | 'doctor_patient_view'
  | 'kassir_dashboard'
  | 'web_login'
  | 'web_dashboard'
  | 'web_admin'
  | 'web_operator'
  | 'web_kassir'
  | 'web_radiolog'
  | 'web_specialist'
  | 'web_doctor'
  | 'web_onlayn'
  | 'web_arizalar'
  | 'web_notifications'
  | 'web_settings'
  | 'web_bemor_profili'
  | 'notifications'
  | 'profile'
  // ── TZ-01: Shifokor Profil ekranlari ────────────────────────────────────────
  | 'doctor_profile_setup'
  | 'doctor_public_profile'
  | 'doctor_private_panel'
  | 'doctor_tariff_select'
  | 'doctor_clinic_manage'
  | 'doctor_verification'
  // ── TZ-02: Portfolio ekranlari ──────────────────────────────────────────────
  | 'doctor_portfolio'
  | 'doctor_portfolio_edit'
  // ── TZ-04: Ariza va Aloqa ekranlari ────────────────────────────────────────
  | 'patient_contact_form'
  | 'doctor_contact_requests'
  | 'doctor_template_manager'
  // ── TZ-05: Xabar tizimi ekranlari ──────────────────────────────────────────
  | 'conversations_list'
  | 'chat_screen'
  // ── TZ-06: FAQ va Xizmatlar ekranlari ───────────────────────────────────────
  | 'doctor_faq_view'
  | 'doctor_faq_editor'
  | 'doctor_services_view'
  | 'doctor_services_editor'
  // ── TZ-07: Qo'shimcha funksionallar ─────────────────────────────────────────
  | 'doctor_anonymous_number'
  | 'doctor_telegram_bot'
  | 'doctor_ad_settings'
  | 'doctor_share_profile'
  // ── TZ-03: Kalendar ekranlari ───────────────────────────────────────────────
  | 'doctor_calendar_view'
  | 'doctor_calendar_settings'
  | 'patient_booking_calendar'
  | 'patient_booking_confirm'
  // ── Web Admin ekranlari ─────────────────────────────────────────────────────
  | 'web_doctor_profiles'
  | 'web_tariff_manage'
  | 'web_calendar_manage'
  // ── Web Spravochnik (Ma'lumotnoma) ekranlari ────────────────────────────────
  | 'web_ref_specialties'
  | 'web_ref_regions'
  | 'web_ref_diagnoses'
  | 'web_ref_drugs'
  | 'web_ref_lab_tests'
  | 'web_ref_services'
  | 'web_ref_templates'
  | 'web_ref_exam_centers'
  // ── Web Admin kengaytirilgan ekranlar ───────────────────────────────────────
  | 'web_admin_dashboard'
  | 'web_admin_users'
  | 'web_admin_roles'
  | 'web_admin_audit'
  | 'web_admin_settings'
  | 'web_admin_logs'
  | 'web_admin_sessions'
  | 'web_admin_payments'
  | 'web_admin_doctors_report'
  | 'web_admin_apps_report'
  // ── Web Operator kengaytirilgan ekranlar ────────────────────────────────────
  | 'web_op_dashboard'
  | 'web_op_create_app'
  | 'web_op_applications'
  | 'web_op_patient_search'
  | 'web_op_queue'
  // ── Web Doctor kengaytirilgan ekranlar ──────────────────────────────────────
  | 'web_doc_dashboard'
  | 'web_doc_patients'
  | 'web_doc_reception'
  | 'web_doc_conclusion'
  | 'web_doc_prescription'
  | 'web_doc_lab_order'
  | 'web_doc_emr'
  | 'web_doc_statistics'
  // ── Web Kassa kengaytirilgan ekranlar ───────────────────────────────────────
  | 'web_kassa_dashboard'
  | 'web_kassa_payment'
  | 'web_kassa_receipt'
  | 'web_kassa_shift_report'
  | 'web_kassa_history';

// ── Spravochnik (Ma'lumotnoma) interfeyslari ──────────────────────────────────

export interface Specialty {
  id: string;
  name: string;
  nameRu?: string;
  code: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  doctorCount?: number;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  type: 'VILOYAT' | 'TUMAN' | 'SHAHAR';
  isActive: boolean;
  children?: Region[];
}

export interface DiagnosisCode {
  id: string;
  code: string;
  name: string;
  nameRu?: string;
  category: string;
  icdVersion: string;
  isActive: boolean;
}

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  form: 'tablet' | 'kapsul' | 'sirop' | 'inektsiya' | 'malham' | 'tomchi' | 'boshqa';
  dosage: string;
  manufacturer: string;
  category: string;
  isActive: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  code: string;
  category: string;
  referenceRange: string;
  unit: string;
  price: number;
  isActive: boolean;
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  price?: number;
  duration?: number;
  isActive: boolean;
  children?: ServiceCategoryItem[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'xulosa' | 'retsept' | 'yollanma' | 'spravka' | 'shartnoma' | 'protokol';
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount?: number;
  updatedAt?: string;
}

export interface ExamCenter {
  id: string;
  name: string;
  address: string;
  region: string;
  phone: string;
  services: string[];
  workHours: string;
  isActive: boolean;
  lat?: number;
  lng?: number;
}

// ── Admin kengaytirilgan interfeyslari ────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ip: string;
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: string;
  group: 'umumiy' | 'bildirishnoma' | 'xavfsizlik' | 'integratsiya' | 'tolov' | 'fayl' | 'kassa' | 'tizim';
  description: string;
  isEditable: boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export interface UserSessionItem {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  platform: 'mini-app' | 'web' | 'mobile';
  deviceInfo: string;
  ipAddress: string;
  isActive: boolean;
  loginAt: string;
  lastActiveAt: string;
}

export interface RolePermissionItem {
  resource: string;
  actions: { [role in UserRole]?: ('C' | 'R' | 'U' | 'D')[] };
}
