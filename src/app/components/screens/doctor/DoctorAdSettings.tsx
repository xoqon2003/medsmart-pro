import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { extrasService } from '../../../../services/api/extrasService';
import type { AdSetting } from '../../../types';
import { ChevronLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react';

export function DoctorAdSettings() {
  const { goBack } = useApp();
  const [settings, setSettings] = useState<AdSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    extrasService.getAdSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof AdSetting, value: boolean) => {
    setSaving(true);
    try {
      const updated = await extrasService.upsertAdSettings({ [key]: value });
      setSettings(updated);
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  const items = [
    { key: 'showBannerAds' as const, label: 'Banner reklamalar', desc: 'Sahifa tepasida va pastida' },
    { key: 'showPopupAds' as const, label: 'Popup reklamalar', desc: 'Ekranda chiqadigan reklamalar' },
    { key: 'showInFeedAds' as const, label: 'Feed reklamalar', desc: "Ro'yxat ichidagi reklamalar" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Reklama sozlamalari</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {items.map(item => {
          const active = settings?.[item.key] ?? true;
          return (
            <div key={item.key} className="bg-white rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {active ? <Eye size={18} className="text-gray-400" /> : <EyeOff size={18} className="text-green-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.key, !active)}
                disabled={saving}
                className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-gray-300' : 'bg-green-500'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-0.5' : 'translate-x-6'}`} />
              </button>
            </div>
          );
        })}

        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-xs text-amber-700">
            Premium tarifda barcha reklamalarni to'liq o'chirishingiz mumkin.
          </p>
        </div>
      </div>
    </div>
  );
}
