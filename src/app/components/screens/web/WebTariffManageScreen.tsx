import React, { useState, useEffect } from 'react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { tariffService } from '../../../../services/api/tariffService';
import type { Tariff } from '../../../types';
import { Crown, Edit3, RefreshCw, Users, Zap, Star, Gift } from 'lucide-react';

const TARIFF_ICONS: Record<string, React.ReactNode> = {
  FREE: <Gift size={20} />,
  START: <Zap size={20} />,
  LITE: <Star size={20} />,
  PREMIUM: <Crown size={20} />,
};

const TARIFF_COLORS: Record<string, string> = {
  FREE: 'from-gray-600 to-gray-700',
  START: 'from-blue-600 to-blue-700',
  LITE: 'from-purple-600 to-purple-700',
  PREMIUM: 'from-amber-600 to-amber-700',
};

export function WebTariffManageScreen() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tariffService.getAll()
      .then(setTariffs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    price === 0 ? 'Bepul' : `${price.toLocaleString('uz-UZ')} so'm/oy`;

  return (
    <WebPlatformLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-100">Tarif boshqaruvi</h1>
            <p className="text-sm text-gray-400">Tarif rejalarini ko'rish va tahrirlash</p>
          </div>
          <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/20">
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Yuklanmoqda...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {tariffs.map(tariff => {
              const features = tariff.features as any;
              return (
                <div key={tariff.id} className={`rounded-2xl p-5 bg-gradient-to-br ${TARIFF_COLORS[tariff.code] ?? 'from-gray-600 to-gray-700'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      {TARIFF_ICONS[tariff.code]}
                    </div>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <Edit3 size={14} className="text-white" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white">{tariff.name}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{formatPrice(tariff.price)}</p>
                  <p className="text-xs text-white/60 mt-1">{tariff.description}</p>

                  <div className="mt-4 space-y-2">
                    <FeatureRow label="Bemorlar" value={features?.maxPatients === -1 ? 'Cheksiz' : features?.maxPatients ?? 0} />
                    <FeatureRow label="Portfolio" value={features?.hasPortfolio ? 'Ha' : 'Yo\'q'} />
                    <FeatureRow label="Kalendar" value={features?.hasCalendar ? 'Ha' : 'Yo\'q'} />
                    <FeatureRow label="FAQ limiti" value={features?.faqLimit === -1 ? 'Cheksiz' : features?.faqLimit ?? 0} />
                    <FeatureRow label="Xizmatlar" value={features?.servicesLimit === -1 ? 'Cheksiz' : features?.servicesLimit ?? 0} />
                    <FeatureRow label="Reklama" value={features?.showAds ? 'Bor' : 'Yo\'q'} />
                    <FeatureRow label="Telegram bot" value={features?.hasTelegramBot ? 'Ha' : 'Yo\'q'} />
                    <FeatureRow label="Anonim nomer" value={features?.hasAnonymousNumber ? 'Ha' : 'Yo\'q'} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-1 text-white/80 text-xs">
                      <Users size={12} />
                      <span>Holati: {tariff.isActive ? 'Faol' : 'Nofaol'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WebPlatformLayout>
  );
}

function FeatureRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}
