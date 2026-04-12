import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit3, Trash2, X, ChevronDown, ChevronUp,
  Stethoscope, FlaskConical, BookOpen, Pill, HelpCircle,
  AlertTriangle, Check, Clock, FileText, User,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';
import { BODY_ZONES, COMMON_SYMPTOMS } from '../../../data/clinicalKB';
import type { KBDisease, KBApprovalStatus, AdaptiveQuestion, DrugRecommendation, DiagnosticProtocol } from '../../../types';

// ── Kategoriyalar ──
const DISEASE_CATEGORIES = [
  'Barchasi', 'Nevrologik', 'Gastroenterologik', 'Kardiologik',
  'Pulmonologik', 'Urologik', 'Allergologik', 'Endokrinologik',
  'Ortopedik', 'Dermatologik', 'Oftalmologik', 'Psixiatrik',
];

const STATUS_OPTIONS: { key: KBApprovalStatus | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'Barchasi', color: 'text-slate-400' },
  { key: 'draft', label: 'Qoralama', color: 'text-yellow-400' },
  { key: 'review', label: 'Tekshiruvda', color: 'text-blue-400' },
  { key: 'approved', label: 'Tasdiqlangan', color: 'text-emerald-400' },
  { key: 'rejected', label: 'Rad etilgan', color: 'text-red-400' },
];

