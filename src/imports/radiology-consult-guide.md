

AMALGA OSHIRISH QO'LLANMASI
Radiologik Konsultatsiya — Telegram Mini App
Real loyihani noldan ishga tushirishning to'liq texnik qo'llanmasi
Hujjat turi:	Amalga oshirish qo'llanmasi (Implementation Guide)
Texnologiyalar:	React + TypeScript + Node.js + PostgreSQL + Telegram WebApp API
Bosqich:	MVP (Boshlang'ich ishlaydigan versiya)
Taxminiy vaqt:	4-6 hafta (1 tajribali dasturchi)
Hosting:	Railway.app (backend) + Vercel (frontend) — arzon va tez


  1. TELEGRAM BOT VA MINI APP SOZLASH  

1.1. BotFather orqali bot yaratish
Telegram da @BotFather ga yozing va quyidagi buyruqlarni kiriting:
  BotFather buyruqlari

/newbot
→ Bot nomi: Radiolog Konsultatsiya
→ Username: radiology_consult_bot  (yoki boshqa bo'sh nom)

Natija: BOT_TOKEN olasiz:
7123456789:AAF_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


Keyin Mini App (WebApp) ulash:
  Mini App ulash

/newapp
→ Botni tanlang: @radiology_consult_bot
→ Title: Radiologik Konsultatsiya
→ Description: Masofaviy radiologik tashxis xizmati
→ Photo: (logotip rasmini yuboring)
→ Web App URL: https://your-frontend.vercel.app
→ Short name: radconsult

Natija: Mini App manzili: t.me/radiology_consult_bot/radconsult


1.2. Bot Webhook sozlash
Bot xabarlarni olishi uchun webhook o'rnatilishi kerak:
  Terminal buyrug'i

# Webhookni o'rnatish (deploy qilgandan keyin bajarish)
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-backend.railway.app/webhook/telegram",
    "allowed_updates": ["message", "callback_query", "web_app_data"]
  }'


1.3. Menu Button sozlash
Foydalanuvchi botga kirganda Mini App tugmasi ko'rinishi uchun:
  Menu tugmasini sozlash

curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton \
  -H 'Content-Type: application/json' \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Konsultatsiya olish",
      "web_app": { "url": "https://your-frontend.vercel.app" }
    }
  }'

  2. LOYIHA PAPKA TUZILMASI  

2.1. Umumiy tuzilma
  Papka tuzilmasi

radiology-app/
├── frontend/                    # React Mini App
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # UI komponentlar
│   │   │   ├── screens/         # Har bir ekran
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── SplashScreen.tsx
│   │   │   │   │   ├── RoleSelect.tsx
│   │   │   │   │   └── PatientProfile.tsx
│   │   │   │   ├── Patient/
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   ├── Anamnez.tsx
│   │   │   │   │   ├── ServiceSelect.tsx
│   │   │   │   │   ├── Contract.tsx
│   │   │   │   │   ├── Payment.tsx
│   │   │   │   │   ├── StatusTracker.tsx
│   │   │   │   │   └── Conclusion.tsx
│   │   │   │   ├── Radiolog/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── ApplicationView.tsx
│   │   │   │   │   └── ConclusionEditor.tsx
│   │   │   │   └── Operator/
│   │   │   │       └── OperatorPanel.tsx
│   │   │   ├── ui/              # Umumiy UI elementlar
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── FileUploader.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useTelegram.ts   # Telegram WebApp API
│   │   │   ├── useAuth.ts
│   │   │   └── useApplication.ts
│   │   ├── api/                 # Backend so'rovlar
│   │   │   ├── client.ts        # Axios instance + interceptors
│   │   │   ├── auth.ts
│   │   │   ├── applications.ts
│   │   │   ├── payments.ts
│   │   │   └── files.ts
│   │   ├── store/               # Zustand global holat
│   │   │   ├── authStore.ts
│   │   │   └── appStore.ts
│   │   ├── types/               # TypeScript turlar
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   ├── i18n/                # Tarjimalar
│   │   │   ├── uz.json
│   │   │   └── ru.json
│   │   └── App.tsx              # Router va asosiy komponent
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Node.js API server
│   ├── src/
│   │   ├── routes/              # API yo'nalishlari
│   │   │   ├── auth.ts
│   │   │   ├── applications.ts
│   │   │   ├── payments.ts
│   │   │   ├── files.ts
│   │   │   ├── radiolog.ts
│   │   │   └── operator.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT tekshirish
│   │   │   ├── telegramAuth.ts  # initData verifikatsiya
│   │   │   └── rateLimit.ts
│   │   ├── services/
│   │   │   ├── telegramService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── storageService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── notificationService.ts
│   │   ├── db/
│   │   │   ├── schema.sql       # Jadval yaratish
│   │   │   ├── migrations/
│   │   │   └── queries.ts       # DB so'rovlar
│   │   ├── webhook/
│   │   │   ├── telegram.ts      # Bot webhook handler
│   │   │   └── payment.ts       # Payme/Click webhook
│   │   └── index.ts             # Server kirish nuqtasi
│   ├── package.json
│   └── .env.example
│
└── docker-compose.yml           # Local ishlab chiqish


  3. MUHIT O'ZGARUVCHILARI (.env)  

