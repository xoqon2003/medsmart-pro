import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { contactService } from '../../../../services/api/contactService';
import type { MessageTemplate } from '../../../types';
import {
  ChevronLeft, Plus, Edit3, Trash2, X, Save, Loader2, FileText,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'COMPLAINT', label: 'Shikoyat' },
  { value: 'SYMPTOM', label: 'Simptom' },
  { value: 'FOLLOW_UP', label: 'Takror murojaat' },
];

export function DoctorTemplateManager() {
  const { goBack } = useNavigation();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: MessageTemplate } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'COMPLAINT', title: '', content: '' });

  const loadTemplates = () => {
    setLoading(true);
    contactService.getTemplates()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTemplates(); }, []);

  const openAdd = () => {
    setForm({ category: 'COMPLAINT', title: '', content: '' });
    setModal({ mode: 'add' });
  };

  const openEdit = (item: MessageTemplate) => {
    setForm({ category: item.category, title: item.title, content: item.content });
    setModal({ mode: 'edit', item });
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      if (modal?.mode === 'add') {
        await contactService.createTemplate(form);
      } else if (modal?.item) {
        await contactService.updateTemplate(modal.item.id, form);
      }
      setModal(null);
      loadTemplates();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await contactService.deleteTemplate(id);
    loadTemplates();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1">Xabar shablonlari</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Add */}
        <button
          onClick={openAdd}
          className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium hover:border-blue-300"
        >
          <Plus size={18} /> Yangi shablon
        </button>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <FileText size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Shablonlar yo'q</p>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {CATEGORIES.find(c => c.value === t.category)?.label ?? t.category}
                  </span>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{t.usageCount} marta ishlatilgan</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100">
                    <Edit3 size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-900">
                {modal.mode === 'add' ? 'Yangi shablon' : 'Shablonni tahrirlash'}
              </h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Kategoriya</label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Sarlavha <span className="text-red-400">*</span></label>
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  placeholder="Shablon nomi"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Mazmun <span className="text-red-400">*</span></label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="Shablon matni..."
                />
              </div>
            </div>

            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
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
