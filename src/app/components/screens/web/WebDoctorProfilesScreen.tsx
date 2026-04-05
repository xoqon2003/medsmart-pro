import React, { useState, useEffect } from 'react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { doctorService } from '../../../../services/api/doctorService';
import type { DoctorProfile } from '../../../types';
import {
  Search, RefreshCw, CheckCircle2, XCircle, Eye, Shield,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

export function WebDoctorProfilesScreen() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    doctorService.getAll(page, 20, search || undefined)
      .then(res => { setDoctors(res.items); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const TARIFF_COLORS: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    START: 'bg-blue-100 text-blue-700',
    LITE: 'bg-purple-100 text-purple-700',
    PREMIUM: 'bg-amber-100 text-amber-700',
  };

  return (
    <WebPlatformLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-100">Shifokor profillari</h1>
            <p className="text-sm text-gray-400">Jami: {total} ta shifokor</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/20">
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Shifokor qidirish (mutaxassislik bo'yicha)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Shifokor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Mutaxassislik</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Tarif</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Reyting</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Litsenziya</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Profil</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">Yuklanmoqda...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">Shifokorlar topilmadi</td></tr>
              ) : doctors.map(doc => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                        {doc.user?.fullName?.[0] ?? '?'}
                      </div>
                      <span className="text-sm text-gray-200">{doc.user?.fullName ?? 'Noma\'lum'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{doc.user?.specialty ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TARIFF_COLORS[doc.tariff?.code ?? 'FREE']}`}>
                      {doc.tariff?.name ?? 'Bepul'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-400">{doc.averageRating.toFixed(1)} ({doc.totalRatings})</td>
                  <td className="px-4 py-3">
                    {doc.licenseVerified
                      ? <CheckCircle2 size={16} className="text-green-400" />
                      : <XCircle size={16} className="text-gray-500" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    {doc.isPublic
                      ? <Eye size={16} className="text-green-400" />
                      : <Eye size={16} className="text-gray-500" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/10" title="Litsenziya tasdiqlash">
                        <Shield size={14} className="text-blue-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">{page}-sahifa, jami {Math.ceil(total / 20)} sahifa</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10">
              <ChevronLeft size={14} className="text-gray-400" />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={doctors.length < 20}
              className="p-2 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10">
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
