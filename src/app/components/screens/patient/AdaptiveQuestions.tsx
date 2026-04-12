import React, { useState, useMemo } from 'react';
import { useApp } from '../../../store/appStore';
import { clinicalKB as defaultKB } from '../../../data/clinicalKB';
import { ArrowLeft, ChevronRight, Check, SkipForward } from 'lucide-react';
import type { AdaptiveQuestion, AdaptiveAnswer } from '../../../types';

export function AdaptiveQuestions() {
  const { goBack, navigate, draftSymptom, updateDraftSymptom, clinicalKBData } = useApp();
  // appStore da KB bor bo'lsa (approved) ishlatamiz, aks holda default mock
  const activeKB = clinicalKBData.filter(d => d.approvalStatus === 'approved').length > 0
    ? clinicalKBData.filter(d => d.approvalStatus === 'approved')
    : defaultKB;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AdaptiveAnswer[]>(draftSymptom.answers);

  // Bemorning simptomlariga mos keladigan savollarni yig'ish
  const questions = useMemo(() => {
    const symptomLower = draftSymptom.symptoms.map(s => s.toLowerCase());
    const zones = draftSymptom.bodyZones;

    // KB dan mos kasalliklarning savollarini yig'ish
    const seen = new Set<string>();
    const qs: AdaptiveQuestion[] = [];

    for (const entry of activeKB) {
      const hasSymptom = entry.requiredSymptoms.some(rs =>
        symptomLower.some(s => s.includes(rs.toLowerCase()) || rs.toLowerCase().includes(s))
      );
      const hasZone = zones.length > 0 && entry.bodyZones.some(bz => zones.includes(bz));

      if (hasSymptom || hasZone) {
        for (const q of entry.adaptiveQuestions) {
          if (!seen.has(q.id)) {
            seen.add(q.id);
            qs.push(q);
          }
        }
      }
    }

    // Agar hech qanday mos savol topilmasa — umumiy savollar
    if (qs.length === 0) {
      const generalQuestions: AdaptiveQuestion[] = [
        {
          id: 'gen_duration',
          question: "Shikoyat qancha vaqtdan beri davom etmoqda?",
          type: 'radio',
          options: ['1 soatdan kam', '1-24 soat', '1-7 kun', '1-4 hafta', '1 oydan ortiq'],
        },
        {
          id: 'gen_pain_level',
          question: "Og'riq/noqulaylik darajasi (1 — yengil, 10 — kuchli)",
          type: 'slider',
          sliderMin: 1,
          sliderMax: 10,
        },
        {
          id: 'gen_fever',
          question: "Isitma bormi?",
          type: 'radio',
          options: ["Yo'q", "37-38°C", "38-39°C", "39°C dan yuqori"],
        },
        {
          id: 'gen_previous',
          question: "Avval ham shunday holat bo'lganmi?",
          type: 'radio',
          options: ['Birinchi marta', 'Vaqti-vaqti bilan', 'Doimiy'],
        },
      ];
      return generalQuestions;
    }

    return qs;
  }, [draftSymptom.symptoms, draftSymptom.bodyZones]);

  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const progress = totalQ > 0 ? ((currentIdx + 1) / totalQ) * 100 : 0;

  // Joriy savol uchun mos state ni aniqlash
  const getInitialState = (q: AdaptiveQuestion | undefined) => {
    if (!q) return { radio: '', checkbox: [] as string[], slider: 5, text: '' };
    const existing = answers.find(a => a.questionId === q.id);
    return {
      radio: q.type === 'radio' && typeof existing?.answer === 'string' ? existing.answer : '',
      checkbox: q.type === 'checkbox' && Array.isArray(existing?.answer) ? existing.answer : [],
      slider: q.type === 'slider' && typeof existing?.answer === 'number' ? existing.answer : 5,
      text: q.type === 'text' && typeof existing?.answer === 'string' ? existing.answer : '',
    };
  };

  const initial = getInitialState(currentQ);
  const [radioValue, setRadioValue] = useState<string>(initial.radio);
  const [checkboxValues, setCheckboxValues] = useState<string[]>(initial.checkbox);
  const [sliderValue, setSliderValue] = useState<number>(initial.slider);
  const [textValue, setTextValue] = useState<string>(initial.text);

  // Savol o'zgarganda local state turi to'g'ri yangilanadi
  const resetLocalForQuestion = (q: AdaptiveQuestion) => {
    const s = getInitialState(q);
    setRadioValue(s.radio);
    setCheckboxValues(s.checkbox);
    setSliderValue(s.slider);
    setTextValue(s.text);
  };

  const getCurrentAnswer = (): AdaptiveAnswer | null => {
    if (!currentQ) return null;
    switch (currentQ.type) {
      case 'radio':
        return radioValue ? { questionId: currentQ.id, question: currentQ.question, answer: radioValue } : null;
      case 'checkbox':
        return checkboxValues.length > 0 ? { questionId: currentQ.id, question: currentQ.question, answer: checkboxValues } : null;
      case 'slider':
        return { questionId: currentQ.id, question: currentQ.question, answer: sliderValue };
      case 'text':
        return textValue.trim() ? { questionId: currentQ.id, question: currentQ.question, answer: textValue.trim() } : null;
      default:
        return null;
    }
  };

  const saveCurrentAnswer = () => {
    const answer = getCurrentAnswer();
    if (answer) {
      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== answer.questionId);
        return [...filtered, answer];
      });
    }
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      resetLocalForQuestion(questions[nextIdx]);
    } else {
      // Oxirgi savol — natijaga o'tish
      finishQuestions();
    }
  };

  const handleSkip = () => {
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      resetLocalForQuestion(questions[nextIdx]);
    } else {
      finishQuestions();
    }
  };

  const finishQuestions = () => {
    const finalAnswer = getCurrentAnswer();
    const finalAnswers = finalAnswer
      ? [...answers.filter(a => a.questionId !== finalAnswer.questionId), finalAnswer]
      : answers;

    updateDraftSymptom({ answers: finalAnswers });
    navigate('patient_diagnosis_results');
  };

  if (!currentQ) {
    // Savollar yo'q — to'g'ridan-to'g'ri natijaga
    updateDraftSymptom({ answers: [] });
    navigate('patient_diagnosis_results');
    return null;
  }

  const toggleCheckbox = (opt: string) => {
    setCheckboxValues(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
  };

  const hasAnswer = getCurrentAnswer() !== null;

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Aniqlashtiruvchi savollar</h1>
            <p className="text-xs text-gray-400">Savol {currentIdx + 1} / {totalQ}</p>
          </div>
          <button onClick={finishQuestions} className="text-xs text-blue-500 font-medium">
            Tugatish
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Savol */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {currentQ.question}
        </h2>

        {/* Radio */}
        {currentQ.type === 'radio' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map(opt => (
              <button
                key={opt}
                onClick={() => setRadioValue(opt)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-left transition-all border ${
                  radioValue === opt
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                    : 'bg-gray-50 border-gray-100 text-gray-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  radioValue === opt ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {radioValue === opt && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                </div>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {currentQ.type === 'checkbox' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map(opt => {
              const isChecked = checkboxValues.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleCheckbox(opt)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-left transition-all border ${
                    isChecked
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'bg-gray-50 border-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Slider */}
        {currentQ.type === 'slider' && (
          <div className="px-2">
            <div className="text-center mb-6">
              <span className={`text-5xl font-bold ${
                sliderValue <= 3 ? 'text-green-500' : sliderValue <= 6 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {sliderValue}
              </span>
              <p className="text-sm text-gray-400 mt-1">
                {sliderValue <= 3 ? 'Yengil' : sliderValue <= 6 ? "O'rtacha" : 'Kuchli'}
              </p>
            </div>
            <input
              type="range"
              min={currentQ.sliderMin ?? 1}
              max={currentQ.sliderMax ?? 10}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{currentQ.sliderMin ?? 1}</span>
              <span>{currentQ.sliderMax ?? 10}</span>
            </div>
          </div>
        )}

        {/* Text */}
        {currentQ.type === 'text' && (
          <textarea
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            placeholder="Javobingizni yozing..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none"
          />
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium"
          >
            <SkipForward className="w-4 h-4" />
            O'tkazish
          </button>
          <button
            onClick={handleNext}
            disabled={!hasAnswer && currentQ.type !== 'slider'}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all ${
              hasAnswer || currentQ.type === 'slider'
                ? 'bg-blue-500 text-white active:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentIdx < totalQ - 1 ? 'Keyingisi' : 'Natijani ko\'rish'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
