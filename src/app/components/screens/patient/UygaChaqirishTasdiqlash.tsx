import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Phone, Clock, Stethoscope, FileText, CheckSquare, Square, ChevronRight, Edit3, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const SPECIALITY_LABELS: Record<string, string> = {
  general: "Umumiy amaliyot shifokori (Terapevt)",
  pediatr: "Pediatr (0-18 yosh)",
  cardio: "Kardiolog",
  neuro: "Nevropatolog",
  endo: "Endokrinolog",
  feldsher: "Feldsher / Hamshira",
  unknown: "Terapevt (mutaxassis aniqlanadi)",
};
const DAY_LABELS: Record<string, string> = {
  today: 'Bugun',
  tomorrow: 'Ertaga',
  'day-after': '2 kun keyin',
};

const CONSENTS = [
  "Uyga chaqirish xizmati shartlarini o'qidim va qabul qilaman",
  "Shaxsiy ma'lumotlarimni qayta ishlashga roziman (PDPL 2019)",
  "Belgilangan vaqtda uyda bo'lishimni tasdiqlayman",
];

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-6 flex-shrink-0 flex justify-center mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs mb-0.5">{label}</p>
        <p className="text-gray-800 text-sm font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children, screen, onEdit }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
  screen: string; onEdit: (s: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50">
        <div className="flex items-center gap-2 text-gray-700 text-sm font-semibold">
          {icon}{title}
        </div>
        <button onClick={() => onEdit(screen)} className="flex items-center gap-1 text-orange-500 text-xs font-medium">
          <Edit3 className="w-3 h-3" /> O'zgartirish
        </button>
      </div>
      <div className="px-4 pb-3">{children}</div>
    </div>
  );
}

