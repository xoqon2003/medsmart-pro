import React, { useState } from 'react';
import { useApp } from '../../../store/appStore';
import { calendarService } from '../../../../services/api/calendarService';
import {
  ChevronLeft, Calendar, Clock, MapPin, Video, Phone,
  MessageCircle, Loader2, CheckCircle2,
} from 'lucide-react';

const TYPE_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  OFFLINE: { label: 'Oflayn (yuzma-yuz)', icon: <MapPin size={16} />, color: 'bg-blue-50 text-blue-600' },
  ONLINE: { label: 'Onlayn (chat)', icon: <MessageCircle size={16} />, color: 'bg-green-50 text-green-600' },
  PHONE: { label: "Telefon qo'ng'iroq", icon: <Phone size={16} />, color: 'bg-amber-50 text-amber-600' },
  VIDEO: { label: "Video qo'ng'iroq", icon: <Video size={16} />, color: 'bg-purple-50 text-purple-600' },
};

export function PatientBookingConfirm() {
  const { goBack, currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [consultType, setConsultType] = useState('OFFLINE');
  const [reason, setReason] = useState('');

  const handleBook = async () => {
    setLoading(true);
    try {
      // TODO: doctorId va slotId navigation state dan olinadi
      // await calendarService.bookConsultation({ doctorId, slotId, consultType, patientName, patientPhone, reason });
      setBooked(true);
    } catch {} finally { setLoading(false); }
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Yozildingiz!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Shifokor sizning yozilganingizni ko'radi. Tasdiqlash xabari yuboriladi.
        </p>
        <button onClick={goBack} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm">
          Orqaga
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Yozilishni tasdiqlash</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Consult Type */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Konsultatsiya turi</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TYPE_INFO).map(([key, info]) => (
              <button key={key} onClick={() => setConsultType(key)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-medium border transition-colors ${
                  consultType === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}>
                {info.icon} {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Bemor ma'lumotlari</h3>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm font-medium text-gray-900">{currentUser?.fullName ?? 'Bemor'}</p>
            <p className="text-xs text-gray-500">{currentUser?.phone ?? ''}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Murojaat sababi</h3>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Qisqacha muammo yoki savolingizni yozing..."
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
          />
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button onClick={handleBook} disabled={loading}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
          {loading ? 'Yuborilmoqda...' : 'Yozilishni tasdiqlash'}
        </button>
      </div>
    </div>
  );
}
