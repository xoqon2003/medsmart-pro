/**
 * @medsmart/types — shared domain types for web, Telegram mini-app,
 * and (eventually) Capacitor mobile surfaces.
 *
 * Phase 3.1: Handwritten types moved here from src/app/types/api/.
 * Phase 3.2: Will add `./generated.ts` emitted by openapi-typescript from
 *            server/openapi.json.
 *
 * Keep this file a pure barrel — no runtime logic, no i18n coupling.
 * `calculator.ts` deliberately stays in the app tree because it imports
 * TranslationKey from the app-local i18n module.
 */

export * from './disease';
export * from './symptom';
export * from './triage';
export * from './matcher-wizard';
