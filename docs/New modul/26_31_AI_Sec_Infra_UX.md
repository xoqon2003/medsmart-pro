# MedSmart Pro — Arxitektura Hujjatlari (26-31)

---

# 26. AI/ML ARCHITECTURE

## 1. MODEL TANLOVI
- **Asosiy:** Claude Sonnet (sifat + tibbiy bilim)
- **Fallback:** GPT-4
- **Embedding:** OpenAI text-embedding-3
- **Speech-to-text:** Whisper (uz/ru/en)

## 2. RAG ARXITEKTURASI
```
Bemor savoli → Embedding → Vector DB qidiruv (top-10)
  → Tibbiy KB'dan kontekst → LLM prompt → Javob
```

## 3. PROMPT STRATEGIYASI
- **System prompt:** "Sen tibbiy yordamchisan, lekin yakuniy tashxis bermaysan..."
- **Few-shot:** 5-10 namuna
- **Chain-of-thought:** "Avval simptomlarni tahlil qil, keyin..."
- **Guard rails:** dori dozasi bermaslik, faqat tavsiya

## 4. HALLUCINATION PREVENTION
- RAG majburiy
- Faqat KB ichidagi tashxislar
- Confidence threshold: 60%+ bo'lsa ko'rsatish
- Fact-checking layer
- Ekspert review (statistik tanlov)

## 5. MONITORING
- Har response log qilinadi
- Confidence taqsimoti
- Foydalanuvchi feedback
- Shifokor validatsiyasi (real keyslar)
- A/B testing

