import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Calendar, FileText, FlaskConical, Syringe, FolderOpen, AlertTriangle, Clock } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const TABS = ['Umumiy', 'Tarix', 'Xulosalar', 'Laboratoriya', 'Retseptlar', 'Fayllar'] as const;
const TAB_ICONS = { Umumiy: Heart, Tarix: Clock, Xulosalar: FileText, Laboratoriya: FlaskConical, Retseptlar: Syringe, Fayllar: FolderOpen };

const PATIENT = { name: 'Karimov Aziz Baxtiyor o\'g\'li', age: 36, gender: 'Erkak', phone: '+998901234567', bloodType: 'A+', allergies: ['Penisilin', 'Aspirin'] };

const VISITS = [
  { date: '2026-04-03', doctor: 'Dr. Rahimov', type: 'Konsultatsiya', summary: 'Gipertenziya nazorati, dorilar to\'g\'rilandi' },
  { date: '2026-03-20', doctor: 'Dr. Rahimov', type: 'Birlamchi qabul', summary: 'Birlamchi tashxis: I10, lab buyurtma berildi' },
  { date: '2026-03-05', doctor: 'Dr. Aliyeva', type: 'Nevrolog konsultatsiya', summary: 'Migren, davolash sxemasi belgilandi' },
  { date: '2026-02-15', doctor: 'Dr. Ergashev', type: 'USG tekshiruv', summary: 'Qorin a\'zolari USG - norma' },
  { date: '2026-01-10', doctor: 'Dr. Rahimov', type: 'Yillik tekshiruv', summary: 'Umumiy tekshiruv, qon tahlili buyurtma' },
];

const CONCLUSIONS = [
  { id: 1, date: '2026-04-03', doctor: 'Dr. Rahimov', type: 'Kardiolog xulosa', status: 'Tasdiqlangan', diagnosis: 'I10 Gipertenziya' },
  { id: 2, date: '2026-03-20', doctor: 'Dr. Rahimov', type: 'Birlamchi xulosa', status: 'Tasdiqlangan', diagnosis: 'I10 Gipertenziya (gumon)' },
  { id: 3, date: '2026-03-05', doctor: 'Dr. Aliyeva', type: 'Nevrolog xulosa', status: 'Tasdiqlangan', diagnosis: 'G43.9 Migren' },
];

const LAB_RESULTS = [
  { date: '2026-03-22', test: 'Glyukoza', value: '5.4', range: '3.9-6.1', unit: 'mmol/l', status: 'normal' },
  { date: '2026-03-22', test: 'Xolesterin', value: '6.2', range: '<5.2', unit: 'mmol/l', status: 'high' },
  { date: '2026-03-22', test: 'AST', value: '28', range: '0-40', unit: 'U/L', status: 'normal' },
  { date: '2026-03-22', test: 'ALT', value: '35', range: '0-41', unit: 'U/L', status: 'normal' },
  { date: '2026-03-22', test: 'Kreatinin', value: '95', range: '62-115', unit: 'mkmol/l', status: 'normal' },
  { date: '2026-01-12', test: 'OAK Leykotsitlar', value: '7.2', range: '4.0-10.0', unit: '10^9/L', status: 'normal' },
  { date: '2026-01-12', test: 'Gemoglobin', value: '148', range: '130-170', unit: 'g/L', status: 'normal' },
  { date: '2026-01-12', test: 'TTG', value: '2.8', range: '0.4-4.0', unit: 'mIU/L', status: 'normal' },
];

const PRESCRIPTIONS = [
  { date: '2026-04-03', doctor: 'Dr. Rahimov', drugs: ['Lizinopril 10mg 1x1', 'Atorvastatin 20mg 1x1 (kechda)', 'Aspirin Kardio 100mg 1x1'] },
  { date: '2026-03-05', doctor: 'Dr. Aliyeva', drugs: ['Sumatriptan 50mg (xurujda)', 'Amitriptilin 25mg 1x1 (kechda)'] },
];

