import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, FlaskConical, ShoppingCart, Send } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const CATEGORIES = [
  { name: 'Qon tahlillari', tests: [
    { code: 'CBC', name: 'Umumiy qon tahlili (OAK)', price: 45000 },
    { code: 'ESR', name: 'EChT (tezlashgan)', price: 15000 },
    { code: 'RET', name: 'Retikulotsitlar', price: 25000 },
  ]},
  { name: 'Bioximiya', tests: [
    { code: 'GLU', name: 'Glyukoza', price: 25000 },
    { code: 'CHOL', name: 'Umumiy xolesterin', price: 30000 },
    { code: 'TG', name: 'Triglitseridlar', price: 30000 },
    { code: 'AST', name: 'AST', price: 25000 },
    { code: 'ALT', name: 'ALT', price: 25000 },
    { code: 'CREA', name: 'Kreatinin', price: 25000 },
    { code: 'UREA', name: 'Mochevina', price: 25000 },
    { code: 'HBA1C', name: 'HbA1c', price: 65000 },
    { code: 'FE', name: 'Temir', price: 35000 },
  ]},
  { name: 'Gormonlar', tests: [
    { code: 'TSH', name: 'TTG', price: 55000 },
    { code: 'FT3', name: 'Erkin T3', price: 50000 },
    { code: 'FT4', name: 'Erkin T4', price: 50000 },
  ]},
  { name: 'Koagulogramma', tests: [
    { code: 'PT', name: 'Protrombin vaqti', price: 35000 },
    { code: 'INR', name: 'INR', price: 35000 },
    { code: 'FIB', name: 'Fibrinogen', price: 30000 },
  ]},
  { name: 'Immunologiya', tests: [
    { code: 'CRP', name: 'C-reaktiv oqsil', price: 40000 },
    { code: 'RF', name: 'Revmatoid faktor', price: 45000 },
  ]},
  { name: 'Peshob', tests: [
    { code: 'UA', name: 'Umumiy peshob', price: 20000 },
  ]},
];

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebDocLabOrderScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Qon tahlillari': true, 'Bioximiya': true });
  const [selected, setSelected] = useState<string[]>(['CBC', 'GLU', 'AST', 'ALT']);

  const toggle = (name: string) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  const toggleTest = (code: string) => setSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);

  const allTests = CATEGORIES.flatMap(c => c.tests);
  const selectedTests = allTests.filter(t => selected.includes(t.code));
  const total = selectedTests.reduce((a, t) => a + t.price, 0);

  return (
    <WebPlatformLayout title="Lab buyurtma" subtitle="Laboratoriya tekshiruvlari buyurtmasi">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Test catalog */}
          <div className="xl:col-span-2 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><span className="text-white text-sm font-bold">KA</span></div>
              <div><p className="text-white font-medium text-sm">Karimov Aziz</p><p className="text-slate-500 text-xs">36 yosh | Ariza #1256</p></div>
            </div>

            {CATEGORIES.map(cat => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <button onClick={() => toggle(cat.name)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {expanded[cat.name] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-white font-semibold text-sm">{cat.name}</span>
                    <span className="text-slate-500 text-xs">({cat.tests.length})</span>
                  </div>
                  <span className="text-indigo-400 text-xs">{cat.tests.filter(t => selected.includes(t.code)).length} tanlangan</span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded[cat.name] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-slate-800">
                        {cat.tests.map(t => (
                          <label key={t.code} className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={selected.includes(t.code)} onChange={() => toggleTest(t.code)}
                                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800" />
                              <span className="text-indigo-400 text-xs font-mono w-10">{t.code}</span>
                              <span className="text-slate-300 text-sm">{t.name}</span>
                            </div>
                            <span className="text-slate-400 text-sm">{fmt(t.price)}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <h3 className="text-white font-semibold text-sm">Buyurtma ({selectedTests.length})</h3>
            </div>
            {selectedTests.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">Testlarni tanlang</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                  {selectedTests.map(t => (
                    <div key={t.code} className="flex items-center justify-between py-1.5">
                      <span className="text-slate-300 text-sm">{t.name}</span>
                      <span className="text-white text-sm">{fmt(t.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-3 mb-4">
                  <div className="flex justify-between"><span className="text-slate-400">Jami</span><span className="text-white font-bold text-lg">{fmt(total)}</span></div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                  <Send className="w-4 h-4" /> Buyurtma berish
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
