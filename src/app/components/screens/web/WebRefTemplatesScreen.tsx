import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Eye, Edit3, Trash2, X, Copy } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const TYPES = ['Barchasi', 'xulosa', 'retsept', 'yollanma', 'spravka', 'shartnoma', 'protokol'] as const;
const TYPE_LABELS: Record<string, string> = { xulosa: 'Xulosa', retsept: 'Retsept', yollanma: "Yo'llanma", spravka: 'Spravka', shartnoma: 'Shartnoma', protokol: 'Protokol' };
const TYPE_COLORS: Record<string, string> = { xulosa: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', retsept: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', yollanma: 'bg-amber-500/10 text-amber-400 border-amber-500/20', spravka: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', shartnoma: 'bg-violet-500/10 text-violet-400 border-violet-500/20', protokol: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };

const MOCK = [
  { id: '1', name: 'MRT bosh miya xulosasi', type: 'xulosa', content: 'Bemor: {{bemor_ism}}\nSana: {{sana}}\nTekshiruv: MRT bosh miya\n\nXulosa:\n{{xulosa_matni}}\n\nTavsiyalar:\n{{tavsiyalar}}\n\nRadiolog: {{radiolog_ism}}', variables: ['bemor_ism', 'sana', 'xulosa_matni', 'tavsiyalar', 'radiolog_ism'], isActive: true, usageCount: 234, updatedAt: '2026-04-01' },
  { id: '2', name: 'MSKT ko\'krak qafasi xulosasi', type: 'xulosa', content: 'Bemor: {{bemor_ism}}\nMSKT ko\'krak qafasi tekshiruvi\n\nTopilmalar:\n{{topilmalar}}\n\nXulosa: {{xulosa}}\n\nRadiolog: {{radiolog_ism}}', variables: ['bemor_ism', 'topilmalar', 'xulosa', 'radiolog_ism'], isActive: true, usageCount: 189, updatedAt: '2026-03-28' },
  { id: '3', name: 'USG qorin a\'zolari xulosasi', type: 'xulosa', content: 'USG tekshiruvi\nBemor: {{bemor_ism}}\nJigar: {{jigar}}\nO\'t pufagi: {{ot_pufagi}}\nBuyrak: {{buyrak}}\nTaloq: {{taloq}}', variables: ['bemor_ism', 'jigar', 'ot_pufagi', 'buyrak', 'taloq'], isActive: true, usageCount: 156, updatedAt: '2026-03-25' },
  { id: '4', name: 'Standart retsept', type: 'retsept', content: 'RETSEPT\nBemor: {{bemor_ism}}\nSana: {{sana}}\n\n1. {{dori_1}} - {{doza_1}} - {{sxema_1}}\n2. {{dori_2}} - {{doza_2}} - {{sxema_2}}\n\nShifokor: {{shifokor_ism}}', variables: ['bemor_ism', 'sana', 'dori_1', 'doza_1', 'sxema_1', 'dori_2', 'doza_2', 'sxema_2', 'shifokor_ism'], isActive: true, usageCount: 312, updatedAt: '2026-04-02' },
  { id: '5', name: 'Mutaxassisga yo\'llanma', type: 'yollanma', content: 'YO\'LLANMA\nKimga: {{mutaxassis}}\nBemor: {{bemor_ism}}\nTashxis: {{tashxis}}\nSabab: {{sabab}}\nJo\'natuvchi: {{shifokor_ism}}', variables: ['mutaxassis', 'bemor_ism', 'tashxis', 'sabab', 'shifokor_ism'], isActive: true, usageCount: 87, updatedAt: '2026-03-20' },
  { id: '6', name: 'Sog\'liq spravkasi', type: 'spravka', content: 'SPRAVKA\n{{bemor_ism}} {{tug_yil}} y.t. sog\'lom ekanligi haqida.\nTekshiruv sanalari: {{sana}}\nXulosa: {{xulosa}}\nShifokor: {{shifokor_ism}}', variables: ['bemor_ism', 'tug_yil', 'sana', 'xulosa', 'shifokor_ism'], isActive: true, usageCount: 45, updatedAt: '2026-03-15' },
  { id: '7', name: 'Tibbiy xizmat shartnomasi', type: 'shartnoma', content: 'SHARTNOMA #{{raqam}}\nSana: {{sana}}\nBemor: {{bemor_ism}}\nXizmat: {{xizmat}}\nSumma: {{summa}} so\'m\nTo\'lov usuli: {{tolov_usuli}}', variables: ['raqam', 'sana', 'bemor_ism', 'xizmat', 'summa', 'tolov_usuli'], isActive: true, usageCount: 198, updatedAt: '2026-04-01' },
  { id: '8', name: 'Konsultatsiya protokoli', type: 'protokol', content: 'PROTOKOL\nBemor: {{bemor_ism}}\nShifokor: {{shifokor_ism}}\nSana: {{sana}}\n\nShikoyatlar: {{shikoyatlar}}\nAnamnez: {{anamnez}}\nTekshiruv: {{tekshiruv}}\nTashxis: {{tashxis}}\nDavolash: {{davolash}}', variables: ['bemor_ism', 'shifokor_ism', 'sana', 'shikoyatlar', 'anamnez', 'tekshiruv', 'tashxis', 'davolash'], isActive: true, usageCount: 167, updatedAt: '2026-03-30' },
  { id: '9', name: 'Lab buyurtma varaqasi', type: 'yollanma', content: 'LAB BUYURTMA\nBemor: {{bemor_ism}}\nTestlar:\n{{testlar}}\nShifokor: {{shifokor_ism}}\nSana: {{sana}}', variables: ['bemor_ism', 'testlar', 'shifokor_ism', 'sana'], isActive: true, usageCount: 95, updatedAt: '2026-03-18' },
  { id: '10', name: 'Rentgen xulosasi', type: 'xulosa', content: 'RENTGEN XULOSASI\nBemor: {{bemor_ism}}\nSoha: {{soha}}\nTopilmalar: {{topilmalar}}\nXulosa: {{xulosa}}\nRadiolog: {{radiolog_ism}}', variables: ['bemor_ism', 'soha', 'topilmalar', 'xulosa', 'radiolog_ism'], isActive: false, usageCount: 78, updatedAt: '2026-02-20' },
];

export function WebRefTemplatesScreen() {
  const [tab, setTab] = useState('Barchasi');
  const [preview, setPreview] = useState<typeof MOCK[0] | null>(null);

  const filtered = tab === 'Barchasi' ? MOCK : MOCK.filter(t => t.type === tab);

  return (
    <WebPlatformLayout title="Hujjat shablonlari" subtitle="Xulosa, retsept va boshqa hujjatlar">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'Barchasi' ? 'Barchasi' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Yangi shablon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tpl, i) => (
            <motion.div key={tpl.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[tpl.type]}`}>{TYPE_LABELS[tpl.type]}</span>
                {!tpl.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Nofaol</span>}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{tpl.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span>{tpl.usageCount} marta ishlatilgan</span>
                <span>|</span>
                <span>{tpl.updatedAt}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {tpl.variables.slice(0, 4).map(v => (
                  <span key={v} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono">{`{{${v}}}`}</span>
                ))}
                {tpl.variables.length > 4 && <span className="text-xs text-slate-600">+{tpl.variables.length - 4}</span>}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreview(tpl)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors">
                  <Eye className="w-3 h-3" /> Ko'rish
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors">
                  <Edit3 className="w-3 h-3" /> Tahrirlash
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors">
                  <Copy className="w-3 h-3" /> Nusxa
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                  <div>
                    <h3 className="text-white font-semibold">{preview.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[preview.type]}`}>{TYPE_LABELS[preview.type]}</span>
                  </div>
                  <button onClick={() => setPreview(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 flex-1 overflow-y-auto">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed bg-slate-800/50 rounded-xl p-4">
                    {preview.content.split(/(\{\{[^}]+\}\})/).map((part, i) =>
                      part.startsWith('{{') ? <span key={i} className="text-indigo-400 bg-indigo-500/10 px-1 rounded">{part}</span> : part
                    )}
                  </pre>
                  <div className="mt-4">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">O'zgaruvchilar</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.variables.map(v => <span key={v} className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-indigo-400 font-mono">{v}</span>)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WebPlatformLayout>
  );
}
