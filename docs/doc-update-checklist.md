# 📋 Hujjatlarni Yangilash Nazorat Ro'yxati

## 🎯 Maqsad

Har bir PR/commit bilan bog'liq hujjatlarning to'liq yangilanishini ta'minlash. Bu checklist har bir Pull Request uchun **MAJBURIY**.

> ⚠️ Ushbu checklist to'ldirilmagan PR merge qilinmaydi!

---

## 📝 O'zgarish Turlari Bo'yicha Checklist

### 1. YANGI MODUL QO'SHILGANDA

**Trigger:** Yangi modul (masalan, Telemedicine, Laboratory) qo'shildi

- [ ] `02-requirements/functional-requirements.md` — Yangi FR qatorlari qo'shish
- [ ] `02-requirements/non-functional-requirements.md` — NFR ta'sirini baholash
- [ ] `09-modules/[MODUL]-module.md` — Modul spetsifikatsiyasi yaratish (`15-templates/module-template.md` asosida)
- [ ] `05-data-architecture/logical-data-model.md` — Yangi jadvallar qo'shish
- [ ] `05-data-architecture/conceptual-data-model.md` — Entity qo'shish
- [ ] `05-data-architecture/data-dictionary.md` — Yangi atributlar lug'ati
- [ ] `06-api-specification/api-endpoints.yaml` — Yangi endpoint guruhlar
- [ ] `03-use-cases/user-stories.md` — Yangi user story lar qo'shish
- [ ] `03-use-cases/actors-catalog.md` — Yangi aktorlar bo'lsa
- [ ] `03-use-cases/stakeholder-map.md` — Stakeholder ta'siri
- [ ] `04-architecture/architecture-design.md` — Arxitektura diagrammasiga qo'shish
- [ ] `04-architecture/container-diagram.md` — Container yangilash
- [ ] `07-integrations/integration-map.md` — Yangi integratsiyalar bo'lsa
- [ ] `08-security/rbac-model.md` — Yangi permission lar
- [ ] `08-security/security-policy.md` — Security review o'tkazish
- [ ] `11-testing/test-plan.md` — Yangi test case lar qo'shish
- [ ] `11-testing/test-strategy.md` — Test qamrovi yangilash
- [ ] `01-business/vision-scope.md` — Scope yangilash
- [ ] `12-changelog/CHANGELOG.md` — Versiya yangilash
- [ ] `PROJECT_CONTEXT.md` — Modullar ro'yxatini yangilash
- [ ] `README.md` — Fayllar soni va mazmun yangilash

**Mas'ul:** SA + BA + Backend Lead + QA Lead
**Muddat:** PR merge dan 2 kun oldin

---

### 2. API ENDPOINT O'ZGARGANDA

**Trigger:** Yangi endpoint qo'shildi, mavjud endpoint o'zgardi yoki o'chirildi

- [ ] `06-api-specification/api-endpoints.yaml` — OpenAPI spec yangilash
- [ ] `06-api-specification/api-versioning.md` — Versiya o'zgarishi bo'lsa
- [ ] `09-modules/[MODUL]-module.md` — Modul API bo'limi yangilash
- [ ] `07-integrations/integration-map.md` — Tashqi tizim API o'zgarishi bo'lsa
- [ ] `03-use-cases/user-stories.md` — Tegishli user story lar
- [ ] `11-testing/test-plan.md` — API test case lar yangilash
- [ ] `12-changelog/CHANGELOG.md` — Breaking changes belgilash
- [ ] `13-onboarding/getting-started.md` — Yangi developer uchun muhim bo'lsa
- [ ] `05-data-architecture/data-dictionary.md` — Response/Request modellar o'zgarsa

**Mas'ul:** Backend Developer + SA
**Muddat:** PR merge dan 1 kun oldin

---

### 3. DATABASE SCHEMA O'ZGARGANDA

