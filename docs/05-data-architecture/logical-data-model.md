# Mantiqiy Ma'lumot Modeli (LDM)

> **Hujjat ID:** DATA-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Jadvallar

### users

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | Unikal identifikator |
| telegram_id | BIGINT | NOT NULL | Telegram foydalanuvchi ID |
| username | VARCHAR(50) | NOT NULL | Foydalanuvchi nomi |
| role | ENUM | NOT NULL | patient, radiolog, doctor, specialist, operator, admin, kassir |
| full_name | VARCHAR(150) | NOT NULL | To'liq ism |
| phone | VARCHAR(20) | NOT NULL | Telefon raqami (+998...) |
| birth_date | DATE | NULL | Tug'ilgan sana |
| gender | ENUM | NULL | male, female |
| city | VARCHAR(100) | NULL | Shahar |
| chronic_diseases | TEXT | NULL | Surunkali kasalliklar |
| language | ENUM | NOT NULL | uz, ru |
| is_active | BOOLEAN | NOT NULL | Faol holati (default: true) |
| avatar | VARCHAR(255) | NULL | Profil rasmi URL |
| license | VARCHAR(50) | NULL | Litsenziya raqami (tibbiy xodim) |
| specialty | VARCHAR(100) | NULL | Mutaxassislik |
| experience | INTEGER | NULL | Tajriba (yil) |
| rating | DECIMAL(3,2) | NULL | Reyting (0-5) |
| total_conclusions | INTEGER | NULL | Jami xulosa soni |
| created_at | TIMESTAMP | NOT NULL | Yaratilgan vaqt |

**Indekslar:** `idx_users_role`, `idx_users_phone`, `idx_users_telegram_id`

---

