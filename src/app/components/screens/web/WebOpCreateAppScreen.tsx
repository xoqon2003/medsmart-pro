import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, FileText, Upload, CreditCard, CheckCircle, ChevronRight, Search, Phone } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const STEPS = [
  { num: 1, label: 'Bemor', icon: User },
  { num: 2, label: 'Xizmat', icon: FileText },
  { num: 3, label: 'Ma\'lumotlar', icon: Upload },
  { num: 4, label: 'To\'lov', icon: CreditCard },
  { num: 5, label: 'Tasdiqlash', icon: CheckCircle },
];
const SERVICES = [
  { key: 'ai_radiolog', label: 'AI + Radiolog', desc: 'Sun\'iy intellekt + radiolog xulosasi', price: 150000 },
  { key: 'radiolog_only', label: 'Faqat Radiolog', desc: 'Radiolog xulosasi', price: 200000 },
  { key: 'radiolog_specialist', label: 'Radiolog + Mutaxassis', desc: 'Radiolog + mutaxassis xulosasi', price: 350000 },
  { key: 'consultation', label: 'Konsultatsiya', desc: 'Onlayn yoki oflayn konsultatsiya', price: 150000 },
  { key: 'home_visit', label: 'Uyga chaqirish', desc: 'Shifokor uyga keladi', price: 300000 },
];
const PAYMENTS = ['Naqd', 'Karta (terminal)', 'Payme', 'Click', 'Uzum'];

export function WebOpCreateAppScreen() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [service, setService] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [complaints, setComplaints] = useState('');
  const [payMethod, setPayMethod] = useState('Naqd');

  const selectedService = SERVICES.find(s => s.key === service);
  const urgencyMultiplier = urgency === 'urgent' ? 1.5 : urgency === 'emergency' ? 2 : 1;
  const total = selectedService ? selectedService.price * urgencyMultiplier : 0;

  return (
    <WebPlatformLayout title="Ariza yaratish" subtitle="Bemor nomidan yangi ariza">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${step >= s.num ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          {/* Step 1: Bemor */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Bemor ma'lumotlari</h3>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 __ ___ __ __"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-indigo-500" />
              </div>
              <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Bemor to'liq ismi"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-indigo-500" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Tug'ilgan yili" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-indigo-500" />
                <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none">
                  <option>Erkak</option><option>Ayol</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Xizmat */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Xizmat turini tanlang</h3>
              <div className="grid gap-3">
                {SERVICES.map(s => (
                  <button key={s.key} onClick={() => setService(s.key)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors text-left ${service === s.key ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                    <div><p className="text-white text-sm font-medium">{s.label}</p><p className="text-slate-400 text-xs">{s.desc}</p></div>
                    <span className="text-indigo-400 text-sm font-medium">{s.price.toLocaleString()} so'm</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Ustuvorlik</label>
                <div className="flex gap-2">
                  {[{ k: 'normal', l: 'Oddiy', c: 'border-slate-700' }, { k: 'urgent', l: 'Shoshilinch (x1.5)', c: 'border-amber-500/50' }, { k: 'emergency', l: 'Favqulodda (x2)', c: 'border-red-500/50' }].map(u => (
                    <button key={u.k} onClick={() => setUrgency(u.k)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm transition-colors ${urgency === u.k ? 'bg-indigo-500/10 border-indigo-500 text-white' : `${u.c} text-slate-400 hover:text-white`}`}>{u.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ma'lumotlar */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Qo'shimcha ma'lumotlar</h3>
              <textarea value={complaints} onChange={e => setComplaints(e.target.value)} rows={4} placeholder="Shikoyatlar va izohlar..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none resize-none focus:border-indigo-500" />
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Fayllarni bu yerga tashlang yoki bosing</p>
                <p className="text-slate-600 text-xs mt-1">PDF, JPEG, PNG, DICOM</p>
              </div>
            </div>
          )}

          {/* Step 4: To'lov */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">To'lov usuli</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-1"><span className="text-slate-400 text-sm">Xizmat</span><span className="text-white text-sm">{selectedService?.label}</span></div>
                <div className="flex justify-between mb-1"><span className="text-slate-400 text-sm">Bazaviy narx</span><span className="text-white text-sm">{selectedService?.price.toLocaleString()} so'm</span></div>
                {urgency !== 'normal' && <div className="flex justify-between mb-1"><span className="text-slate-400 text-sm">Ustuvorlik</span><span className="text-amber-400 text-sm">x{urgencyMultiplier}</span></div>}
                <div className="flex justify-between pt-2 border-t border-slate-700"><span className="text-white font-semibold">Jami</span><span className="text-white font-bold text-lg">{total.toLocaleString()} so'm</span></div>
              </div>
              <div className="grid gap-2">
                {PAYMENTS.map(p => (
                  <button key={p} onClick={() => setPayMethod(p)}
                    className={`p-3 rounded-xl border text-sm text-left transition-colors ${payMethod === p ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Tasdiqlash */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Arizani tasdiqlang</h3>
              <div className="space-y-3">
                {[
                  { l: 'Bemor', v: patientName || 'Kiritilmagan' },
                  { l: 'Telefon', v: phone || 'Kiritilmagan' },
                  { l: 'Xizmat', v: selectedService?.label || '-' },
                  { l: 'Ustuvorlik', v: urgency === 'normal' ? 'Oddiy' : urgency === 'urgent' ? 'Shoshilinch' : 'Favqulodda' },
                  { l: 'Summa', v: total.toLocaleString() + " so'm" },
                  { l: 'To\'lov usuli', v: payMethod },
                  { l: 'Shikoyatlar', v: complaints || 'Kiritilmagan' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-500 text-sm">{r.l}</span>
                    <span className="text-white text-sm text-right max-w-[60%]">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
            <button onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors">Orqaga</button>
            <button onClick={() => step < 5 ? setStep(step + 1) : null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              {step === 5 ? 'Arizani yaratish' : 'Keyingi'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
