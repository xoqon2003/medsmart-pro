/**
 * Feature flag utility — MedSmart-Pro
 *
 * Prod default'lari:
 *   VITE_FEATURE_DISEASE_KB = false   (Disease KB moduli)
 *
 * Local dev uchun .env faylida true ga qo'ying.
 * Staging/demo uchun Vercel / Railway environment variables panelida sozlang.
 */

/** Disease KB moduli (kasalliklar bazasi, shifokor inbox, KB admin). */
export const DISEASE_KB_ENABLED: boolean =
  import.meta.env.VITE_FEATURE_DISEASE_KB === 'true';
