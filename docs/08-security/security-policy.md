# Xavfsizlik Siyosati

> **Hujjat ID:** SEC-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## 1. Autentifikatsiya

### Mini App (Telegram)
- Telegram `initData` orqali foydalanuvchini aniqlash
- `initData` server tomonida tekshiriladi (HMAC-SHA256)
- JWT token beriladi (muddati: 7 kun)

### Web Platform
- Telefon raqami + PIN kod
- OTP (bir martalik parol) orqali tasdiqlash
- JWT token beriladi (muddati: 7 kun)

### Token boshqaruvi
```
Access Token:  7 kun (JWT)
Refresh Token: 30 kun (kelajak)
```

## 2. Avtorizatsiya (RBAC)

- Har bir API endpoint rolga asoslangan ruxsat tekshiradi
- Batafsil: [rbac-model.md](./rbac-model.md)
- Middleware qatlami: `@Roles('admin', 'operator')` dekoratorlari (kelajak NestJS)

## 3. Ma'lumot himoyasi

### Transport qatlami
- HTTPS (TLS 1.3) - Vercel tomonidan ta'minlanadi
- HSTS header: `Strict-Transport-Security: max-age=31536000`

### Ma'lumot saqlash
| Ma'lumot turi | Shifrlash | Qo'shimcha |
|--------------|----------|-----------|
| Parollar/PIN | bcrypt (12 rounds) | Salt bilan |
| Tibbiy ma'lumotlar | AES-256-GCM | At-rest encryption |
| Fayl saqlash | AES-256 | Server-side encryption |
| API tokenlar | JWT RS256 | Asimmetrik |

### Xavfsizlik headerlar
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 4. OWASP Top 10 himoyasi

| # | Tahdid | Himoya chorasi | Holat |
|---|--------|---------------|-------|
| A01 | Broken Access Control | RBAC middleware, resurs egaligi tekshiruvi | Tayyor |
| A02 | Cryptographic Failures | AES-256, bcrypt, TLS 1.3 | Qisman |
| A03 | Injection | Parameterized queries, input sanitization | Rejada |
| A04 | Insecure Design | Threat modeling, security review | Rejada |
| A05 | Security Misconfiguration | Security headers, minimal exposure | Tayyor |
| A06 | Vulnerable Components | npm audit, Dependabot | Rejada |
| A07 | Auth Failures | Rate limiting, account lockout | Rejada |
| A08 | Data Integrity | Input validation, CSRF tokens | Qisman |
| A09 | Logging Failures | Audit log, centralized logging | Tayyor |
| A10 | SSRF | URL validation, whitelist | Rejada |

## 5. Audit Logging

### Qayd qilinadigan harakatlar
- Tizimga kirish/chiqish
- Ariza yaratish/o'zgartirish
- Holat o'zgarishi
- To'lov operatsiyalari
- Xulosa yozish/o'zgartirish
- Foydalanuvchi ma'lumotlari o'zgarishi

### Log formati
```json
{
  "id": 1,
  "applicationId": 100,
  "action": "STATUS_CHANGED",
  "actorId": 2,
  "actorRole": "radiolog",
  "actorName": "Jasur Yusupov",
  "details": {
    "from": "accepted",
    "to": "conclusion_writing"
  },
  "at": "2026-03-25T10:30:00Z"
}
```

## 6. Input Validation

- Barcha foydalanuvchi kiritmalari server tomonida tekshiriladi
- Telefon: `/^\+998\d{9}$/`
- PIN: `/^\d{6}$/`
- Fayl hajmi: max 50MB
- Fayl turi: DICOM, JPG, PNG, PDF, ZIP
- XSS himoyasi: HTML teglarni tozalash

## 7. Rate Limiting (kelajak)

| Endpoint | Limit | Oyna |
|---------|-------|------|
| /auth/send-otp | 3 | 1 daqiqa |
| /auth/login | 5 | 5 daqiqa |
| /applications (POST) | 10 | 1 soat |
| /files (POST) | 20 | 1 soat |
| Umumiy API | 100 | 1 daqiqa |