**Trigger:** Yangi jadval, yangi ustun, indeks, foreign key, Prisma schema o'zgarishi

- [ ] `05-data-architecture/logical-data-model.md` — Jadvallar va munosabatlar
- [ ] `05-data-architecture/conceptual-data-model.md` — Yangi entity bo'lsa
- [ ] `05-data-architecture/data-dictionary.md` — Atributlar lug'ati
- [ ] `06-api-specification/api-endpoints.yaml` — Response model o'zgarishi
- [ ] `09-modules/[MODUL]-module.md` — Modul data model bo'limi
- [ ] `08-security/security-policy.md` — PHI/PII ma'lumotlar bo'lsa
- [ ] `08-security/rbac-model.md` — Yangi jadvalga permission kerak bo'lsa
- [ ] `11-testing/test-plan.md` — Database test case lar
- [ ] `12-changelog/CHANGELOG.md` — Migration tarixi
- [ ] `PROJECT_CONTEXT.md` — Database schema o'zgarishi

**Mas'ul:** DBA + Backend Developer + Security
**Muddat:** PR merge dan 2 kun oldin

> 📌 **Eslatma:** `server/prisma/schema.prisma` o'zgarishi avtomatik ravishda ushbu checklistni boshlaydi

---

### 4. BIZNES QOIDA O'ZGARGANDA

**Trigger:** Yangi biznes qoida, mavjud qoida o'zgardi, narxlar/tariflar o'zgardi

- [ ] `01-business/business-rules.md` — Biznes qoidalar jadvali (BR-XXX)
- [ ] `01-business/vision-scope.md` — Vizyon/doira ta'siri
- [ ] `02-requirements/functional-requirements.md` — Tegishli FR yangilash
- [ ] `02-requirements/non-functional-requirements.md` — NFR ta'siri bo'lsa
- [ ] `03-use-cases/user-stories.md` — User story lar yangilash
- [ ] `09-modules/[MODUL]-module.md` — Modul biznes qoidalar bo'limi
- [ ] `11-testing/test-plan.md` — Biznes qoida test case lar
- [ ] `12-changelog/CHANGELOG.md` — O'zgarish qaydi

**Mas'ul:** Business Analyst + Product Owner
**Muddat:** Sprint planning dan oldin

---

### 5. XAVFSIZLIK O'ZGARGANDA

**Trigger:** Auth mexanizmi, RBAC, encryption, audit log o'zgarishi

- [ ] `08-security/security-policy.md` — Umumiy xavfsizlik siyosati
- [ ] `08-security/rbac-model.md` — Rollar va permission lar
- [ ] `02-requirements/non-functional-requirements.md` — Security NFR
- [ ] `09-modules/auth-module.md` — Auth modul yangilash
- [ ] `06-api-specification/api-endpoints.yaml` — Auth header/middleware
- [ ] `10-devops/runbook.md` — Security runbook
- [ ] `10-devops/deployment.md` — Deploy xavfsizlik konfiguratsiyasi
- [ ] `13-onboarding/getting-started.md` — Auth sozlash bo'limi
- [ ] `11-testing/test-plan.md` — Security test case lar
- [ ] `12-changelog/CHANGELOG.md` — Security changelog

