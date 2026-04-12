import React, { useState, useMemo } from 'react';
import { useApp } from '../../../store/appStore';
import { runDiagnosis, clinicalKB as defaultKB } from '../../../data/clinicalKB';
import {
  ArrowLeft,
  Stethoscope,
  FlaskConical,
  BookOpen,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  Save,
  RotateCcw,
} from 'lucide-react';
import type { DiagnosisResult, SymptomConsultation } from '../../../types';

export function DiagnosisResults() {
  const {
    goBack, navigate,
    draftSymptom, clearDraftSymptom,
    addSymptomConsultation,
    updateDraftConsultation,
    clinicalKBData,
  } = useApp();

  const [expandedIdx, setExpandedIdx] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  // appStore da KB bor bo'lsa (approved) ishlatamiz, aks holda default mock
  const activeKB = clinicalKBData.filter(d => d.approvalStatus === 'approved').length > 0
    ? clinicalKBData.filter(d => d.approvalStatus === 'approved')
    : defaultKB;

  // Diagnostika natijasini hisoblash
  const results: DiagnosisResult[] = useMemo(() => {
    const raw = runDiagnosis(draftSymptom.symptoms, draftSymptom.bodyZones, draftSymptom.answers, activeKB);
    if (raw.length === 0) return [];

    // Ball → foiz konversiyasi (nisbiy, eng yuqori = max 95%)
    const maxScore = raw[0].score || 1; // division by zero himoyasi
    const MAX_DISPLAY_PERCENT = 95;
    return raw.map(r => ({
      diseaseId: r.entry.id,
      nameUz: r.entry.nameUz,
      nameLat: r.entry.nameLat,
      icd10: r.entry.icd10,
      probability: Math.min(MAX_DISPLAY_PERCENT, Math.round((r.score / maxScore) * MAX_DISPLAY_PERCENT)),
      matchingSymptoms: r.matchingSymptoms,
      specialist: r.entry.specialist,
      tests: r.entry.tests,
      source: r.entry.source,
      description: r.entry.description,
    }));
  }, [draftSymptom]);

  // Natijani tarixga saqlash va PatientHome ga qaytish
  const handleSave = (andNavigateHome = false) => {
    if (!saved) {
      const consultation: SymptomConsultation = {
        id: `sc_${Date.now()}`,
        date: new Date().toISOString(),
        inputMethod: draftSymptom.inputMethod ?? 'text',
        symptoms: draftSymptom.symptoms,
        bodyZones: draftSymptom.bodyZones,
        freeText: draftSymptom.freeText,
        answers: draftSymptom.answers,
        results,
        status: 'active',
        specialistRecommended: results[0]?.specialist,
      };
      addSymptomConsultation(consultation);
      setSaved(true);
    }
    if (andNavigateHome) {
      clearDraftSymptom();
      navigate('patient_home');
    }
  };

  // Navbat olish — mutaxassislik filtri bilan KonsultatsiyaDoctor ga
  const handleBooking = (specialist: string) => {
    // Avval tarixga saqlash
    if (!saved) handleSave(false);
    // DraftConsultation ga mutaxassislik filtrini qo'yish
    updateDraftConsultation({ specialityFilters: [specialist], query: specialist });
    navigate('patient_kons_doctor');
  };

  // Qaytadan boshlash
  const handleRestart = () => {
    clearDraftSymptom();
    navigate('patient_symptom_input');
  };

  const probColor = (p: number) => {
    if (p >= 70) return 'text-red-600 bg-red-50';
    if (p >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-gray-600 bg-gray-50';
  };

  const probBarColor = (p: number) => {
    if (p >= 70) return 'bg-red-400';
    if (p >= 40) return 'bg-amber-400';
    return 'bg-gray-400';
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Tahlil natijalari</h1>
            <p className="text-xs text-gray-400">
              {draftSymptom.symptoms.length} ta simptom tahlil qilindi
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Simptomlar xulosa */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Sizning shikoyatlaringiz:</p>
          <div className="flex flex-wrap gap-1.5">
            {draftSymptom.symptoms.map(s => (
              <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Natijalar bo'lmasa */}
        {results.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">Natija topilmadi</h3>
            <p className="text-sm text-gray-500 mb-4">
              Kiritilgan simptomlar bo'yicha mos kasallik topilmadi. Iltimos, batafsil kiritib qaytadan urinib ko'ring yoki shifokorga murojaat qiling.
            </p>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 mx-auto px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Qaytadan boshlash
            </button>
          </div>
        )}

        {/* Natijalar kartochkalari */}
        {results.map((r, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={r.diseaseId}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                idx === 0 ? 'border-blue-200 shadow-sm' : 'border-gray-100'
              }`}
            >
              {/* Karta boshi */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
                className="w-full flex items-start gap-3 p-4 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${probColor(r.probability)}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{r.nameUz}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${probColor(r.probability)}`}>
                      {r.probability}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{r.nameLat} &middot; {r.icd10}</p>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${probBarColor(r.probability)}`}
                      style={{ width: `${r.probability}%` }} />
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />}
              </button>

              {/* Kengaytirilgan tafsilotlar */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                  {/* Tavsif */}
                  {r.description && (
                    <p className="text-xs text-gray-600 leading-relaxed">{r.description}</p>
                  )}

                  {/* Mos simptomlar */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      Asoslantiruvchi simptomlar:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.matchingSymptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[11px]">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Mutaxassis */}
                  <div className="flex items-center gap-2 bg-sky-50 rounded-xl px-3 py-2.5">
                    <Stethoscope className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Tavsiya etilgan mutaxassis:</p>
                      <p className="text-sm font-semibold text-sky-700">{r.specialist}</p>
                    </div>
                    <button
                      onClick={() => handleBooking(r.specialist)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-medium"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Navbat olish
                    </button>
                  </div>

                  {/* Tahlillar */}
                  <div className="bg-purple-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                      Tavsiya etilgan tahlillar:
                    </p>
                    <ul className="space-y-1">
                      {r.tests.map(t => (
                        <li key={t} className="text-xs text-purple-700 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Manba */}
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-400">Manba: {r.source}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">DIQQAT</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Bu yakuniy tashxis emas. Natijalar faqat ma'lumot uchun. Aniq tashxis va davolanish uchun mutaxassis shifokorga murojaat qiling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="flex gap-2">
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Yangi
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={results.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all ${
              results.length > 0
                ? 'bg-blue-500 text-white active:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Tarixga saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