## 6. QAYTA O'QITISH
- Oylik fine-tuning (real ma'lumotlar asosida)
- Anonimlashtirilgan dataset
- Ekspert tasdig'i bilan

## 7. ETIK AI
- Bias monitoring (jins, yosh, etnik)
- Shaffoflik (qaror sabablarini ko'rsatish)
- Bemor avtonomiyasi

---

# 27. INTEGRATION ARCHITECTURE

## 1. TASHQI TIZIMLAR
| Tizim | Maqsad | Protokol |
|---|---|---|
| Click/Payme/Uzum | To'lov | REST API + webhook |
| Eskiz.uz | SMS | REST |
| Google Maps | Klinika xaritasi | REST |
| Laboratoriyalar | Tahlil natijalari | REST/HL7 FHIR |
| Klinika ERP | Navbat sinxronizatsiya | REST/webhook |
| Firebase | Push notification | SDK |
| Sentry | Xato monitoring | SDK |

## 2. INTEGRATSIYA PATTERNLARI
- **Synchronous:** REST (real-time)
- **Asynchronous:** Message queue (RabbitMQ/Bull)
- **Event-driven:** Webhooks
- **Batch:** Cron jobs (kunlik sync)

## 3. MA'LUMOT TRANSFORMATSIYASI
- ETL pipeline'lar
- Adapter pattern (har bir tashqi tizim uchun)
- Standartlash (HL7 FHIR ga o'tkazish)

## 4. XATO BOSHQARUVI
- Retry with exponential backoff
- Circuit breaker
- Dead letter queue
- Alerting

---

# 28. SECURITY ARCHITECTURE

## 1. THREAT MODEL (STRIDE)
| Threat | Tavsifi | Mitigation |
|---|---|---|
| Spoofing | Soxta foydalanuvchi | MFA, JWT |
| Tampering | Ma'lumot o'zgartirish | HMAC, audit log |
| Repudiation | Inkor etish | Audit log, imzolar |
| Info disclosure | Sizish | Shifrlash, RBAC |
| DoS | Hujum | Rate limiting, WAF |
| Elevation | Privilege oshirish | RBAC, principle of least privilege |

## 2. AUTH
- **OAuth 2.0 + OpenID Connect**
- **JWT** (access 15 min, refresh 7 kun)
- **RBAC** + ABAC
- **MFA** (SMS, TOTP)

## 3. SHIFRLASH
- **In-transit:** TLS 1.3
- **At-rest:** AES-256
- **PHI:** alohida key (HSM)
- **Backup:** shifrlangan

## 4. NETWORK SECURITY
- WAF (Cloudflare)
- DDoS protection
- VPC, private subnets
- Bastion host
- IP whitelisting (admin)

## 5. SECRET MANAGEMENT
- AWS Secrets Manager / HashiCorp Vault
- Hech qachon kodda emas
- Rotation (90 kunda)

## 6. PEN TEST REJASI
- Yiliga 2 marta tashqi pen-test
- Quartal ichki audit
- Bug bounty programma

## 7. INCIDENT RESPONSE
- 24/7 monitoring
- Incident response team
- Playbook (qadamma-qadam)
- Post-mortem majburiy

---

# 29. INFRASTRUCTURE / DEVOPS

## 1. CLOUD
- **Asosiy:** AWS Frankfurt (eu-central-1) — GDPR/HIPAA
- **Mahalliy backup:** O'zbekiston DC (PHI uchun)
- **CDN:** Cloudflare

## 2. SERVICES
- **Compute:** EKS (Kubernetes)
- **DB:** RDS PostgreSQL Multi-AZ
- **Cache:** ElastiCache Redis
- **Storage:** S3 + Backblaze B2 (backup)
- **Queue:** SQS / RabbitMQ

## 3. CI/CD PIPELINE
```
Git push → GitHub Actions
  → Lint → Test → Build → Security scan
  → Docker build → Push to ECR
  → Deploy to staging → Smoke tests
  → Manual approval → Deploy to prod
```

## 4. MONITORING
- **Metrics:** Prometheus + Grafana
- **Logs:** Loki / ELK stack
- **APM:** Sentry, Datadog
- **Uptime:** UptimeRobot
- **Alerting:** PagerDuty

## 5. BACKUP
- DB: kunlik full + 1 soatlik incremental
- 3-2-1 qoidasi (3 nusxa, 2 turli media, 1 offsite)
- Yiliga 2 marta restore drill

## 6. IaC
- Terraform (AWS resurslari)
- Helm charts (Kubernetes)
- Ansible (configuration)

---

# 30. UI/UX DESIGN SYSTEM

## 1. BREND
- **Logo:** Tibbiy + AI uyg'unligi
- **Slogan:** "Cho'ntagingizdagi tibbiy yordamchi"

## 2. RANG PALITRA
- **Asosiy:** #2563EB (ishonch ko'k)
- **Yordamchi:** #10B981 (yashil — sog'lik)
- **Ogohlantirish:** #F59E0B (sariq)
- **Xavf:** #EF4444 (qizil — red flag)
- **Neutral:** kulrang shkala

## 3. TIPOGRAFIKA
- **Sarlavha:** Inter Bold
- **Matn:** Inter Regular
- **O'zbek/rus uchun:** Cyrillic support

## 4. KOMPONENTLAR
- Buttons (primary, secondary, danger, ghost)
- Forms (input, select, textarea, slider)
- Cards (diagnosis, doctor, clinic)
- Modals
- Toasts
- Progress bars
- Body map (interaktiv)

## 5. WIREFRAME'LAR
- Splash, login, onboarding, home, simptom kiritish, savol-javob, natija, klinika ro'yxati, navbat, profil, EMR

## 6. ACCESSIBILITY
- WCAG 2.1 AA
- Kontrast 4.5:1+
- Keyboard navigation
- Screen reader support
- Katta shrift opsiyasi (keksalar uchun)
- Ovoz orqali boshqaruv

## 7. MICROINTERACTIONS
- Loading skeletons
- Smooth transitions
- Haptic feedback (mobile)

---

# 31. MOBILE APP ARCHITECTURE

## 1. TANLOV
**React Native + Expo** — kross-platform, tezroq

## 2. ASOSIY XUSUSIYATLAR
- Push notification (Firebase)
- Offline mode (oxirgi murojaatlar keshda)
- Biometrik auth (Face ID, fingerprint)
- Camera (hujjat skanlash)
- Mikrofon (ovoz orqali simptom)
- GPS
- Calendar integration

## 3. STATE MANAGEMENT
- Zustand yoki Redux Toolkit
- React Query (server state)

## 4. NAVIGATSIYA
- React Navigation (stack + tab)

## 5. PERFORMANCE
- Lazy loading
- Image optimization
- FlashList (long lists)

## 6. RELEASE
- TestFlight (iOS), Internal Testing (Android)
- Phased rollout
- OTA updates (Expo)

**Hujjat oxiri.**