export function WebDocEmrScreen() {
  const [tab, setTab] = useState<typeof TABS[number]>('Umumiy');

  return (
    <WebPlatformLayout title="Tibbiy karta (EMR)" subtitle={PATIENT.name}>
      <div className="p-6 space-y-5">
        {/* Patient header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">KA</span>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">{PATIENT.name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{PATIENT.age} yosh</span><span>|</span><span>{PATIENT.gender}</span><span>|</span>
                <span>{PATIENT.phone}</span><span>|</span><span className="text-red-400">Qon: {PATIENT.bloodType}</span>
              </div>
            </div>
          </div>
          {PATIENT.allergies.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div className="flex gap-1">{PATIENT.allergies.map(a => <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{a}</span>)}</div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => { const Icon = TAB_ICONS[t]; return (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" /> {t}
            </button>
          );})}
        </div>

        {/* Tab content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'Umumiy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Oxirgi tashrif', value: '2026-04-03', color: 'from-blue-500 to-indigo-600' },
                { label: 'Tashxislar soni', value: '3', color: 'from-emerald-500 to-green-600' },
                { label: 'Allergiyalar', value: String(PATIENT.allergies.length), color: 'from-amber-500 to-orange-600' },
                { label: 'Surunkali kasalliklar', value: '2', color: 'from-violet-500 to-purple-600' },
              ].map(c => (
                <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}><Heart className="w-5 h-5 text-white" /></div>
                  <p className="text-white text-2xl font-bold">{c.value}</p>
                  <p className="text-slate-500 text-xs">{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'Tarix' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="space-y-0 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {VISITS.map((v, i) => (
                  <div key={i} className="flex gap-4 py-3 relative">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center z-10 shrink-0"><div className="w-2 h-2 rounded-full bg-indigo-500" /></div>
                    <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-white text-sm font-medium">{v.type}</span><span className="text-slate-500 text-xs">{v.date}</span></div>
                    <p className="text-slate-400 text-sm">{v.summary}</p><p className="text-slate-600 text-xs mt-1">{v.doctor}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Xulosalar' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full"><thead><tr className="border-b border-slate-800">
                {['Sana', 'Shifokor', 'Turi', 'Tashxis', 'Holat'].map(h => <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>)}
              </tr></thead><tbody>{CONCLUSIONS.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer">
                  <td className="px-5 py-3 text-slate-400 text-sm">{c.date}</td>
                  <td className="px-5 py-3 text-white text-sm">{c.doctor}</td>
                  <td className="px-5 py-3 text-slate-300 text-sm">{c.type}</td>
                  <td className="px-5 py-3"><span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{c.diagnosis}</span></td>
                  <td className="px-5 py-3"><span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{c.status}</span></td>
                </tr>
              ))}</tbody></table>
            </div>
          )}

          {tab === 'Laboratoriya' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full"><thead><tr className="border-b border-slate-800">
                {['Sana', 'Test', 'Natija', 'Norma', 'Birlik', 'Holat'].map(h => <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>)}
              </tr></thead><tbody>{LAB_RESULTS.map((l, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="px-5 py-3 text-slate-400 text-sm">{l.date}</td>
                  <td className="px-5 py-3 text-white text-sm">{l.test}</td>
                  <td className={`px-5 py-3 text-sm font-bold ${l.status === 'high' ? 'text-red-400' : 'text-emerald-400'}`}>{l.value}</td>
                  <td className="px-5 py-3 text-slate-500 text-sm">{l.range}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{l.unit}</td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'normal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{l.status === 'normal' ? 'Norma' : 'Yuqori'}</span></td>
                </tr>
              ))}</tbody></table>
            </div>
          )}

          {tab === 'Retseptlar' && (
            <div className="space-y-3">{PRESCRIPTIONS.map((p, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3"><span className="text-slate-400 text-sm">{p.date}</span><span className="text-slate-600">|</span><span className="text-white text-sm">{p.doctor}</span></div>
                <div className="space-y-1.5">{p.drugs.map(d => <div key={d} className="flex items-center gap-2"><Syringe className="w-3 h-3 text-indigo-400 shrink-0" /><span className="text-slate-300 text-sm">{d}</span></div>)}</div>
              </div>
            ))}</div>
          )}

          {tab === 'Fayllar' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['MRT_bosh_2026-03-20.dcm', 'USG_qorin_2026-02-15.pdf', 'EKG_2026-01-10.pdf', 'Lab_natija_2026-03-22.pdf', 'Retsept_2026-04-03.pdf', 'Xulosa_2026-04-03.pdf'].map(f => (
                <div key={f} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 cursor-pointer transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-white text-xs font-medium truncate">{f}</p>
                  <p className="text-slate-600 text-xs mt-1">{f.endsWith('.dcm') ? 'DICOM' : 'PDF'}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
