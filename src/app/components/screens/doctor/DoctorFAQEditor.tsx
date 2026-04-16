import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { faqService } from '../../../../services/api/faqService';
import { doctorService } from '../../../../services/api/doctorService';
import type { FAQ } from '../../../types';
import { ChevronLeft, Plus, Edit3, Trash2, X, Save, Loader2, HelpCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'OPERATION', label: 'Operatsiya' },
  { value: 'RECOVERY', label: 'Tiklanish' },
  { value: 'COSTS', label: 'Xarajatlar' },
  { value: 'CONSULTATION', label: 'Konsultatsiya' },
  { value: 'DIAGNOSTICS', label: 'Diagnostika' },
];

export function DoctorFAQEditor() {
  const { goBack } = useNavigation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: FAQ } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'CONSULTATION' });
  const [profileId, setProfileId] = useState('');

  const load = () => {
    doctorService.getMyProfile()
      .then(p => {
        setProfileId(p.id);
        return faqService.getPublicFaq(p.id);
      })
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ question: '', answer: '', category: 'CONSULTATION' });
    setModal({ mode: 'add' });
  };

  const openEdit = (item: FAQ) => {
    setForm({ question: item.question, answer: item.answer, category: item.category });
    setModal({ mode: 'edit', item });
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) return;
    setSaving(true);
    try {
      if (modal?.mode === 'add') await faqService.createFaq(form as any);
      else if (modal?.item) await faqService.updateFaq(modal.item.id, form);
      setModal(null);
      load();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await faqService.deleteFaq(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1">FAQ boshqaruvi</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        <button onClick={openAdd} className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium hover:border-blue-300">
          <Plus size={18} /> Yangi savol
        </button>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <HelpCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">FAQ lar yo'q</p>
          </div>
        ) : faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {CATEGORIES.find(c => c.value === faq.category)?.label ?? faq.category}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(faq)} className="p-2 rounded-lg hover:bg-gray-100">
                  <Edit3 size={14} className="text-gray-400" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-2 rounded-lg hover:bg-red-50">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-900">{modal.mode === 'add' ? 'Yangi FAQ' : 'Tahrirlash'}</h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Kategoriya</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Savol <span className="text-red-400">*</span></label>
                <input value={form.question} onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Javob <span className="text-red-400">*</span></label>
                <textarea value={form.answer} onChange={e => setForm(prev => ({ ...prev, answer: e.target.value }))} rows={4} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
            </div>
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button onClick={handleSave} disabled={saving || !form.question || !form.answer} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
