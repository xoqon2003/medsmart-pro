import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { extrasService } from '../../../../services/api/extrasService';
import type { TelegramBotConfig } from '../../../types';
import { ChevronLeft, Send, Loader2, Save, Link, Radio } from 'lucide-react';

export function DoctorTelegramBot() {
  const { goBack } = useApp();
  const [config, setConfig] = useState<TelegramBotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ channelUrl: '', autoPost: false });

  useEffect(() => {
    extrasService.getTelegramBot()
      .then(c => {
        setConfig(c);
        if (c) setForm({ channelUrl: c.channelUrl ?? '', autoPost: c.autoPost });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await extrasService.upsertTelegramBot({
        channelUrl: form.channelUrl || undefined,
        autoPost: form.autoPost,
      });
      setConfig(updated);
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Telegram Bot</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Send size={24} className="text-white" />
            <div>
              <p className="text-white font-semibold text-sm">Telegram integratsiya</p>
              <p className="text-sky-200 text-xs">Kanalingizga avtomatik post yuborish</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              <Link size={12} className="inline mr-1" /> Kanal manzili
            </label>
            <input
              value={form.channelUrl}
              onChange={e => setForm(prev => ({ ...prev, channelUrl: e.target.value }))}
              placeholder="https://t.me/your_channel"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Radio size={14} className="text-green-500" /> Avtomatik post
              </p>
              <p className="text-xs text-gray-500">Yangi xizmat/FAQ qo'shilganda kanalga yuboriladi</p>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, autoPost: !prev.autoPost }))}
              className={`w-12 h-6 rounded-full transition-colors ${form.autoPost ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.autoPost ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
