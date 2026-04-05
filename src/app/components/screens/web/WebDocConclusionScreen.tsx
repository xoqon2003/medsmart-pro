import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Eye, Save, Send, Search, Tags } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const TEMPLATES = ['Bo\'sh shablon', 'MRT bosh miya', 'MSKT ko\'krak', 'USG qorin', 'Rentgen o\'pka', 'Kardiologik xulosa', 'Nevrologik xulosa'];
const ICD_CODES = [
  { code: 'I10', name: 'Gipertenziya' }, { code: 'I25.1', name: 'Aterosklerotik yurak' }, { code: 'E11', name: 'Diabet 2-tur' },
  { code: 'J18.9', name: 'Pnevmoniya' }, { code: 'M54.5', name: 'Bel og\'rig\'i' }, { code: 'G43.9', name: 'Migren' },
  { code: 'K29.7', name: 'Gastrit' }, { code: 'J45', name: 'Bronxial astma' }, { code: 'E03.9', name: 'Gipotireoz' },
];

export function WebDocConclusionScreen() {
  const [template, setTemplate] = useState('Bo\'sh shablon');
  const [preview, setPreview] = useState(false);
  const [icdSearch, setIcdSearch] = useState('');
  const [selectedIcd, setSelectedIcd] = useState<string[]>(['I10']);
  const [sections, setSections] = useState({ shikoyatlar: '', anamnez: '', tekshiruv: '', xulosa: '', tavsiyalar: '' });

  const filteredIcd = ICD_CODES.filter(c => c.code.toLowerCase().includes(icdSearch.toLowerCase()) || c.name.toLowerCase().includes(icdSearch.toLowerCase()));

  return (
    <WebPlatformLayout title="Xulosa yozish" subtitle="Tibbiy xulosa tahrirlash">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main editor */}
          <div className="xl:col-span-3 space-y-4">
            {/* Patient header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><span className="text-white text-sm font-bold">KA</span></div>
                <div><p className="text-white font-medium text-sm">Karimov Aziz Baxtiyor o'g'li</p><p className="text-slate-500 text-xs">36 yosh, Erkak | Ariza #1256 | MRT bosh miya</p></div>
              </div>
              <div className="flex items-center gap-2">
                <select value={template} onChange={e => setTemplate(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none">
                  {TEMPLATES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => setPreview(!preview)} className={`p-2 rounded-xl transition-colors ${preview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Editor sections */}
            {!preview ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {[
                  { key: 'shikoyatlar' as const, label: 'Shikoyatlar', rows: 2 },
                  { key: 'anamnez' as const, label: 'Anamnez', rows: 3 },
                  { key: 'tekshiruv' as const, label: 'Tekshiruv natijalari', rows: 4 },
                  { key: 'xulosa' as const, label: 'Xulosa', rows: 3 },
                  { key: 'tavsiyalar' as const, label: 'Tavsiyalar', rows: 3 },
                ].map(s => (
                  <div key={s.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">{s.label}</label>
                    <textarea rows={s.rows} value={sections[s.key]} onChange={e => setSections({ ...sections, [s.key]: e.target.value })}
                      placeholder={`${s.label} kiriting...`}
                      className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder-slate-700 leading-relaxed" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold text-center mb-4">TIBBIY XULOSA</h3>
                <div className="space-y-4 text-sm">
                  {Object.entries(sections).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><p className="text-indigo-400 font-semibold uppercase text-xs mb-1">{k}</p><p className="text-slate-300">{v}</p></div>
                  ))}
                  {selectedIcd.length > 0 && (
                    <div><p className="text-indigo-400 font-semibold uppercase text-xs mb-1">Tashxis kodlari</p>
                      <div className="flex flex-wrap gap-1">{selectedIcd.map(c => <span key={c} className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{c}</span>)}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Save className="w-4 h-4" /> Qoralama saqlash</button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"><Send className="w-4 h-4" /> Xulosani yuborish</button>
            </div>
          </div>

          {/* Right sidebar: ICD codes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 h-fit">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Tags className="w-4 h-4 text-indigo-400" /> ICD-10 kodlar</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={icdSearch} onChange={e => setIcdSearch(e.target.value)} placeholder="Qidirish..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredIcd.map(c => (
                <button key={c.code} onClick={() => setSelectedIcd(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${selectedIcd.includes(c.code) ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}>
                  <span className="font-mono font-bold">{c.code}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
            {selectedIcd.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-2">Tanlangan ({selectedIcd.length})</p>
                <div className="flex flex-wrap gap-1">{selectedIcd.map(c => (
                  <span key={c} className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full cursor-pointer hover:bg-indigo-500/20"
                    onClick={() => setSelectedIcd(prev => prev.filter(x => x !== c))}>{c} ×</span>
                ))}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
