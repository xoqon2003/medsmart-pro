# API Versiyalash Siyosati

> **Hujjat ID:** API-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Versiyalash strategiyasi

### SemVer (Semantic Versioning)
```
MAJOR.MINOR.PATCH
  │      │     └── Bug fix, backward compatible
  │      └──────── Yangi funksiya, backward compatible
  └─────────────── Breaking change
```

### URL versiyalash
```
/api/v1/applications
/api/v1/users
/api/v2/applications  (kelajakda)
```

## API konventsiyalari

### Endpoint nomlash
```
GET    /api/v1/applications          # Ro'yxat
GET    /api/v1/applications/:id      # Bitta
POST   /api/v1/applications          # Yaratish
PUT    /api/v1/applications/:id      # Yangilash
DELETE /api/v1/applications/:id      # O'chirish (soft delete)
```

### Javob formati
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Xato formati
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Telefon raqami noto'g'ri formatda",
    "details": [
      { "field": "phone", "message": "Format: +998XXXXXXXXX" }
    ]
  }
}
```

### HTTP status kodlari

| Kod | Ma'nosi | Qachon ishlatiladi |
|-----|---------|-------------------|
| 200 | OK | Muvaffaqiyatli so'rov |
| 201 | Created | Yangi resurs yaratildi |
| 400 | Bad Request | Validatsiya xatosi |
| 401 | Unauthorized | Autentifikatsiya kerak |
| 403 | Forbidden | Ruxsat yo'q |
| 404 | Not Found | Resurs topilmadi |
| 409 | Conflict | Ziddiyat (masalan, takroriy) |
| 500 | Internal Error | Server xatosi |

## Breaking Changes siyosati

1. Breaking change oldidan kamida 2 sprint oldin ogohlantirish
2. Eski versiya kamida 3 oy davomida qo'llab-quvvatlanadi
3. Migration guide tayyorlanadi
4. `12-changelog/CHANGELOG.md` ga yoziladi
