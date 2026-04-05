# Yangi Xodimlar Uchun Qo'llanma

> **Hujjat ID:** ONB-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Tez boshlash (15 daqiqa)

### 1. Loyihani yuklab olish
```bash
git clone <repository-url>
cd "Delop qilingani (Claude code)"
```

### 2. Dependency o'rnatish
```bash
npm install
```

### 3. Development serverni ishga tushirish
```bash
npm run dev
```

### 4. Brauzerda ochish
- **Mini App:** http://localhost:5173/
- **Web Panel:** http://localhost:5173/web

### 5. Demo login (Web Panel)
1. http://localhost:5173/web sahifasini oching
2. Telefon: `+998903333333`, PIN: `000000` (Admin rol)
3. Dashboard ochiladi

## Loyiha tuzilishi

```
src/
├── app/
│   ├── App.tsx              ← Mini App router
│   ├── WebApp.tsx           ← Web Platform router
│   ├── components/
│   │   ├── screens/         ← Rol asosida ekranlar
│   │   └── ui/              ← shadcn/ui komponentlari
│   ├── store/appStore.tsx   ← Global state (React Context)
│   ├── types/index.ts       ← TypeScript interfeyslari
│   └── data/mockData.ts     ← Mock ma'lumotlar
├── services/
│   └── mock/                ← Mock service implementations
└── styles/                  ← CSS fayllar
```

## Asosiy tushunchalar

### 1. Dual Interface
- **Mini App** (`/`) - Telegram botdan ochiladigan mobil interfeys
- **Web Platform** (`/web`) - Desktop brauzerdan ochiladi
- Ikkalasi bitta AppStore va Services dan foydalanadi

### 2. Screen-based Navigation (Mini App)
```typescript
const { navigate, goBack, currentScreen } = useApp()
navigate('patient_upload')  // Yangi ekranga o'tish
goBack()                    // Ortga qaytish
```

### 3. Role-based Access
Har bir rol o'z ekranlariga ega. `currentUser.role` asosida navigatsiya boshqariladi.

### 4. Mock → API almashtirish
`src/services/index.ts` da importni o'zgartiring:
```typescript
// Hozir:
export * from './mock'
// Kelajakda:
export * from './api'
```

## Demo foydalanuvchilar

| Rol | Telefon | PIN | Nima qilish mumkin |
|-----|---------|-----|-------------------|
| Bemor | +998901234567 | 0000 | Ariza topshirish, xulosa ko'rish |
| Radiolog | +998901111111 | 123456 | Arizalarni ko'rish, xulosa yozish |
| Shifokor | +998907777777 | 777777 | Konsultatsiya, bemor ko'rish |
| Operator | +998902222222 | 654321 | Barcha arizalarni boshqarish |
| Kassir | +998908888888 | 222222 | To'lov qabul qilish |
| Admin | +998903333333 | 000000 | KPI, statistika, tizim boshqarish |

## Foydali havolalar

- [Hujjatlar markazi](../README.md)
- [Arxitektura](../04-architecture/architecture-design.md)
- [API spetsifikatsiya](../06-api-specification/api-endpoints.yaml)
- [Biznes qoidalari](../01-business/business-rules.md)
- [RBAC modeli](../08-security/rbac-model.md)

## Texnologiya steki

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| React | 18.3 | UI framework |
| TypeScript | - | Type safety |
| Vite | 6.3 | Build tool |
| Tailwind CSS | 4.1 | Styling |
| shadcn/ui | - | UI components |
| React Hook Form | 7.55 | Form management |
| Recharts | 2.15 | Charts |
| jsPDF | 4.2 | PDF generation |
| Motion.js | 12.23 | Animations |
