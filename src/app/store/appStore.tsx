import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Application, Screen, DraftApplication, DraftConsultation, DraftExamination, Notification, Conclusion, AuditEvent, RelativeInfo, SavedPatient } from '../types';
import { applicationService, notificationService } from '../../services';

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
}

const AppContext = createContext<AppState | null>(null);

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
  const [selectedApplication, setSelectedApplicationState] = useState<Application | null>(null);
  const [draftApplication, setDraftApplication] = useState<DraftApplication>({});
  const [draftConsultation, setDraftConsultation] = useState<DraftConsultation>({});
  const [draftExamination, setDraftExamination] = useState<DraftExamination>({});
  const [savedRelatives, setSavedRelatives] = useState<RelativeInfo[]>([]);
  const [savedPatients, setSavedPatients] = useState<SavedPatient[]>([]);
  const [isLoading] = useState(false);

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}