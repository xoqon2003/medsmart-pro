# Nofunksional Talablar

> **Hujjat ID:** REQ-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25 | **Standart:** ISO 25010

## Ishlash (Performance)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-PERF-001 | Sahifa yuklash vaqti | < 3 soniya (3G) | Yuqori |
| NFR-PERF-002 | API javob vaqti | < 500ms (p95) | Yuqori |
| NFR-PERF-003 | Fayl yuklash | < 10 soniya (50MB gacha) | O'rta |
| NFR-PERF-004 | PDF generatsiya | < 5 soniya | O'rta |

## Ishonchlilk (Reliability)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-REL-001 | Tizim mavjudligi | 99.5% yillik | Yuqori |
| NFR-REL-002 | Ma'lumot yo'qotmaslik | 0 lost transactions | Yuqori |
| NFR-REL-003 | Xato qayta tiklash | < 5 daqiqa | O'rta |

## Xavfsizlik (Security)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-SEC-001 | HTTPS (TLS 1.3) | Barcha so'rovlar | Yuqori |
| NFR-SEC-002 | JWT token muddati | 7 kun | Yuqori |
| NFR-SEC-003 | RBAC kirish nazorati | Barcha endpointlar | Yuqori |
| NFR-SEC-004 | Tibbiy ma'lumot shifrlash | AES-256 | Yuqori |
| NFR-SEC-005 | Audit logging | Barcha muhim harakatlar | Yuqori |
| NFR-SEC-006 | OWASP Top 10 himoyasi | 0 critical vulnerability | Yuqori |

## Foydalanish qulayligi (Usability)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-USE-001 | Mobil moslashuvchanlik | 320px - 1920px | Yuqori |
| NFR-USE-002 | Minimal o'rganish vaqti | < 15 daqiqa (bemor) | O'rta |
| NFR-USE-003 | Xatolik xabarlari | Tushunarli, o'zbek tilida | Yuqori |
| NFR-USE-004 | Accessibility | WCAG 2.1 AA | Past |

## Masshtablilik (Scalability)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-SCAL-001 | Bir vaqtdagi foydalanuvchilar | 500+ concurrent | O'rta |
| NFR-SCAL-002 | Ma'lumotlar hajmi | 100GB+ | O'rta |
| NFR-SCAL-003 | Gorizontal masshtablash | Kubernetes auto-scale | Kelajak |

## Qo'llab-quvvatlanish (Maintainability)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-MAIN-001 | Kod qoplamliligi (test) | > 80% | O'rta |
| NFR-MAIN-002 | TypeScript strict mode | 100% | Yuqori |
| NFR-MAIN-003 | Hujjatlashtirish | Barcha modullar | O'rta |
| NFR-MAIN-004 | Modular arxitektura | Modul mustaqilligi | Yuqori |

## Moslik (Compatibility)

| ID | Talab | Metrika | Ustuvorlik |
|----|-------|---------|-----------|
| NFR-COMP-001 | Brauzer qo'llashi | Chrome 90+, Safari 15+, Firefox 90+ | Yuqori |
| NFR-COMP-002 | Telegram WebApp API | v6.0+ | Yuqori |
| NFR-COMP-003 | Mobil OS | iOS 14+, Android 10+ | Yuqori |