3.1. Backend .env fayli
  backend/.env

# ===== SERVER =====
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# ===== TELEGRAM =====
BOT_TOKEN=7123456789:AAF_xxxxxxxxxxxxxxxxxxxxxxxx
WEBHOOK_SECRET=random_64_char_string_here

# ===== DATABASE =====
DATABASE_URL=postgresql://user:pass@host:5432/radiology_db

# ===== JWT =====
JWT_SECRET=another_random_64_char_string
JWT_EXPIRES_IN=7d

# ===== FAYL SAQLASH (Backblaze B2) =====
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=radiology-files
B2_BUCKET_ID=your_bucket_id
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com

# ===== TO'LOV TIZIMLARI =====
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_payme_secret
PAYME_TEST_SECRET_KEY=your_test_secret
PAYME_IS_TEST=false

CLICK_SERVICE_ID=your_service_id
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SECRET_KEY=your_click_secret

# ===== AI (ixtiyoriy) =====
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# ===== ADMIN TELEGRAM ID =====
ADMIN_TELEGRAM_ID=123456789
RADIOLOG_TELEGRAM_ID=987654321


3.2. Frontend .env fayli
  frontend/.env

VITE_API_URL=https://your-backend.railway.app
VITE_BOT_USERNAME=radiology_consult_bot
VITE_APP_ENV=production


  4. MA'LUMOTLAR BAZASI — TO'LIQ SQL  

4.1. Jadvallar yaratish (schema.sql)
  db/schema.sql

-- Foydalanuvchilar
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  telegram_username VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'patient'
    CHECK (role IN ('patient','radiolog','operator','admin')),
  full_name VARCHAR(200),
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('male','female')),
  city VARCHAR(100),
  chronic_diseases TEXT,
  language VARCHAR(5) DEFAULT 'uz',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Arizalar
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  ariza_number VARCHAR(20) UNIQUE NOT NULL,
  patient_id INT REFERENCES users(id),
  radiolog_id INT REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','paid_pending','accepted',
      'extra_info_needed','with_specialist',
      'conclusion_writing','done','failed','archived')),
  scan_type VARCHAR(50) NOT NULL,
  organ VARCHAR(100),
  service_type VARCHAR(30)
    CHECK (service_type IN ('ai_radiolog','radiolog_only','radiolog_specialist')),
  urgency VARCHAR(20) DEFAULT 'normal'
    CHECK (urgency IN ('normal','urgent','emergency')),
  scan_date DATE,
  scan_facility VARCHAR(200),
  price DECIMAL(12,2) NOT NULL,
  deadline_at TIMESTAMP,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Anamnez
CREATE TABLE anamnez (
  id SERIAL PRIMARY KEY,
  application_id INT UNIQUE REFERENCES applications(id),
  complaint TEXT NOT NULL,
  duration VARCHAR(50),
  has_pain BOOLEAN DEFAULT false,
  pain_level INT CHECK (pain_level BETWEEN 1 AND 10),
  previous_treatment TEXT,
  medications TEXT,
  allergies TEXT,
  additional_info TEXT
);

-- Fayllar
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  application_id INT REFERENCES applications(id),
  file_type VARCHAR(20)
    CHECK (file_type IN ('dicom','image','pdf','other')),
  original_name VARCHAR(300),
  s3_key VARCHAR(500) NOT NULL,
  size_bytes BIGINT,
  mime_type VARCHAR(100),
  is_deleted BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Shartnomalar
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  application_id INT UNIQUE REFERENCES applications(id),
  patient_id INT REFERENCES users(id),
  accepted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT,
  telegram_user_id BIGINT NOT NULL,
  contract_version VARCHAR(10) DEFAULT '1.0',
  pdf_s3_key VARCHAR(500)
);

-- To'lovlar
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  application_id INT REFERENCES applications(id),
  amount DECIMAL(12,2) NOT NULL,
  provider VARCHAR(20)
    CHECK (provider IN ('payme','click','uzum','cash')),
  provider_transaction_id VARCHAR(200),
  provider_time BIGINT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','paid','cancelled','refunded')),
  paid_at TIMESTAMP,
  receipt_s3_key VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Xulosalar
