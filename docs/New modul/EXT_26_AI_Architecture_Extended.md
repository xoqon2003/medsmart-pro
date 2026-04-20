# MedSmart Pro — AI Architecture (KENGAYTIRILGAN)

**Hujjat ID:** DOC-26-AI-EXT | **Versiya:** 2.0 | **Sana:** 11.04.2026  
**Mas'ul:** AI Engineer + Bosh shifokor

---

## 1. UMUMIY ARXITEKTURA

### 1.1. Yuqori darajadagi pipeline
```
[Bemor input]
    ↓
[Input normalizer] (text/voice→text/body_map→symptom)
    ↓
[Symptom extractor] (NER — kasallik atamalari ajratib olish)
    ↓
[Context builder] (EMR + symptoms + history)
    ↓
[RAG retriever] (Vector DB → top-K relevant KB chunks)
    ↓
[Prompt assembler] (system + context + KB + user)
    ↓
[LLM call] (Claude → fallback GPT-4)
    ↓
[Response parser] (JSON validation)
    ↓
[KB validator] (galyutsinatsiya tekshirish)
    ↓
[Context adjuster] (yosh, jins, irsiyat omillari)
    ↓
[Red flag detector]
    ↓
[Ranker & formatter]
    ↓
[Bemorga javob]
```

### 1.2. Texnologik tanlovlar
| Komponent | Texnologiya | Sabab |
|---|---|---|
| Asosiy LLM | Claude Sonnet | Sifat, tibbiy bilim, xavfsizlik |
| Fallback LLM | GPT-4 Turbo | Reliability |
| Speech-to-text | Whisper API | uz/ru/en, aniqlik |
| Embeddings | OpenAI text-embedding-3-large | Sifat |
| Vector DB | Pinecone (yoki Qdrant self-hosted) | Tezlik, scale |
| NER | Custom spaCy model + LLM | Tibbiy entitelarni ajratish |
| Orchestration | Python FastAPI + LangChain | Tezkor |

---

## 2. RAG (Retrieval Augmented Generation) BATAFSIL

### 2.1. Indekslash jarayoni (offline)
```python
# Pseudo-code
for disease in clinical_kb:
    chunks = chunk_disease(disease, max_tokens=500)
    for chunk in chunks:
        embedding = openai.embed(chunk.text)
        pinecone.upsert(
            id=f"{disease.id}_{chunk.id}",
            vector=embedding,
            metadata={
                "disease_id": disease.id,
                "icd10": disease.icd10,
                "section": chunk.section,  # symptoms/treatment/etc
                "language": "uz"
            }
        )
```

### 2.2. Qidiruv jarayoni (online)
```python
def retrieve_context(symptoms, patient_emr, top_k=10):
    # 1. Bemor savolini embedding ga aylantirish
    query = build_query(symptoms, patient_emr)
    query_embedding = openai.embed(query)
    
    # 2. Pinecone qidiruv
    results = pinecone.query(
        vector=query_embedding,
        top_k=top_k,
        filter={"language": patient_emr.language}
    )
    
    # 3. Re-ranking (cross-encoder)
    reranked = rerank(query, results)
    
    # 4. Context yig'ish (max 4000 tokens)
    context = assemble_context(reranked, max_tokens=4000)
    return context
```

### 2.3. Chunking strategiyasi
- Har kasallik 5-10 ta chunk'ga bo'linadi (symptoms, treatment, red_flags va h.k.)
- Overlap: 50 tokens
- Metadata har chunk'da saqlanadi

### 2.4. Hybrid search
- **Semantic** (vector) — fikr o'xshashligi
- **Keyword** (BM25) — aniq atamalar (ICD-10, dori nomi)
- **Re-ranking** — eng yaxshi natijalarni tartiblash

---

## 3. PROMPT ENGINEERING

