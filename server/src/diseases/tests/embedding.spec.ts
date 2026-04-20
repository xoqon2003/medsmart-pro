import { EmbeddingService } from '../embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    // OPENAI_API_KEY yo'q — process.env ga ishonch, mock vektor yo'l bilan test qilinadi
    delete process.env['OPENAI_API_KEY'];
    service = new EmbeddingService();
  });

  it('1536-o\'lchamli vektor qaytaradi', async () => {
    const vector = await service.embed('gipertoniya');
    expect(vector).toHaveLength(1536);
    vector.forEach((v) => {
      expect(typeof v).toBe('number');
      expect(isFinite(v)).toBe(true);
    });
  });

  it('bir xil matn → bir xil vektor (deterministik)', async () => {
    const v1 = await service.embed('diabet');
    const v2 = await service.embed('diabet');
    expect(v1).toEqual(v2);
  });

  it('har xil matn → har xil vektor', async () => {
    const v1 = await service.embed('gipertoniya');
    const v2 = await service.embed('diabet');
    expect(v1).not.toEqual(v2);
  });

  it('bo\'sh matn uchun ham 1536-o\'lchamli vektor qaytaradi', async () => {
    const vector = await service.embed('');
    expect(vector).toHaveLength(1536);
  });

  it('embedDisease nameUz, nameLat va synonyms ni birlashtiradi', async () => {
    const v1 = await service.embedDisease({
      nameUz: 'Gipertoniya',
      nameLat: 'Hypertension',
      synonyms: ['yuqori qon bosimi'],
    });
    const v2 = await service.embed('Gipertoniya Hypertension yuqori qon bosimi');
    expect(v1).toEqual(v2);
  });

  it('embedDisease — null nameLat bilan ishlaydi', async () => {
    const vector = await service.embedDisease({
      nameUz: 'Qandli diabet',
      nameLat: null,
      synonyms: [],
    });
    expect(vector).toHaveLength(1536);
  });

  it('getEmbedding — API key yo\'q bo\'lsa mock vektor qaytaradi', async () => {
    const vector = await service.getEmbedding('test matn');
    expect(vector).toHaveLength(1536);
  });
});