CREATE TABLE conclusions (
  id SERIAL PRIMARY KEY,
  application_id INT UNIQUE REFERENCES applications(id),
  radiolog_id INT REFERENCES users(id),
  description TEXT,
  findings TEXT NOT NULL,
  impression TEXT NOT NULL,
  recommendations TEXT,
  ai_analysis JSONB,
  pdf_s3_key VARCHAR(500),
  signed_at TIMESTAMP DEFAULT NOW()
);

-- Indekslar (tezlik uchun)
CREATE INDEX idx_applications_patient ON applications(patient_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_radiolog ON applications(radiolog_id);
CREATE INDEX idx_files_application ON files(application_id);
CREATE INDEX idx_payments_application ON payments(application_id);

-- Ariza raqami generatsiya funksiyasi
CREATE OR REPLACE FUNCTION generate_ariza_number()
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'RAD-' || TO_CHAR(NOW(), 'YYYY') || '-'
    || LPAD(nextval('ariza_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
CREATE SEQUENCE ariza_seq START 1;


  5. BACKEND — ASOSIY KODLAR  

5.1. Server kirish nuqtasi (index.ts)
  backend/src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRouter from './routes/auth';
import applicationsRouter from './routes/applications';
import paymentsRouter from './routes/payments';
import radiologRouter from './routes/radiolog';
import telegramWebhook from './webhook/telegram';
import paymentWebhook from './webhook/payment';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 daqiqa
  max: 100,
  message: 'Juda ko\'p so\'rov. Keyinroq urinib ko\'ring.'
});
app.use('/api/', limiter);

// Webhook — raw body kerak (to'lov tekshirish uchun)
app.use('/webhook/telegram', express.raw({type: '*/*'}), telegramWebhook);
app.use('/webhook/payment', express.raw({type: '*/*'}), paymentWebhook);

// API yo'nalishlari
app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/radiolog', radiologRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server ishga tushdi: port', process.env.PORT);
});


5.2. Telegram autentifikatsiya (telegramAuth.ts)
💡  Bu ENG MUHIM xavfsizlik qadami. Har bir so'rovda Telegram imzosi tekshiriladi.
  backend/src/middleware/telegramAuth.ts

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function verifyTelegramInitData(initData: string): any | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // Saralangan juftliklar ro'yxati
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // HMAC-SHA256 hisoblash
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN!)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return null;

  // Vaqt tekshirish (1 soatdan eski bo'lmasin)
  const authDate = parseInt(params.get('auth_date') || '0');
  if (Date.now() / 1000 - authDate > 3600) return null;

  return JSON.parse(params.get('user') || 'null');
}

// Middleware
export async function telegramAuthMiddleware(
  req: Request, res: Response, next: NextFunction
) {
  const initData = req.headers['x-telegram-init-data'] as string;
  if (!initData) return res.status(401).json({ error: 'initData yo\'q' });

  const telegramUser = verifyTelegramInitData(initData);
  if (!telegramUser) return res.status(401).json({ error: 'Imzo noto\'g\'ri' });

  (req as any).telegramUser = telegramUser;
  next();
}


5.3. Auth Route — login/register
  backend/src/routes/auth.ts

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { telegramAuthMiddleware } from '../middleware/telegramAuth';
import { db } from '../db/queries';

const router = Router();