**Mas'ul:** Security Specialist + SA + DevOps
**Muddat:** Darhol (security issue bo'lsa 24 soat ichida)

---

### 6. DEPLOY/INFRASTRUCTURE O'ZGARGANDA

**Trigger:** Vercel config, environment variables, CI/CD pipeline o'zgarishi

- [ ] `10-devops/deployment.md` — Deployment konfiguratsiyasi
- [ ] `10-devops/runbook.md` — Operatsion qo'llanma
- [ ] `13-onboarding/getting-started.md` — Local setup o'zgarishi
- [ ] `14-practicals/demo-credentials.md` — Yangi environment credentials
- [ ] `04-architecture/container-diagram.md` — Infra o'zgarishi bo'lsa
- [ ] `12-changelog/CHANGELOG.md` — Infra changelog

**Mas'ul:** DevOps Engineer + Tech Lead
**Muddat:** Deploy dan 1 kun oldin

---

### 7. YANGI INTEGRATSIYA QO'SHILGANDA

**Trigger:** Yangi tashqi tizim bilan integratsiya (Telegram, to'lov, AI, SMS)

- [ ] `07-integrations/integration-map.md` — Integratsiya xaritasi (yangi qator)
- [ ] `06-api-specification/api-endpoints.yaml` — Webhook/callback endpoint lar
- [ ] `04-architecture/architecture-design.md` — Arxitektura diagramma yangilash
- [ ] `04-architecture/container-diagram.md` — Tashqi tizim qo'shish
- [ ] `08-security/security-policy.md` — 3rd party security review
- [ ] `09-modules/[MODUL]-module.md` — Modul integratsiya bo'limi
- [ ] `05-data-architecture/data-dictionary.md` — Tashqi tizim data modeli
- [ ] `11-testing/test-plan.md` — Integration test case lar
- [ ] `12-changelog/CHANGELOG.md` — Integration changelog
- [ ] `01-business/business-rules.md` — Integratsiya biznes qoidalari

**Mas'ul:** Integration Specialist + Backend Dev + Security
**Muddat:** Integratsiyadan 1 hafta oldin

---

### 8. TEST/QA O'ZGARGANDA

**Trigger:** Yangi test strategy, test plan o'zgarishi, yangi test case lar

- [ ] `11-testing/test-strategy.md` — Test strategiyasi
- [ ] `11-testing/test-plan.md` — Test rejasi va test case lar
- [ ] `02-requirements/functional-requirements.md` — FR-test traceability
- [ ] `03-use-cases/user-stories.md` — User story acceptance criteria
- [ ] `12-changelog/CHANGELOG.md` — Test changelog

**Mas'ul:** QA Lead + QA Engineer
**Muddat:** Sprint boshidan oldin

---

### 9. USER STORY / USE CASE O'ZGARGANDA

**Trigger:** Yangi user story, foydalanuvchi stsenariysi o'zgarishi

- [ ] `03-use-cases/user-stories.md` — User story yangilash
- [ ] `03-use-cases/actors-catalog.md` — Aktorlar ro'yxati
- [ ] `03-use-cases/stakeholder-map.md` — Stakeholder xaritasi
- [ ] `02-requirements/functional-requirements.md` — FR bilan bog'lash
- [ ] `09-modules/[MODUL]-module.md` — Modul user flow
- [ ] `11-testing/test-plan.md` — Acceptance test case lar
- [ ] `12-changelog/CHANGELOG.md` — O'zgarish qaydi

**Mas'ul:** BA + Product Owner
**Muddat:** Sprint planning dan oldin

---

### 10. STANDART/METODOLOGIYA O'ZGARGANDA

**Trigger:** Yangi standart qo'shildi, metodologiya o'zgarishi

- [ ] `00-standards/methodology.md` — Standart hujjati yangilash
- [ ] `15-templates/user-story-template.md` — Shablon yangilash
- [ ] `15-templates/module-template.md` — Modul shablon yangilash
- [ ] `README.md` — Hujjatlar tuzilmasi
- [ ] `13-onboarding/getting-started.md` — Onboarding yangilash
- [ ] `14-practicals/demo-credentials.md` — Amaliy topshiriqlar

**Mas'ul:** BA + SA + Tech Lead
**Muddat:** Loyiha boshida yoki standart o'zgarganda

---

## 🚨 Majburiy Yangilanishlar (Har bir PR uchun)

Har qanday PR uchun quyidagilar **MAJBURIY**:

- [ ] `12-changelog/CHANGELOG.md` — Har doim yangilanadi
- [ ] `doc-update-checklist.md` — Ushbu checklist to'ldiriladi
- [ ] PR description da o'zgarish turi belgilanadi (1-10 raqamlardan)
- [ ] Reviewerlar tayinlanadi (kamida 2 ta)
- [ ] `PROJECT_CONTEXT.md` dolzarbligi tekshiriladi

---

## ✅ Tasdiqlash Jarayoni

```
1. Developer → O'zgarish qiladi
2. Developer → Ushbu checklist ni to'ldiradi
3. Developer → PR yaratadi (o'zgarish turi belgilanadi)
4. Reviewer 1 → Kod review + hujjat review
5. Reviewer 2 → Cross-reference tekshiruv
6. Team Lead → Final tasdiqlash
7. Merge → CHANGELOG avtomatik yangilanadi
```

---

## 📊 Cross-Reference Matritsasi

Qaysi hujjat o'zgarganda qaysilarni tekshirish kerak:

| O'zgargan hujjat | Tekshirish kerak |
|---|---|
| `01-business/*` | → `02-requirements/*`, `03-use-cases/*`, `09-modules/*` |
| `02-requirements/*` | → `03-use-cases/*`, `06-api-specification/*`, `11-testing/*` |
| `03-use-cases/*` | → `02-requirements/*`, `09-modules/*`, `11-testing/*` |
| `04-architecture/*` | → `05-data-architecture/*`, `06-api-specification/*`, `10-devops/*` |
| `05-data-architecture/*` | → `06-api-specification/*`, `09-modules/*`, `08-security/*` |
| `06-api-specification/*` | → `07-integrations/*`, `09-modules/*`, `11-testing/*` |
| `07-integrations/*` | → `06-api-specification/*`, `08-security/*`, `04-architecture/*` |
| `08-security/*` | → `09-modules/*`, `10-devops/*`, `02-requirements/*` |
| `09-modules/*` | → `06-api-specification/*`, `11-testing/*`, `05-data-architecture/*` |
| `10-devops/*` | → `13-onboarding/*`, `08-security/*` |
| `11-testing/*` | → `02-requirements/*`, `03-use-cases/*` |

---

## 👥 Mas'uliyat Matritsasi

| Rol | Asosiy hujjat mas'uliyati | Qo'shimcha |
|-----|---------------------------|------------|
| **Frontend Developer** | `09-modules/*` (UI bo'limlari), `03-use-cases/user-stories.md` | Component docs |
| **Backend Developer** | `06-api-specification/*`, `05-data-architecture/*`, `09-modules/*` (API bo'limlari) | Migration files |
| **DevOps Engineer** | `10-devops/*`, `13-onboarding/getting-started.md` | CI/CD config |
| **Business Analyst** | `01-business/*`, `02-requirements/*`, `03-use-cases/*` | Traceability |
| **Product Owner** | `01-business/vision-scope.md`, `01-business/business-rules.md` | Priority/scope |
| **QA Engineer** | `11-testing/*`, `14-practicals/*` | Test automation |
| **Security Specialist** | `08-security/*` | Compliance audit |
| **Team Lead** | `04-architecture/*`, `12-changelog/*`, `PROJECT_CONTEXT.md` | Final review |

---

## 🔄 Avtomatlashtirilgan Tekshiruvlar

Quyidagi tekshiruvlar CI/CD pipeline da avtomatlashtirilishi kerak:

1. **PR Template** — O'zgarish turi va checklist majburiy maydonlar
2. **Lint Check** — Markdown formatini tekshirish
3. **Link Check** — Ichki linklar ishlaydimi
4. **Changelog Check** — `CHANGELOG.md` yangilanganmi
5. **Schema Sync** — `schema.prisma` o'zgarsa, data-architecture tekshiruv

---

> 📅 **Oxirgi yangilanish:** 2026-03-25
> 📌 **Versiya:** 2.0.0 (Namuna asosida kengaytirilgan)
