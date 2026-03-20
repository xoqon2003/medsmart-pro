import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Phone, Calendar, MapPin, Heart, ChevronRight, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/appStore';

export function PatientProfile() {
  const { currentUser, setUser, navigate, goBack } = useApp();
  const [form, setForm] = useState({
    fullName: currentUser?.fullName || '',
    birthDate: currentUser?.birthDate || '',
    gender: currentUser?.gender || 'male',
    phone: currentUser?.phone || '+998',
    city: currentUser?.city || '',
    chronicDiseases: currentUser?.chronicDiseases || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 5) newErrors.fullName = "To'liq ism kamida 5 ta belgi";
    if (!form.birthDate) newErrors.birthDate = "Tug'ilgan sana kiritilmadi";
    if (!form.phone.match(/^\+998\d{9}$/)) newErrors.phone = "+998 XX XXX XX XX formatida kiriting";
    return newErrors;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (currentUser) {
      setUser({ ...currentUser, ...form, gender: form.gender as 'male' | 'female' });
    }
    setSaved(true);
    setTimeout(() => navigate('patient_home'), 1200);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <p className="text-gray-800">Profil muvaffaqiyatli saqlandi!</p>
        <p className="text-gray-500 text-sm">Yo'naltirilmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white text-xl mb-1">Profil ma'lumotlari</h1>
          <p className="text-blue-200 text-sm">Bir martalik to'ldirish</p>
          {/* Progress */}
          <div className="mt-4 flex gap-1.5">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full ${n === 1 ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
          <p className="text-blue-200 text-xs mt-1">1/3 — Profil</p>
        </motion.div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> To'liq ism *
            </label>
            <input
              value={form.fullName}
              onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              placeholder="Familiya Ism Sharif"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.fullName ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Birth Date */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tug'ilgan sana *
            </label>
            <input
              type="date"
              value={form.birthDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.birthDate ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 block">Jinsi *</label>
            <div className="grid grid-cols-2 gap-2">
              {[['male', '👨 Erkak'], ['female', '👩 Ayol']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm(p => ({ ...p, gender: val }))}
                  className={`py-2.5 rounded-xl border text-sm transition-all ${
                    form.gender === val
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Telefon raqam *
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+998 90 123 45 67"
              type="tel"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* City */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Shahar / Manzil
            </label>
            <input
              value={form.city}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              placeholder="Toshkent"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Chronic diseases */}
          <div>
            <label className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Surunkali kasalliklar
            </label>
            <textarea
              value={form.chronicDiseases}
              onChange={e => setForm(p => ({ ...p, chronicDiseases: e.target.value }))}
              placeholder="Gipertoniya, diabet va h.k. (ixtiyoriy)"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>Saqlash va davom etish</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