// POST /api/auth/telegram
router.post('/telegram', telegramAuthMiddleware, async (req, res) => {
  const tgUser = (req as any).telegramUser;

  // Foydalanuvchini topish yoki yaratish
  let user = await db.findUserByTelegramId(tgUser.id);

  if (!user) {
    user = await db.createUser({
      telegram_user_id: tgUser.id,
      telegram_username: tgUser.username,
      full_name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
      role: 'patient'
    });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, telegramId: tgUser.id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({ token, user, isNewUser: !user.full_name });
});

// POST /api/auth/set-role  (Radiolog/Operator PIN kiritish)
router.post('/set-role', telegramAuthMiddleware, async (req, res) => {
  const { pin, requestedRole } = req.body;
  const tgUser = (req as any).telegramUser;

  // PIN ni env da saqlangan bilan solishtirish
  const correctPin = process.env[`${requestedRole.toUpperCase()}_PIN`];
  if (pin !== correctPin) {
    return res.status(403).json({ error: 'PIN noto\'g\'ri' });
  }

  await db.updateUserRole(tgUser.id, requestedRole);
  res.json({ success: true });
});

export default router;


5.4. Fayl yuklash (presigned URL orqali)
💡  Katta fayllar uchun: backend → presigned URL → frontend to'g'ridan B2/S3 ga yuklaydi. Server yuklamas!
  backend/src/routes/files.ts (qisqartirilgan)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

// POST /api/files/presign — frontend presigned URL so'raydi
router.post('/presign', jwtAuth, async (req, res) => {
  const { fileName, fileType, applicationId } = req.body;

  // Ruxsat etilgan formatlar
  const allowed = ['image/jpeg','image/png','application/pdf',
                   'application/dicom','application/zip'];
  if (!allowed.includes(fileType)) {
    return res.status(400).json({ error: 'Format qabul qilinmaydi' });
  }

  const s3Key = `applications/${applicationId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: s3Key,
    ContentType: fileType,
    ServerSideEncryption: 'AES256',
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  // DB ga fayl yozuvi qo'shish (hali uploaded emas)
  const fileRecord = await db.createFileRecord({
    application_id: applicationId,
    s3_key: s3Key,
    original_name: fileName,
    mime_type: fileType,
  });

  res.json({ presignedUrl, s3Key, fileId: fileRecord.id });
});

// POST /api/files/confirm — yuklash tugaganini bildirish
router.post('/confirm', jwtAuth, async (req, res) => {
  const { fileId, sizeBytes } = req.body;
  await db.confirmFileUpload(fileId, sizeBytes);
  res.json({ success: true });
});


  6. TO'LOV TIZIMLARI INTEGRATSIYASI  

6.1. Payme integratsiyasi
Payme merchant API orqali ishlaydi. Ular sizga so'rovlar yuboradi (sizning serveringiz endpoint bo'ladi):
  backend/src/webhook/payment.ts (Payme qismi)

// webhook/payment.ts  — Payme bizga so'rov yuboradi

const PAYME_METHODS: Record<string, Function> = {
  'CheckPerformTransaction': checkPerform,
  'CreateTransaction':       createTransaction,
  'PerformTransaction':      performTransaction,
  'CancelTransaction':       cancelTransaction,
  'CheckTransaction':        checkTransaction,
};

router.post('/payme', async (req, res) => {
  // Basic auth tekshirish
  const authHeader = req.headers.authorization || '';
  const base64 = authHeader.replace('Basic ', '');
  const decoded = Buffer.from(base64, 'base64').toString();
  const [, key] = decoded.split(':');

  const expectedKey = process.env.PAYME_IS_TEST === 'true'
    ? process.env.PAYME_TEST_SECRET_KEY
    : process.env.PAYME_SECRET_KEY;

  if (key !== expectedKey) {
    return res.json({ error: { code: -32504, message: 'Insufficient privilege' } });
  }

  const { method, params, id } = req.body;
  const handler = PAYME_METHODS[method];

  if (!handler) {
    return res.json({ id, error: { code: -32601, message: 'Method not found' } });
  }

  const result = await handler(params);
  res.json({ id, result });
});

// CheckPerformTransaction — to'lov mumkinmi tekshirish
async function checkPerform(params: any) {
  const { account, amount } = params;
  const application = await db.findApplicationByArizaNumber(account.ariza_number);

  if (!application) return { error: { code: -31050, message: 'Ariza topilmadi' } };
  if (application.status !== 'new') return { error: { code: -31051, message: 'To\'lov qabul qilinmaydi' } };
  if (amount !== application.price * 100) return { error: { code: -31001, message: 'Summa noto\'g\'ri' } };

  return { allow: true };
}

// PerformTransaction — to'lov amalga oshirildi
async function performTransaction(params: any) {
  const payment = await db.findPaymentByProviderTxId(params.id);
  if (!payment) return { error: { code: -31003, message: 'Transaction topilmadi' } };

  await db.updatePaymentStatus(payment.id, 'paid');
  await db.updateApplicationStatus(payment.application_id, 'paid_pending');

  // Radiologga bildirishnoma yuborish
  await notifyRadiolog(payment.application_id);

  return { transaction: params.id, perform_time: Date.now(), state: 2 };
}


6.2. To'lov oynasini ochish (Frontend)
  frontend/src/api/payments.ts

// Frontend: To'lov havolasini yaratish va ochish

export function openPaymePayment(arizaNumber: string, amount: number) {
  const merchantId = import.meta.env.VITE_PAYME_MERCHANT_ID;

  // account ni base64 ga aylantirish
  const account = btoa(JSON.stringify({ ariza_number: arizaNumber }));

  // Summa tiyin da (so'm * 100)
  const amountInTiyin = amount * 100;

  const paymeUrl = `https://checkout.paycom.uz/${merchantId}?a=${amountInTiyin}&ac.ariza_number=${arizaNumber}&l=uz`;

  // Telegram WebApp orqali ochish
  window.Telegram.WebApp.openLink(paymeUrl);
}

// To'lov holatini polling orqali tekshirish
export async function pollPaymentStatus(applicationId: number): Promise<string> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const { status } = await api.get(`/applications/${applicationId}/status`);
      if (status !== 'new') {
        clearInterval(interval);
        resolve(status);
      }
    }, 3000); // har 3 soniyada tekshir

    // 30 daqiqa kutish maksimum
    setTimeout(() => { clearInterval(interval); resolve('timeout'); }, 1800000);
  });
}


  7. FRONTEND — ASOSIY KODLAR  

