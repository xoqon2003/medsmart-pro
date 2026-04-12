import React, { useState, useRef } from 'react';
import { useApp } from '../../../store/appStore';
import { BODY_ZONES, COMMON_SYMPTOMS } from '../../../data/clinicalKB';
import {
  ArrowLeft,
  Keyboard,
  List,
  User as UserIcon,
  Mic,
  Search,
  Check,
  ChevronRight,
  X,
  MicOff,
} from 'lucide-react';
import type { SymptomInputMethod } from '../../../types';

type Tab = SymptomInputMethod;

export function SymptomInput() {
  const { goBack, navigate, updateDraftSymptom, draftSymptom } = useApp();
  const [tab, setTab] = useState<Tab>('text');
  const [freeText, setFreeText] = useState(draftSymptom.freeText ?? '');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(draftSymptom.symptoms);
  const [selectedZones, setSelectedZones] = useState<string[]>(draftSymptom.bodyZones);
  const [searchQ, setSearchQ] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Simptomlar ro'yxatidan tanlash
  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  // Tana zonasini tanlash
  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev => prev.includes(zoneId) ? prev.filter(x => x !== zoneId) : [...prev, zoneId]);
  };

  // Ovoz yozish (Web Speech API)
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFreeText(prev => prev + (prev ? '\n' : '') + '[Brauzeringiz ovozni qo\'llab-quvvatlamaydi]');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setFreeText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // Hamma simptomlarni yig'ish va keyingi bosqichga o'tish
  const allSymptoms = (): string[] => {
    const set = new Set<string>();
    // Erkin matndan — butun matn bitta simptom sifatida (parchalanmasdan)
    if (freeText.trim()) {
      set.add(freeText.trim());
    }
    // Ro'yxatdan tanlanganlar
    selectedSymptoms.forEach(s => set.add(s));
    // Tana zonasiga bog'liq simptomlar (dublikat tekshiruvli)
    selectedZones.forEach(zoneId => {
      const zone = BODY_ZONES.find(z => z.id === zoneId);
      if (zone) {
        const zoneSymptom = zone.label + " og'rig'i";
        // Agar shu zona simptomi ro'yxatdan allaqachon tanlangan bo'lsa, qo'shmaslik
        const alreadyExists = Array.from(set).some(s =>
          s.toLowerCase().includes(zone.label.toLowerCase())
        );
        if (!alreadyExists) set.add(zoneSymptom);
      }
    });
    return Array.from(set);
  };

  const canProceed = freeText.trim().length > 5 || selectedSymptoms.length > 0 || selectedZones.length > 0;

  const handleNext = () => {
    const symptoms = allSymptoms();
    updateDraftSymptom({
      inputMethod: tab,
      symptoms,
      bodyZones: selectedZones,
      freeText: freeText.trim() || undefined,
      startedAt: new Date().toISOString(),
    });
    navigate('patient_adaptive_questions');
  };

  const filteredSymptoms = searchQ.trim().length >= 1
    ? COMMON_SYMPTOMS.filter(s => s.toLowerCase().includes(searchQ.toLowerCase()))
    : COMMON_SYMPTOMS;

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: 'text',     label: 'Matn',    icon: <Keyboard className="w-4 h-4" /> },
    { key: 'list',     label: "Ro'yxat", icon: <List className="w-4 h-4" /> },
    { key: 'body_map', label: 'Tana',    icon: <UserIcon className="w-4 h-4" /> },
    { key: 'voice',    label: 'Ovoz',    icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Shikoyatingizni kiriting</h1>
            <p className="text-xs text-gray-400 mt-0.5">Simptomlaringizni batafsil tasvirlang</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-3 bg-gray-100 rounded-xl p-1 gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* ── Matn tab ────────────────────────────── */}
        {tab === 'text' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Shikoyatingizni erkin yozing
            </label>
            <textarea
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              placeholder="Masalan: 2 kundan beri boshim og'riyapti, ko'nglim aynayapti, yorug'likdan bezovtalanamn..."
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">Iloji boricha batafsil yozing — nima, qachon, qanday</p>
          </div>
        )}

        {/* ── Ro'yxat tab ─────────────────────────── */}
        {tab === 'list' && (
          <div>
            {/* Qidiruv */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Shikoyat qidirish..."
                className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
              />
              {searchQ && (
                <button onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Tanlangan */}
            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedSymptoms.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {s}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Ro'yxat */}
            <div className="space-y-1">
              {filteredSymptoms.map(s => {
                const isSelected = selectedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 text-blue-700 font-medium'
                        : 'bg-gray-50 border border-gray-100 text-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tana xaritasi tab ───────────────────── */}
        {tab === 'body_map' && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Og'riq yoki noqulaylik sezayotgan joyni tanlang</p>

            {/* Tanlangan zonalar */}
            {selectedZones.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedZones.map(zId => {
                  const zone = BODY_ZONES.find(z => z.id === zId);
                  return (
                    <button
                      key={zId}
                      onClick={() => toggleZone(zId)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-medium"
                    >
                      {zone?.label}
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Body grid — 2D */}
            <div className="relative bg-gray-50 rounded-2xl p-4 border border-gray-100">
              {/* Odam konturi SVG */}
              <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto" style={{ height: 320 }}>
                {/* Bosh */}
                <circle cx="100" cy="40" r="25"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('head') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('head')}
                />
                {/* Bo'yin */}
                <rect x="90" y="65" width="20" height="20" rx="4"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('neck') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('neck')}
                />
                {/* Ko'krak */}
                <rect x="65" y="85" width="70" height="55" rx="10"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('chest') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('chest')}
                />
                {/* Qorin */}
                <rect x="70" y="140" width="60" height="50" rx="8"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('abdomen') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('abdomen')}
                />
                {/* Chap qo'l */}
                <rect x="30" y="90" width="30" height="80" rx="10"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('left_arm') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('left_arm')}
                />
                {/* O'ng qo'l */}
                <rect x="140" y="90" width="30" height="80" rx="10"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('right_arm') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('right_arm')}
                />
                {/* Bel / Orqa — pastda pelvis ustida */}
                <rect x="73" y="145" width="54" height="20" rx="4"
                  className={`cursor-pointer transition-all stroke-1 ${selectedZones.includes('back') ? 'fill-orange-200 stroke-orange-400' : 'fill-transparent stroke-gray-400 hover:fill-orange-100'}`}
                  onClick={() => toggleZone('back')}
                  strokeDasharray="4 2"
                />
                {/* Pelvis */}
                <rect x="72" y="190" width="56" height="30" rx="8"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('pelvis') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('pelvis')}
                />
                {/* Chap oyoq */}
                <rect x="72" y="225" width="25" height="100" rx="8"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('left_leg') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('left_leg')}
                />
                {/* O'ng oyoq */}
                <rect x="103" y="225" width="25" height="100" rx="8"
                  className={`cursor-pointer transition-all stroke-2 ${selectedZones.includes('right_leg') ? 'fill-red-200 stroke-red-400' : 'fill-gray-200 stroke-gray-300 hover:fill-blue-100'}`}
                  onClick={() => toggleZone('right_leg')}
                />

                {/* Labellar */}
                <text x="100" y="43" textAnchor="middle" className="fill-gray-500 text-[8px]">Bosh</text>
                <text x="100" y="117" textAnchor="middle" className="fill-gray-500 text-[8px]">Ko'krak</text>
                <text x="100" y="168" textAnchor="middle" className="fill-gray-500 text-[8px]">Qorin</text>
                <text x="100" y="208" textAnchor="middle" className="fill-gray-500 text-[8px]">Chanoq</text>
              </svg>

              {/* Butun tana tugmasi */}
              <button
                onClick={() => toggleZone('whole_body')}
                className={`mt-3 w-full py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedZones.includes('whole_body')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                Butun tana
              </button>
            </div>
          </div>
        )}

        {/* ── Ovoz tab ────────────────────────────── */}
        {tab === 'voice' && (
          <div className="flex flex-col items-center gap-6 pt-8">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-100 border-4 border-red-400 animate-pulse'
                : 'bg-blue-50 border-4 border-blue-200'
            }`}>
              {isRecording
                ? <MicOff className="w-10 h-10 text-red-500" />
                : <Mic className="w-10 h-10 text-blue-500" />
              }
            </div>

            <button
              onClick={isRecording ? stopVoice : startVoice}
              className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {isRecording ? "To'xtatish" : "Gapiring — yozib olamiz"}
            </button>

            <p className="text-xs text-gray-400 text-center px-4">
              Mikrofon tugmasini bosing va shikoyatingizni gapiring. Matnga aylantiriladi.
            </p>

            {freeText && (
              <div className="w-full mt-4">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Yozilgan matn:</label>
                <textarea
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-pb">
        <div className="flex items-center gap-2 mb-2">
          {selectedSymptoms.length > 0 && (
            <span className="text-xs text-gray-400">{selectedSymptoms.length} ta simptom tanlandi</span>
          )}
          {selectedZones.length > 0 && (
            <span className="text-xs text-gray-400">{selectedZones.length} ta zona tanlandi</span>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
            canProceed
              ? 'bg-blue-500 text-white active:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Davom etish
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
