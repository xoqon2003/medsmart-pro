import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Application, Screen, DraftApplication, DraftConsultation, DraftExamination, DraftSymptomSession, SymptomConsultation, SymptomConsultationStatus, KBDisease, KBSymptom, Notification, Conclusion, AuditEvent, RelativeInfo, SavedPatient } from '../types';
import { applicationService, notificationService, bookingService } from '../../services';

interface AppState {
  currentUser: User | null;
  currentScreen: Screen;
  screenHistory: Screen[];
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
  navigate: (screen: Screen) => void;
  goBack: () => void;
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
  // ── AI Tavsiya (Simptom tahlili) ──────────────────────────────
  draftSymptom: DraftSymptomSession;
  symptomHistory: SymptomConsultation[];
  updateDraftSymptom: (data: Partial<DraftSymptomSession>) => void;
  clearDraftSymptom: () => void;
  addSymptomConsultation: (consultation: SymptomConsultation) => void;
  updateSymptomStatus: (id: string, status: SymptomConsultationStatus) => void;
  // ── Klinik Bilim Bazasi (Web KB ↔ AI Tavsiya) ────────────────
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

const AppContext = createContext<AppState | null>(null);

// ── localStorage helpers ────────────────────────────────────────
const KB_DISEASES_KEY = 'medsmart_kb_diseases';
const KB_SYMPTOMS_KEY = 'medsmart_kb_symptoms';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function AppProvider({ children, initialScreen = 'splash' }: { children: ReactNode; initialScreen?: Screen }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);
  const openServiceSheet  = useCallback(() => setServiceSheetOpen(true),  []);
  const closeServiceSheet = useCallback(() => setServiceSheetOpen(false), []);

  useEffect(() => {
    applicationService.getAll().then(setApplications);
    notificationService.getAll().then(setNotifications);
  }, []);