7.1. Telegram WebApp hook (useTelegram.ts)
  frontend/src/hooks/useTelegram.ts

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: { WebApp: TelegramWebApp };
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    tg?.ready();                    // Telegram ga tayyor ekanligimizni bildirish
    tg?.expand();                   // To'liq ekranga kengaytirish
    tg?.setHeaderColor('#1e3a8a'); // Header rangi
  }, []);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData,         // Backend ga yuboriladi
    colorScheme: tg?.colorScheme,   // 'light' | 'dark'
    themeParams: tg?.themeParams,

    // Orqaga tugmasini ko'rsatish/yashirish
    showBackButton: (onClick: () => void) => {
      tg?.BackButton.show();
      tg?.BackButton.onClick(onClick);
    },
    hideBackButton: () => {
      tg?.BackButton.hide();
    },

    // Asosiy tugma (pastdagi katta tugma)
    showMainButton: (text: string, onClick: () => void) => {
      tg?.MainButton.setText(text);
      tg?.MainButton.show();
      tg?.MainButton.onClick(onClick);
    },
    hideMainButton: () => tg?.MainButton.hide(),
    setMainButtonLoading: (loading: boolean) => {
      loading ? tg?.MainButton.showProgress() : tg?.MainButton.hideProgress();
    },

    // Haptic feedback (titroq)
    haptic: {
      success: () => tg?.HapticFeedback.notificationOccurred('success'),
      error:   () => tg?.HapticFeedback.notificationOccurred('error'),
      tap:     () => tg?.HapticFeedback.impactOccurred('light'),
    },

    // Yorliq yopilishidan oldin ogohlantirish
    enableClosingConfirmation: () => tg?.enableClosingConfirmation(),
  };
}


7.2. API Client (axios + interceptors)
  frontend/src/api/client.ts

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  timeout: 30000,
});

// Har so'rovga JWT va initData qo'shish
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Telegram initData ham yuboriladi (ikkilamchi tekshirish)
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) config.headers['X-Telegram-Init-Data'] = initData;

  return config;
});

// Xato qayta ishlash
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.reload();
    }
    const message = error.response?.data?.error || 'Xato yuz berdi';
    window.Telegram?.WebApp?.showAlert(message);
    return Promise.reject(error);
  }
);


7.3. Fayl yuklash komponenti
  frontend/src/api/files.ts

export async function uploadFile(
  file: File,
  applicationId: number,
  onProgress: (pct: number) => void
): Promise<string> {

  // 1. Backenddan presigned URL olish
  const { presignedUrl, s3Key, fileId } = await apiClient.post('/files/presign', {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    applicationId,
  });

  // 2. To'g'ridan B2/S3 ga yuklash (progress bilan)
  await axios.put(presignedUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      const pct = Math.round((e.loaded * 100) / (e.total || 1));
      onProgress(pct);
    },
  });

  // 3. Backendga tasdiqlash
  await apiClient.post('/files/confirm', { fileId, sizeBytes: file.size });

  return s3Key;
}


7.4. App.tsx — Router tuzilmasi
  frontend/src/App.tsx

import { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './store/authStore';
// Ekranlar import...

type Screen = 'splash' | 'role' | 'profile' |
  'upload' | 'anamnez' | 'service' | 'contract' | 'payment' | 'status' | 'conclusion' |
  'radiolog_dash' | 'radiolog_view' | 'radiolog_conclude' |
  'operator_dash';

export default function App() {
  const { tg, user, initData, showBackButton, hideBackButton } = useTelegram();
  const { currentUser, login } = useAuthStore();
  const [screen, setScreen] = useState<Screen>('splash');
  const [history, setHistory] = useState<Screen[]>([]);

  const navigate = (to: Screen) => {
    setHistory(h => [...h, screen]);
    setScreen(to);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) { setHistory(h => h.slice(0, -1)); setScreen(prev); }
  };

  // Back button boshqarish
  useEffect(() => {
    if (history.length > 0) showBackButton(goBack);
    else hideBackButton();
  }, [history]);

  // Autentifikatsiya
  useEffect(() => {
    if (!initData) return;
    login(initData).then((user) => {
      if (user.isNewUser) navigate('role');
      else if (user.role === 'patient') navigate('upload');
      else if (user.role === 'radiolog') navigate('radiolog_dash');
      else if (user.role === 'operator') navigate('operator_dash');
    });
  }, [initData]);

  const screens: Record<Screen, JSX.Element> = {
    splash:           <SplashScreen />,
    role:             <RoleSelect onSelect={(r) => r==='patient' ? navigate('profile') : navigate('pin')} />,
    profile:          <PatientProfile onDone={() => navigate('upload')} />,
    upload:           <FileUpload onDone={() => navigate('anamnez')} />,
    anamnez:          <Anamnez onDone={() => navigate('service')} />,
    service:          <ServiceSelect onDone={() => navigate('contract')} />,
    contract:         <Contract onAccepted={() => navigate('payment')} />,
    payment:          <Payment onPaid={() => navigate('status')} />,
    status:           <StatusTracker onReady={() => navigate('conclusion')} />,
    conclusion:       <Conclusion />,
    radiolog_dash:    <RadiologDashboard onOpen={(id) => navigate('radiolog_view')} />,
    radiolog_view:    <ApplicationView onConclude={() => navigate('radiolog_conclude')} />,
    radiolog_conclude:<ConclusionEditor onDone={() => navigate('radiolog_dash')} />,
    operator_dash:    <OperatorPanel />,
  };

  return <div className='app'>{screens[screen]}</div>;
}


  8. TELEGRAM BILDIRISHNOMALAR  