export function UygaChaqirishTasdiqlash() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation, addApplication, currentUser } = useApp();
  const d = draftConsultation;

  const [consents, setConsents] = useState([false, false, false]);
  const [allChecked, setAllChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleConsent = (i: number) => {
    const next = [...consents];
    next[i] = !next[i];
    setConsents(next);
    setAllChecked(next.every(Boolean));
  };
  const toggleAll = () => {
    const allOn = !allChecked;
    setAllChecked(allOn);
    setConsents([allOn, allOn, allOn]);
  };

  const canSubmit = consents.every(Boolean);

  const handleEdit = (screen: string) => navigate(screen as Parameters<typeof navigate>[0]);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const now = new Date().toISOString();
    const arizaNum = `HV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    addApplication({
      id: Date.now(),
      arizaNumber: arizaNum,
      patientId: currentUser?.id || 1,
      patient: currentUser || undefined,
      status: 'new' as const,
      scanType: 'Uyga chaqirish',
      organ: SPECIALITY_LABELS[d.hvSpeciality || 'general'] || d.hvSpeciality || '',
      serviceType: 'home_visit' as const,
      urgency: 'normal' as const,
      scanDate: now.split('T')[0],
      scanFacility: `${d.hvRegion || ''}, ${d.hvDistrict || ''}`,
      price: 150000,
      notes: `Uyga chaqirish | ${DAY_LABELS[d.hvVisitDay || ''] || ''} ${d.hvTimeSlot || ''} | ${d.hvLastName || ''} ${d.hvFirstName || ''}`,
      hvVisitDay: d.hvVisitDay,
      hvTimeSlot: d.hvTimeSlot,
      hvAddress: [d.hvStreet, d.hvHouseNum, d.hvApartment ? `kv.${d.hvApartment}` : ''].filter(Boolean).join(', '),
      createdAt: now,
      updatedAt: now,
      files: [],
    });

    setLoading(false);
    setDone(true);
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>
        <h1 className="text-gray-800 text-xl font-bold mb-2">Ariza qabul qilindi!</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Sizning uyga chaqirish arizangiz muvaffaqiyatli yuborildi.<br />
          Tez orada SMS xabar olasiz.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 w-full max-w-xs mb-6">
          <p className="text-orange-700 text-xs font-medium mb-1">Ariza raqami</p>
          <p className="text-orange-800 text-lg font-bold">{`HV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 w-full text-left space-y-2 mb-8 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-medium">Holat bildirishnomalari:</p>
          <div className="flex items-center gap-2 text-sm text-gray-700"><span className="text-yellow-500">🟡</span> SMS: "Ariza qabul qilindi"</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><span className="text-blue-500">🔵</span> Tasdiqlanganda SMS yuboriladi</div>
          <div className="flex items-center gap-2 text-sm text-gray-700"><span className="text-orange-500">🚗</span> Shifokor yo'lda — SMS bildirishnoma</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('patient_home')}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-orange-200"
        >
          Bosh sahifaga qaytish
        </motion.button>
      </div>
    );
  }

  // ── Main confirm screen ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-orange-100 text-xs">5-qadam / 5</p>
            <h1 className="text-white text-lg font-bold">Tasdiqlash</h1>
            <p className="text-orange-100/80 text-xs mt-0.5">Ma'lumotlarni tekshiring va yuboring</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white" />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-32 space-y-3">
        {/* Manzil */}
        <Section title="Manzil" icon={<MapPin className="w-4 h-4 text-orange-500" />} screen="home_visit_address" onEdit={handleEdit}>
          <Row icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />} label="Viloyat / Tuman" value={`${d.hvRegion || '—'}, ${d.hvDistrict || '—'}`} />
          <Row icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />} label="Ko'cha / Uy" value={`${d.hvStreet || '—'}, ${d.hvHouseNum || '—'}${d.hvApartment ? `, kv. ${d.hvApartment}` : ''}`} />
          {d.hvLandmark && <Row icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />} label="Mo'ljal" value={d.hvLandmark} />}
          {(d.hvLat && d.hvLng) && <Row icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />} label="GPS" value={`${d.hvLat.toFixed(4)}, ${d.hvLng.toFixed(4)}`} />}
        </Section>

        {/* Aloqa */}
        <Section title="Bemor ma'lumotlari" icon={<Phone className="w-4 h-4 text-orange-500" />} screen="home_visit_contact" onEdit={handleEdit}>
          <Row icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="Telefon" value={d.hvPhone || '—'} />
          <Row icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="F.I.O" value={`${d.hvLastName || ''} ${d.hvFirstName || ''}`.trim() || '—'} />
          {d.hvBirthDate && <Row icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="Tug'ilgan sana" value={d.hvBirthDate} />}
          {d.hvExtraPhone && <Row icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="Qo'shimcha telefon" value={'+998 ' + d.hvExtraPhone} />}
          {d.hvTelegram && <Row icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="Telegram" value={'@' + d.hvTelegram} />}
        </Section>

        {/* Vaqt */}
        <Section title="Tashrif vaqti" icon={<Clock className="w-4 h-4 text-orange-500" />} screen="home_visit_time" onEdit={handleEdit}>
          <Row icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Kun" value={DAY_LABELS[d.hvVisitDay || ''] || '—'} />
          <Row icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Vaqt oralig'i" value={d.hvTimeSlot || '—'} />
          {d.hvVisitNote && <Row icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Izoh" value={d.hvVisitNote} />}
        </Section>

        {/* Mutaxassis */}
        <Section title="Mutaxassis va shikoyat" icon={<Stethoscope className="w-4 h-4 text-orange-500" />} screen="home_visit_specialist" onEdit={handleEdit}>
          <Row icon={<Stethoscope className="w-3.5 h-3.5 text-gray-400" />} label="Mutaxassis" value={SPECIALITY_LABELS[d.hvSpeciality || ''] || d.hvSpeciality || '—'} />
          {d.hvSymptoms && d.hvSymptoms.length > 0 && (
            <Row icon={<FileText className="w-3.5 h-3.5 text-gray-400" />} label="Belgilar" value={d.hvSymptoms.join(', ')} />
          )}
          {d.hvComplaintsText && <Row icon={<FileText className="w-3.5 h-3.5 text-gray-400" />} label="Shikoyat" value={d.hvComplaintsText} />}
          {d.hvDuration && <Row icon={<Clock className="w-3.5 h-3.5 text-gray-400" />} label="Davomiyligi" value={d.hvDuration} />}
        </Section>

        {/* Narx */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-orange-700 text-xs font-medium">Taxminiy narx</p>
            <p className="text-orange-800 text-sm text-gray-500 mt-0.5">To'lov shifokor tashrifi so'ng amalga oshiriladi</p>
          </div>
          <p className="text-orange-700 text-lg font-bold">150 000 so'm</p>
        </div>

        {/* Rozilik */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {/* Barchasini belgilash */}
          <button onClick={toggleAll} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-3 transition-all ${allChecked ? 'border-orange-400 bg-orange-50' : submitted && !canSubmit ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            {allChecked ? <CheckSquare className="w-5 h-5 text-orange-500 flex-shrink-0" /> : <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <span className={`text-sm font-semibold ${allChecked ? 'text-orange-700' : 'text-gray-700'}`}>Barchasini belgilash</span>
          </button>
          <div className="space-y-2">
            {CONSENTS.map((text, i) => (
              <button
                key={i}
                onClick={() => toggleConsent(i)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${consents[i] ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                {consents[i] ? <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                <span className={`text-xs leading-relaxed ${consents[i] ? 'text-green-700' : 'text-gray-600'}`}>{text}</span>
              </button>
            ))}
          </div>
          {submitted && !canSubmit && (
            <p className="text-red-500 text-xs mt-2 text-center">Barcha rozilik bandlarini belgilang</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            canSubmit ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Yuborilmoqda...</span></>
          ) : (
            <><Send className="w-4 h-4" /><span>Ariza yuborish</span></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