// ── Mock kasalliklar (kengaytirilgan) ──
const MOCK_DISEASES: KBDisease[] = [
  {
    id: 'kb_migraine', nameUz: 'Migren', nameLat: 'Migraine', icd10: 'G43.9',
    description: "Bosh og'rig'ining keng tarqalgan turi.",
    category: 'Nevrologik',
    symptoms: ["bosh og'rig'i", "ko'ngil aynash", "yorug'likdan qo'rqish"],
    requiredSymptoms: ["bosh og'rig'i"],
    supportingSymptoms: ["pulsatsiyali og'riq", "bir tomonlama"],
    excludingSymptoms: ["isitma", "bo'yin qattiqligi"],
    specialist: 'Nevropatolog',
    relatedSpecialists: ['Nevrolog', 'Terapevt'],
    tests: ['Qon bosimi monitoringi', 'Nevrologik tekshiruv', 'Bosh MRT'],
    ageRange: [12, 65], genderBias: 'F',
    bodyZones: ['head'],
    adaptiveQuestions: [
      { id: 'q_duration', question: "Shikoyat qancha vaqtdan beri?", type: 'radio', options: ['1 soatdan kam', '1-24 soat', '1-7 kun', '1 oydan ortiq'] },
      { id: 'q_location', question: "Og'riq qayerda?", type: 'radio', options: ['Peshona', 'Chakka', 'Ensa', 'Butun bosh'] },
    ],
    diagnosticProtocol: {
      diagnosticSteps: ['Nevrologik tekshiruv', 'Qon bosimi o\'lchash', 'Bosh MRT (zarur bo\'lsa)'],
      treatmentGuidelines: ['Ibuprofen 400mg og\'riq paytida', 'Qorong\'u xonada dam olish', 'Trigger omillardan qochish'],
      redFlags: ['Birdan paydo bo\'lgan kuchli bosh og\'rig\'i', 'Nutq buzilishi', 'Ong yo\'qotish'],
      source: 'WHO Headache Guidelines, 2022',
      sourceUrl: 'https://www.who.int/publications/headache-guidelines',
      evidenceLevel: 'A',
      lastReviewed: '2024-01-15',
    },
    drugRecommendations: [
      { id: 'dr1', drugName: 'Ibuprofen', dosage: '400mg', frequency: 'Og\'riq paytida, kuniga 3 martadan ko\'p emas', duration: 'Kerakligiga qarab', contraindications: ['Oshqozon yarasi', 'Buyrak yetishmovchiligi'], sideEffects: ['Oshqozon og\'rig\'i', 'Bosh aylanishi'], source: 'WHO protokoli', isFirstLine: true },
      { id: 'dr2', drugName: 'Sumatriptan', dosage: '50mg', frequency: 'Xuruj boshida 1 ta', duration: 'Kerakligiga qarab', contraindications: ['Yurak kasalliklari', 'Gipertoniya'], sideEffects: ['Bosim ko\'tarilishi', 'Yuz qizarishi'], source: 'EHF Guidelines 2023', isFirstLine: false },
    ],
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.',
    createdAt: '2026-04-10T10:00:00Z',
    updatedBy: 'user_expert_1', updatedByName: 'Dr. Karimov A.',
    updatedAt: '2026-04-11T14:30:00Z',
    approvalStatus: 'approved', approvedBy: 'admin_1', approvedByName: 'Admin Tizim',
    isActive: true,
  },
  {
    id: 'kb_gastritis', nameUz: 'Gastrit', nameLat: 'Gastritis', icd10: 'K29.7',
    description: "Oshqozon shilliq qavatining yallig'lanishi.",
    category: 'Gastroenterologik',
    symptoms: ["qorin og'rig'i", "ko'ngil aynash", "ich dam bo'lishi"],
    requiredSymptoms: ["qorin og'rig'i"],
    supportingSymptoms: ["ovqatdan keyin og'riq", "oshqozon achchiq"],
    excludingSymptoms: ["qon qusish"],
    specialist: 'Gastroenterolog',
    relatedSpecialists: ['Terapevt'],
    tests: ['FEGDS', 'Helicobacter pylori testi', 'Qorin UZI'],
    bodyZones: ['abdomen'],
    adaptiveQuestions: [
      { id: 'q_duration', question: "Shikoyat qancha vaqtdan beri?", type: 'radio', options: ['1 soatdan kam', '1-24 soat', '1-7 kun', '1 oydan ortiq'] },
    ],
    drugRecommendations: [
      { id: 'dr3', drugName: 'Omeprazol', dosage: '20mg', frequency: 'Kuniga 1 marta, och qoringa', duration: '2-4 hafta', contraindications: ['Jigar yetishmovchiligi'], sideEffects: ['Bosh og\'rig\'i', 'Ich ketishi'], source: 'ACG Guidelines 2023', isFirstLine: true },
    ],
    diagnosticProtocol: {
      diagnosticSteps: ['Fizik tekshiruv', 'FEGDS', 'H.pylori testi'],
      treatmentGuidelines: ['Proton pompa inhibitorlari', 'Dietoterapiya', 'H.pylori eradikatsiyasi'],
      redFlags: ['Qon qusish', 'Qora najas', 'Tez vazn yo\'qotish'],
      source: "O'zR SSV Gastrit klinik protokoli, 2023",
      evidenceLevel: 'A',
    },
    createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.',
    createdAt: '2026-04-11T08:00:00Z',
    approvalStatus: 'draft',
    isActive: true,
  },
  {
    id: 'kb_hypertension', nameUz: 'Gipertoniya', nameLat: 'Hypertension', icd10: 'I10',
    description: "Arterial qon bosimining surunkali ko'tarilishi.",
    category: 'Kardiologik',
    symptoms: ["bosh og'rig'i", "bosh aylanishi", "yurak tez urishi"],
    requiredSymptoms: ["bosh og'rig'i"],
    supportingSymptoms: ["yuz qizarishi", "quloqda shovqin"],
    excludingSymptoms: [],
    specialist: 'Kardiolog',
    relatedSpecialists: ['Terapevt', 'Nefrolog'],
    tests: ['Qon bosimi monitoringi', 'EKG', 'Biokimyoviy qon tahlili'],
    ageRange: [30, 90],
    bodyZones: ['head', 'chest'],
    adaptiveQuestions: [],
    drugRecommendations: [],
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.',
    createdAt: '2026-04-12T09:00:00Z',
    approvalStatus: 'review',
    isActive: true,
  },
];

type EditTab = 'basic' | 'symptoms' | 'protocol' | 'drugs' | 'questions';

