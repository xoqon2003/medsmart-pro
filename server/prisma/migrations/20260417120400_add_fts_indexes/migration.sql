-- Migration: add_fts_indexes
-- PR: PR-06
-- Reference: docs/analysis/implementation-plan.md#pr-06-postgres-fts-pg_trgm-tsvector-indexes
-- Scope: pg_trgm + unaccent extensions, generated tsvector columns on Disease & Symptom, GIN indexes.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ── Disease.searchVector ─────────────────────────────────────────────────────
ALTER TABLE "Disease" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', unaccent(coalesce("nameUz", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce("nameRu", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("nameEn", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("icd10", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string("synonyms", ' '), ''))), 'C')
  ) STORED;

CREATE INDEX "idx_Disease_search" ON "Disease" USING GIN ("searchVector");

-- Trigram indexes for ILIKE / similarity fallbacks
CREATE INDEX "idx_Disease_nameUz_trgm" ON "Disease" USING GIN ("nameUz" gin_trgm_ops);
CREATE INDEX "idx_Disease_nameRu_trgm" ON "Disease" USING GIN ("nameRu" gin_trgm_ops);

-- ── Symptom.searchVector ─────────────────────────────────────────────────────
ALTER TABLE "Symptom" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', unaccent(coalesce("nameUz", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce("nameRu", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("nameEn", ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce("code", ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(array_to_string("synonyms", ' '), ''))), 'C')
  ) STORED;

CREATE INDEX "idx_Symptom_search" ON "Symptom" USING GIN ("searchVector");

CREATE INDEX "idx_Symptom_nameUz_trgm" ON "Symptom" USING GIN ("nameUz" gin_trgm_ops);
