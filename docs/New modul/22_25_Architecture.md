# MedSmart Pro — Arxitektura Hujjatlari (22-25)

**Versiya:** 1.0 | **Sana:** 11.04.2026

---

# 22. SYSTEM ARCHITECTURE DOCUMENT (HLD)

## 1. ARXITEKTURA USLUBI
**Tanlov:** Modular Monolith → Microservices (bosqichma-bosqich)  
**Sabab:** MVP tez chiqarish + kelajakda scale qilish

## 2. C4 MODEL

### Level 1 — Context
```
[Bemor] → [MedSmart Pro Web/Mobile] ← [Shifokor]
                    ↓
        ┌───────────┼───────────┐
   [LLM API]   [Lab API]   [Payment]
                    ↓
              [SMS/Push]
```

### Level 2 — Container
- **Web App** (Next.js) — bemor interfeysi
- **Mobile App** (React Native) — iOS/Android
- **Doctor Portal** (Next.js) — shifokorlar uchun
- **Admin Panel** (Next.js) — administratorlar
- **API Gateway** (Kong/Nginx)
- **Auth Service** (Node.js)
- **EMR Service** (Node.js)
- **AI Service** (Python/FastAPI)
- **Booking Service** (Node.js)
- **Notification Service** (Node.js)
- **Analytics Service** (Python)
- **PostgreSQL** (asosiy DB)
- **Redis** (kesh va sessiya)
- **Vector DB** (Pinecone)
- **S3** (fayllar)

### Level 3 — Component
Har bir service ichida: Controller → Service → Repository → DB

## 3. TEXNOLOGIYA STEK
| Qatlam | Texnologiya | Sabab |
|---|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui | SSR, SEO, sifat |
| Mobile | React Native + Expo | Cross-platform |
| Backend | Node.js (NestJS) + Python (FastAPI) | Tez + AI uchun |
| DB | PostgreSQL 16 | ACID, JSON support |
| Cache | Redis 7 | Tez |
| Vector DB | Pinecone yoki Qdrant | RAG |
| AI | Claude API + GPT-4 (fallback) | Sifat |
| Cloud | AWS (Frankfurt) + mahalliy DC | HIPAA + qonun |
| Container | Docker + Kubernetes | Scale |
| CI/CD | GitHub Actions | Standart |

## 4. SCALABILITY STRATEGIYASI
- Horizontal scaling (k8s)
- Read replicas (DB)
- CDN (Cloudflare)
- Caching qatlamlari
- Async processing (Bull MQ)

## 5. DISASTER RECOVERY
- Multi-region backup
- RPO: 1 soat
- RTO: 4 soat
- Automated failover

---

# 23. LOW LEVEL DESIGN (LLD)

## 1. AI SERVICE — sequence diagram

```
Bemor → Frontend → API Gateway → AI Service
  → [1] EMR Service (bemor ma'lumotlarini olish)
  → [2] Vector DB (RAG qidiruv)
  → [3] LLM API (Claude)
  → [4] Red Flag Checker
  → [5] Response formatter
  → Frontend → Bemor
```

## 2. EMR SERVICE — class diagram (qisqa)
```
Class Patient
  - id, phoneNumber, profile
  - getMedicalHistory()
  - addAllergy()
  - addMedication()

Class MedicalHistory
  - chronicDiseases[]
  - surgeries[]
  - familyHistory{}

Class Allergy
  - substance, severity, reactions[]
```

## 3. STATE DIAGRAM — Bemor murojaati
```
[Yangi] → [Simptom kiritish] → [Savol-javob]
   → [AI tahlil] → [Natija] → [Klinika tanlash]
   → [To'lov] → [Tasdiqlangan] → [Yakunlangan]
```

## 4. ALGORITM PSEUDOKOD — Tashxis qo'yish
```
function diagnose(symptoms, patient):
  emr = getEMR(patient.id)
  context = buildContext(symptoms, emr)
  rag_results = vectorSearch(context)
  prompt = buildPrompt(context, rag_results)
  llm_response = callLLM(prompt)
  diagnoses = parseLLMResponse(llm_response)
  
  for d in diagnoses:
    d.probability *= contextFactors(emr)
  
  redFlags = checkRedFlags(symptoms, emr)
  if redFlags:
    return {type: "EMERGENCY", redFlags}
  
  return rankAndReturn(diagnoses)
```

---

# 24. DATABASE DESIGN DOCUMENT

## 1. CONCEPTUAL DATA MODEL (ERD)