### applications

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | Unikal identifikator |
| ariza_number | VARCHAR(20) | NOT NULL | MSP-YYYY-NNNNN |
| patient_id | INTEGER | FK → users.id | Bemor |
| radiolog_id | INTEGER | FK → users.id | Tayinlangan radiolog |
| specialist_id | INTEGER | FK → users.id | Tayinlangan mutaxassis |
| doctor_id | INTEGER | FK → users.id | Tayinlangan shifokor |
| status | ENUM | NOT NULL | 11 ta holat |
| service_type | ENUM | NOT NULL | ai_radiolog, radiolog_only, radiolog_specialist, consultation, home_visit |
| urgency | ENUM | NOT NULL | normal, urgent, emergency |
| scan_type | VARCHAR(50) | NULL | MRT, MSKT, Rentgen, USG, Boshqa |
| organ | VARCHAR(100) | NULL | Tekshirilgan organ |
| scan_date | DATE | NULL | Skaner sanasi |
| scan_facility | VARCHAR(200) | NULL | Skaner muassasasi |
| price | DECIMAL(12,2) | NOT NULL | Narx (so'm) |
| notes | TEXT | NULL | Qo'shimcha izoh |
| rating | INTEGER | NULL | Bemor baholashi (1-5) |
| created_at | TIMESTAMP | NOT NULL | Yaratilgan |
| updated_at | TIMESTAMP | NOT NULL | Yangilangan |
| accepted_at | TIMESTAMP | NULL | Qabul qilingan |
| completed_at | TIMESTAMP | NULL | Yakunlangan |
| deadline_at | TIMESTAMP | NULL | SLA muddati |

**Indekslar:** `idx_app_patient`, `idx_app_status`, `idx_app_radiolog`, `idx_app_created`

---

### conclusions

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | Unikal identifikator |
| application_id | INTEGER | FK → applications.id | Ariza |
| author_id | INTEGER | FK → users.id | Muallif |
| conclusion_type | ENUM | NOT NULL | ai_analysis, radiolog, specialist, doctor |
| description | TEXT | NOT NULL | Tavsif |
| findings | TEXT | NOT NULL | Topilmalar |
| impression | TEXT | NOT NULL | Taassurot |
| recommendations | TEXT | NULL | Tavsiyalar |
| source | ENUM | NULL | editor, upload |
| signed_at | TIMESTAMP | NOT NULL | Imzolangan vaqt |
| pdf_url | VARCHAR(255) | NULL | PDF fayl URL |

---

### payments

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | Unikal identifikator |
| application_id | INTEGER | FK → applications.id | Ariza |
| amount | DECIMAL(12,2) | NOT NULL | Summa |
| provider | ENUM | NOT NULL | personal_card, payme, click, uzum, uzcard, humo, cash |
| status | ENUM | NOT NULL | pending, paid, cancelled, refunded |
| provider_transaction_id | VARCHAR(100) | NULL | Provayderning tranzaksiya ID |
| paid_at | TIMESTAMP | NULL | To'langan vaqt |
| created_at | TIMESTAMP | NOT NULL | Yaratilgan |

---

### anamnez

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| application_id | INTEGER | FK → applications.id | Ariza |
| complaints | TEXT | NOT NULL | Shikoyatlar |
| duration | VARCHAR(50) | NULL | Davomiylik |
| pain_level | INTEGER | NULL | Og'riq darajasi (1-10) |
| medications | TEXT | NULL | Qabul qilinayotgan dorilar |
| allergies | TEXT | NULL | Allergiyalar |
| chronic_diseases | TEXT | NULL | Surunkali kasalliklar |
| previous_exams | TEXT | NULL | Oldingi tekshiruvlar |

---

### files

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| application_id | INTEGER | FK → applications.id | Ariza |
| file_name | VARCHAR(255) | NOT NULL | Fayl nomi |
| file_type | VARCHAR(50) | NOT NULL | DICOM, JPG, PDF, ZIP |
| file_size | BIGINT | NOT NULL | Hajm (bayt) |
| url | VARCHAR(500) | NOT NULL | Saqlash URL |
| uploaded_at | TIMESTAMP | NOT NULL | Yuklangan vaqt |

---

### audit_events

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| application_id | INTEGER | FK → applications.id | Ariza |
| action | VARCHAR(50) | NOT NULL | APPLICATION_CREATED, STATUS_CHANGED, ... |
| actor_id | INTEGER | NULL | Harakat qiluvchi |
| actor_role | ENUM | NULL | Harakat qiluvchi roli |
| actor_name | VARCHAR(150) | NULL | Harakat qiluvchi ismi |
| details | JSONB | NULL | Qo'shimcha ma'lumot |
| created_at | TIMESTAMP | NOT NULL | Vaqt |

---

### notifications

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users.id | Qabul qiluvchi |
| type | VARCHAR(50) | NOT NULL | status_change, payment, conclusion, system |
| title | VARCHAR(200) | NOT NULL | Sarlavha |
| message | TEXT | NOT NULL | Xabar matni |
| is_read | BOOLEAN | NOT NULL | O'qilganmi (default: false) |
| application_id | INTEGER | NULL | Bog'liq ariza |
| created_at | TIMESTAMP | NOT NULL | Yaratilgan |

---

### kassa_smena

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| kassir_id | INTEGER | FK → users.id | Kassir |
| opened_at | TIMESTAMP | NOT NULL | Smena boshlangan |
| closed_at | TIMESTAMP | NULL | Smena yopilgan |
| initial_balance | DECIMAL(12,2) | NOT NULL | Boshlang'ich qoldiq |
| cash_total | DECIMAL(12,2) | NOT NULL | Naqd jami |
| card_total | DECIMAL(12,2) | NOT NULL | Karta jami |
| online_total | DECIMAL(12,2) | NOT NULL | Onlayn jami |
| grand_total | DECIMAL(12,2) | NOT NULL | Umumiy jami |
| transactions_count | INTEGER | NOT NULL | Tranzaksiyalar soni |

---

### kassa_tolov

| Ustun | Turi | Null | Tavsif |
|-------|------|------|--------|
| id | SERIAL | PK | |
| smena_id | INTEGER | FK → kassa_smena.id | Smena |
| application_id | INTEGER | FK → applications.id | Ariza |
| invoice_number | VARCHAR(20) | NOT NULL | INV-YYYY-NNNNN |
| patient_name | VARCHAR(150) | NOT NULL | Bemor ismi |
| service_name | VARCHAR(200) | NOT NULL | Xizmat nomi |
| amount | DECIMAL(12,2) | NOT NULL | Summa |
| discount | DECIMAL(12,2) | NOT NULL | Chegirma |
| amount_due | DECIMAL(12,2) | NOT NULL | To'lash kerak |
| amount_paid | DECIMAL(12,2) | NOT NULL | To'langan |
| change_amount | DECIMAL(12,2) | NOT NULL | Qaytim |
| payment_method | ENUM | NOT NULL | naqd, karta, payme, click, uzum, uzcard, humo, terminal |
| status | ENUM | NOT NULL | kutilmoqda, qabul_qilindi, bekor, qaytarildi |
| kassir_id | INTEGER | FK → users.id | Kassir |
| created_at | TIMESTAMP | NOT NULL | Sana va vaqt |
