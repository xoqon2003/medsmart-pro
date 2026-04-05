import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, FolderOpen } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const MOCK = [
  { id: '1', name: 'Instrumental tekshiruvlar', children: [
    { id: '1-1', name: 'MRT tekshiruv', price: 450000, duration: 45, isActive: true },
    { id: '1-2', name: 'MSKT tekshiruv', price: 550000, duration: 30, isActive: true },
    { id: '1-3', name: 'Rentgen tekshiruv', price: 120000, duration: 15, isActive: true },
    { id: '1-4', name: 'USG tekshiruv', price: 200000, duration: 20, isActive: true },
    { id: '1-5', name: 'EKG', price: 80000, duration: 15, isActive: true },
    { id: '1-6', name: 'EEG', price: 150000, duration: 30, isActive: false },
  ]},
  { id: '2', name: 'Laboratoriya xizmatlari', children: [
    { id: '2-1', name: 'Umumiy qon tahlili', price: 45000, duration: 60, isActive: true },
    { id: '2-2', name: 'Bioximiyaviy tahlil', price: 85000, duration: 120, isActive: true },
    { id: '2-3', name: 'Gormonlar tahlili', price: 55000, duration: 180, isActive: true },
    { id: '2-4', name: 'Peshob tahlili', price: 20000, duration: 60, isActive: true },
  ]},
  { id: '3', name: 'Konsultatsiyalar', children: [
    { id: '3-1', name: 'Birlamchi konsultatsiya', price: 150000, duration: 30, isActive: true },
    { id: '3-2', name: 'Takroriy konsultatsiya', price: 100000, duration: 20, isActive: true },
    { id: '3-3', name: 'Onlayn konsultatsiya', price: 120000, duration: 25, isActive: true },
    { id: '3-4', name: 'Uyga chaqirish', price: 300000, duration: 60, isActive: true },
  ]},
  { id: '4', name: 'Fizioterapiya', children: [
    { id: '4-1', name: 'Magnit terapiya', price: 60000, duration: 20, isActive: true },
    { id: '4-2', name: 'Lazer terapiya', price: 80000, duration: 15, isActive: true },
    { id: '4-3', name: 'Elektroforez', price: 50000, duration: 20, isActive: true },
  ]},
  { id: '5', name: 'Jarrohlik xizmatlari', children: [
    { id: '5-1', name: 'Kichik jarrohlik amaliyoti', price: 500000, duration: 60, isActive: true },
    { id: '5-2', name: 'Biopsiya', price: 350000, duration: 30, isActive: true },
  ]},
];

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebRefServicesScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '1': true, '3': true });

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalServices = MOCK.reduce((a, c) => a + c.children.length, 0);
  const activeServices = MOCK.reduce((a, c) => a + c.children.filter(s => s.isActive).length, 0);

  return (
    <WebPlatformLayout title="Xizmat kategoriyalari" subtitle="Tibbiy xizmatlar katalogi va narxlar">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Kategoriyalar', value: MOCK.length, color: 'from-indigo-500 to-blue-600' },
            { label: 'Jami xizmatlar', value: totalServices, color: 'from-emerald-500 to-green-600' },
            { label: 'Faol xizmatlar', value: activeServices, color: 'from-violet-500 to-purple-600' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div><p className="text-white text-xl font-bold">{k.value}</p><p className="text-slate-500 text-xs">{k.label}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">{MOCK.length} kategoriya, {totalServices} xizmat</p>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Kategoriya qo'shish
          </button>
        </div>

        <div className="space-y-3">
          {MOCK.map((cat, ci) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  {expanded[cat.id] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span className="text-white font-semibold text-sm">{cat.name}</span>
                  <span className="text-slate-500 text-xs">({cat.children.length} xizmat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); }} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); }} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {expanded[cat.id] && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-slate-800">
                      {cat.children.map(svc => (
                        <div key={svc.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${svc.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className="text-slate-300 text-sm">{svc.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-white text-sm font-medium w-28 text-right">{fmt(svc.price)}</span>
                            <span className="text-slate-500 text-xs w-16 text-right">{svc.duration} min</span>
                            <button className="text-slate-500 hover:text-white transition-colors">
                              {svc.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </WebPlatformLayout>
  );
}
