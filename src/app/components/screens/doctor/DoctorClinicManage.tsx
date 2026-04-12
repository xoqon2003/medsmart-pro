import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import { bookingService } from '../../../../services';
import type { DoctorClinic, ClinicSearchResult } from '../../../types';
import {
  ArrowLeft, Plus, Edit3, Trash2, X, Save, Loader2,
  Building2, MapPin, Star, Search, ToggleLeft, ToggleRight,
  Phone, Globe, CheckCircle2,
} from 'lucide-react';

export function DoctorClinicManage() {
  const { goBack } = useApp();
  const [linkedClinics, setLinkedClinics] = useState<DoctorClinic[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Modal holatlari ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClinic, setEditClinic] = useState<DoctorClinic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Klinika qidiruv ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClinicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /* ── Forma ── */
  const [form, setForm] = useState({ position: '', department: '', cabinet: '', floor: '' });

  /* ── Demo klinika data yuklash ── */
  const loadClinics = useCallback(async () => {
    try {
      const profile = await doctorService.getMyProfile();
      setLinkedClinics(profile.clinics || []);
    } catch {
      // Demo: mock data
      const allClinics = await bookingService.searchClinics({});
      const mockLinked: DoctorClinic[] = allClinics.data.slice(0, 2).map((c, i) => ({
        id: `dc-${c.id}`,
        doctorId: 'demo',
        clinicId: c.id,
        clinic: { id: c.id, name: c.name, address: c.address, city: c.city, region: c.region, isVerified: true, servicesCount: c.servicesCount },
        position: i === 0 ? 'Kardiolog' : 'Konsultant',
        department: i === 0 ? 'Kardiologiya bo\'limi' : 'Umumiy amaliyot',
        cabinet: i === 0 ? '305' : '112',
        floor: i === 0 ? 3 : 1,
        isVerified: i === 0,
        isActive: true,
      }));
      setLinkedClinics(mockLinked);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClinics(); }, [loadClinics]);

  /* ── Klinika qidiruv (debounce 300ms) ── */
  useEffect(() => {
    if (!showAddModal || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await bookingService.searchClinics({ query: searchQuery });
        // Allaqachon bog'langan klinikalarni filtrlash
        const linkedIds = new Set(linkedClinics.map(lc => lc.clinicId));
        setSearchResults(res.data.filter(c => !linkedIds.has(c.id)));
      } catch { /* ignore */ }
      finally { setIsSearching(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, showAddModal, linkedClinics]);

  /* ── Yangi klinika qo'shish ── */
  const handleAdd = async () => {
    if (!selectedClinic) return;
    setSaving(true);
    try {
      await doctorService.addClinic({
        clinicId: selectedClinic.id,
        position: form.position || undefined,
        department: form.department || undefined,
        cabinet: form.cabinet || undefined,
        floor: form.floor ? +form.floor : undefined,
      });
    } catch {
      // Demo: local state ga qo'shish
      const newClinic: DoctorClinic = {
        id: `dc-${Date.now()}`,
        doctorId: 'demo',
        clinicId: selectedClinic.id,
        clinic: { id: selectedClinic.id, name: selectedClinic.name, address: selectedClinic.address, city: selectedClinic.city, region: selectedClinic.region, isVerified: true, servicesCount: selectedClinic.servicesCount },
        position: form.position || undefined,
        department: form.department || undefined,
        cabinet: form.cabinet || undefined,
        floor: form.floor ? +form.floor : undefined,
        isVerified: false,
        isActive: true,
      };
      setLinkedClinics(prev => [...prev, newClinic]);
    } finally {
      setSaving(false);
      resetAddModal();
    }
  };

  /* ── Klinika tahrirlash ── */
  const handleEdit = async () => {
    if (!editClinic) return;
    setSaving(true);
    // Demo: local state yangilash
    setLinkedClinics(prev => prev.map(c =>
      c.id === editClinic.id ? { ...c, position: form.position || undefined, department: form.department || undefined, cabinet: form.cabinet || undefined, floor: form.floor ? +form.floor : undefined } : c
    ));
    setSaving(false);
    setEditClinic(null);
  };

  /* ── Klinika o'chirish ── */
  const handleDelete = async (id: string) => {
    try {
      await doctorService.removeClinic(id);
    } catch { /* Demo fallback */ }
    setLinkedClinics(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  /* ── Faol/nofaol toggle ── */
  const toggleActive = (id: string) => {
    setLinkedClinics(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const resetAddModal = () => {
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedClinic(null);
    setForm({ position: '', department: '', cabinet: '', floor: '' });
  };

  const openEdit = (clinic: DoctorClinic) => {
    setForm({
      position: clinic.position || '',
      department: clinic.department || '',
      cabinet: clinic.cabinet || '',
      floor: clinic.floor?.toString() || '',
    });
    setEditClinic(clinic);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-6 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-semibold">Klinikalar boshqaruvi</h1>
            <p className="text-emerald-200/80 text-xs mt-0.5">
              Klinikalarni qo'shish, tahrirlash va boshqarish
            </p>
          </div>
          <button
            onClick={() => { setForm({ position: '', department: '', cabinet: '', floor: '' }); setShowAddModal(true); }}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 -mt-2 pb-24 space-y-3">
        {/* ── Statistika ── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-emerald-700 text-lg font-bold">{linkedClinics.length}</p>
            <p className="text-gray-500 text-[10px]">Jami</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-emerald-700 text-lg font-bold">{linkedClinics.filter(c => c.isActive).length}</p>
            <p className="text-gray-500 text-[10px]">Faol</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-emerald-700 text-lg font-bold">{linkedClinics.filter(c => c.isVerified).length}</p>
            <p className="text-gray-500 text-[10px]">Tasdiqlangan</p>
          </div>
        </div>

        {/* ── Bog'langan klinikalar ── */}
        {linkedClinics.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-emerald-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Hali klinika qo'shilmagan</p>
            <p className="text-gray-400 text-xs mt-1">Klinika qo'shish uchun "+" tugmasini bosing</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl"
            >
              Klinika qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-gray-500 text-xs px-1">{linkedClinics.length} ta klinika bog'langan</p>
            {linkedClinics.map((dc, i) => (
              <motion.div
                key={dc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl shadow-sm border p-4 ${dc.isActive ? 'border-gray-100' : 'border-orange-100 bg-orange-50/30'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dc.isActive ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-100'}`}>
                    <Building2 className={`w-5 h-5 ${dc.isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${dc.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{dc.clinic.name}</p>
                      {dc.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <p className="text-gray-500 text-xs truncate">{dc.clinic.address}</p>
                    </div>

                    {/* Ma'lumotlar */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {dc.position && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full">{dc.position}</span>
                      )}
                      {dc.department && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full">{dc.department}</span>
                      )}
                      {dc.cabinet && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">Kab: {dc.cabinet}</span>
                      )}
                      {dc.floor != null && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{dc.floor}-qavat</span>
                      )}
                    </div>

                    {/* Amallar */}
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => toggleActive(dc.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors">
                        {dc.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        {dc.isActive ? 'Faol' : 'Nofaol'}
                      </button>
                      <button onClick={() => openEdit(dc)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
                      </button>
                      <button onClick={() => setDeleteConfirm(dc.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> O'chirish
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── O'chirish tasdiqlash ── */}
                <AnimatePresence>
                  {deleteConfirm === dc.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-red-100"
                    >
                      <p className="text-red-600 text-xs mb-2">Klinikani o'chirishni tasdiqlaysizmi?</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(dc.id)} className="flex-1 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg">Ha, o'chirish</button>
                        <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Bekor qilish</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════ KLINIKA QO'SHISH MODALI ══════════ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) resetAddModal(); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h2 className="text-gray-900 text-base font-semibold">
                  {selectedClinic ? 'Ma\'lumotlarni kiriting' : 'Klinika qidiring'}
                </h2>
                <button onClick={resetAddModal} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {!selectedClinic ? (
                  <>
                    {/* Qidiruv */}
                    <div className="bg-gray-50 rounded-xl px-3 flex items-center gap-2 border border-gray-200">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Klinika nomini kiriting..."
                        className="w-full py-3 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                      <p className="text-gray-400 text-xs text-center">Kamida 2 ta harf kiriting</p>
                    )}

                    {/* Natijalar */}
                    {isSearching && (
                      <div className="text-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-gray-500 text-xs">{searchResults.length} ta klinika topildi</p>
                        {searchResults.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedClinic(c)}
                            className="w-full bg-white rounded-xl border border-gray-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 text-sm font-medium">{c.name}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{c.address}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-0.5 text-xs text-gray-600">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{c.rating.toFixed(1)}
                                  </span>
                                  <span className="text-gray-400 text-[10px]">{c.servicesCount} xizmat</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Klinika topilmadi</p>
                      </div>
                    )}

                    {searchQuery.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Klinika nomini kiriting</p>
                        <p className="text-gray-400 text-xs mt-1">Masalan: "MedLine" yoki "Central"</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Tanlangan klinika */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-emerald-800 text-sm font-semibold">{selectedClinic.name}</p>
                          <p className="text-emerald-600 text-xs">{selectedClinic.address}</p>
                        </div>
                        <button onClick={() => setSelectedClinic(null)} className="text-emerald-600 text-xs underline">O'zgartirish</button>
                      </div>
                    </div>

                    {/* Forma */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-600 text-xs font-medium mb-1 block">Lavozim</label>
                        <input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                          placeholder="Masalan: Kardiolog, Konsultant"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-gray-600 text-xs font-medium mb-1 block">Bo'lim</label>
                        <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                          placeholder="Masalan: Kardiologiya bo'limi"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-600 text-xs font-medium mb-1 block">Kabinet</label>
                          <input value={form.cabinet} onChange={e => setForm(p => ({ ...p, cabinet: e.target.value }))}
                            placeholder="305"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                        </div>
                        <div>
                          <label className="text-gray-600 text-xs font-medium mb-1 block">Qavat</label>
                          <input type="number" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                            placeholder="3"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleAdd}
                      disabled={saving}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Klinika qo'shish
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ TAHRIRLASH MODALI ══════════ */}
      <AnimatePresence>
        {editClinic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setEditClinic(null); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-gray-900 text-base font-semibold">Klinika ma'lumotlarini tahrirlash</h2>
                <button onClick={() => setEditClinic(null)} className="p-1 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{editClinic.clinic.name}</p>
                    <p className="text-gray-500 text-xs">{editClinic.clinic.address}</p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 text-xs font-medium mb-1 block">Lavozim</label>
                  <input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-gray-600 text-xs font-medium mb-1 block">Bo'lim</label>
                  <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 text-xs font-medium mb-1 block">Kabinet</label>
                    <input value={form.cabinet} onChange={e => setForm(p => ({ ...p, cabinet: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs font-medium mb-1 block">Qavat</label>
                    <input type="number" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400" />
                  </div>
                </div>

                <button
                  onClick={handleEdit}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
