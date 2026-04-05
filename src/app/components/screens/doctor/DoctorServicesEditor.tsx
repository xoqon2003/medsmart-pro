import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { faqService } from '../../../../services/api/faqService';
import { doctorService } from '../../../../services/api/doctorService';
import type { MedicalService } from '../../../types';
import { ChevronLeft, Plus, Edit3, Trash2, X, Save, Loader2, Stethoscope } from 'lucide-react';

const CATEGORIES = [
  { value: 'INSTRUMENTAL', label: 'Instrumental' },
  { value: 'LABORATORY', label: 'Laboratoriya' },
  { value: 'OPERATION', label: 'Operatsiya' },
  { value: 'CONSULTATION', label: 'Konsultatsiya' },
  { value: 'DIAGNOSTICS', label: 'Diagnostika' },
];

export function DoctorServicesEditor() {
  const { goBack } = useApp();
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: MedicalService } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'CONSULTATION', price: '', description: '', duration: '' });

  const load = () => {
    doctorService.getMyProfile()
      .then(p => faqService.getPublicServices(p.id))
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ name: '', category: 'CONSULTATION', price: '', description: '', duration: '' });
    setModal({ mode: 'add' });
  };

  const openEdit = (item: MedicalService) => {
    setForm({
      name: item.name,
      category: item.category,
      price: item.price?.toString() ?? '',
      description: item.description ?? '',
      duration: item.duration ?? '',
    });
    setModal({ mode: 'edit', item });
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data: any = { name: form.name, category: form.category, description: form.description || undefined, duration: form.duration || undefined };
      if (form.price) data.price = +form.price;
      if (modal?.mode === 'add') await faqService.createService(data);
      else if (modal?.item) await faqService.updateService(modal.item.id, data);
      setModal(null);
      load();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await faqService.deleteService(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1">Xizmatlar boshqaruvi</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        <button onClick={openAdd} className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium hover:border-blue-300">
          <Plus size={18} /> Yangi xizmat
        </button>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Stethoscope size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Xizmatlar yo'q</p>
          </div>
        ) : services.map(svc => (
          <div key={svc.id} className="bg-white rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {CATEGORIES.find(c => c.value === svc.category)?.label ?? svc.category}
                  </span>
                  {svc.price && <span className="text-xs font-bold text-blue-600">{svc.price.toLocaleString('uz-UZ')} so'm</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(svc)} className="p-2 rounded-lg hover:bg-gray-100"><Edit3 size={14} className="text-gray-400" /></button>
                <button onClick={() => handleDelete(svc.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-900">{modal.mode === 'add' ? 'Yangi xizmat' : 'Tahrirlash'}</h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Xizmat nomi <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Kategoriya</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Narxi (so'm)</label>
                <input type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Davomiyligi</label>
                <input value={form.duration} onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm" placeholder="30 daqiqa" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tavsif</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none" />
              </div>
            </div>
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button onClick={handleSave} disabled={saving || !form.name} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
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
