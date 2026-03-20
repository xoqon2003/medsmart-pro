import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileText, Image, Archive, CheckCircle, ChevronRight, AlertCircle, CalendarDays, ChevronDown, MapPin, Info } from 'lucide-react';
import { ExamDatePicker } from '../../ui/ExamDatePicker';
import { useApp } from '../../../store/appStore';
import { ArizachiSelector } from './ArizachiSelector';
import type { ApplicantType, RelativeInfo, DoctorReferralInfo } from '../../../types';

const STEP_LABELS = ['Tasvir', 'Shikoyat', 'Xizmat', 'Shartnoma', "To'lov"];

interface MockFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

export function FileUpload() {
  const { draftApplication, updateDraft, navigate, goBack, savedRelatives, addSavedRelative, savedPatients, addSavedPatient, currentUser } = useApp();
  const [applicantType, setApplicantType] = useState<ApplicantType>(draftApplication.applicantType || 'self');
  const [relativeInfo, setRelativeInfo] = useState<RelativeInfo | undefined>(draftApplication.relativeInfo);
  const [doctorReferral, setDoctorReferral] = useState<DoctorReferralInfo | undefined>(draftApplication.doctorReferral);

  const [examCategory, setExamCategory] = useState<'instrumental' | 'laboratory' | ''>(draftApplication.examCategory || '');
  const [instrumentalType, setInstrumentalType] = useState(draftApplication.instrumentalType || '');
  const [instrumentalOtherName, setInstrumentalOtherName] = useState(draftApplication.instrumentalOtherName || '');
  const [labTypes, setLabTypes] = useState<string[]>(draftApplication.labTypes || []);
  const [labOtherName, setLabOtherName] = useState(draftApplication.labOtherName || '');
  const [organ, setOrgan] = useState(draftApplication.organ || '');

  const [dateStatus, setDateStatus]   = useState<'known' | 'unknown' | 'to_clarify'>(draftApplication.examDateStatus || 'known');
  const [selectedExamDate, setSelectedExamDate] = useState<Date | undefined>(() => {
    const src = draftApplication.examDateYmd || draftApplication.scanDate || '';
    if (!src) return undefined;
    const d = new Date(src + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [approxYear, setApproxYear]     = useState(draftApplication.examDateApproxYear || '');

  const [scanFacility, setScanFacility] = useState(draftApplication.scanFacility || '');
  const [files, setFiles] = useState<MockFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXT = ['.dicom', '.dcm', '.zip', '.rar', '.png', '.jpg', '.jpeg', '.pdf'];
  const MAX_FILE_SIZE = 500 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 1024 * 1024 * 1024;

  const instrumentalNeedsOrgan = useMemo(() => {
    return ['MRT', 'MSKT', 'Rentgen', 'UZI', 'EXO-KG'].includes(instrumentalType);
  }, [instrumentalType]);

  const instrumentalChips = ['MRT', 'MSKT', 'Rentgen', 'UZI', 'EKG', 'EXO-KG', 'Boshqa'] as const;
  const organChips = ['Bosh', "Bo'yin", "Ko'krak qafasi", "Qorin bo'shlig'i", "Umurtqa pog'onasi", "Oyoq-qo'l", 'Boshqa'] as const;
  const labChips = ['Umumiy qon', 'Umumiy peshob', 'Gepatit', 'Fermentlar', 'Gormonal', 'Biokimyo', 'Boshqa'] as const;

  const ymd = useMemo(() => {
    if (dateStatus !== 'known' || !selectedExamDate) return '';
    const yyyy = selectedExamDate.getFullYear();
    const mm   = String(selectedExamDate.getMonth() + 1).padStart(2, '0');
    const dd   = String(selectedExamDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [dateStatus, selectedExamDate]);

  const dateError = useMemo(() => {
    if (dateStatus !== 'known') return '';
    if (!ymd) return '';
    const d = new Date(ymd + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return "Sana noto'g'ri";
    if (d.getTime() > today.getTime()) return "Tekshiruv sanasi kelajakda bo'lishi mumkin emas";
    return '';
  }, [dateStatus, ymd]);

  const oldDateWarning = useMemo(() => {
    if (dateStatus !== 'known') return '';
    if (!ymd || dateError) return '';
    const d = new Date(ymd + 'T00:00:00');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return "Diqqat: Ushbu tekshiruv 1 yildan ko'proq vaqt oldin o'tkazilgan. Mutaxassislar yangi tekshiruvni tavsiya qilishi mumkin.";
    }
    return '';
  }, [dateError, dateStatus, ymd]);

  const simulateUpload = (file: File): MockFile => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const mockFile: MockFile = { id, name: file.name, size: file.size, type: file.type, progress: 0, status: 'uploading' };

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100, status: 'done' } : f));
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(progress) } : f));
      }
    }, 300);

    return mockFile;
  };

  const extOf = (name: string) => {
    const i = name.lastIndexOf('.');
    if (i < 0) return '';
    return name.slice(i).toLowerCase();
  };

  const isDicomName = (name: string) => {
    const e = extOf(name);
    return e === '.dcm' || e === '.dicom';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validFiles: MockFile[] = [];
    const newErrors: string[] = [];

    const totalBefore = files.reduce((acc, f) => acc + (f.size || 0), 0);
    let total = totalBefore;

    for (const file of selected) {
      const ext = extOf(file.name);
      if (!ALLOWED_EXT.includes(ext)) {
        newErrors.push(`${file.name}: Fayl formati noto'g'ri. Faqat ${ALLOWED_EXT.join(', ')} qabul qilinadi`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name}: hajmi 500MB dan oshib ketdi`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_SIZE) {
        newErrors.push(`${file.name}: Jami yuklash hajmi 1GB dan oshib ketdi`);
        continue;
      }
      total += file.size;
      validFiles.push(simulateUpload(file));
    }

    if (newErrors.length) setErrors(prev => ({ ...prev, files: newErrors.join('\n') }));
    setFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image;
    if (type.includes('pdf')) return FileText;
    if (type.includes('zip') || type.includes('dicom')) return Archive;
    return FileText;
  };

  const formatSize = (bytes: number): string => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!examCategory) errs.examCategory = "Tekshiruv kategoriyasini tanlang";
    if (examCategory === 'instrumental') {
      if (!instrumentalType) errs.instrumentalType = "Tekshiruv turini tanlang";
      if (instrumentalType === 'Boshqa' && !instrumentalOtherName.trim()) errs.instrumentalOtherName = "Tekshiruv nomini yozing";
      if (instrumentalNeedsOrgan && !organ) errs.organ = "Organ/sohani tanlang";
    }
    if (examCategory === 'laboratory') {
      if (labTypes.length === 0) errs.labTypes = "Kamida bitta laboratoriya turini tanlang";
      if (labTypes.includes('Boshqa') && !labOtherName.trim()) errs.labOtherName = "Tahlil nomini yozing";
    }

    if (dateStatus === 'unknown' && approxYear && !/^\~?\d{4}$/.test(approxYear.trim())) {
      errs.examDate = "Taxminiy yil formati: ~2022 yoki 2022";
    }
    if (dateError) errs.examDate = dateError;

    const uploading = files.some(f => f.status === 'uploading');
    if (uploading) errs.files = "Fayllar yuklanishini kuting";
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const scanTypeLegacy =
      examCategory === 'instrumental'
        ? (instrumentalType === 'Boshqa' ? (instrumentalOtherName || 'Boshqa') : instrumentalType) || ''
        : 'Laboratoriya';

    updateDraft({
      applicantType,
      relativeInfo: applicantType === 'relative' ? relativeInfo : undefined,
      doctorReferral: applicantType === 'doctor' ? doctorReferral : undefined,
      examCategory: examCategory as any,
      instrumentalType: examCategory === 'instrumental' ? (instrumentalType as any) : undefined,
      instrumentalOtherName: examCategory === 'instrumental' ? instrumentalOtherName : undefined,
      labTypes: examCategory === 'laboratory' ? (labTypes as any) : undefined,
      labOtherName: examCategory === 'laboratory' ? labOtherName : undefined,
      organ: instrumentalNeedsOrgan ? organ : undefined,

      examDateStatus: dateStatus,
      examDateYmd: dateStatus === 'known' ? (ymd || undefined) : undefined,
      examDateApproxYear: dateStatus === 'unknown' ? (approxYear || undefined) : undefined,

      scanType: scanTypeLegacy,
      scanDate: dateStatus === 'known' ? (ymd || '') : '',
      scanFacility: scanFacility.slice(0, 255),

      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        isDicom: isDicomName(f.name),
      })),
    });
    navigate('patient_anamnez');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Tasvir yuklash</h1>
            <p className="text-blue-200 text-xs">1-bosqich: Tasvir ma'lumotlari</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mb-1">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className={`h-1 flex-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
        <div className="flex justify-between">
          {STEP_LABELS.map((l, i) => (
            <span key={l} className={`text-xs ${i === 0 ? 'text-white' : 'text-white/40'}`}>{l}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Arizachi */}
        <ArizachiSelector
          value={applicantType}
          relativeInfo={relativeInfo}
          doctorReferral={doctorReferral}
          savedRelatives={savedRelatives}
          savedPatients={savedPatients}
          currentUserRole={currentUser?.role}
          onChangeType={setApplicantType}
          onChangeRelative={setRelativeInfo}
          onChangeDoctorReferral={setDoctorReferral}
          onSaveRelative={r => { addSavedRelative(r); setRelativeInfo(r); }}
          onSavePatient={p => addSavedPatient(p)}
        />

        {/* Category */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Tekshiruv kategoriyasi *</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setExamCategory('instrumental');
                setErrors(p => ({ ...p, examCategory: '' }));
              }}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                examCategory === 'instrumental' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <p className="text-sm font-medium">🔬 Instrumental</p>
              <p className={`text-xs mt-1 ${examCategory === 'instrumental' ? 'text-white/80' : 'text-gray-500'}`}>MRT, EKG, UZI...</p>
            </button>
            <button
              onClick={() => {
                setExamCategory('laboratory');
                setErrors(p => ({ ...p, examCategory: '' }));
              }}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                examCategory === 'laboratory' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <p className="text-sm font-medium">🧪 Laboratoriya</p>
              <p className={`text-xs mt-1 ${examCategory === 'laboratory' ? 'text-white/80' : 'text-gray-500'}`}>Qon, Peshob...</p>
            </button>
          </div>
          {errors.examCategory && <p className="text-red-500 text-xs mt-2">{errors.examCategory}</p>}
        </div>

        {/* Instrumental types */}
        {examCategory === 'instrumental' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3">Tekshiruv turi *</p>
            <div className="flex flex-wrap gap-2">
              {instrumentalChips.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setInstrumentalType(t);
                    setErrors(p => ({ ...p, instrumentalType: '', instrumentalOtherName: '' }));
                    if (!['MRT', 'MSKT', 'Rentgen', 'UZI', 'EXO-KG'].includes(t)) setOrgan('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                    instrumentalType === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.instrumentalType && <p className="text-red-500 text-xs mt-2">{errors.instrumentalType}</p>}

            {instrumentalType === 'Boshqa' && (
              <div className="mt-3">
                <label className="text-gray-600 text-xs mb-1 block">Tekshiruv nomi</label>
                <input
                  value={instrumentalOtherName}
                  onChange={(e) => setInstrumentalOtherName(e.target.value)}
                  placeholder="Masalan: Spirometriya"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.instrumentalOtherName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.instrumentalOtherName && <p className="text-red-500 text-xs mt-2">{errors.instrumentalOtherName}</p>}
              </div>
            )}
          </div>
        )}

        {/* Laboratory types */}
        {examCategory === 'laboratory' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3">Laboratoriya turlari *</p>
            <p className="text-gray-400 text-xs mb-2">Bir vaqtda bir nechtasini tanlash mumkin</p>
            <div className="flex flex-wrap gap-2">
              {labChips.map(t => {
                const active = labTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setErrors(p => ({ ...p, labTypes: '', labOtherName: '' }));
                      setLabTypes((prev) => (active ? prev.filter((x) => x !== t) : [...prev, t]));
                    }}
                    className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {errors.labTypes && <p className="text-red-500 text-xs mt-2">{errors.labTypes}</p>}

            {labTypes.includes('Boshqa') && (
              <div className="mt-3">
                <label className="text-gray-600 text-xs mb-1 block">Tahlil nomi</label>
                <input
                  value={labOtherName}
                  onChange={(e) => setLabOtherName(e.target.value)}
                  placeholder="Masalan: Vitamin D"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.labOtherName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.labOtherName && <p className="text-red-500 text-xs mt-2">{errors.labOtherName}</p>}
              </div>
            )}
          </div>
        )}

        {/* Organ (conditional) */}
        {examCategory === 'instrumental' && instrumentalNeedsOrgan && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3">Organ / Soha *</p>
            <div className="flex flex-wrap gap-2">
              {organChips.map(o => (
              <button
                key={o}
                onClick={() => { setOrgan(o); setErrors(p => ({ ...p, organ: '' })); }}
                className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                  organ === o
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          {errors.organ && <p className="text-red-500 text-xs mt-2">{errors.organ}</p>}
          </div>
        )}

        {/* Date & Facility */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 block">Tekshiruv sanasi</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDateStatus('known'); setErrors(p => ({ ...p, examDate: '' })); }}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${dateStatus === 'known' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  Aniq
                </button>
                <button
                  onClick={() => { setDateStatus('unknown'); setErrors(p => ({ ...p, examDate: '' })); }}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${dateStatus === 'unknown' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  Esimda yo'q
                </button>
                <button
                  onClick={() => { setDateStatus('to_clarify'); setErrors(p => ({ ...p, examDate: '' })); }}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${dateStatus === 'to_clarify' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                >
                  Aniqlaymiz
                </button>
              </div>
            </div>

            {dateStatus === 'known' && (
              <div className="space-y-2">
                {/* Trigger tugmasi */}
                <button
                  type="button"
                  onClick={() => setCalendarOpen(p => !p)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all border ${
                    selectedExamDate
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedExamDate ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <CalendarDays className={`w-4.5 h-4.5 ${selectedExamDate ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-400 text-[11px] leading-none mb-0.5">Tekshiruv sanasi</p>
                    <p className={`text-sm font-medium leading-none ${selectedExamDate ? 'text-gray-800' : 'text-gray-400'}`}>
                      {selectedExamDate
                        ? selectedExamDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'Sanani tanlang...'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Inline calendar */}
                <AnimatePresence>
                  {calendarOpen && (
                    <motion.div
                      key="exam-cal"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <ExamDatePicker
                        selected={selectedExamDate}
                        onSelect={(d) => {
                          setSelectedExamDate(d);
                          setCalendarOpen(false);
                          setErrors(p => ({ ...p, examDate: '' }));
                        }}
                        maxDate={new Date()}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {dateStatus === 'unknown' && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Aniq sanani bilmayman</span>
                </div>
                <input
                  value={approxYear}
                  onChange={(e) => setApproxYear(e.target.value.slice(0, 5))}
                  placeholder="~2022"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {dateStatus === 'to_clarify' && (
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p>Sana operator/shifokor bilan aniqlanadi (date_status: to_clarify).</p>
              </div>
            )}

            {errors.examDate && (
              <div className="mt-2 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-xs">{errors.examDate}</p>
              </div>
            )}

            {oldDateWarning && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-xs">{oldDateWarning}</p>
                  <p className="text-amber-700 text-xs mt-1">Baribir davom etish →</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-2 block">Qaysi muassasada olingan <span className="text-gray-400 font-normal text-xs">(ixtiyoriy)</span></label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={scanFacility}
                onChange={e => setScanFacility(e.target.value)}
                placeholder="Diagnostika markazi nomi"
                maxLength={255}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* File upload */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Fayllar yuklash (ixtiyoriy)</p>
          <p className="text-gray-400 text-xs mb-3">
            {ALLOWED_EXT.map(x => x.toUpperCase()).join(' · ')} · bitta fayl max: 500 MB · jami: 1 GB
          </p>

          {/* Upload zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-gray-600 text-sm">Fayl tanlash yoki tashlash</p>
            <p className="text-gray-400 text-xs">+ Yana fayl qo'shish</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXT.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {errors.files && (
            <div className="mt-2 flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.files}</p>
            </div>
          )}

          {/* File list */}
          <AnimatePresence>
            {files.map(file => {
              const FileIcon = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 bg-gray-50 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-xs truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">{formatSize(file.size)}</p>
                    </div>
                    {file.status === 'done' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <button onClick={() => removeFile(file.id)} className="p-1">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Yuklanmoqda...</span>
                        <span>{file.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
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
