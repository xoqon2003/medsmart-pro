import { Injectable, Logger } from '@nestjs/common';

/**
 * EmbeddingService — matnni vektorial tasvirga o'tkazish.
 *
 * Ikki ish rejimi:
 *  1. Production: `OPENAI_API_KEY` env o'rnatilgan bo'lsa OpenAI `text-embedding-3-small` ishlatadi.
 *  2. MVP / dev: API kaliti yo'q bo'lsa deterministik mock vektor qaytaradi.
 *     Mock xususiyatlari: bir xil matn → bir xil vektor (test qilish mumkin).
 *
 * O'lcham: VECTOR_DIM = 1536 (Prisma schema `vector(1536)` bilan sinxron).
 */

const VECTOR_DIM = 1536;

interface OpenAIEmbeddingResponse {
  data: [{ embedding: number[] }];
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  /**
   * Berilgan matn uchun 1536-o'lchamli embedding vektorini qaytaradi.
   * OPENAI_API_KEY env o'zgaruvchisi yo'q bo'lsa — deterministik mock vektor (MVP fallback).
   */
  async getEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env['OPENAI_API_KEY'];

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY topilmadi — deterministik mock vektor ishlatilmoqda');
      return this.embed(text);
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`OpenAI API xatosi: ${response.status} — ${body}`);
    }

    const data = (await response.json()) as OpenAIEmbeddingResponse;
    return data.data[0].embedding;
  }

  /**
   * Deterministik mock embedding (MVP da ishlatiladi).
   * Bir xil matn → bir xil vektor (test qilish mumkin).
   * Production da `getEmbedding()` ni ishlating.
   */
  async embed(text: string): Promise<number[]> {
    // Bo'sh matn uchun nol-vektor oldini olish
    const src = text.length > 0 ? text : '\0';

    return Array.from({ length: VECTOR_DIM }, (_, i) => {
      const charCode = src.charCodeAt(i % src.length) / 255;
      return Math.sin(charCode * (i + 1)) * 0.1;
    });
  }

  /**
   * Kasallik nomlaridan embedding matni quradi va vektorga o'tkazadi.
   * nameUz + nameLat + synonyms birlashtirilib embedding uchun manba hisoblanadi.
   */
  async embedDisease(disease: {
    nameUz: string;
    nameLat?: string | null;
    synonyms: string[];
  }): Promise<number[]> {
    const text = [disease.nameUz, disease.nameLat, ...disease.synonyms]
      .filter(Boolean)
      .join(' ');
    return this.embed(text);
  }
}
