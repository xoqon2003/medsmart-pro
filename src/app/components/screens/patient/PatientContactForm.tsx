import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { contactService } from '../../../../services/api/contactService';
import {
  ChevronLeft, Send, Phone, Mail, MapPin, Loader2,
  MessageCircle, AlertCircle, RefreshCw, HelpCircle,
} from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'CONSULTATION', label: 'Konsultatsiya', icon: <MessageCircle size={16} /> },
  { value: 'COMPLAINT', label: 'Shikoyat', icon: <AlertCircle size={16} /> },
  { value: 'FOLLOW_UP', label: 'Takror murojaat', icon: <RefreshCw size={16} /> },
  { value: 'OTHER', label: 'Boshqa', icon: <HelpCircle size={16} /> },
];

interface Props {
  doctorProfileId?: string;
  doctorName?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  clinicInfo?: string;
}

export function PatientContactForm({ doctorProfileId, doctorName, doctorPhone, doctorEmail, clinicInfo }: Props) {
  const { goBack, currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<{ id: string; title: string; content: string }[]>([]);

  const [form, setForm] = useState({
    patientName: currentUser?.fullName ?? '',
    patientPhone: currentUser?.phone ?? '',
    patientEmail: '',
    requestType: 'CONSULTATION',
    message: '',
  });

  useEffect(() => {
    if (doctorProfileId) {
      contactService.getPublicTemplates(doctorProfileId)
        .then(setTemplates)
        .catch(() => {});
    }
  }, [doctorProfileId]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.patientName || !form.patientPhone || !form.message) {
      setError('Iltimos barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (!doctorProfileId) {
      setError('Shifokor ma\'lumotlari topilmadi');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await contactService.createRequest({
        doctorId: doctorProfileId,
        patientId: currentUser?.id,
        ...form,
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Ariza yuborishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (content: string) => {
    set('message', form.message ? `${form.message}\n${content}` : content);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Send size={28} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Ariza yuborildi!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Shifokor sizning murojatingizni ko'rib chiqadi va javob beradi.
        </p>
        <button onClick={goBack} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Ariza qoldirish</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Doctor Info */}
        {doctorName && (
          <div className="bg-white rounded-2xl p-4">
            <p className="font-semibold text-gray-900 text-sm">{doctorName}</p>
            {doctorPhone && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <Phone size={12} /> {doctorPhone}
              </div>
            )}
            {doctorEmail && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <Mail size={12} /> {doctorEmail}
              </div>
            )}
            {clinicInfo && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <MapPin size={12} /> {clinicInfo}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              F.I.O. <span className="text-red-400">*</span>
            </label>
            <input
              value={form.patientName}
              onChange={e => set('patientName', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To'liq ismingiz"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Telefon <span className="text-red-400">*</span>
            </label>
            <input
              value={form.patientPhone}
              onChange={e => set('patientPhone', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+998 XX XXX XX XX"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
            <input
              value={form.patientEmail}
              onChange={e => set('patientEmail', e.target.value)}
              type="email"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          {/* Request Type */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Murojaat turi <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REQUEST_TYPES.map(rt => (
                <button
                  key={rt.value}
                  onClick={() => set('requestType', rt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    form.requestType === rt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {rt.icon} {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Shablon tanlash</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.content)}
                    className="shrink-0 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Xabar <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Muammo yoki savolingizni yozing..."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Yuborilmoqda...' : 'Ariza yuborish'}
        </button>
      </div>
    </div>
  );
}
