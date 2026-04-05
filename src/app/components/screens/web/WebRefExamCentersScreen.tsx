import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, Building2, MapPin, Phone, Clock, X } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const REGIONS = ['Barchasi', 'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 'Buxoro', 'Farg\'ona', 'Andijon', 'Namangan'];

const MOCK = [
  { id: '1', name: 'MedSmartPro Diagnostika Markazi', address: 'Toshkent, Yunusobod t., Amir Temur ko\'chasi 45', region: 'Toshkent shahri', phone: '+998 71 234-56-78', services: ['MRT', 'MSKT', 'USG', 'Rentgen', 'EKG'], workHours: 'Du-Sha: 08:00 - 20:00', isActive: true },
  { id: '2', name: 'Respublika ixtisoslashtirilgan markazi', address: 'Toshkent, Chilonzor t., Bunyodkor ko\'chasi 12', region: 'Toshkent shahri', phone: '+998 71 345-67-89', services: ['MRT', 'MSKT', 'Lab', 'USG'], workHours: 'Du-Ju: 08:00 - 18:00, Sha: 09:00 - 14:00', isActive: true },
  { id: '3', name: 'Diagnostik klinika "Salom Med"', address: 'Toshkent, Mirzo Ulug\'bek t., Mustaqillik ko\'chasi 78', region: 'Toshkent shahri', phone: '+998 71 456-78-90', services: ['USG', 'Rentgen', 'Lab', 'EKG'], workHours: 'Du-Sha: 07:30 - 19:00', isActive: true },
  { id: '4', name: 'Intermed Innovation markazi', address: 'Toshkent, Shayxontohur t., Navoiy ko\'chasi 33', region: 'Toshkent shahri', phone: '+998 71 567-89-01', services: ['MRT', 'MSKT', 'USG', 'Lab'], workHours: '24/7', isActive: true },
  { id: '5', name: 'Chirchiq shahar shifoxonasi', address: 'Chirchiq, Amir Temur ko\'chasi 5', region: 'Toshkent viloyati', phone: '+998 70 678-90-12', services: ['Rentgen', 'USG', 'Lab'], workHours: 'Du-Ju: 08:00 - 17:00', isActive: true },
  { id: '6', name: 'Samarqand viloyat diagnostika markazi', address: 'Samarqand, Registon ko\'chasi 22', region: 'Samarqand', phone: '+998 66 789-01-23', services: ['MRT', 'USG', 'Lab', 'Rentgen'], workHours: 'Du-Sha: 08:00 - 18:00', isActive: true },
  { id: '7', name: 'Buxoro tibbiyot diagnostikasi', address: 'Buxoro, Ibn Sino ko\'chasi 15', region: 'Buxoro', phone: '+998 65 890-12-34', services: ['USG', 'Rentgen', 'Lab', 'EKG'], workHours: 'Du-Ju: 08:00 - 17:00', isActive: true },
  { id: '8', name: 'Farg\'ona zamonaviy diagnostika', address: 'Farg\'ona, Mustaqillik ko\'chasi 50', region: 'Farg\'ona', phone: '+998 73 901-23-45', services: ['MRT', 'MSKT', 'USG', 'Lab'], workHours: 'Du-Sha: 08:00 - 19:00', isActive: true },
  { id: '9', name: 'Andijon viloyat tibbiyot markazi', address: 'Andijon, Bobur shoh ko\'chasi 8', region: 'Andijon', phone: '+998 74 012-34-56', services: ['USG', 'Rentgen', 'Lab'], workHours: 'Du-Ju: 08:00 - 16:00', isActive: false },
  { id: '10', name: 'Namangan diagnostika xizmati', address: 'Namangan, Navoiy ko\'chasi 30', region: 'Namangan', phone: '+998 69 123-45-67', services: ['USG', 'Lab', 'EKG', 'Rentgen'], workHours: 'Du-Sha: 08:00 - 18:00', isActive: true },
];

const SVC_COLORS: Record<string, string> = { MRT: 'bg-indigo-500/10 text-indigo-400', MSKT: 'bg-violet-500/10 text-violet-400', USG: 'bg-emerald-500/10 text-emerald-400', Rentgen: 'bg-amber-500/10 text-amber-400', Lab: 'bg-cyan-500/10 text-cyan-400', EKG: 'bg-rose-500/10 text-rose-400' };

export function WebRefExamCentersScreen() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('Barchasi');

  const filtered = MOCK.filter(c =>
    (region === 'Barchasi' || c.region === region) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Tekshiruv markazlari" subtitle="Diagnostika markazlari va klinikalar">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nomi yoki manzil bo'yicha..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">{REGIONS.map(r => <option key={r}>{r}</option>)}</select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Qo'shish</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead><tr className="border-b border-slate-800">
                {['Nomi', 'Manzil', 'Hudud', 'Telefon', 'Xizmatlar', 'Ish vaqti', 'Holat', ''].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-white text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-sm max-w-[200px] truncate">{c.address}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">{c.region}</span></td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{c.phone}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">{c.services.map(s => <span key={s} className={`text-xs px-1.5 py-0.5 rounded-full ${SVC_COLORS[s] || 'bg-slate-800 text-slate-400'}`}>{s}</span>)}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.workHours}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{c.isActive ? 'Faol' : 'Nofaol'}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