8.1. Telegram xabar yuborish servisi
  backend/src/services/notificationService.ts

// services/notificationService.ts
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

// Mini App tugmasi bilan xabar
export async function sendWithMiniAppButton(
  telegramId: number,
  text: string,
  buttonText: string,
  path: string  // '?screen=status&appId=123'
) {
  const url = `https://your-frontend.vercel.app${path}`;
  await bot.sendMessage(telegramId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{
        text: buttonText,
        web_app: { url }
      }]]
    }
  });
}

// Bemorga — ariza qabul qilindi
export async function notifyPatientApplicationReceived(application: any) {
  const text = [
    '✅ <b>Arizangiz qabul qilindi!</b>',
    '',
    `📋 Ariza: <b>${application.ariza_number}</b>`,
    `🔬 Tasvir turi: ${application.scan_type}`,
    `⏰ Muddat: ${getDeadlineText(application.urgency)}`,
    '',
    '📩 Xulosa tayyor bo\'lganda xabar beramiz.',
  ].join('\n');

  await sendWithMiniAppButton(
    application.patient_telegram_id,
    text, '👁️ Ariza holatini kuzatish',
    `?screen=status&appId=${application.id}`
  );
}

// Radiologga — yangi ariza
export async function notifyRadiologNewApplication(application: any) {
  const urgencyEmoji = { normal: '🟢', urgent: '🟡', emergency: '🔴' };
  const text = [
    `${urgencyEmoji[application.urgency]} <b>Yangi ariza!</b>`,
    '',
    `📋 ${application.ariza_number}`,
    `👤 ${application.patient_name}`,
    `🔬 ${application.scan_type} — ${application.organ}`,
    `💰 ${application.price.toLocaleString()} so'm`,
    `⚡ Muhimlik: ${application.urgency}`,
  ].join('\n');

  await sendWithMiniAppButton(
    parseInt(process.env.RADIOLOG_TELEGRAM_ID!),
    text, '📂 Arizani ko\'rish',
    `?screen=radiolog_view&appId=${application.id}`
  );
}

// Bemorga — xulosa tayyor
export async function notifyPatientConclusionReady(application: any, pdfUrl: string) {
  const text = [
    '🎉 <b>Xulosingiz tayyor!</b>',
    '',
    `📋 Ariza: <b>${application.ariza_number}</b>`,
    `👨‍⚕️ Radiolog: ${application.radiolog_name}`,
    '',
    '⬇️ Quyida PDF ni yuklab olishingiz mumkin.',
  ].join('\n');

  // Xabar + Mini App tugmasi
  await sendWithMiniAppButton(
    application.patient_telegram_id,
    text, '📄 Xulosani ko\'rish',
    `?screen=conclusion&appId=${application.id}`
  );

  // PDF faylni ham to'g'ridan chat ga yuborish
  await bot.sendDocument(application.patient_telegram_id, pdfUrl, {
    caption: `📄 ${application.ariza_number} — Radiologik xulosa`
  });
}


  9. PDF XULOSA GENERATSIYA  

9.1. PDFKit orqali xulosa PDF
  backend/src/services/pdfService.ts

import PDFDocument from 'pdfkit';
import { uploadBuffer } from './storageService';

