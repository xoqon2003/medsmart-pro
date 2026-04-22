---
name: mock-to-real
description: Frontend mock service'ni haqiqiy backend API chaqiruviga ko'chirish. `src/services/mock/*` → `src/services/api/*` migrasiyasi. openapi-typescript orqali tip generatsiyasi.
---

# Mock → Real migration

## Vaziyat

MVP vaqtida frontend `src/services/mock/` dagi soxta ma'lumotlar bilan ishlagan. Backend tayyor bo'lgandan keyin real chaqiruvga ko'chiriladi.

## Qadam-qadam

### 1. Tip generatsiyasi
```bash
pnpm dlx openapi-typescript server/openapi.json -o src/app/types/api.generated.ts
```

### 2. Axios klient
```typescript
// src/services/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('jwt');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      // refresh token logic
    }
    return Promise.reject(err);
  },
);
```

### 3. Service file migrasiyasi

**Avval** (`src/services/mock/consultation.ts`):
```typescript
export const getConsultation = async (id: string) => mockData[id];
```

**Keyin** (`src/services/api/consultation.ts`):
```typescript
import { api } from './client';
import type { paths } from '../../app/types/api.generated';

type GetRes = paths['/api/v1/consultation/{id}']['get']['responses']['200']['content']['application/json'];

export const getConsultation = (id: string) =>
  api.get<GetRes>(`/consultation/${id}`).then((r) => r.data);
```

### 4. Komponent imports

`import { getConsultation } from '@/services/mock/consultation'` → `from '@/services/api/consultation'`.

### 5. Error handling

React Query yoki SWR ishlating (agar hali yo'q bo'lsa, Context-based simple cache). 401 → login redirect. Network error → toast (`sonner`).

### 6. Feature flag

`VITE_USE_MOCK=true` → mock, `false` → real. `src/services/index.ts` aggregator:
```typescript
export * from import.meta.env.VITE_USE_MOCK === 'true' ? './mock' : './api';
```

### 7. Test

MSW (Mock Service Worker) bilan integration test — real API shape'iga mos mock javoblar.

## Checklist

- [ ] openapi.json yangi
- [ ] Tiplar regen qilingan
- [ ] Axios klient + interceptors
- [ ] Har mock service'ga mos api service
- [ ] Komponent importlar yangilangan
- [ ] 401/500 handling
- [ ] `.env.example` yangilangan (`VITE_API_URL`, `VITE_USE_MOCK`)
- [ ] E2E test (playwright) yashil