export function WebRefKBDiseasesScreen() {
  const { clinicalKBData, addKBDisease, updateKBDisease, removeKBDisease, setKBDiseases } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [statusFilter, setStatusFilter] = useState<KBApprovalStatus | 'all'>('all');
  const [editingDisease, setEditingDisease] = useState<KBDisease | null>(null);
  const [editTab, setEditTab] = useState<EditTab>('basic');
  const [showModal, setShowModal] = useState(false);

  // Birinchi marta ochilganda mock ma'lumotlarni yuklash (agar bo'sh bo'lsa)
  React.useEffect(() => {
    if (clinicalKBData.length === 0) setKBDiseases(MOCK_DISEASES);
  }, []);

  const diseases = clinicalKBData;

  const filtered = useMemo(() => diseases.filter(d =>
    (category === 'Barchasi' || d.category === category) &&
    (statusFilter === 'all' || d.approvalStatus === statusFilter) &&
    (d.nameUz.toLowerCase().includes(search.toLowerCase()) ||
     d.nameLat.toLowerCase().includes(search.toLowerCase()) ||
     d.icd10.toLowerCase().includes(search.toLowerCase()))
  ), [diseases, category, statusFilter, search]);

  const statusBadge = (s: KBApprovalStatus) => {
    const map: Record<KBApprovalStatus, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Qoralama' },
      review: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Tekshiruvda' },
      approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Tasdiqlangan' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rad etilgan' },
    };
    return map[s];
  };

  const openNew = () => {
    const now = new Date().toISOString();
    setEditingDisease({
      id: `kb_${Date.now()}`, nameUz: '', nameLat: '', icd10: '', description: '',
      category: '', symptoms: [], requiredSymptoms: [], supportingSymptoms: [],
      excludingSymptoms: [], specialist: '', relatedSpecialists: [], tests: [],
      bodyZones: [], adaptiveQuestions: [], drugRecommendations: [],
      createdBy: 'current_user', createdByName: 'Joriy foydalanuvchi',
      createdAt: now, approvalStatus: 'draft', isActive: true,
    });
    setEditTab('basic');
    setShowModal(true);
  };

  const openEdit = (d: KBDisease) => {
    setEditingDisease({ ...d });
    setEditTab('basic');
    setShowModal(true);
  };

  const saveDisease = () => {
    if (!editingDisease || !editingDisease.nameUz.trim()) return;
    const updated = { ...editingDisease, updatedAt: new Date().toISOString(), updatedBy: 'current_user', updatedByName: 'Joriy foydalanuvchi' };
    addKBDisease(updated); // appStore + localStorage ga saqlaydi
    setShowModal(false);
    setEditingDisease(null);
  };

  const deleteDisease = (id: string) => {
    removeKBDisease(id); // appStore + localStorage dan o'chiradi
  };

  const updateField = <K extends keyof KBDisease>(key: K, value: KBDisease[K]) => {
    if (!editingDisease) return;
    setEditingDisease({ ...editingDisease, [key]: value });
  };

  const TABS: { key: EditTab; label: string; icon: React.ReactNode }[] = [
    { key: 'basic', label: 'Asosiy', icon: <FileText className="w-4 h-4" /> },
    { key: 'symptoms', label: 'Simptomlar', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'protocol', label: 'Protokol', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'drugs', label: 'Dorilar', icon: <Pill className="w-4 h-4" /> },
    { key: 'questions', label: 'Savollar', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <WebPlatformLayout title="Kasalliklar bazasi" subtitle="Klinik bilim bazasi — kasalliklar, simptomlar, protokollar">
      <div className="p-6 space-y-5">
        {/* Filtrlar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ICD-10, kasallik nomi yoki lotincha nomi..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 min-w-[180px]">
              {DISEASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Yangi kasallik
            </button>
          </div>

          {/* Status filtrlar */}
          <div className="flex gap-2 mt-3">
            {STATUS_OPTIONS.map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}>{s.label}</button>
            ))}
          </div>
        </motion.div>

        {/* Statistika */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Jami', value: diseases.length, color: 'text-slate-300' },
            { label: 'Tasdiqlangan', value: diseases.filter(d => d.approvalStatus === 'approved').length, color: 'text-emerald-400' },
            { label: 'Qoralama', value: diseases.filter(d => d.approvalStatus === 'draft').length, color: 'text-yellow-400' },
            { label: 'Tekshiruvda', value: diseases.filter(d => d.approvalStatus === 'review').length, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Jadval */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase">
                <th className="px-5 py-3">ICD-10</th>
                <th className="px-5 py-3">Kasallik</th>
                <th className="px-5 py-3">Kategoriya</th>
                <th className="px-5 py-3">Mutaxassis</th>
                <th className="px-5 py-3">Holat</th>
                <th className="px-5 py-3">Kiritgan</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const badge = statusBadge(d.approvalStatus);
                return (
                  <motion.tr key={d.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => openEdit(d)}
                  >
                    <td className="px-5 py-3">
                      <span className="text-indigo-400 font-mono text-sm">{d.icd10}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-white text-sm font-medium">{d.nameUz}</p>
                      <p className="text-slate-500 text-xs">{d.nameLat}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{d.category}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-sky-400 text-sm">{d.specialist}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400 text-xs">{d.createdByName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(d)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDisease(d.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">Kasallik topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════ TAHRIRLASH MODALI ══════ */}
      <AnimatePresence>
        {showModal && editingDisease && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 lg:inset-x-[10%] lg:inset-y-[3%] bg-slate-900 border border-slate-700 rounded-2xl z-50 flex flex-col overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div>
                  <h2 className="text-white text-lg font-semibold">
                    {editingDisease.nameUz || 'Yangi kasallik'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {editingDisease.icd10 && `ICD-10: ${editingDisease.icd10} · `}
                    Kiritgan: {editingDisease.createdByName} · {new Date(editingDisease.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Tablar */}
              <div className="flex border-b border-slate-800 px-6">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setEditTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      editTab === t.key
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-white'
                    }`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* ── ASOSIY ── */}
                {editTab === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nomi (o'zbekcha) *</label>
                      <input value={editingDisease.nameUz} onChange={e => updateField('nameUz', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nomi (lotincha) *</label>
                      <input value={editingDisease.nameLat} onChange={e => updateField('nameLat', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">ICD-10 kodi *</label>
                      <input value={editingDisease.icd10} onChange={e => updateField('icd10', e.target.value)}
                        placeholder="Masalan: G43.9"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Kategoriya *</label>
                      <select value={editingDisease.category} onChange={e => updateField('category', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                        <option value="">Tanlang...</option>
                        {DISEASE_CATEGORIES.filter(c => c !== 'Barchasi').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Asosiy mutaxassis *</label>
                      <input value={editingDisease.specialist} onChange={e => updateField('specialist', e.target.value)}
                        placeholder="Masalan: Nevropatolog"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Yaqin mutaxassislar</label>
                      <input value={editingDisease.relatedSpecialists.join(', ')}
                        onChange={e => updateField('relatedSpecialists', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Nevrolog, Terapevt (vergul bilan)"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-400 mb-1 block">Tavsif</label>
                      <textarea value={editingDisease.description} onChange={e => updateField('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Tavsiya etilgan tahlillar</label>
                      <input value={editingDisease.tests.join(', ')}
                        onChange={e => updateField('tests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="EKG, Qon tahlili (vergul bilan)"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Tasdiqlash holati</label>
                      <select value={editingDisease.approvalStatus}
                        onChange={e => updateField('approvalStatus', e.target.value as KBApprovalStatus)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                        <option value="draft">Qoralama</option>
                        <option value="review">Tekshiruvga yuborish</option>
                        <option value="approved">Tasdiqlangan</option>
                        <option value="rejected">Rad etilgan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Tana zonalari</label>
                      <div className="flex flex-wrap gap-1.5">
                        {BODY_ZONES.map(z => (
                          <button key={z.id}
                            onClick={() => {
                              const zones = editingDisease.bodyZones.includes(z.id)
                                ? editingDisease.bodyZones.filter(bz => bz !== z.id)
                                : [...editingDisease.bodyZones, z.id];
                              updateField('bodyZones', zones);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                              editingDisease.bodyZones.includes(z.id)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}>{z.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SIMPTOMLAR ── */}
                {editTab === 'symptoms' && (
                  <div className="space-y-5">
                    {[
                      { label: 'Majburiy simptomlar (required)', key: 'requiredSymptoms' as const, color: 'red' },
                      { label: "Qo'llab-quvvatlovchi simptomlar (supporting)", key: 'supportingSymptoms' as const, color: 'yellow' },
                      { label: 'Istisno qiluvchi simptomlar (excluding)', key: 'excludingSymptoms' as const, color: 'slate' },
                      { label: 'Umumiy simptomlar', key: 'symptoms' as const, color: 'blue' },
                    ].map(section => (
                      <div key={section.key}>
                        <label className="text-xs text-slate-400 mb-2 block font-medium">{section.label}</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editingDisease[section.key].map((s: string) => (
                            <span key={s} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-${section.color}-500/10 text-${section.color}-400`}>
                              {s}
                              <button onClick={() => updateField(section.key, editingDisease[section.key].filter((x: string) => x !== s))}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input placeholder="Yangi simptom..."
                            onKeyDown={e => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!editingDisease[section.key].includes(val)) {
                                  updateField(section.key, [...editingDisease[section.key], val]);
                                }
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        {/* Tezkor tanlash */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {COMMON_SYMPTOMS.filter(cs => !editingDisease[section.key].includes(cs)).slice(0, 8).map(cs => (
                            <button key={cs} onClick={() => updateField(section.key, [...editingDisease[section.key], cs])}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-500 hover:text-white transition-colors">
                              + {cs}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PROTOKOL ── */}
                {editTab === 'protocol' && (
                  <div className="space-y-4">
                    {(() => {
                      const proto = editingDisease.diagnosticProtocol || {
                        diagnosticSteps: [], treatmentGuidelines: [], redFlags: [],
                        source: '', sourceUrl: '', evidenceLevel: undefined, lastReviewed: undefined,
                      };
                      const updateProto = (field: string, value: any) => {
                        updateField('diagnosticProtocol', { ...proto, [field]: value });
                      };
                      return (
                        <>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Diagnostika bosqichlari</label>
                            <textarea value={proto.diagnosticSteps.join('\n')}
                              onChange={e => updateProto('diagnosticSteps', e.target.value.split('\n').filter(Boolean))}
                              rows={3} placeholder="Har bir bosqich yangi qatorda..."
                              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Davolash yo'riqnomalari</label>
                            <textarea value={proto.treatmentGuidelines.join('\n')}
                              onChange={e => updateProto('treatmentGuidelines', e.target.value.split('\n').filter(Boolean))}
                              rows={3} placeholder="Har bir yo'riqnoma yangi qatorda..."
                              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              Red flags (xavfli belgilar)
                            </label>
                            <textarea value={proto.redFlags.join('\n')}
                              onChange={e => updateProto('redFlags', e.target.value.split('\n').filter(Boolean))}
                              rows={2} placeholder="Har bir xavfli belgi yangi qatorda..."
                              className="w-full px-4 py-2.5 bg-slate-800 border border-red-500/30 rounded-xl text-sm text-white outline-none focus:border-red-500 resize-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Manba (protokol nomi) *</label>
                              <input value={proto.source} onChange={e => updateProto('source', e.target.value)}
                                placeholder="Masalan: WHO Guidelines 2022"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Manba URL</label>
                              <input value={proto.sourceUrl || ''} onChange={e => updateProto('sourceUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Dalillar darajasi</label>
                              <select value={proto.evidenceLevel || ''} onChange={e => updateProto('evidenceLevel', e.target.value || undefined)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                                <option value="">Tanlanmagan</option>
                                <option value="A">A — Yuqori (RCT, meta-analiz)</option>
                                <option value="B">B — O'rta (kogorta, case-control)</option>
                                <option value="C">C — Past (ekspert fikri)</option>
                                <option value="D">D — Juda past (empirik)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Oxirgi ko'rib chiqilgan sana</label>
                              <input type="date" value={proto.lastReviewed || ''}
                                onChange={e => updateProto('lastReviewed', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* ── DORILAR ── */}
                {editTab === 'drugs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300 font-medium">Dori tavsiylari</label>
                      <button onClick={() => {
                        const newDrug: DrugRecommendation = {
                          id: `dr_${Date.now()}`, drugName: '', dosage: '', frequency: '',
                          duration: '', contraindications: [], sideEffects: [], source: '', isFirstLine: false,
                        };
                        updateField('drugRecommendations', [...editingDisease.drugRecommendations, newDrug]);
                      }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs">
                        <Plus className="w-3 h-3" /> Dori qo'shish
                      </button>
                    </div>
                    {editingDisease.drugRecommendations.map((drug, idx) => (
                      <div key={drug.id} className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">#{idx + 1} {drug.isFirstLine && '(Birinchi qator)'}</span>
                          <button onClick={() => updateField('drugRecommendations', editingDisease.drugRecommendations.filter(d => d.id !== drug.id))}
                            className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input value={drug.drugName} placeholder="Dori nomi *"
                            onChange={e => {
                              const updated = editingDisease.drugRecommendations.map(d => d.id === drug.id ? { ...d, drugName: e.target.value } : d);
                              updateField('drugRecommendations', updated);
                            }}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                          <input value={drug.dosage} placeholder="Dozasi (masalan: 400mg)"
                            onChange={e => {
                              const updated = editingDisease.drugRecommendations.map(d => d.id === drug.id ? { ...d, dosage: e.target.value } : d);
                              updateField('drugRecommendations', updated);
                            }}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                          <input value={drug.frequency} placeholder="Qabul qilish tartibi"
                            onChange={e => {
                              const updated = editingDisease.drugRecommendations.map(d => d.id === drug.id ? { ...d, frequency: e.target.value } : d);
                              updateField('drugRecommendations', updated);
                            }}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                          <input value={drug.source} placeholder="Manba (protokol)"
                            onChange={e => {
                              const updated = editingDisease.drugRecommendations.map(d => d.id === drug.id ? { ...d, source: e.target.value } : d);
                              updateField('drugRecommendations', updated);
                            }}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={drug.isFirstLine}
                            onChange={e => {
                              const updated = editingDisease.drugRecommendations.map(d => d.id === drug.id ? { ...d, isFirstLine: e.target.checked } : d);
                              updateField('drugRecommendations', updated);
                            }}
                            className="rounded border-slate-600" />
                          <span className="text-xs text-slate-400">Birinchi qator dori</span>
                        </label>
                      </div>
                    ))}
                    {editingDisease.drugRecommendations.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        <Pill className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Dori tavsiylari hali kiritilmagan
                      </div>
                    )}
                  </div>
                )}

                {/* ── SAVOLLAR ── */}
                {editTab === 'questions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300 font-medium">Adaptiv savollar (qaror daraxti)</label>
                      <button onClick={() => {
                        const newQ: AdaptiveQuestion = {
                          id: `aq_${Date.now()}`, question: '', type: 'radio', options: [],
                        };
                        updateField('adaptiveQuestions', [...editingDisease.adaptiveQuestions, newQ]);
                      }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs">
                        <Plus className="w-3 h-3" /> Savol qo'shish
                      </button>
                    </div>
                    {editingDisease.adaptiveQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Savol #{idx + 1}</span>
                          <button onClick={() => updateField('adaptiveQuestions', editingDisease.adaptiveQuestions.filter(x => x.id !== q.id))}
                            className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <input value={q.question} placeholder="Savol matni *"
                          onChange={e => {
                            const updated = editingDisease.adaptiveQuestions.map(x => x.id === q.id ? { ...x, question: e.target.value } : x);
                            updateField('adaptiveQuestions', updated);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                        <div className="flex gap-3">
                          <select value={q.type}
                            onChange={e => {
                              const updated = editingDisease.adaptiveQuestions.map(x => x.id === q.id ? { ...x, type: e.target.value as any } : x);
                              updateField('adaptiveQuestions', updated);
                            }}
                            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500">
                            <option value="radio">Radio (bitta tanlash)</option>
                            <option value="checkbox">Checkbox (ko'p tanlash)</option>
                            <option value="slider">Slider (shkala)</option>
                            <option value="text">Matn (erkin)</option>
                          </select>
                        </div>
                        {(q.type === 'radio' || q.type === 'checkbox') && (
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Javob variantlari (vergul bilan)</label>
                            <input value={(q.options || []).join(', ')}
                              onChange={e => {
                                const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                const updated = editingDisease.adaptiveQuestions.map(x => x.id === q.id ? { ...x, options: opts } : x);
                                updateField('adaptiveQuestions', updated);
                              }}
                              placeholder="Variant 1, Variant 2, Variant 3..."
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                          </div>
                        )}
                      </div>
                    ))}
                    {editingDisease.adaptiveQuestions.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Savollar hali kiritilmagan
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  {editingDisease.updatedAt && (
                    <span>Oxirgi o'zgarish: {editingDisease.updatedByName} · {new Date(editingDisease.updatedAt).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                    Bekor qilish
                  </button>
                  <button onClick={saveDisease}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
                    <Check className="w-4 h-4" />
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WebPlatformLayout>
  );
}
