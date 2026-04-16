/**
 * NavigationContext — ekranlar orasidagi o'tish holati.
 *
 * HOZIRGI IMPLEMENTATSIYA: React Router v7 bilan integratsiya.
 *
 * Nima uchun wrap qilingan?
 *   Ilovada 84 ta consumer `useApp()` yoki `useNavigation()` orqali
 *   `navigate('screen')` chaqiradi. Ularni o'zgartirish — 3-4 kun ish.
 *   Buning o'rniga string-based API ni saqlab, ichida React Router
 *   ishlatamiz. Natijada:
 *     ✅ Browser back/forward ishlaydi
 *     ✅ URL o'zgaradi, bookmark mumkin
 *     ✅ Deep link (/d/:slug) avtomatik
 *     ✅ Consumer kodlari tegmaydi
 *
 * API:
 *   const { navigate, goBack, currentScreen, screenHistory } = useNavigation();
 *   navigate('patient_home')          // URL: /bemor
 *   navigate('doctor_public_profile') // URL: /d/:slug — lekin slug yo'q bo'lsa /shifokor
 *   goBack()                          // browser.back()
 *   currentScreen                     // location.pathname dan derive
 */

import { createContext, useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Screen } from '../types';
import { pathToScreen, screenToPath } from '../router/screen-routes';

export interface NavigationState {
  currentScreen: Screen;
  screenHistory: Screen[];
  navigate: (screen: Screen, params?: Record<string, string>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationState | null>(null);

/**
 * NavigationProvider — React Router ning BrowserRouter ichida ishlaydi.
 *
 * Muhim: bu Provider React Router uchun BrowserRouter (yoki HashRouter)
 * ichida bo'lishi shart. App.tsx da:
 *
 *   <BrowserRouter>
 *     <AppProvider>  ← NavigationProvider bu yerda
 *       <AppContent />
 *     </AppProvider>
 *   </BrowserRouter>
 */
export function NavigationProvider({
  children,
  initialScreen: _initialScreen = 'splash', // ignore qilinadi — URL dan derive
}: {
  children: ReactNode;
  initialScreen?: Screen;
}) {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // currentScreen URL dan derive qilinadi.
  // Bu ReactRouter location.pathname ga subscribe bo'ladi.
  const currentScreen = useMemo(
    () => pathToScreen(location.pathname),
    [location.pathname],
  );

  // screenHistory — ref orqali saqlanadi, render trigger qilmaydi.
  // Eski API bilan mosligi uchun qoldirildi, lekin amalda brauzer history ishlatamiz.
  const historyRef = useRef<Screen[]>([]);

  useEffect(() => {
    // Har navigatsiyada historyRef ga oldingi ekran qo'shiladi.
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev !== currentScreen) {
      historyRef.current = [...historyRef.current, currentScreen].slice(-20);
    }
  }, [currentScreen]);

  const navigate = useCallback(
    (screen: Screen, params?: Record<string, string>) => {
      const path = screenToPath(screen, params);
      routerNavigate(path);
    },
    [routerNavigate],
  );

  const goBack = useCallback(() => {
    // Brauzer history orqali — bu eng to'g'ri yondashuv.
    routerNavigate(-1);
  }, [routerNavigate]);

  const value = useMemo<NavigationState>(
    () => ({
      currentScreen,
      screenHistory: historyRef.current,
      navigate,
      goBack,
    }),
    [currentScreen, navigate, goBack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

/**
 * Faqat navigatsiya maydonlari kerak bo'lsa shu hookni ishlating.
 *
 * @example
 * const { goBack, navigate, currentScreen } = useNavigation();
 */
export function useNavigation(): NavigationState {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error('useNavigation must be used within NavigationProvider (AppProvider)');
  return ctx;
}