export async function generateConclusionPDF(data: {
  application: any;
  patient: any;
  radiolog: any;
  conclusion: any;
}): Promise<string> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers: Buffer[] = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  // ─── HEADER ───
  doc.fontSize(18).font('Helvetica-Bold')
     .text('RADIOLOGIK XULOSA', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica')
     .text(`Ariza raqami: ${data.application.ariza_number}`, { align: 'center' })
     .text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2563eb');
  doc.moveDown();

  // ─── BEMOR MA'LUMOTLARI ───
  doc.fontSize(12).font('Helvetica-Bold').text('BEMOR:');
  doc.fontSize(11).font('Helvetica')
     .text(`Ism: ${data.patient.full_name}`)  
     .text(`Tug'ilgan: ${data.patient.birth_date}`)  
     .text(`Jinsi: ${data.patient.gender === 'male' ? 'Erkak' : 'Ayol'}`);
  doc.moveDown();

  // ─── TASVIR HAQIDA ───
  doc.fontSize(12).font('Helvetica-Bold').text('TASVIR:');
  doc.fontSize(11).font('Helvetica')
     .text(`Turi: ${data.application.scan_type}`)  
     .text(`Soha: ${data.application.organ}`)  
     .text(`Olingan sana: ${data.application.scan_date}`);
  doc.moveDown();

  // ─── XULOSA ───
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#93c5fd');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text('TASVIR TAVSIFI:');
  doc.fontSize(11).font('Helvetica').text(data.conclusion.description);
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('TOPILMALAR:');
  doc.fontSize(11).font('Helvetica').text(data.conclusion.findings);
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('XULOSA:');
  doc.fontSize(11).font('Helvetica').text(data.conclusion.impression);
  doc.moveDown();

  if (data.conclusion.recommendations) {
    doc.fontSize(12).font('Helvetica-Bold').text('TAVSIYALAR:');
    doc.fontSize(11).font('Helvetica').text(data.conclusion.recommendations);
    doc.moveDown();
  }

  // ─── MUHIM IZOH ───
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#fbbf24');
  doc.moveDown(0.5);
  doc.fontSize(9).font('Helvetica').fillColor('#6b7280')
     .text('⚠️ Ushbu xulosa faqat taqdim etilgan tasvir asosida berilgan. Klinik ko\'rik o\'rnini bosa olmaydi.');
  doc.moveDown();

  // ─── RADIOLOG IMZOSI ───
  doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
     .text(`Radiolog: ${data.radiolog.full_name}`)
     .font('Helvetica')
     .text(`Litsenziya: ${data.radiolog.license_number}`)  
     .text(`Imzolangan: ${new Date().toLocaleString('uz-UZ')}`);

  doc.end();

  await new Promise(r => doc.on('end', r));
  const pdfBuffer = Buffer.concat(buffers);

  // B2/S3 ga yuklash
  const s3Key = `conclusions/${data.application.id}/xulosa.pdf`;
  await uploadBuffer(s3Key, pdfBuffer, 'application/pdf');

  return s3Key;
}


  10. DEPLOY — ISHGA TUSHIRISH  

10.1. Backend — Railway.app (bepul boshlash mumkin)
  Railway deploy

# 1. railway.app da ro'yxatdan o'ting (GitHub bilan)
# 2. 'New Project' → 'Deploy from GitHub repo'
# 3. backend/ papkasini tanlang
# 4. PostgreSQL qo'shish: 'Add Plugin' → PostgreSQL
# 5. Muhit o'zgaruvchilarni kiritish: Settings → Variables
#    BOT_TOKEN, JWT_SECRET, B2_*, PAYME_* ...
# 6. Start command: node dist/index.js
# 7. Build command: npm run build

# package.json scripts:
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node-dev src/index.ts"
}


10.2. Frontend — Vercel (bepul)
  Vercel deploy

# 1. vercel.com da ro'yxatdan o'ting
# 2. 'New Project' → GitHub repo → frontend/ papka
# 3. Framework: Vite
# 4. Muhit o'zgaruvchilar: VITE_API_URL, VITE_BOT_USERNAME
# 5. Deploy

# MUHIM: vercel.json fayli (frontend/ ichida)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}


10.3. Ma'lumotlar bazasi — Railway PostgreSQL yoki Supabase
  DB o'rnatish

# Railway PostgreSQL — avtomatik DATABASE_URL beriladi
# Schema o'rnatish:
npx ts-node src/db/migrate.ts

# Yoki Supabase (bepul 500MB):
# 1. supabase.com → New project
# 2. SQL Editor → schema.sql ni paste qiling → Run
# 3. Settings → Database → Connection string olish


10.4. Backblaze B2 sozlash (fayl saqlash)
  Backblaze B2 sozlash

# 1. backblaze.com → B2 Cloud Storage → Create Bucket
#    Bucket name: radiology-files-prod
#    Files in Bucket are: Private
# 2. App Keys → Add a New Application Key
#    Key Name: radiology-app
#    Allow access to bucket: radiology-files-prod
#    Type of access: Read and Write
# 3. Natija: applicationKeyId va applicationKey
#    Bu ikkalasi .env ga kiritiladi