### 3.1. System prompt (qisqartirilgan)
```
Sen — MedSmart Pro tibbiy yordamchisan. Sening vazifang bemorlarning shikoyatlari asosida ehtimoliy tashxislarni taklif qilish va mutaxassisga yo'naltirishdan iborat.

QAT'IY QOIDALAR:
1. Sen HECH QACHON yakuniy tashxis qo'ymaysan.
2. Sen HECH QACHON aniq dori dozalarini bermaysan.
3. Sen HECH QACHON "uyda davolaning" demaysan.
4. Faqat berilgan KB ma'lumotlari asosida javob berasan.
5. Agar bilmasang — "Bu haqda yetarli ma'lumot yo'q, shifokorga murojaat qiling" deysan.
6. Red flag belgilarini darhol aniqlaysan va shoshilinch yordam tavsiya qilasan.
7. Bemor allergiyalarini har doim hisobga olasan.

JAVOB FORMATI: faqat valid JSON, qo'shimcha matnsiz.
```

### 3.2. Context injection
```
[CONTEXT]
Bemor: {age} yosh, {gender}
Surunkali kasalliklar: {chronic_diseases}
Allergiyalar: {allergies}  ← KRITIK
Hozirgi dorilar: {medications}
Oilaviy anamnez: {family_history}

[KB CONTEXT]
{retrieved_kb_chunks}

[BEMOR SHIKOYATI]
{patient_complaint}

[SAVOL-JAVOBLAR]
{qa_history}
```

### 3.3. Few-shot misollar
```
NAMUNA 1:
Input: 35 yosh ayol, "boshim 2 kun og'riyapti, bir tomonda, ko'nglim aynayapti"
Output: {
  "diagnoses": [
    {"icd10": "G43.9", "name": "Migren", "probability": 0.85, ...},
    {"icd10": "G44.2", "name": "Tarang tipdagi bosh og'rig'i", "probability": 0.10}
  ],
  "red_flags": [],
  "recommended_specialist": "Nevropatolog",
  "recommended_tests": ["UQT", "Qon bosimi monitoringi"]
}
```

### 3.4. Chain-of-thought (yashirin)
LLM ichki rasoning qiladi, lekin foydalanuvchiga faqat yakuniy natija ko'rsatiladi.

### 3.5. Guard rails
- Output JSON bo'lishi shart (struktur validatsiya)
- Probability 0-1 oralig'ida
- ICD-10 KB da mavjud
- Specialist KB ro'yxatidan
- Hech qachon aniq dori dozasi

---

## 4. HALLUCINATION PREVENTION

### 4.1. Strategiyalar
1. **RAG majburiy** — LLM faqat kontekstdan foydalanadi
2. **KB validatsiya** — har tashxis KB da bormi tekshiriladi
3. **Confidence threshold** — < 60% bo'lsa ko'rsatilmaydi
4. **Cross-validation** — 2 xil prompt strategiyasi natijalarini solishtirish
5. **Fact-checking layer** — alohida LLM call faktlarni tekshiradi
6. **Conservative fallback** — shubhada "shifokorga murojaat qiling"

### 4.2. KB validator pseudokod
```python
def validate_response(llm_response, kb):
    for diagnosis in llm_response.diagnoses:
        if diagnosis.icd10 not in kb.diseases:
            log_warning("Hallucinated ICD-10")
            remove_diagnosis(diagnosis)
        
        if diagnosis.specialist not in kb.specialists:
            diagnosis.specialist = "Terapevt"  # safe default
        
        for test in diagnosis.tests:
            if test not in kb.lab_tests:
                remove_test(test)
    
    return llm_response
```

---

## 5. RED FLAG DETECTION (alohida pipeline)

### 5.1. 2 qatlamli yondashuv
**Qatlam 1: Rule-based** (har doim ishlaydi, LLM dan oldin)
```python
def check_red_flags_rules(symptoms, emr):
    flags = []
    
    # FAST testi (insult)
    if "yuz_egilishi" in symptoms or "nutq_buzilishi" in symptoms:
        flags.append("STROKE_SUSPICION")
    
    # Infarkt
    if "ko'krak_og'rig'i" in symptoms and "chap_qo'l_og'rig'i" in symptoms:
        flags.append("MI_SUSPICION")
    
    # Anafilaksiya
    if "qichima" in symptoms and "hansirash" in symptoms and "shish" in symptoms:
        flags.append("ANAPHYLAXIS")
    
    # ... 50+ qoida
    return flags
```

**Qatlam 2: LLM-based** (kontekstga sezgir)
LLM ham red flag tekshiradi, ikkita qatlam natijasi birlashtiriladi.

### 5.2. False positive vs false negative
**Bu yerda false negative (red flag'ni o'tkazib yuborish) JIDDIY xato.**  
Strategiya: **overcaution** — shubhada doimo flag.

