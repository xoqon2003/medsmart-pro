import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckSquare, ChevronRight, FileText, Shield, Square } from 'lucide-react';
import { motion } from 'motion/react';

export function ConfirmationWithContract(props: {
  title: string;
  subtitle?: string;
  summaryRows: Array<{ label: string; value: React.ReactNode }>;
  contractText: string;
  confirmText?: string;
  loadingText?: string;
  onBack: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const {
    title,
    subtitle,
    summaryRows,
    contractText,
    confirmText = "Tasdiqlash va To'lovga o'tish",
    loadingText = 'Yaratilmoqda...',
    onBack,
    onConfirm,
  } = props;

  const [checks, setChecks] = useState({ contract: false, pdpl: false, disclaimer: false });
  const [loading, setLoading] = useState(false);

  const allChecked = useMemo(() => checks.contract && checks.pdpl && checks.disclaimer, [checks]);

  const toggle = (key: keyof typeof checks) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleConfirm = async () => {
    if (!allChecked || loading) return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">{title}</h1>
            {subtitle && <p className="text-blue-200 text-xs">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Ma'lumotlar xulosasi</p>
          <div className="space-y-2">
            {summaryRows.map((item) => (
              <div key={item.label} className="flex justify-between py-1 border-b border-gray-50 last:border-0 gap-4">
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-gray-800 text-sm text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700 text-sm">Shartnoma matni</p>
          </div>
          <div className="h-48 overflow-y-auto bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
            {contractText}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-gray-700 text-sm mb-2">Rozilik (barcha 3 ta majburiy)</p>
          {[
            { key: 'contract' as const, label: "Konsultatsiya shartlarini o'qidim va qabul qilaman" },
            { key: 'pdpl' as const, label: "Shaxsiy ma'lumotlarimni qayta ishlashga roziman (PDPL 2019)" },
            { key: 'disclaimer' as const, label: "Xizmat klinik ko'rik o'rnini bosa olmasligini tushunaman" },
          ].map((item) => (
            <button key={item.key} onClick={() => toggle(item.key)} className="flex items-start gap-3 w-full text-left">
              {checks[item.key] ? (
                <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${checks[item.key] ? 'text-gray-800' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-xs">
            Tasdiqlash bosilganda elektron imzo qayd etiladi: Telegram ID, timestamp va IP manzil.
          </p>
        </div>

        {!allChecked && (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs">Davom etish uchun barcha 3 ta roziliklarni belgilang</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!allChecked || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              <span>{confirmText}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

