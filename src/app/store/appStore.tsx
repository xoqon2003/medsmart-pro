import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  User, Application, DraftApplication, DraftConsultation, DraftExamination,
  DraftSymptomSession, SymptomConsultation, SymptomConsultationStatus,
  KBDisease, KBSymptom, Notification, Conclusion, AuditEvent,
  RelativeInfo, SavedPatient,
} from '../types';
import { applicationService, notificationService, bookingService } from '../../services';
import { NavigationProvider, useNavigation } from './navigationContext';
import type { NavigationState } from './navigationContext';

// Re-export useNavigation so callers can import from one place
export { useNavigation };

// ── localStorage helpers ────────────────────────────────────────
const KB_DISEASES_KEY  = 'medsmart_kb_diseases';
const KB_SYMPTOMS_KEY  = 'medsmart_kb_symptoms';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── AppData state (navigatsiyasiz) ────────────────────────────────────────────
interface AppDataState {
  currentUser: User | null;
  serviceSheetOpen: boolean;
  openServiceSheet: () => void;
  closeServiceSheet: () => void;
  applications: Application[];
  notifications: Notification[];
  selectedApplication: Application | null;
  draftApplication: DraftApplication;
  draftConsultation: DraftConsultation;
  draftExamination: DraftExamination;
  savedRelatives: RelativeInfo[];
  savedPatients: SavedPatient[];
  isLoading: boolean;
  unreadCount: number;
  setUser: (user: User | null) => void;
  addSavedRelative: (r: RelativeInfo) => void;
  addSavedPatient: (p: SavedPatient) => void;
  setSelectedApplication: (app: Application | null) => void;
  updateDraft: (data: Partial<DraftApplication>) => void;
  clearDraft: () => void;
  updateDraftConsultation: (data: Partial<DraftConsultation>) => void;
  clearDraftConsultation: () => void;
  updateDraftExamination: (data: Partial<DraftExamination>) => void;
  clearDraftExamination: () => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  updateApplicationStatus: (id: number, status: Application['status'], notes?: string) => void;
  updateApplication: (id: number, updates: Partial<Application>) => void;
  addApplication: (app: Application) => void;
  addNotification: (notif: Omit<Notification, 'id'>) => void;
  addConclusionToApp: (appId: number, conclusion: Conclusion) => void;
  viewingDoctorId: number | null;
  setViewingDoctorId: (id: number | null) => void;
  draftSymptom: DraftSymptomSession;
  symptomHistory: SymptomConsultation[];
  updateDraftSymptom: (data: Partial<DraftSymptomSession>) => void;
  clearDraftSymptom: () => void;
  addSymptomConsultation: (consultation: SymptomConsultation) => void;
  updateSymptomStatus: (id: string, status: SymptomConsultationStatus) => void;
  clinicalKBData: KBDisease[];
  clinicalKBSymptoms: KBSymptom[];
  setKBDiseases: (data: KBDisease[]) => void;
  addKBDisease: (disease: KBDisease) => void;
  updateKBDisease: (id: string, updates: Partial<KBDisease>) => void;
  removeKBDisease: (id: string) => void;
  setKBSymptoms: (data: KBSymptom[]) => void;
  addKBSymptom: (symptom: KBSymptom) => void;
  updateKBSymptom: (id: string, updates: Partial<KBSymptom>) => void;
  removeKBSymptom: (id: string) => void;
}

/** Facade tipi — navigatsiya + app data birlashtirilgan */
export type AppState = NavigationState & AppDataState;

const AppDataContext = createContext<AppDataState | null>(null);

