import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User, Search, CheckCircle, Send } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const SPECIALISTS = [
  { id: 1, name: 'Prof. Umarov S.A.', specialty: 'Nevrolog', hospital: 'Toshkent Tibbiyot Akademiyasi', experience: 25, avatar: 'US' },
  { id: 2, name: 'Dr. Hasanova M.R.', specialty: 'Ortoped', hospital: 'Respublika Travmatologiya Markazi', experience: 18, avatar: 'HM' },
  { id: 3, name: 'Prof. Tursunov B.K.', specialty: 'Onkolog', hospital: "O'zbekiston Onkologiya Instituti", experience: 30, avatar: 'TB' },
  { id: 4, name: 'Dr. Nazarov A.O.', specialty: 'Kardiolog', hospital: 'Respublika Kardiologiya Markazi', experience: 15, avatar: 'NA' },
  { id: 5, name: 'Dr. Yusupova G.I.', specialty: 'Endokrinolog', hospital: 'Toshkent Endokrinologiya Instituti', experience: 12, avatar: 'YG' },
];

export function SpecialistReferral() {
  const { selectedApplication, navigate, goBack, updateApplicationStatus } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  const filtered = SPECIALISTS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!selected.length || !reason.trim()) return;
    setSent(true);
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication.id, 'with_specialist');
    }
    setTimeout(() => navigate('radiolog_dashboard'), 2000);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-purple-600" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-gray-900 text-xl mb-2">Yuborildi!</h2>
          <p className="text-gray-500 text-sm">Mutaxassislar Telegram orqali xabardor qilindi</p>
          <p className="text-gray-400 text-sm mt-1">Javob kelganida sizga bildirishnoma keladi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-900 to-violet-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Mutaxassisga yuborish</h1>
            <p className="text-purple-200 text-xs">{selectedApplication?.arizaNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Mutaxassis qidirish..."
            className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 shadow-sm focus:outline-none"
          />
        </div>

        {/* Specialists list */}
        <div className="space-y-2.5">
          {filtered.map((specialist, i) => {
            const isSelected = selected.includes(specialist.id);
            return (
              <motion.button
                key={specialist.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleSelect(specialist.id)}
                className={`w-full bg-white rounded-2xl shadow-sm p-4 text-left border-2 transition-all ${isSelected ? 'border-purple-400 bg-purple-50' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm flex-shrink-0">
                    {specialist.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{specialist.name}</p>
                    <p className="text-purple-600 text-xs">{specialist.specialty}</p>
                    <p className="text-gray-400 text-xs">{specialist.hospital} • {specialist.experience} yil tajriba</p>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Reason */}
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-2">Yuborish sababi *</p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Nima uchun konsultatsiya kerakligini yozing..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </motion.div>
        )}

        <button
          onClick={handleSend}
          disabled={!selected.length || !reason.trim()}
          className="w-full bg-purple-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Yuborish ({selected.length} ta mutaxassis)</span>
        </button>
      </div>
    </div>
  );
}