---

## 6. EVALUATION FRAMEWORK

### 6.1. Offline evaluation (release oldidan)
**Dataset:** 500 ta anonimlashtirilgan real klinik holat (ekspert tomonidan tasdiqlangan ground truth)

**Metrikalar:**
- **Top-1 accuracy:** birinchi tashxis to'g'ri
- **Top-3 accuracy:** to'g'ri tashxis 3 talik ichida (≥85% target)
- **Top-5 accuracy:** ≥95% target
- **Red flag sensitivity:** ≥95% (kritik!)
- **Red flag specificity:** ≥80% (false alarm kam)
- **Hallucination rate:** < 1%
- **Response time:** < 8s

### 6.2. Online evaluation (production)
- Har 1000 holatdan 10 tasi tasodifiy ekspert revizyaga
- Foydalanuvchi feedback (👍/👎)
- Shifokor tasdig'i (real konsultatsiyadan keyin)
- A/B testing (yangi prompt vs eski)

### 6.3. Confusion matrix
Har asosiy kasallik uchun TP/FP/TN/FN hisoblanadi.

### 6.4. Bias monitoring
- Jins bo'yicha accuracy
- Yosh guruhlari bo'yicha
- Til bo'yicha (uz/ru/en)

---

## 7. MODEL VERSIONING VA DEPLOYMENT

### 7.1. Versioning strategiyasi
- Prompt version: `v1.2.3` (semantic versioning)
- KB version: Git commit hash
- Model version: Claude API version

### 7.2. Deployment pipeline
```
Yangi prompt → Offline eval → Shadow mode → Canary (5%) → Gradual rollout → 100%
```

### 7.3. Rollback
Agar production metrikalar pasayib ketsa — avtomatik rollback.

### 7.4. A/B testing
- Variant A (eski) — 50% trafik
- Variant B (yangi) — 50% trafik
- 1 hafta natijalarni solishtirish
- Statistik signifikantlik tekshirish (chi-square)

---

## 8. MONITORING VA OBSERVABILITY

### 8.1. Real-time metrikalar
- Request rate (req/sec)
- Latency (p50, p95, p99)
- Error rate
- Token usage va cost
- Cache hit rate

### 8.2. Klinik metrikalar
- Top-3 accuracy (oylik)
- Red flag sensitivity (kunlik)
- User satisfaction (NPS)
- Doctor agreement rate

### 8.3. Alerting
- Latency > 10s → alert
- Error rate > 1% → alert
- Hallucination detected → alert (Slack)
- Red flag missed (post-hoc) → critical alert

---

## 9. COST OPTIMIZATION

### 9.1. Strategiyalar
- **Prompt caching** — system prompt cache qilinadi
- **Response caching** — bir xil so'rovlar uchun
- **Model routing** — oddiy savollar uchun arzonroq model
- **Batch processing** — analitika uchun

### 9.2. Token boshqaruvi
- Input < 4000 tokens
- Output < 1000 tokens
- Context window optimallashtirilgan

### 9.3. Taxminiy xarajat
- Bir murojaat uchun: ~$0.05
- Oyiga 100K murojaat: ~$5,000

---

## 10. ETIK AI VA EXPLAINABILITY

### 10.1. Shaffoflik
Har tashxis uchun:
- Qaysi simptomlar asos bo'lgani
- KB dan qaysi manba
- Confidence darajasi

### 10.2. Bemor avtonomiyasi
- Bemor tushuntirish so'rashi mumkin
- Boshqa fikr olishga ruxsat berish

### 10.3. Bias kamaytirish
- Diverse training data
- Regular bias audit
- Ekspertlar nazorati

### 10.4. Privacy
- Bemor ma'lumotlari LLM provayderga shifrlangan
- API call'lar log qilinmaydi (zero retention)
- Anonimlashtirish

---

## 11. KELAJAK YO'LXARITASI

### V1 (MVP)
- Claude API + RAG
- 20 kasallik
- 3 til

### V2
- Fine-tuned model (mahalliy ma'lumotlarda)
- Multimodal (rasm: teri, ECG, X-ray)
- Voice agent

### V3
- O'z modeli (open-source asosida)
- On-device inference
- Real-time vital signs integration

**Hujjat oxiri.**
