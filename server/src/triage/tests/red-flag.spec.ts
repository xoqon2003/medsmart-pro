import { evaluateRedFlags, RED_FLAG_RULES, RedFlagRule } from '../red-flag-rules';

// ─── Red Flag Engine testlari ─────────────────────────────────────────────────

describe('Red Flag Engine', () => {
  // ─── 1. Miokard infarkti ───────────────────────────────────────────────────

  it('miokard infarkti markerlarida IMMEDIATE qoida topiladi', () => {
    const markers = ['CHEST_PAIN', 'SHORTNESS_OF_BREATH', 'LEFT_ARM_PAIN'];
    const results = evaluateRedFlags(markers);

    const rf001 = results.find((r) => r.id === 'RF-001');
    expect(rf001).toBeDefined();
    expect(rf001!.urgencyLevel).toBe('IMMEDIATE');
    expect(rf001!.callEmergency).toBe(true);
  });

  // ─── 2. Oddiy bosh og'riqda red flag topilmaydi ───────────────────────────

  it('oddiy bosh og\'riqda red flag topilmaydi', () => {
    // Yolg'iz HEADACHE markeri hech qaysi qoidada minMatchCount=1 sifatida yo'q
    // (RF-002 requires 2+ matches from its list)
    const markers = ['HEADACHE'];
    const results = evaluateRedFlags(markers);
    // "HEADACHE" mavjud qoidalarda yo'q — hech narsa topilmasligi kerak
    expect(results).toHaveLength(0);
  });

  // ─── 3. Anafilaksiya markerlarida callEmergency=true ─────────────────────

  it('anafilaksiya markerlarida callEmergency=true', () => {
    const markers = ['THROAT_SWELLING', 'SHORTNESS_OF_BREATH', 'SKIN_HIVES'];
    const results = evaluateRedFlags(markers);

    const rf007 = results.find((r) => r.id === 'RF-007');
    expect(rf007).toBeDefined();
    expect(rf007!.callEmergency).toBe(true);
    expect(rf007!.urgencyLevel).toBe('IMMEDIATE');
    expect(rf007!.conditionLabel).toContain('Anafilaksiya');
  });

  // ─── 4. Natijalar urgency bo'yicha tartiblanadi ───────────────────────────

  it('natijalar urgency bo\'yicha tartiblanadi (IMMEDIATE birinchi)', () => {
    // Pankreatit (URGENT) + Miokard infarkti (IMMEDIATE) markerlarini birlashtiramiz
    const markers = [
      'CHEST_PAIN',            // RF-001 uchun
      'SHORTNESS_OF_BREATH',   // RF-001, RF-007 uchun
      'LEFT_ARM_PAIN',         // RF-001 uchun
      'UPPER_ABDOMINAL_PAIN',  // RF-008 uchun
      'ABDOMINAL_DISTENSION',  // RF-008 uchun
      'NAUSEA_VOMITING',       // RF-008 uchun
    ];
    const results = evaluateRedFlags(markers);

    expect(results.length).toBeGreaterThanOrEqual(2);

    // Birinchi natija IMMEDIATE bo'lishi kerak
    expect(results[0].urgencyLevel).toBe('IMMEDIATE');

    // URGENT natijalar oxirida kelishi kerak
    const urgencyOrder = results.map((r) => r.urgencyLevel);
    let lastImmediateIdx = -1;
    let firstUrgentIdx = -1;
    urgencyOrder.forEach((u, i) => {
      if (u === 'IMMEDIATE') lastImmediateIdx = i;
      if (u === 'URGENT' && firstUrgentIdx === -1) firstUrgentIdx = i;
    });
    if (firstUrgentIdx !== -1 && lastImmediateIdx !== -1) {
      expect(lastImmediateIdx).toBeLessThan(firstUrgentIdx);
    }
  });

  // ─── 5. Insult markerlarida to'g'ri qoida topiladi ───────────────────────

  it('insult markerlarida RF-002 topiladi', () => {
    const markers = ['FACIAL_DROOPING', 'SPEECH_DIFFICULTY'];
    const results = evaluateRedFlags(markers);

    const rf002 = results.find((r) => r.id === 'RF-002');
    expect(rf002).toBeDefined();
    expect(rf002!.callEmergency).toBe(true);
  });

  // ─── 6. Bitta marker bilan IMMEDIATE qoidalar ishga tushadi ─────────────

  it('LOSS_OF_CONSCIOUSNESS bitta marker bilan RF-005 topiladi', () => {
    const markers = ['LOSS_OF_CONSCIOUSNESS'];
    const results = evaluateRedFlags(markers);

    const rf005 = results.find((r) => r.id === 'RF-005');
    expect(rf005).toBeDefined();
    expect(rf005!.urgencyLevel).toBe('IMMEDIATE');
    expect(rf005!.minMatchCount).toBe(1);
  });

  // ─── 7. Sepsis uchun kamida 3 ta marker kerak ────────────────────────────

  it('sepsis uchun 2 ta marker yetarli emas', () => {
    // RF-016 minMatchCount = 3
    const markers = ['HIGH_FEVER', 'RAPID_PULSE']; // 2 ta — yetarli emas
    const results = evaluateRedFlags(markers);
    const rf016 = results.find((r) => r.id === 'RF-016');
    expect(rf016).toBeUndefined();
  });

  it('sepsis uchun 3 ta marker yetarli', () => {
    const markers = ['HIGH_FEVER', 'RAPID_PULSE', 'CONFUSION'];
    const results = evaluateRedFlags(markers);
    const rf016 = results.find((r) => r.id === 'RF-016');
    expect(rf016).toBeDefined();
    expect(rf016!.urgencyLevel).toBe('IMMEDIATE');
  });

  // ─── 8. Bo'sh markerlar massivi — natija bo'sh ───────────────────────────

  it('bo\'sh markerlar massivida hech qanday red flag topilmaydi', () => {
    const results = evaluateRedFlags([]);
    expect(results).toHaveLength(0);
  });

  // ─── 9. Barcha qoidalar unikal IDlarga ega ────────────────────────────────

  it('RED_FLAG_RULES da barcha IDlar unikal', () => {
    const ids = RED_FLAG_RULES.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // ─── 10. Barcha qoidalarda icd10Hints mavjud yoki undefined ─────────────

  it('barcha qoidalar to\'g\'ri tuzilmaga ega', () => {
    for (const rule of RED_FLAG_RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.symptomMarkers.length).toBeGreaterThan(0);
      expect(rule.minMatchCount).toBeGreaterThanOrEqual(1);
      expect(['IMMEDIATE', 'URGENT', 'SOON']).toContain(rule.urgencyLevel);
      expect(typeof rule.callEmergency).toBe('boolean');
      expect(rule.messageUz).toBeTruthy();
      expect(rule.conditionLabel).toBeTruthy();
    }
  });

  // ─── 11. GI qon ketishi — bitta marker bilan topiladi ───────────────────

  it('BLOODY_VOMIT bitta marker bilan RF-010 topiladi', () => {
    const markers = ['BLOODY_VOMIT'];
    const results = evaluateRedFlags(markers);
    const rf010 = results.find((r) => r.id === 'RF-010');
    expect(rf010).toBeDefined();
    expect(rf010!.urgencyLevel).toBe('IMMEDIATE');
  });

  // ─── 12. Qaytarilgan natijalar asl RED_FLAG_RULES'dan referens ───────────

  it('evaluateRedFlags qaytargan obyektlar RED_FLAG_RULES massividan referensdir', () => {
    const markers = ['CHEST_PAIN', 'SHORTNESS_OF_BREATH'];
    const results = evaluateRedFlags(markers);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r: RedFlagRule) => {
      const original = RED_FLAG_RULES.find((rule) => rule.id === r.id);
      expect(original).toBe(r); // bir xil referens
    });
  });
});
