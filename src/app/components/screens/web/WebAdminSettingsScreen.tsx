import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const TABS = ['Umumiy', 'Bildirishnoma', 'Xavfsizlik', 'Integratsiya'] as const;

const SETTINGS: Record<string, { label: string; key: string; type: 'text' | 'number' | 'toggle' | 'select'; value: any; options?: string[] }[]> = {
  Umumiy: [
    { label: 'Tizim nomi', key: 'app_name', type: 'text', value: 'MedSmartPro' },
    { label: 'Versiya', key: 'app_version', type: 'text', value: '2.0.0' },
    { label: 'Texnik ishlar rejimi', key: 'maintenance_mode', type: 'toggle', value: false },
    { label: 'Standart til', key: 'default_language', type: 'select', value: 'uz', options: ['uz', 'ru', 'en'] },
    { label: 'Max fayl hajmi (MB)', key: 'max_upload_mb', type: 'number', value: 20 },
    { label: 'Sahifalash limiti', key: 'page_size', type: 'number', value: 25 },
  ],
  Bildirishnoma: [
    { label: 'SMS provider', key: 'sms_provider', type: 'select', value: 'eskiz', options: ['eskiz', 'playmobile', 'infobip'] },
    { label: 'Push notification', key: 'push_enabled', type: 'toggle', value: true },
    { label: 'Email notification', key: 'email_enabled', type: 'toggle', value: true },
    { label: 'Email yuboruvchi', key: 'email_from', type: 'text', value: 'noreply@medsmart.uz' },
    { label: 'SMTP host', key: 'smtp_host', type: 'text', value: 'smtp.gmail.com' },
    { label: 'Telegram bot', key: 'telegram_bot_enabled', type: 'toggle', value: true },
  ],
  Xavfsizlik: [
    { label: 'OTP muddati (daqiqa)', key: 'otp_expiry_min', type: 'number', value: 5 },
    { label: 'JWT muddati (soat)', key: 'jwt_expiry_hours', type: 'number', value: 24 },
    { label: 'Max login urinishlari', key: 'max_login_attempts', type: 'number', value: 5 },
    { label: 'Sessiya muddati (daqiqa)', key: 'session_timeout_min', type: 'number', value: 60 },
    { label: 'PIN kod majburiy', key: 'pin_required', type: 'toggle', value: true },
    { label: 'CSRF himoya', key: 'csrf_enabled', type: 'toggle', value: true },
    { label: 'Rate limit (req/min)', key: 'rate_limit', type: 'number', value: 100 },
  ],
  Integratsiya: [
    { label: 'Payme integratsiya', key: 'payme_enabled', type: 'toggle', value: true },
    { label: 'Click integratsiya', key: 'click_enabled', type: 'toggle', value: true },
    { label: 'Uzum integratsiya', key: 'uzum_enabled', type: 'toggle', value: true },
    { label: 'Telegram bot token', key: 'telegram_token', type: 'text', value: '••••••••••••••••••' },
    { label: 'Webhook URL', key: 'webhook_url', type: 'text', value: 'https://api.medsmart.uz/webhooks' },
    { label: 'S3 bucket', key: 's3_bucket', type: 'text', value: 'medsmart-files' },
  ],
};

export function WebAdminSettingsScreen() {
  const [tab, setTab] = useState<typeof TABS[number]>('Umumiy');
  const [saved, setSaved] = useState(false);

  return (
    <WebPlatformLayout title="Tizim sozlamalari" subtitle="Kalit-qiymat konfiguratsiya">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setSaved(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t}</button>
            ))}
          </div>
          <button onClick={() => setSaved(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saqlandi</> : <><Save className="w-4 h-4" /> Saqlash</>}
          </button>
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">{tab} sozlamalari</h3>
          <div className="space-y-5 max-w-2xl">
            {SETTINGS[tab].map(s => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-slate-300 text-sm">{s.label}</label>
                  <p className="text-slate-600 text-xs">{s.key}</p>
                </div>
                {s.type === 'toggle' ? (
                  <button className={`w-10 h-5 rounded-full transition-colors ${s.value ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${s.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                ) : s.type === 'select' ? (
                  <select defaultValue={s.value} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none w-48">
                    {s.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input defaultValue={s.value} type={s.type === 'number' ? 'number' : 'text'}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none w-48 focus:border-indigo-500" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
