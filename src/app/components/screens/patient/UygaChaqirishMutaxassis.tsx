import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Stethoscope, FileText, AlertCircle, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const SPECIALITIES = [
  { id: 'general', label: "Umumiy amaliyot shifokori (Terapevt)", icon: '🩺' },
  { id: 'pediatr', label: "Pediatr (0-18 yosh)", icon: '👶' },
  { id: 'cardio', label: "Kardiolog", icon: '❤️' },
  { id: 'neuro', label: "Nevropatolog", icon: '🧠' },
  { id: 'endo', label: "Endokrinolog", icon: '🔬' },
  { id: 'feldsher', label: "Feldsher / Hamshira", icon: '💉' },
  { id: 'unknown', label: "Qaysi mutaxassis kerakligini bilmayman", icon: '❓' },
];

const SYMPTOMS = [
  "Harorat ko'tarilgan (isitma)",
  "Bosh og'riq",
  "Yurak / ko'krak og'rig'i",
  "Qorin og'rig'i",
  "Nafas qisinishi",
  "Bel og'rig'i",
  "Bosim ko'tarilgan",
  "Holsizlik / charchoq",
  "Yo'tal / shamollash",
];

const DURATIONS = [
  { id: 'today', label: 'Bugun boshlandi' },
  { id: '2-3', label: '2-3 kun' },
  { id: 'week', label: '1 hafta' },
  { id: 'more', label: "1 haftadan ko'p" },
];

const CHRONIC = [
  "Diabet",
  "Gipertoniya",
  "Yurak kasalligi",
  "Bronxial astma",
  "Buyrak kasalligi",
];

export function UygaChaqirishMutaxassis() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();

  const [speciality, setSpeciality] = useState(draftConsultation.hvSpeciality || '');
  const [complaints, setComplaints] = useState(draftConsultation.hvComplaintsText || '');
  const [symptoms, setSymptoms] = useState<string[]>(draftConsultation.hvSymptoms || []);
  const [otherSymptom, setOtherSymptom] = useState('');
  const [duration, setDuration] = useState(draftConsultation.hvDuration || '');
  const [chronic, setChronic] = useState<string[]>(draftConsultation.hvChronicDiseases || []);
  const [noChronicDiseases, setNoChronicDiseases] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSpecialities, setShowSpecialities] = useState(false);

  const selectedSpec = SPECIALITIES.find((s) => s.id === speciality);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };
  const toggleChronic = (c: string) => {
    setNoChronicDiseases(false);
    setChronic((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const isValid = speciality && complaints.trim().length >= 20 && duration;

  const handleNext = () => {
    setSubmitted(true);
    if (!isValid) return;
    const allSymptoms = otherSymptom.trim() ? [...symptoms, otherSymptom.trim()] : symptoms;
    updateDraftConsultation({
      hvSpeciality: speciality,
      hvComplaintsText: complaints,
      hvSymptoms: allSymptoms,
      hvDuration: duration,
      hvChronicDiseases: noChronicDiseases ? ['Yo\'q'] : chronic,
    });
    navigate('home_visit_confirm');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-orange-100 text-xs">4-qadam / 5</p>
            <h1 className="text-white text-lg font-bold">Mutaxassis va shikoyat</h1>
            <p className="text-orange-100/80 text-xs mt-0.5">Nima bezovta qilayotgani</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-28 space-y-3">
        {/* Mutaxassis tanlash */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2 mb-3">
            <Stethoscope className="w-4 h-4 text-orange-500" /> Mutaxassis *
          </h3>
          <button
            onClick={() => setShowSpecialities(!showSpecialities)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
              submitted && !speciality ? 'border-red-300 bg-red-50' : speciality ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {selectedSpec ? (
              <>
                <span className="text-xl">{selectedSpec.icon}</span>
                <p className="flex-1 text-sm font-medium text-orange-700">{selectedSpec.label}</p>
              </>
            ) : (
              <p className="flex-1 text-sm text-gray-500">Mutaxassisni tanlang...</p>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSpecialities ? 'rotate-180' : ''}`} />
          </button>
          {submitted && !speciality && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Mutaxassisni tanlang</p>}

          {showSpecialities && (
            <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-3">
              {SPECIALITIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSpeciality(s.id); setShowSpecialities(false); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${speciality === s.id ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </div>
          )}
          {speciality === 'unknown' && (
            <p className="text-orange-600 text-xs mt-2 bg-orange-50 rounded-xl p-2.5">
              💡 Terapevt (umumiy amaliyot shifokori) tayinlanadi va u kerakli mutaxassisni yo'naltiradi
            </p>
          )}
        </div>

        {/* Shikoyat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-orange-500" /> Asosiy shikoyat *
          </h3>

          {/* Tezkor belgilash */}
          <p className="text-gray-500 text-xs mb-2">Tezkor belgilash (bir nechtasini tanlash mumkin):</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                  symptoms.includes(s) ? 'border-orange-400 bg-orange-100 text-orange-700 font-medium' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-200'
                }`}
              >
                {symptoms.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
            <input
              type="text"
              value={otherSymptom}
              onChange={(e) => setOtherSymptom(e.target.value)}
              placeholder="+ Boshqa..."
              className="border border-dashed border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-orange-300 min-w-[100px]"
            />
          </div>

          <textarea
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            placeholder="Batafsil yozing: qachondan boshlab bezovta qilmoqda, qanday og'riq, qachon kuchayadi..."
            rows={4}
            minLength={20}
            maxLength={1000}
            className={`w-full bg-gray-50 border rounded-xl px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${
              submitted && complaints.trim().length < 20 ? 'border-red-300 bg-red-50' : complaints ? 'border-orange-200 bg-white' : 'border-gray-200'
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {submitted && complaints.trim().length < 20
              ? <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />Kamida 20 belgi kiriting</p>
              : <p className="text-gray-400 text-xs">Kamida 20 belgi</p>
            }
            <p className="text-gray-400 text-xs">{complaints.length}/1000</p>
          </div>
        </div>

        {/* Davomiyligi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold mb-3">Belgilar davomiyligi *</h3>
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`p-3 rounded-xl border-2 text-sm transition-all text-center ${
                  duration === d.id ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {submitted && !duration && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Davomiylikni tanlang</p>}
        </div>

        {/* Surunkali kasalliklar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 text-sm font-semibold">Surunkali kasalliklar</h3>
            <span className="text-gray-400 text-xs">ixtiyoriy</span>
          </div>
          <div className="space-y-2">
            {CHRONIC.map((c) => (
              <button
                key={c}
                onClick={() => toggleChronic(c)}
                disabled={noChronicDiseases}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                  chronic.includes(c) ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                } ${noChronicDiseases ? 'opacity-40 cursor-not-allowed' : 'hover:border-orange-200'}`}
              >
                {chronic.includes(c) ? <CheckSquare className="w-4 h-4 text-orange-500 flex-shrink-0" /> : <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                <span className="text-sm text-gray-700">{c}</span>
              </button>
            ))}
            <button
              onClick={() => { setNoChronicDiseases(!noChronicDiseases); setChronic([]); }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                noChronicDiseases ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              {noChronicDiseases ? <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <span className={`text-sm ${noChronicDiseases ? 'text-green-700 font-medium' : 'text-gray-700'}`}>Yo'q (surunkali kasallik yo'q)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            isValid ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          <span>Tasdiqlashga o'tish</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
