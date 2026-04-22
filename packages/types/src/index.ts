/**
 * @medsmart/types — shared domain types for web, Telegram mini-app,
 * and (eventually) Capacitor mobile surfaces.
 *
 * Phase 3.1: Handwritten types moved here from src/app/types/api/.
 * Phase 3.2: `./generated.ts` — emitted by openapi-typescript from
 *            server/openapi.json. Regenerate via:
 *              pnpm --filter @medsmart/types generate
 *
 * Keep this file a pure barrel — no runtime logic, no i18n coupling.
 * `calculator.ts` deliberately stays in the app tree because it imports
 * TranslationKey from the app-local i18n module.
 */

// ── Handwritten domain types ───────────────────────────────────────────────
export * from './disease';
export * from './symptom';
export * from './triage';
export * from './matcher-wizard';

// ── OpenAPI-generated types (namespaced; do not export *) ──────────────────
//
// Consumers reference server contract types explicitly:
//
//   import type { paths, components } from '@medsmart/types';
//
//   type GetDiseaseResp =
//     paths['/api/v1/diseases/{id}']['get']['responses']['200']['content']['application/json'];
//
//   type DiseaseDto = components['schemas']['DiseaseDto'];
//
// Named re-exports are intentional — `export *` would pollute the barrel
// with `operations`, `webhooks`, `$defs`, etc. and risk future collisions
// with handwritten types.
// `paths` and `components` are always emitted by openapi-typescript v7.
// `operations` and `webhooks` depend on spec content — import those
// directly from '@medsmart/types/generated' if needed:
//
//   import type { operations } from '@medsmart/types/generated';
export type { paths, components } from './generated';
