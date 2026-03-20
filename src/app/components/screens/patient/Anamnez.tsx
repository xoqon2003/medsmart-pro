import React, { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const STEP_LABELS = ['Tasvir', 'Shikoyat', 'Xizmat', 'Shartnoma', "To'lov"];
const DURATION_OPTIONS = ['1 kun', '1 hafta', '1 oy', '3 oy', 'Yildan ko\'p'];

export function Anamnez() {
  const { draftApplication, updateDraft, navigate, goBack } = useApp();
  const [form, setForm] = useState({
    complaint: draftApplication.complaint || '',
    duration: draftApplication.duration || '',
    hasPain: draftApplication.hasPain ?? false,
    painLevel: draftApplication.painLevel || 5,
    previousTreatment: draftApplication.previousTreatment || '',
    medications: draftApplication.medications || '',
    allergies: draftApplication.allergies || '',
    additionalInfo: draftApplication.additionalInfo || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.complaint || form.complaint.length < 20) errs.complaint = "Shikoyat kamida 20 ta belgi bo'lishi kerak";
    if (!form.duration) errs.duration = "Qancha vaqtdan buyon ekanligini tanlang";
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    updateDraft({ ...form });
    navigate('patient_service');
  };

  const painColors = ['', '#22c55e', '#86efac', '#fde68a', '#fb923c', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Shikoyat va anamnez</h1>
            <p className="text-blue-200 text-xs">2-bosqich: Klinik ma'lumotlar</p>
          </div>
        </div>
        <div className="flex gap-1.5 mb-1">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className={`h-1 flex-1 rounded-full ${i <= 1 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Complaint */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="text-gray-700 text-sm mb-2 block">Asosiy shikoyat *</label>
          <textarea
            value={form.complaint}
            onChange={e => { setForm(p => ({ ...p, complaint: e.target.value })); setErrors(p => ({ ...p, complaint: '' })); }}
            placeholder="Asosiy shikoyatingizni batafsil yozing (kamida 20 belgi)..."
            rows={4}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none ${errors.complaint ? 'border-red-300' : 'border-gray-200'}`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.complaint ? (
              <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.complaint}</span>
            ) : <span />}
            <span className="text-gray-400 text-xs">{form.complaint.length}/500</span>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Qachondan buyon? *</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => { setForm(p => ({ ...p, duration: d })); setErrors(p => ({ ...p, duration: '' })); }}
                className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                  form.duration === d ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {errors.duration && <p className="text-red-500 text-xs mt-2">{errors.duration}</p>}
        </div>

        {/* Pain */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Og'riq bormi?</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['true', "Ha"], ['false', "Yo'q"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setForm(p => ({ ...p, hasPain: val === 'true' }))}
                className={`py-2.5 rounded-xl border text-sm transition-all ${
                  String(form.hasPain) === val
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {form.hasPain && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-gray-600 text-sm">Og'riq darajasi</p>
                <span className="text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: painColors[form.painLevel] + '30', color: painColors[form.painLevel] }}>
                  {form.painLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={form.painLevel}
                onChange={e => setForm(p => ({ ...p, painLevel: Number(e.target.value) }))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 - Kam</span>
                <span>10 - O'ta kuchli</span>
              </div>
            </div>
          )}
        </div>

        {/* Previous treatment */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div>
            <p className="text-gray-700 text-sm mb-1">Avval muolaja bo'lganmi?</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[['true', "Ha"], ['false', "Yo'q"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm(p => ({ ...p, previousTreatment: val === 'false' ? '' : p.previousTreatment }))}
                  className={`py-2 rounded-xl border text-sm transition-all ${
                    (val === 'true' && form.previousTreatment) || (val === 'false' && !form.previousTreatment)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {form.previousTreatment !== undefined && (
              <textarea
                value={form.previousTreatment}
                onChange={e => setForm(p => ({ ...p, previousTreatment: e.target.value }))}
                placeholder="Qanday muolaja bo'lganini yozing..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            )}
          </div>

          <div>
            <label className="text-gray-600 text-xs mb-1 block">Qabul qilinayotgan dorilar</label>
            <input
              value={form.medications}
              onChange={e => setForm(p => ({ ...p, medications: e.target.value }))}
              placeholder="Lisinopril 10mg, Metformin... (ixtiyoriy)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-xs mb-1 block">Allergiyalar</label>
            <input
              value={form.allergies}
              onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))}
              placeholder="Penitsillin, aspirin... (ixtiyoriy)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-gray-600 text-xs mb-1 block">Qo'shimcha ma'lumot (500 belgi)</label>
            <textarea
              value={form.additionalInfo}
              onChange={e => { if (e.target.value.length <= 500) setForm(p => ({ ...p, additionalInfo: e.target.value })); }}
              placeholder="Boshqa muhim ma'lumotlar..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-gray-400 text-xs text-right mt-1">{form.additionalInfo.length}/500</p>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>Davom etish</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