# CORS sozlash (B2 console → Bucket → CORS Rules):
[{"corsRuleName":"allow-upload","allowedOrigins":["https://your-frontend.vercel.app"],"allowedHeaders":["*"],"allowedOperations":["s3_put"],"maxAgeSeconds":3600}]


  11. BARCHA KERAKLI PAKETLAR  

11.1. Backend package.json
  backend/package.json

"dependencies": {
  "express": "^4.18",
  "cors": "^2.8",
  "helmet": "^7.1",
  "express-rate-limit": "^7.1",
  "jsonwebtoken": "^9.0",
  "pg": "^8.11",              // PostgreSQL
  "node-telegram-bot-api": "^0.65",
  "@aws-sdk/client-s3": "^3.0",   // B2 bilan ishlash
  "@aws-sdk/s3-request-presigner": "^3.0",
  "pdfkit": "^0.14",         // PDF generatsiya
  "axios": "^1.6",
  "dotenv": "^16.3",
  "bull": "^4.12"            // Queue (bildirishnomalar)
},
"devDependencies": {
  "typescript": "^5.3",
  "@types/express": "^4.17",
  "@types/node": "^20",
  "ts-node-dev": "^2.0"
}


11.2. Frontend package.json
  frontend/package.json

"dependencies": {
  "react": "^18.2",
  "react-dom": "^18.2",
  "typescript": "^5.3",
  "axios": "^1.6",
  "zustand": "^4.4",         // Global holat boshqarish
  "react-hook-form": "^7.49", // Forma boshqarish
  "zod": "^3.22",            // Validatsiya
  "i18next": "^23.7",        // Kop tillik
  "react-i18next": "^13.5",
  "clsx": "^2.0"             // Dinamik class nomlari
},
"devDependencies": {
  "vite": "^5.0",
  "@vitejs/plugin-react": "^4.2",
  "tailwindcss": "^3.4",
  "autoprefixer": "^10.4"
}


  12. XAVFSIZLIK — TEKSHIRUV RO'YXATI  

Ishga tushirishdan oldin tekshiring:
✅ Telegram initData	Har so'rovda HMAC-SHA256 imzo tekshiriladi
✅ JWT token	Barcha himoyalangan yo'nalishlarda tekshiriladi
✅ Rol tekshiruvi	Radiolog/Operator endpointlari role: middleware bilan himoyalangan
✅ Rate limiting	API: 100 so'rov/10 daqiqa. Fayl yuklash: 10/soat
✅ Fayl turi	Faqat ruxsat etilgan MIME turlar qabul qilinadi
✅ Fayl hajmi	500MB cheki (presigned URL da ham, nginx da ham)
✅ HTTPS	Railway va Vercel avtomatik SSL beradi
✅ CORS	Faqat FRONTEND_URL dan so'rovlar qabul qilinadi
✅ SQL injection	Parameterized queries (pg library default)
✅ .env	Hech qachon Git ga push qilinmasin — .gitignore da
⚠️ PDF URL	Vaqtinchalik presigned URL (1 soat), bemorga to'g'ri URL beriladi
⚠️ DICOM ma'lumotlar	S3 da private bucket — to'g'ridan kirish yo'q

  13. BIRINCHI MARTA ISHGA TUSHIRISH TARTIBI  

Tartib bo'yicha:
1️⃣  GitHub repo yarating: radiology-app nomi bilan, public yoki private
2️⃣  BotFather: @BotFather da bot yarating, BOT_TOKEN oling
3️⃣  Backblaze B2: Bucket va API key yarating
4️⃣  Payme merchant: business.payme.uz da ro'yxat, YaTT hujjatlari bilan
5️⃣  Railway.app: Backend deploy + PostgreSQL plugin qo'shing
6️⃣  DB schema: schema.sql ni Railway PostgreSQL ga ulang va ishga tushiring
7️⃣  Vercel: Frontend deploy, VITE_API_URL ni Railway URL ga bog'lang
8️⃣  Webhook: Bot webhook + menu button sozlang (1.1 va 1.2 bo'limlardagi buyruqlar)
9️⃣  Test: O'zingiz bemor sifatida kirib sinab ko'ring
🔟  Radiolog PIN: .env da RADIOLOG_PIN=123456 o'rnating, rol sozlang

⚠️  Payme merchant ro'yxati 5-10 ish kunini olishi mumkin. Avval test rejimida ishlab, keyin real rejimga o'ting.
💡  Railway.app bepul rejim: $5 kredit/oy. MVP uchun yetadi. O'sgan sayin pro planga o'ting.


Ushbu qo'llanma 1 tajribali dasturchi uchun MVP ni 4-6 haftada ishga tushirish uchun yetarli.
