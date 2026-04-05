# Test Strategiyasi

> **Hujjat ID:** TST-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25 | **Standart:** ISTQB / ISO 29119

## Test piramidasi

```
        ┌──────────┐
        │  E2E     │  ← Kam (muhim oqimlar)
        │  Tests   │
        ├──────────┤
        │Integration│  ← O'rta (service + component)
        │  Tests   │
        ├──────────┤
        │  Unit    │  ← Ko'p (funksiya, util, hook)
        │  Tests   │
        └──────────┘
```

## Test turlari

### 1. Unit testlar
- **Maqsad:** Individual funksiya va komponentlarni tekshirish
- **Texnologiya:** Vitest + React Testing Library
- **Qamrov:** Utility funksiyalar, custom hooklar, pure komponentlar
- **Target coverage:** 80%+

**Misollar:**
- `formatPrice(150000)` → "150 000 so'm"
- `getStatusLabel('accepted')` → "Qabul qilindi"
- `calculatePrice('ai_radiolog', 'urgent')` → 225000

### 2. Integratsiya testlari
- **Maqsad:** Komponentlar orasidagi aloqani tekshirish
- **Texnologiya:** Vitest + React Testing Library
- **Qamrov:** Service layer, AppStore, form oqimlari

**Misollar:**
- Auth service → AppStore → UI yangilanishi
- Ariza yaratish → to'lov → status o'zgarishi
- Notification yaratish → unreadCount yangilanishi

### 3. E2E testlar (kelajak)
- **Maqsad:** To'liq foydalanuvchi oqimlarini tekshirish
- **Texnologiya:** Playwright
- **Qamrov:** Muhim biznes oqimlari

**Misollar:**
- Bemor ariza topshirish oqimi (7 bosqich)
- Web login → dashboard → ariza ko'rish
- Kassir smena ochish → to'lov qabul qilish → smena yopish

## Test qamrovi maqsadlari

| Modul | Unit | Integration | E2E | Jami maqsad |
|-------|------|------------|-----|-------------|
| AUTH | 90% | 80% | + | 85% |
| APP | 85% | 75% | + | 80% |
| RAD | 85% | 75% | + | 80% |
| PAY | 90% | 85% | + | 85% |
| KONS | 80% | 70% | - | 75% |
| TKS | 80% | 70% | - | 75% |
| HV | 80% | 70% | - | 75% |
| WEB | 75% | 70% | + | 72% |

## Test muhitlari

| Muhit | Maqsad | Ma'lumot |
|-------|--------|---------|
| Development | Tez tekshirish | Mock data |
| Staging | Pre-production test | Test database |
| Production | Smoke test | Real data (read-only) |

## Test jarayoni

```
Feature branch yaratish
  → Kod yozish
  → Unit test yozish
  → Local test o'tkazish (npm run test)
  → PR yaratish
  → CI pipeline (lint + type-check + test)
  → Code review
  → Merge to develop
  → Staging test
  → Merge to main
  → Smoke test (production)
```
