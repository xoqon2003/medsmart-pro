import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronDown, MapPin, Plus, Edit3, Search } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import type { Region } from '../../../types';

const MOCK: Region[] = [
  { id: '1', name: 'Toshkent shahri', code: 'TSH', type: 'VILOYAT', isActive: true, children: [
    { id: '1-1', name: 'Yunusobod tumani', code: 'YUN', type: 'TUMAN', parentId: '1', isActive: true },
    { id: '1-2', name: 'Chilonzor tumani', code: 'CHI', type: 'TUMAN', parentId: '1', isActive: true },
    { id: '1-3', name: 'Mirzo Ulug\'bek tumani', code: 'MUL', type: 'TUMAN', parentId: '1', isActive: true },
    { id: '1-4', name: 'Shayxontohur tumani', code: 'SHX', type: 'TUMAN', parentId: '1', isActive: true },
  ]},
  { id: '2', name: 'Toshkent viloyati', code: 'TVL', type: 'VILOYAT', isActive: true, children: [
    { id: '2-1', name: 'Chirchiq shahri', code: 'CHR', type: 'SHAHAR', parentId: '2', isActive: true },
    { id: '2-2', name: 'Olmaliq shahri', code: 'OLM', type: 'SHAHAR', parentId: '2', isActive: true },
    { id: '2-3', name: 'Nurafshon shahri', code: 'NUR', type: 'SHAHAR', parentId: '2', isActive: true },
  ]},
  { id: '3', name: 'Samarqand viloyati', code: 'SAM', type: 'VILOYAT', isActive: true, children: [
    { id: '3-1', name: 'Samarqand shahri', code: 'SMS', type: 'SHAHAR', parentId: '3', isActive: true },
    { id: '3-2', name: 'Urgut tumani', code: 'URG', type: 'TUMAN', parentId: '3', isActive: true },
  ]},
  { id: '4', name: 'Buxoro viloyati', code: 'BUX', type: 'VILOYAT', isActive: true, children: [
    { id: '4-1', name: 'Buxoro shahri', code: 'BXS', type: 'SHAHAR', parentId: '4', isActive: true },
    { id: '4-2', name: 'Kogon tumani', code: 'KOG', type: 'TUMAN', parentId: '4', isActive: true },
  ]},
  { id: '5', name: 'Farg\'ona viloyati', code: 'FAR', type: 'VILOYAT', isActive: true, children: [
    { id: '5-1', name: 'Farg\'ona shahri', code: 'FRS', type: 'SHAHAR', parentId: '5', isActive: true },
    { id: '5-2', name: 'Marg\'ilon shahri', code: 'MAR', type: 'SHAHAR', parentId: '5', isActive: true },
  ]},
  { id: '6', name: 'Andijon viloyati', code: 'AND', type: 'VILOYAT', isActive: true, children: [
    { id: '6-1', name: 'Andijon shahri', code: 'ANS', type: 'SHAHAR', parentId: '6', isActive: true },
  ]},
  { id: '7', name: 'Namangan viloyati', code: 'NAM', type: 'VILOYAT', isActive: true, children: [
    { id: '7-1', name: 'Namangan shahri', code: 'NMS', type: 'SHAHAR', parentId: '7', isActive: true },
  ]},
  { id: '8', name: 'Xorazm viloyati', code: 'XOR', type: 'VILOYAT', isActive: true, children: [
    { id: '8-1', name: 'Urganch shahri', code: 'URN', type: 'SHAHAR', parentId: '8', isActive: true },
    { id: '8-2', name: 'Xiva shahri', code: 'XIV', type: 'SHAHAR', parentId: '8', isActive: true },
  ]},
  { id: '9', name: 'Navoiy viloyati', code: 'NAV', type: 'VILOYAT', isActive: true, children: [] },
  { id: '10', name: 'Qashqadaryo viloyati', code: 'QAS', type: 'VILOYAT', isActive: true, children: [
    { id: '10-1', name: 'Qarshi shahri', code: 'QRS', type: 'SHAHAR', parentId: '10', isActive: true },
  ]},
  { id: '11', name: 'Surxondaryo viloyati', code: 'SUR', type: 'VILOYAT', isActive: true, children: [
    { id: '11-1', name: 'Termiz shahri', code: 'TRM', type: 'SHAHAR', parentId: '11', isActive: true },
  ]},
  { id: '12', name: 'Jizzax viloyati', code: 'JIZ', type: 'VILOYAT', isActive: true, children: [] },
  { id: '13', name: 'Sirdaryo viloyati', code: 'SIR', type: 'VILOYAT', isActive: true, children: [
    { id: '13-1', name: 'Guliston shahri', code: 'GUL', type: 'SHAHAR', parentId: '13', isActive: true },
  ]},
  { id: '14', name: 'Qoraqalpog\'iston Respublikasi', code: 'QQR', type: 'VILOYAT', isActive: true, children: [
    { id: '14-1', name: 'Nukus shahri', code: 'NUK', type: 'SHAHAR', parentId: '14', isActive: true },
  ]},
];

const TYPE_BADGE: Record<string, string> = {
  VILOYAT: 'bg-indigo-500/10 text-indigo-400',
  TUMAN: 'bg-emerald-500/10 text-emerald-400',
  SHAHAR: 'bg-amber-500/10 text-amber-400',
};

export function WebRefRegionsScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '1': true });
  const [selected, setSelected] = useState<Region | null>(MOCK[0]);
  const [search, setSearch] = useState('');

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredRegions = search
    ? MOCK.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.children?.some(c => c.name.toLowerCase().includes(search.toLowerCase())))
    : MOCK;

  return (
    <WebPlatformLayout title="Hududlar" subtitle="O'zbekiston hududlari ierarxiyasi">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-[calc(100vh-180px)]">
          {/* Left: Tree */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hudud qidirish..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
              </div>
              <button className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredRegions.map(region => (
                <div key={region.id}>
                  <button onClick={() => { toggle(region.id); setSelected(region); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      selected?.id === region.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'
                    }`}>
                    {region.children && region.children.length > 0 ? (
                      expanded[region.id] ? <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" /> : <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                    ) : <div className="w-4" />}
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                    <span className="truncate font-medium">{region.name}</span>
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${TYPE_BADGE[region.type]}`}>{region.type}</span>
                  </button>
                  {expanded[region.id] && region.children?.map(child => (
                    <button key={child.id} onClick={() => setSelected(child)}
                      className={`w-full flex items-center gap-2 pl-10 pr-3 py-2 rounded-xl text-sm transition-all ${
                        selected?.id === child.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'
                      }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                      <span className="truncate">{child.name}</span>
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${TYPE_BADGE[child.type]}`}>{child.type}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-white text-xl font-bold">{selected.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-indigo-400 text-sm font-mono">{selected.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BADGE[selected.type]}`}>{selected.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selected.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {selected.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Nomi', value: selected.name },
                    { label: 'Kod', value: selected.code },
                    { label: 'Turi', value: selected.type },
                    { label: 'Holat', value: selected.isActive ? 'Faol' : 'Nofaol' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-4">
                      <span className="text-slate-500 text-sm w-24">{f.label}</span>
                      <span className="text-white text-sm">{f.value}</span>
                    </div>
                  ))}
                </div>
                {selected.children && selected.children.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Quyi hududlar ({selected.children.length})</h3>
                    <div className="space-y-1">
                      {selected.children.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-white text-sm">{c.name}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${TYPE_BADGE[c.type]}`}>{c.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 text-sm">Hududni tanlang</div>
            )}
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
