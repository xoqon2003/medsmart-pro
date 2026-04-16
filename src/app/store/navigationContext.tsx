/**
 * NavigationContext — ekranlar orasidagi o'tish holati.
 *
 * Nima uchun ajratildi?
 *   appStore.tsx da barcha 47 ta maydon bitta Context edi.
 *   Navigatsiya (currentScreen) har bir ekran o'tishida o'zgaradi,
 *   bu esa barcha consumer komponentlarni qayta render qilardi —
 *   hatto foydalanuvchi ma'lumoti va arizalar o'zgarmagan bo'lsa ham.
 *
 * Facade:
 *   `useApp()` hali ham barcha maydonlarni qaytaradi (hech qanday
 *   mavjud komponent o'zgarmaydi). Yangi komponentlar yoki faqat
 *   navigatsiya kerak bo'lganlar `useNavigation()` ishlatib, faqat
 *   ekran o'zgarishida render bo'ladi.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { Screen } from '../types';

export interface NavigationState {
  currentScreen: Screen;
  screenHistory: Screen[];
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationState | null>(null);

export function NavigationProvider({
  children,
  initialScreen = 'splash',
}: {
  children: ReactNode;
  initialScreen?: Screen;
}) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  // Ref trick: navigate uchun stable (o'zgarmaydigan) referens.
  // Eski pattern: useCallback([currentScreen]) — har bir ekran o'tishida navigate o'zgarardi.
  // Yangi pattern: ref orqali currentScreen ni o'qiymiz → deps bo'sh → navigate barqaror.
  const currentScreenRef = useRef(currentScreen);
  currentScreenRef.current = currentScreen;

  const navigate = useCallback((screen: Screen) => {
    setScreenHistory((prev) => [...prev, currentScreenRef.current]);
    setCurrentScreen(screen);
  }, []); // Stable — hech qachon o'zgarmaydi

  const goBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const prevScreen = newHistory.pop()!;
      setCurrentScreen(prevScreen);
      return newHistory;
    });
  }, []); // Stable — functional updater pattern

  return (
    <NavigationContext.Provider
      value={{ currentScreen, screenHistory, navigate, goBack }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Faqat navigatsiya maydonlari kerak bo'lsa shu hookni ishlating.
 *
 * Afzallik: bu hook faqat `currentScreen` o'zgarganda render bo'ladi,
 * `applications`, `currentUser` va boshqa maydonlar o'zgarganda emas.
 *
 * @example
 * const { goBack } = useNavigation();
 */
export function useNavigation(): NavigationState {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error('useNavigation must be used within NavigationProvider (AppProvider)');
  return ctx;
}