Asosiy entitelar:
- **User** (bemor, shifokor, admin)
- **Patient** (1:1 with User)
- **MedicalRecord**
- **Allergy**, **Medication**, **ChronicDisease**, **FamilyHistory**
- **Consultation** (murojaat)
- **Symptom**, **Diagnosis**
- **Doctor**, **Clinic**, **Specialty**
- **Appointment**
- **Payment**
- **LabTest**, **LabResult**
- **Disease** (KB)

## 2. LOGICAL DATA MODEL — asosiy jadvallar

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  role ENUM('patient', 'doctor', 'admin'),
  created_at TIMESTAMP,
  encrypted_password TEXT
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  birth_date DATE,
  gender ENUM('M','F'),
  blood_type VARCHAR(5),
  height_cm INT,
  weight_kg DECIMAL(5,2),
  language_preference VARCHAR(5)
);

-- Medical Records
CREATE TABLE medical_records (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  data JSONB,  -- flexible for different data types
  updated_at TIMESTAMP
);

-- Allergies
CREATE TABLE allergies (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  substance VARCHAR(255),
  severity ENUM('mild','moderate','severe'),
  reactions TEXT[]
);

-- Consultations
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  symptoms JSONB,
  ai_diagnoses JSONB,
  red_flag BOOLEAN,
  created_at TIMESTAMP
);

-- Diseases (KB)
CREATE TABLE diseases (
  id UUID PRIMARY KEY,
  icd10 VARCHAR(10) UNIQUE,
  snomed VARCHAR(20),
  names JSONB,  -- {uz, ru, en}
  symptoms JSONB,
  specialist VARCHAR(100)
);

-- Doctors, Clinics, Appointments, Payments, LabTests...
```

## 3. INDEKSLAR
- `idx_patients_user_id`
- `idx_consultations_patient_date`
- `idx_diseases_icd10`
- `idx_appointments_doctor_date`

## 4. PARTITIONING
- `consultations` — oy bo'yicha
- `audit_logs` — kun bo'yicha

## 5. DATA DICTIONARY
Har bir jadval va ustun uchun: nomi, tipi, tavsifi, cheklovlar, namunaviy qiymat (alohida fayl).

## 6. NORMALIZATSIYA
3NF asosiy, denormalizatsiya kerak joylarda (analitika uchun materialized views).

---

# 25. API SPECIFICATION

## 1. UMUMIY
- **Format:** REST + JSON
- **Versioning:** /api/v1/
- **Auth:** JWT Bearer token
- **Rate limit:** 100 req/min per user
- **Documentation:** OpenAPI 3.0 / Swagger

## 2. ENDPOINT'LAR (asosiy)

### Auth
- `POST /api/v1/auth/register` — telefon + OTP yuborish
- `POST /api/v1/auth/verify-otp` — OTP tasdiqlash
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Patient
- `GET /api/v1/patients/me`
- `PUT /api/v1/patients/me`
- `GET /api/v1/patients/me/emr`
- `POST /api/v1/patients/me/allergies`
- `POST /api/v1/patients/me/medications`
- `GET /api/v1/patients/me/consultations`

### AI Diagnosis
- `POST /api/v1/diagnose/start` — yangi murojaat
- `POST /api/v1/diagnose/{id}/symptoms` — simptom qo'shish
- `POST /api/v1/diagnose/{id}/answer` — savolga javob
- `GET /api/v1/diagnose/{id}/result` — natija olish

### Doctors & Clinics
- `GET /api/v1/clinics?lat=&lng=&specialty=`
- `GET /api/v1/doctors/{id}`
- `GET /api/v1/doctors/{id}/availability`

### Appointments
- `POST /api/v1/appointments`
- `GET /api/v1/appointments/me`
- `DELETE /api/v1/appointments/{id}`

### Payments
- `POST /api/v1/payments/initiate`
- `POST /api/v1/payments/webhook`

## 3. NAMUNAVIY REQUEST/RESPONSE

```json
POST /api/v1/diagnose/start
Request:
{
  "input_method": "text",
  "language": "uz"
}

Response 200:
{
  "consultation_id": "uuid",
  "first_question": {
    "id": "q1",
    "text": "Sizni nima bezovta qilmoqda?",
    "type": "free_text"
  }
}
```

## 4. XATO KODLARI
- 400 — Bad Request
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 422 — Validation Error
- 429 — Rate Limit
- 500 — Server Error
- 503 — Service Unavailable

## 5. WEBHOOK'LAR
- Payment confirmation
- Lab result ready
- Appointment reminder

**Hujjat oxiri.**
