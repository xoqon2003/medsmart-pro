# RBAC Modeli (Rolga Asoslangan Kirish Nazorati)

> **Hujjat ID:** SEC-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Rollar ierarxiyasi

```
admin (Super)
  ├── operator
  ├── kassir
  └── [barcha rollarni ko'rish]

radiolog
  ├── Arizalarni ko'rish/qabul qilish
  ├── Xulosa yozish
  └── Mutaxassisga yo'naltirish

doctor
  ├── Konsultatsiya berish
  ├── Bemorni ko'rish
  └── Xulosa yozish

specialist
  ├── Yo'naltirilgan arizalarni ko'rish
  └── Qo'shimcha xulosa yozish

patient
  ├── Ariza topshirish
  ├── O'z arizalarini ko'rish
  └── Xulosa yuklab olish

kassir
  ├── To'lov qabul qilish
  ├── Smena boshqarish
  └── Moliyaviy hisobot

operator
  ├── Barcha arizalarni ko'rish
  ├── Ariza yo'naltirish
  └── Statistika ko'rish
```

## Ruxsat matritsasi - Resurslar bo'yicha

### Applications (Arizalar)

| Harakat | patient | radiolog | doctor | specialist | operator | kassir | admin |
|---------|---------|----------|--------|-----------|----------|--------|-------|
| create | OWN | - | - | - | ANY | - | ANY |
| read | OWN | ASSIGNED | ASSIGNED | ASSIGNED | ANY | - | ANY |
| update_status | - | ASSIGNED | ASSIGNED | ASSIGNED | ANY | - | ANY |
| delete | - | - | - | - | - | - | ANY |
| assign | - | - | - | - | ANY | - | ANY |

### Conclusions (Xulosalar)

| Harakat | patient | radiolog | doctor | specialist | operator | kassir | admin |
|---------|---------|----------|--------|-----------|----------|--------|-------|
| create | - | ASSIGNED | ASSIGNED | ASSIGNED | - | - | - |
| read | OWN_APP | ASSIGNED | ASSIGNED | ASSIGNED | ANY | - | ANY |
| update | - | OWN | OWN | OWN | - | - | - |
| download_pdf | OWN_APP | ASSIGNED | ASSIGNED | ASSIGNED | ANY | - | ANY |

### Payments (To'lovlar)

| Harakat | patient | radiolog | doctor | specialist | operator | kassir | admin |
|---------|---------|----------|--------|-----------|----------|--------|-------|
| create | OWN | - | - | - | - | ANY | ANY |
| confirm | - | - | - | - | - | ANY | ANY |
| refund | - | - | - | - | - | ANY | ANY |
| view_all | - | - | - | - | - | OWN_SMENA | ANY |

### Users (Foydalanuvchilar)

| Harakat | patient | radiolog | doctor | specialist | operator | kassir | admin |
|---------|---------|----------|--------|-----------|----------|--------|-------|
| view_self | + | + | + | + | + | + | + |
| update_self | + | + | + | + | + | + | + |
| view_all | - | - | - | - | + | - | + |
| manage | - | - | - | - | - | - | + |

## Izohlar

- **OWN** - faqat o'zining resurslari
- **ASSIGNED** - o'ziga tayinlangan resurslar
- **OWN_APP** - o'z arizasiga tegishli
- **OWN_SMENA** - o'z smenasidagi to'lovlar
- **ANY** - barcha resurslar
- **+** - ruxsat berilgan
- **-** - ruxsat yo'q

## Ekranlar bo'yicha kirish nazorati

### Mini App ekranlari

| Ekran | patient | radiolog | doctor | specialist | operator | kassir | admin |
|-------|---------|----------|--------|-----------|----------|--------|-------|
| patient_home | + | - | - | - | - | - | - |
| patient_upload | + | - | - | - | - | - | - |
| radiolog_dashboard | - | + | - | - | - | - | - |
| doctor_dashboard | - | - | + | - | - | - | - |
| specialist_dashboard | - | - | - | + | - | - | - |
| operator_dashboard | - | - | - | - | + | - | - |
| kassir_dashboard | - | - | - | - | - | + | - |
| admin_dashboard | - | - | - | - | - | - | + |

### Web Platform ekranlari

| Ekran | patient | radiolog | doctor | specialist | operator | kassir | admin |
|-------|---------|----------|--------|-----------|----------|--------|-------|
| web_admin | - | - | - | - | - | - | + |
| web_operator | - | - | - | - | + | - | + |
| web_radiolog | - | + | - | - | - | - | + |
| web_doctor | - | - | + | - | - | - | + |
| web_specialist | - | - | - | + | - | - | + |
| web_kassir | - | - | - | - | - | + | + |
| web_arizalar | - | + | + | + | + | - | + |