  // Deep-link: /d/{slug} URL orqali shifokor profilini ochish
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/d\/(.+)$/);
    if (!match) return;
    const slug = decodeURIComponent(match[1]);

    // Slug bo'yicha mock shifokorlardan qidirish (ismi slug ga mos)
    bookingService.getDoctors({ query: '', specialities: [] }).then(doctors => {
      const doctor = doctors.find(d => {
        const nameSlug = d.fullName.toLowerCase().replace(/\s+/g, '-');
        return nameSlug === slug || String(d.id) === slug;
      });
      if (doctor) {
        setViewingDoctorIdState(doctor.id);
        setCurrentScreen('doctor_public_profile');
      }
    });
  }, []);
  const [selectedApplication, setSelectedApplicationState] = useState<Application | null>(null);
  const [draftApplication, setDraftApplication] = useState<DraftApplication>({});
  const [draftConsultation, setDraftConsultation] = useState<DraftConsultation>({});
  const [draftExamination, setDraftExamination] = useState<DraftExamination>({});
  const [savedRelatives, setSavedRelatives] = useState<RelativeInfo[]>([]);
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);
  const [isLoading] = useState(false);
  const [viewingDoctorId, setViewingDoctorIdState] = useState<number | null>(null);
  const setViewingDoctorId = useCallback((id: number | null) => setViewingDoctorIdState(id), []);
  const [draftSymptom, setDraftSymptom] = useState<DraftSymptomSession>({ symptoms: [], bodyZones: [], answers: [] });
  const [symptomHistory, setSymptomHistory] = useState<SymptomConsultation[]>([]);
  // ── Klinik KB (localStorage dan yuklanadi) ──
  const [clinicalKBData, setClinicalKBDataState] = useState<KBDisease[]>(() => loadFromStorage<KBDisease[]>(KB_DISEASES_KEY, []));
  const [clinicalKBSymptoms, setClinicalKBSymptomsState] = useState<KBSymptom[]>(() => loadFromStorage<KBSymptom[]>(KB_SYMPTOMS_KEY, []));

  const setUser = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

  const navigate = useCallback((screen: Screen) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
  }, [currentScreen]);

  const goBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const prevScreen = newHistory.pop()!;
      setCurrentScreen(prevScreen);
      return newHistory;
    });
  }, []);

  const setSelectedApplication = useCallback((app: Application | null) => {
    setSelectedApplicationState(app);
  }, []);

  const updateDraft = useCallback((data: Partial<DraftApplication>) => {
    setDraftApplication((prev) => ({ ...prev, ...data }));
  }, []);

  const clearDraft = useCallback(() => {
    setDraftApplication({});
  }, []);

  const updateDraftConsultation = useCallback((data: Partial<DraftConsultation>) => {
    setDraftConsultation((prev) => ({ ...prev, ...data }));
  }, []);

  const clearDraftConsultation = useCallback(() => {
    setDraftConsultation({});
  }, []);

  const updateDraftExamination = useCallback((data: Partial<DraftExamination>) => {
    setDraftExamination((prev) => ({ ...prev, ...data }));
  }, []);

  const clearDraftExamination = useCallback(() => {
    setDraftExamination({});
  }, []);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const makeAuditEvent = useCallback((applicationId: number, action: AuditEvent['action'], details?: AuditEvent['details']): AuditEvent => {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      applicationId,
      action,
      actorId: currentUser?.id ?? null,
      actorRole: currentUser?.role,
      actorName: currentUser?.fullName,
      at: new Date().toISOString(),
      details,
    };
  }, [currentUser]);

  const updateApplicationStatus = useCallback((id: number, status: Application['status'], notes?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              updatedAt: new Date().toISOString(),
              ...(notes !== undefined ? { notes } : {}),
              auditLog: [...(a.auditLog || []), makeAuditEvent(id, 'STATUS_CHANGED', { from: a.status, to: status, notes })],
            }
          : a
      )
    );
    setSelectedApplicationState((prev) =>
      prev?.id === id
        ? {
            ...prev,
            status,
            updatedAt: new Date().toISOString(),
            ...(notes !== undefined ? { notes } : {}),
            auditLog: [...(prev.auditLog || []), makeAuditEvent(id, 'STATUS_CHANGED', { from: prev.status, to: status, notes })],
          }
        : prev
    );
  }, [makeAuditEvent]);

  const updateApplication = useCallback((id: number, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updates,
              // Deep merge payment if provided
              payment: updates.payment !== undefined
                ? updates.payment
                : a.payment,
              updatedAt: new Date().toISOString(),
              auditLog: [
                ...(a.auditLog || []),
                ...(updates.payment !== undefined
                  ? [makeAuditEvent(id, 'PAYMENT_CHANGED', { payment: updates.payment })]
                  : []),
              ],
            }
          : a
      )
    );
    setSelectedApplicationState((prev) =>
      prev?.id === id
        ? {
            ...prev,
            ...updates,
            payment: updates.payment !== undefined ? updates.payment : prev.payment,
            updatedAt: new Date().toISOString(),
            auditLog: [
              ...(prev.auditLog || []),
              ...(updates.payment !== undefined
                ? [makeAuditEvent(id, 'PAYMENT_CHANGED', { payment: updates.payment })]
                : []),
            ],
          }
        : prev
    );
  }, [makeAuditEvent]);

  const addApplication = useCallback((app: Application) => {
    const baseAudit: AuditEvent[] = [...(app.auditLog || []), makeAuditEvent(app.id, 'APPLICATION_CREATED', { arizaNumber: app.arizaNumber })];
    setApplications((prev) => [{ ...app, auditLog: baseAudit }, ...prev]);
  }, [makeAuditEvent]);

  const addSavedRelative = useCallback((r: RelativeInfo) => {
    const withId = { ...r, id: Date.now().toString() };
    setSavedRelatives(prev => [withId, ...prev.filter(x => x.id !== r.id)]);
  }, []);

  const addSavedPatient = useCallback((p: SavedPatient) => {
    const withId = { ...p, id: Date.now().toString() };
    setSavedPatients(prev => [withId, ...prev.filter(x => x.id !== p.id)]);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [
      { ...notif, id: Date.now() + Math.random() },
      ...prev,
    ]);
  }, []);

  const addConclusionToApp = useCallback((appId: number, conclusion: Conclusion) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              conclusions: [...(a.conclusions || []), conclusion],
              updatedAt: new Date().toISOString(),
              auditLog: [...(a.auditLog || []), makeAuditEvent(appId, 'CONCLUSION_ADDED', { conclusionType: conclusion.conclusionType, authorId: conclusion.authorId, source: conclusion.source })],
            }
          : a
      )
    );
    setSelectedApplicationState((prev) =>
      prev?.id === appId
        ? {
            ...prev,
            conclusions: [...(prev.conclusions || []), conclusion],
            updatedAt: new Date().toISOString(),
            auditLog: [...(prev.auditLog || []), makeAuditEvent(appId, 'CONCLUSION_ADDED', { conclusionType: conclusion.conclusionType, authorId: conclusion.authorId, source: conclusion.source })],
          }
        : prev
    );
  }, [makeAuditEvent]);

  const updateDraftSymptom = useCallback((data: Partial<DraftSymptomSession>) => {
    setDraftSymptom(prev => ({ ...prev, ...data }));
  }, []);

  const clearDraftSymptom = useCallback(() => {
    setDraftSymptom({ symptoms: [], bodyZones: [], answers: [] });
  }, []);

  const addSymptomConsultation = useCallback((consultation: SymptomConsultation) => {
    setSymptomHistory(prev => [consultation, ...prev]);
  }, []);

  const updateSymptomStatus = useCallback((id: string, status: SymptomConsultationStatus) => {
    setSymptomHistory(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }, []);

  // ── Klinik KB CRUD (localStorage ga persist) ──
  const setKBDiseases = useCallback((data: KBDisease[]) => {
    setClinicalKBDataState(data);
    saveToStorage(KB_DISEASES_KEY, data);
  }, []);

  const addKBDisease = useCallback((disease: KBDisease) => {
    setClinicalKBDataState(prev => {
      const updated = [disease, ...prev.filter(d => d.id !== disease.id)];
      saveToStorage(KB_DISEASES_KEY, updated);
      return updated;
    });
  }, []);

  const updateKBDisease = useCallback((id: string, updates: Partial<KBDisease>) => {
    setClinicalKBDataState(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
      saveToStorage(KB_DISEASES_KEY, updated);
      return updated;
    });
  }, []);

  const removeKBDisease = useCallback((id: string) => {
    setClinicalKBDataState(prev => {
      const updated = prev.filter(d => d.id !== id);
      saveToStorage(KB_DISEASES_KEY, updated);
      return updated;
    });
  }, []);

  const setKBSymptoms = useCallback((data: KBSymptom[]) => {
    setClinicalKBSymptomsState(data);
    saveToStorage(KB_SYMPTOMS_KEY, data);
  }, []);

  const addKBSymptom = useCallback((symptom: KBSymptom) => {
    setClinicalKBSymptomsState(prev => {
      const updated = [symptom, ...prev.filter(s => s.id !== symptom.id)];
      saveToStorage(KB_SYMPTOMS_KEY, updated);
      return updated;
    });
  }, []);

  const updateKBSymptom = useCallback((id: string, updates: Partial<KBSymptom>) => {
    setClinicalKBSymptomsState(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      saveToStorage(KB_SYMPTOMS_KEY, updated);
      return updated;
    });
  }, []);

  const removeKBSymptom = useCallback((id: string) => {
    setClinicalKBSymptomsState(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToStorage(KB_SYMPTOMS_KEY, updated);
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.isRead && (!currentUser || n.userId === currentUser.id)
  ).length;

  const value: AppState = {
    currentUser,
    currentScreen,
    screenHistory,
    serviceSheetOpen,
    openServiceSheet,
    closeServiceSheet,
    applications,
    notifications,
    selectedApplication,
    draftApplication,
    draftConsultation,
    draftExamination,
    savedRelatives,
    savedPatients,
    isLoading,
    unreadCount,
    setUser,
    navigate,
    goBack,
    setSelectedApplication,
    updateDraft,
    clearDraft,
    updateDraftConsultation,
    clearDraftConsultation,
    updateDraftExamination,
    clearDraftExamination,
    markNotificationRead,
    markAllNotificationsRead,
    updateApplicationStatus,
    updateApplication,
    addApplication,
    addSavedRelative,
    addSavedPatient,
    addNotification,
    addConclusionToApp,
    viewingDoctorId,
    setViewingDoctorId,
    draftSymptom,
    symptomHistory,
    updateDraftSymptom,
    clearDraftSymptom,
    addSymptomConsultation,
    updateSymptomStatus,
    clinicalKBData,
    clinicalKBSymptoms,
    setKBDiseases,
    addKBDisease,
    updateKBDisease,
    removeKBDisease,
    setKBSymptoms,
    addKBSymptom,
    updateKBSymptom,
    removeKBSymptom,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}