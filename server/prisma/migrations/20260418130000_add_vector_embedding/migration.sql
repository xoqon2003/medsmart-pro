-- pgvector extension (Supabase da allaqachon mavjud)
CREATE EXTENSION IF NOT EXISTS vector;

-- Disease jadvaliga embedding ustuni qo'shish
ALTER TABLE "Disease" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);

-- IVFFlat index (cosine similarity uchun, ko'p qatorli jadvallar uchun optimal)
-- lists=100: ~10x sqrt(rows) qoidasi, 50 kasallik uchun ham ishlaydi
CREATE INDEX IF NOT EXISTS "disease_embedding_idx"
  ON "Disease" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 10);
