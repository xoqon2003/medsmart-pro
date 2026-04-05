# User Story Shabloni

## Asosiy format

```markdown
# US-[MODUL]-[RAQAM]: [Qisqa sarlavha]

> **Ustuvorlik:** [Yuqori/O'rta/Past] | **Sprint:** [#] | **Baholash:** [SP]

## User Story

**Sifatida:** [Rol]
**Men xohlayman:** [Harakat]
**Shunda:** [Foyda/Natija]

## Qabul mezonlari

```gherkin
Scenario: [Stsenariy nomi]
  Given: [Boshlang'ich holat]
  When: [Foydalanuvchi harakati]
  Then: [Kutilgan natija]

Scenario: [Xato holati]
  Given: [Boshlang'ich holat]
  When: [Noto'g'ri harakat]
  Then: [Xato xabari]
```

## Texnik tafsilotlar

### Ekranlar
- [Ekran nomi] (`screen_code`)

### Komponentlar
- `src/app/components/screens/[rol]/[Component].tsx`

### API endpointlar
- `POST /api/v1/[resource]`
- `GET /api/v1/[resource]`

### Ma'lumot modeli
- [Entity nomi] → [O'zgartirilgan maydonlar]

## Bog'liq hujjatlar
- FR-[MODUL]-[RAQAM] (Funksional talab)
- BR-[RAQAM] (Biznes qoidasi)

## Test holatlari
- TC-[MODUL]-[RAQAM]
```

---

## Misol

```markdown
# US-APP-001: Radiologik tahlil uchun ariza topshirish

> **Ustuvorlik:** Yuqori | **Sprint:** #3 | **Baholash:** 8 SP

## User Story

**Sifatida:** Bemor
**Men xohlayman:** Radiologik tasvirlarimni yuklash va mutaxassis xulosasini olish
**Shunda:** Uyimdan chiqmasdan professional diagnostika olaman

## Qabul mezonlari

Scenario: Muvaffaqiyatli ariza
  Given: Bemor tizimga kirgan
  When: Fayl yuklaydi, anamnez to'ldiradi, to'lov qiladi
  Then: Ariza yaratiladi va radiologga yuboriladi

Scenario: Noto'g'ri fayl formati
  Given: Bemor fayl yuklash ekranida
  When: .exe fayl yuklashga harakat qiladi
  Then: "Faqat DICOM, JPG, PDF, ZIP formatlar qabul qilinadi" xatosi

## Bog'liq: FR-APP-001, BR-010, BR-030
```
