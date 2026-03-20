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
  | 'profile';