// ── AppDataProvider (ichki, NavigationProvider ichida ishlaydi) ───────────────
function AppDataProvider({ children }: { children: ReactNode }) {
  // Navigation hozircha AppDataProvider ichida ishlatilmayapti
  // (deep-link endi React Router tomonidan boshqariladi).

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);
  const openServiceSheet  = useCallback(() => setServiceSheetOpen(true),  []);
  const closeServiceSheet = useCallback(() => setServiceSheetOpen(false), []);

  // Foydalanuvchi tizimga kirmagan bo'lsa — API so'rovlarini yubormaymiz.
  useEffect(() => {
    if (!currentUser) {
      setApplications([]);
      setNotifications([]);
      return;
    }
    applicationService.getAll().then(setApplications);
    notificationService.getAll().then(setNotifications);
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-link /d/:slug — React Router endi URL ni avtomatik match qiladi
  // va DoctorPublicProfile ni render qiladi. Bu effect faqat slug dan
  // viewingDoctorId ni topib qo'yishga xizmat qiladi (navigate chaqirilmaydi).
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/d\/(.+)$/);
    if (!match) return;
    const slug = decodeURIComponent(match[1]);

    bookingService.getDoctors({ query: '', specialities: [] }).then((doctors) => {
      const doctor = doctors.find((d) => {
        const nameSlug = d.fullName.toLowerCase().replace(/\s+/g, '-');
        return nameSlug === slug || String(d.id) === slug;
      });
      if (doctor) {
        setViewingDoctorIdState(doctor.id);
      }
    });
  }, []); // faqat mount da — router URL ni avtomatik boshqaradi

  const [selectedApplication, setSelectedApplicationState] = useState<Application | null>(null);
  const [draftApplication, setDraftApplication]   = useState<DraftApplication>({});
  const [draftConsultation, setDraftConsultation] = useState<DraftConsultation>({});
  const [draftExamination, setDraftExamination]   = useState<DraftExamination>({});
  const [savedRelatives, setSavedRelatives]       = useState<RelativeInfo[]>([]);
  const [savedPatients, setSavedPatients]         = useState<SavedPatient[]>([]);
  const [isLoading]                               = useState(false);
  const [viewingDoctorId, setViewingDoctorIdState] = useState<number | null>(null);
  const [draftSymptom, setDraftSymptom]           = useState<DraftSymptomSession>({ symptoms: [], bodyZones: [], answers: [] });
  const [symptomHistory, setSymptomHistory]       = useState<SymptomConsultation[]>([]);
  const [clinicalKBData, setClinicalKBDataState]     = useState<KBDisease[]>(() => loadFromStorage<KBDisease[]>(KB_DISEASES_KEY, []));
  const [clinicalKBSymptoms, setClinicalKBSymptomsState] = useState<KBSymptom[]>(() => loadFromStorage<KBSymptom[]>(KB_SYMPTOMS_KEY, []));

  const setUser = useCallback((user: User | null) => setCurrentUser(user), []);
  const setViewingDoctorId = useCallback((id: number | null) => setViewingDoctorIdState(id), []);
  const setSelectedApplication = useCallback((app: Application | null) => setSelectedApplicationState(app), []);

  const updateDraft              = useCallback((data: Partial<DraftApplication>)   => setDraftApplication((p)   => ({ ...p, ...data })), []);
  const clearDraft               = useCallback(() => setDraftApplication({}), []);
  const updateDraftConsultation  = useCallback((data: Partial<DraftConsultation>)  => setDraftConsultation((p)  => ({ ...p, ...data })), []);
  const clearDraftConsultation   = useCallback(() => setDraftConsultation({}), []);
  const updateDraftExamination   = useCallback((data: Partial<DraftExamination>)   => setDraftExamination((p)   => ({ ...p, ...data })), []);
  const clearDraftExamination    = useCallback(() => setDraftExamination({}), []);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const makeAuditEvent = useCallback((applicationId: number, action: AuditEvent['action'], details?: AuditEvent['details']): AuditEvent => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    applicationId,
    action,
    actorId:   currentUser?.id ?? null,
    actorRole: currentUser?.role,
    actorName: currentUser?.fullName,
    at:        new Date().toISOString(),
    details,
  }), [currentUser]);

  const updateApplicationStatus = useCallback((id: number, status: Application['status'], notes?: string) => {
    const patch = (a: Application): Application => ({
      ...a,
      status,
      updatedAt: new Date().toISOString(),
      ...(notes !== undefined ? { notes } : {}),
      auditLog: [...(a.auditLog || []), makeAuditEvent(id, 'STATUS_CHANGED', { from: a.status, to: status, notes })],
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? patch(a) : a)));
    setSelectedApplicationState((prev) => (prev?.id === id ? patch(prev) : prev));
  }, [makeAuditEvent]);

  const updateApplication = useCallback((id: number, updates: Partial<Application>) => {
    const patch = (a: Application): Application => ({
      ...a,
      ...updates,
      payment:   updates.payment !== undefined ? updates.payment : a.payment,
      updatedAt: new Date().toISOString(),
      auditLog: [
        ...(a.auditLog || []),
        ...(updates.payment !== undefined ? [makeAuditEvent(id, 'PAYMENT_CHANGED', { payment: updates.payment })] : []),
      ],
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? patch(a) : a)));
    setSelectedApplicationState((prev) => (prev?.id === id ? patch(prev) : prev));
  }, [makeAuditEvent]);

  const addApplication = useCallback((app: Application) => {
    const baseAudit: AuditEvent[] = [
      ...(app.auditLog || []),
      makeAuditEvent(app.id, 'APPLICATION_CREATED', { arizaNumber: app.arizaNumber }),
    ];
    setApplications((prev) => [{ ...app, auditLog: baseAudit }, ...prev]);
  }, [makeAuditEvent]);

  const addSavedRelative = useCallback((r: RelativeInfo) => {
    setSavedRelatives((prev) => [{ ...r, id: Date.now().toString() }, ...prev.filter((x) => x.id !== r.id)]);
  }, []);
  const addSavedPatient = useCallback((p: SavedPatient) => {
    setSavedPatients((prev) => [{ ...p, id: Date.now().toString() }, ...prev.filter((x) => x.id !== p.id)]);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [{ ...notif, id: Date.now() + Math.random() }, ...prev]);
  }, []);

  const addConclusionToApp = useCallback((appId: number, conclusion: Conclusion) => {
    const patch = (a: Application): Application => ({
      ...a,
      conclusions: [...(a.conclusions || []), conclusion],
      updatedAt:   new Date().toISOString(),
      auditLog:    [...(a.auditLog || []), makeAuditEvent(appId, 'CONCLUSION_ADDED', { conclusionType: conclusion.conclusionType, authorId: conclusion.authorId, source: conclusion.source })],
    });
    setApplications((prev) => prev.map((a) => (a.id === appId ? patch(a) : a)));
    setSelectedApplicationState((prev) => (prev?.id === appId ? patch(prev) : prev));
  }, [makeAuditEvent]);

  const updateDraftSymptom      = useCallback((data: Partial<DraftSymptomSession>) => setDraftSymptom((p) => ({ ...p, ...data })), []);
  const clearDraftSymptom       = useCallback(() => setDraftSymptom({ symptoms: [], bodyZones: [], answers: [] }), []);
  const addSymptomConsultation  = useCallback((c: SymptomConsultation) => setSymptomHistory((p) => [c, ...p]), []);
  const updateSymptomStatus     = useCallback((id: string, status: SymptomConsultationStatus) =>
    setSymptomHistory((p) => p.map((c) => (c.id === id ? { ...c, status } : c))), []);

  const setKBDiseases   = useCallback((data: KBDisease[])  => { setClinicalKBDataState(data);     saveToStorage(KB_DISEASES_KEY, data); }, []);
  const addKBDisease    = useCallback((d: KBDisease)        => setClinicalKBDataState((p) => { const u = [d, ...p.filter((x) => x.id !== d.id)]; saveToStorage(KB_DISEASES_KEY, u); return u; }), []);
  const updateKBDisease = useCallback((id: string, upd: Partial<KBDisease>) =>
    setClinicalKBDataState((p) => { const u = p.map((d) => (d.id === id ? { ...d, ...upd, updatedAt: new Date().toISOString() } : d)); saveToStorage(KB_DISEASES_KEY, u); return u; }), []);
  const removeKBDisease = useCallback((id: string) =>
    setClinicalKBDataState((p) => { const u = p.filter((d) => d.id !== id); saveToStorage(KB_DISEASES_KEY, u); return u; }), []);

  const setKBSymptoms   = useCallback((data: KBSymptom[])  => { setClinicalKBSymptomsState(data); saveToStorage(KB_SYMPTOMS_KEY, data); }, []);
  const addKBSymptom    = useCallback((s: KBSymptom)        => setClinicalKBSymptomsState((p) => { const u = [s, ...p.filter((x) => x.id !== s.id)]; saveToStorage(KB_SYMPTOMS_KEY, u); return u; }), []);
  const updateKBSymptom = useCallback((id: string, upd: Partial<KBSymptom>) =>
    setClinicalKBSymptomsState((p) => { const u = p.map((s) => (s.id === id ? { ...s, ...upd } : s)); saveToStorage(KB_SYMPTOMS_KEY, u); return u; }), []);
  const removeKBSymptom = useCallback((id: string) =>
    setClinicalKBSymptomsState((p) => { const u = p.filter((s) => s.id !== id); saveToStorage(KB_SYMPTOMS_KEY, u); return u; }), []);

  const unreadCount = notifications.filter(
    (n) => !n.isRead && (!currentUser || n.userId === currentUser.id),
  ).length;

  const value: AppDataState = {
    currentUser, serviceSheetOpen, openServiceSheet, closeServiceSheet,
    applications, notifications, selectedApplication,
    draftApplication, draftConsultation, draftExamination,
    savedRelatives, savedPatients, isLoading, unreadCount,
    setUser, addSavedRelative, addSavedPatient,
    setSelectedApplication, updateDraft, clearDraft,
    updateDraftConsultation, clearDraftConsultation,
    updateDraftExamination, clearDraftExamination,
    markNotificationRead, markAllNotificationsRead,
    updateApplicationStatus, updateApplication, addApplication,
    addNotification, addConclusionToApp,
    viewingDoctorId, setViewingDoctorId,
    draftSymptom, symptomHistory,
    updateDraftSymptom, clearDraftSymptom, addSymptomConsultation, updateSymptomStatus,
    clinicalKBData, clinicalKBSymptoms,
    setKBDiseases, addKBDisease, updateKBDisease, removeKBDisease,
    setKBSymptoms, addKBSymptom, updateKBSymptom, removeKBSymptom,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * AppProvider — ilovaning ildiz Provider'i.
 * Ichida NavigationProvider + AppDataProvider bor.
 * Mavjud `<AppProvider>` ishlatadigan barcha joylar o'zgarmaydi.
 */
export function AppProvider({
  children,
  initialScreen = 'splash',
}: {
  children: ReactNode;
  initialScreen?: string;
}) {
  return (
    <NavigationProvider initialScreen={initialScreen as import('../types').Screen}>
      <AppDataProvider>{children}</AppDataProvider>
    </NavigationProvider>
  );
}

/**
 * useApp — barcha maydonlarni qaytaruvchi facade hook.
 *
 * Mavjud 83 ta consumer komponent o'zgarmaydi.
 * Faqat navigatsiya kerak bo'lgan yangi komponentlar `useNavigation()` ishlatsin.
 */
export function useApp(): AppState {
  const nav     = useNavigation();
  const appData = useContext(AppDataContext);
  if (!appData) throw new Error('useApp must be used within AppProvider');
  return { ...appData, ...nav };
}
