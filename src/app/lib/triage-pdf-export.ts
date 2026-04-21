import jsPDF from 'jspdf';
import type { DiseaseDetail } from '../types/api/disease';
import type {
  MatchScores,
  DifferentialDiagnosisRow,
  TimelineAnswer,
} from '../types/api/matcher-wizard';
import type { AnswerValue } from '../types/api/triage';

/**
 * Triage sessiya natijasi uchun PDF eksport.
 *
 * Chiqish:
 *  - Header: kasallik nomi + ICD-10 + sana
 *  - 5 ko'rsatkich: moslik%, javob berilgan%, xavf darajasi, qizil bayroqlar, ishonch%
 *  - Differentsial diagnostika (DDx) ro'yxati
 *  - Simptom javoblar xulosa
 *  - Davolash bo'yicha eslatma + disclaimer
 */

export interface TriagePdfInput {
  disease: DiseaseDetail;
  scores: MatchScores;
  ddx: DifferentialDiagnosisRow[];
  redFlagLabels?: string[];
  answers?: Map<string, AnswerValue>;
  timeline?: TimelineAnswer;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeUzText(text: string): string {
  return text
    .replace(/o\u02BB/g, "o'")
    .replace(/g\u02BB/g, "g'")
    .replace(/O\u02BB/g, "O'")
    .replace(/G\u02BB/g, "G'")
    .replace(/\u02BC/g, "'");
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

const RISK_LABEL_UZ: Record<MatchScores['risk'], string> = {
  LOW: 'Past',
  MODERATE: "O'rtacha",
  HIGH: 'Yuqori',
  VERY_HIGH: 'Juda yuqori',
};

const ANSWER_LABEL_UZ: Record<string, string> = {
  YES: 'Ha',
  NO: "Yo'q",
  UNKNOWN: 'Bilmayman',
  SOMETIMES: "Ba'zan",
};

const ONSET_LABEL_UZ: Record<string, string> = {
  TODAY: 'Bugun',
  LAST_WEEK: 'Oxirgi 1 hafta',
  LAST_MONTH: 'Oxirgi 1 oy',
  LAST_6_MONTHS: 'Oxirgi 6 oy',
  OVER_YEAR: '1 yildan ortiq',
};

const CONTEXT_LABEL_UZ: Record<string, string> = {
  HOME: 'Uyda',
  WORK: 'Ishda',
  SPORT: 'Sport paytida',
  TRAVEL: 'Sayohatda',
  POST_MEAL: 'Ovqatdan keyin',
  NIGHT: 'Kechasi',
};

const CONSULT_LABEL_UZ: Record<string, string> = {
  GP: 'Umumiy amaliyot shifokori',
  SELF: 'O\'zi dori ichgan',
  NEVER: 'Murojaat qilmagan',
};

// ─── Section render helpers ───────────────────────────────────────────────────

interface Ctx {
  doc: jsPDF;
  ml: number;
  cw: number;
  maxY: number;
  y: number;
}

function newPageIfNeeded(ctx: Ctx, needed: number): Ctx {
  if (ctx.y + needed > ctx.maxY) {
    ctx.doc.addPage();
    return { ...ctx, y: 15 };
  }
  return ctx;
}

/** Ko'rsatkich qutisi — belgi + raqam + UZ matn */
function drawScoreBox(
  doc: jsPDF,
  x: number,
  y: number,
  boxW: number,
  label: string,
  value: string,
  tone: 'ok' | 'warn' | 'danger' | 'muted',
): void {
  const colors: Record<typeof tone, [number, number, number]> = {
    ok:     [99, 102, 241],  // indigo
    warn:   [245, 158, 11],  // amber
    danger: [239, 68,  68],  // red
    muted:  [148, 163, 184], // slate-400
  };
  const [r, g, b] = colors[tone];

  // Quti orqa-fon
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, boxW, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, boxW, 18, 2, 2, 'S');

  // Rang liniya (tepa)
  doc.setFillColor(r, g, b);
  doc.roundedRect(x, y, boxW, 1.5, 0.5, 0.5, 'F');

  // Qiymat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  doc.text(value, x + boxW / 2, y + 8, { align: 'center' });

  // Matn label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const labelLines = doc.splitTextToSize(normalizeUzText(label), boxW - 2);
  doc.text(labelLines[0] as string, x + boxW / 2, y + 13, { align: 'center' });
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportTriageToPdf(input: TriagePdfInput): Promise<void> {
  const { disease, scores, ddx, redFlagLabels = [], answers, timeline } = input;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const ml = 20;
  const mr = 20;
  const cw = pageW - ml - mr;
  const pageH = 297;
  const footerH = 15;
  const maxY = pageH - footerH - 10;

  let y = 15;
  let ctx: Ctx = { doc, ml, cw, maxY, y };

  // ─── HEADER ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text('MedSmart-Pro', ml, y);

  const today = new Date().toLocaleDateString('ru-RU');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(today, pageW - mr, y, { align: 'right' });

  y += 7;

  // Simptom tekshiruvi belgisi
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Simptom tekshiruvi natijasi', ml, y);

  y += 9;

  // ICD-10
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(normalizeUzText(disease.icd10), ml, y);
  y += 8;

  // Kasallik nomi — bold 18pt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const nameLines = doc.splitTextToSize(normalizeUzText(disease.nameUz), cw);
  doc.text(nameLines, ml, y);
  y += nameLines.length * 7;

  if (disease.nameLat) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizeUzText(disease.nameLat), ml, y);
    y += 6;
  }

  // Ajratuvchi chiziq
  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(ml, y, pageW - mr, y);
  y += 8;

  // ─── 5 KO'RSATKICH ─────────────────────────────────────────────────────────
  const boxW = (cw - 4 * 3) / 5;

  const matchTone: Ctx['y'] extends number ? 'ok' | 'warn' | 'muted' : never =
    scores.match >= 0.7 ? 'ok' : scores.match >= 0.4 ? 'warn' : 'muted';

  drawScoreBox(doc, ml,               y, boxW, "Simptom moslik",  pct(scores.match),     matchTone as 'ok' | 'warn' | 'muted' | 'danger');
  drawScoreBox(doc, ml + (boxW+3)*1,  y, boxW, "Javob berilgan", pct(scores.answered),   'ok');
  drawScoreBox(doc, ml + (boxW+3)*2,  y, boxW, "Xavf darajasi",  RISK_LABEL_UZ[scores.risk],
    scores.risk === 'LOW' ? 'ok' : scores.risk === 'MODERATE' ? 'warn' : 'danger');
  drawScoreBox(doc, ml + (boxW+3)*3,  y, boxW, "Qizil bayroq",  String(scores.redFlagCount),
    scores.redFlagCount > 0 ? 'danger' : 'muted');
  drawScoreBox(doc, ml + (boxW+3)*4,  y, boxW, "Ishonch darajasi", pct(scores.confidence),
    scores.confidence >= 0.5 ? 'ok' : 'warn');

  y += 22;

  // ─── QIZIL BAYROQLAR (agar mavjud) ─────────────────────────────────────────
  if (redFlagLabels.length > 0) {
    ctx = { ...ctx, y };
    ctx = newPageIfNeeded(ctx, 14 + redFlagLabels.length * 5);
    y = ctx.y;

    // Sarlavha
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(ml, y, cw, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text(normalizeUzText('Shoshilinch tibbiy yordam talablari'), ml + 3, y + 5);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    for (const label of redFlagLabels) {
      ctx = { ...ctx, y };
      ctx = newPageIfNeeded(ctx, 5);
      y = ctx.y;
      doc.text(normalizeUzText(`• ${label}`), ml + 2, y);
      y += 5;
    }
    y += 4;
  }

  // ─── DIFFERENTSIAL DIAGNOSTIKA ─────────────────────────────────────────────
  if (ddx.length > 0) {
    ctx = { ...ctx, y };
    ctx = newPageIfNeeded(ctx, 14);
    y = ctx.y;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(ml, y, ml + cw, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(normalizeUzText("Differentsial diagnostika"), ml, y);
    y += 8;

    for (const row of ddx) {
      ctx = { ...ctx, y };
      ctx = newPageIfNeeded(ctx, 10);
      y = ctx.y;

      const matchPct = Math.round(row.matchScore * 100);
      const barW = (cw - 40) * row.matchScore;
      const barColor: [number, number, number] =
        row.matchScore >= 0.8 ? [34, 197, 94] :
        row.matchScore >= 0.6 ? [245, 158, 11] :
        [148, 163, 184];

      // Kasallik nomi
      doc.setFont('helvetica', row.redFlag ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const nameTxt = normalizeUzText(`${row.nameUz} (${row.icd10})`);
      const rowNameLines = doc.splitTextToSize(nameTxt, cw - 40);
      doc.text(rowNameLines[0] as string, ml, y);

      // Foiz — o'ng
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...barColor);
      doc.text(`${matchPct}%`, pageW - mr, y, { align: 'right' });

      y += 4;

      // Progress bar
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(ml, y, cw - 40, 2.5, 1, 1, 'F');
      doc.setFillColor(...barColor);
      doc.roundedRect(ml, y, barW, 2.5, 1, 1, 'F');

      // Qizil bayroq belgisi
      if (row.redFlag) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(220, 38, 38);
        doc.text('!!! Shoshilinch', ml + cw - 38, y + 2);
      }

      y += 7;
    }

    y += 4;
  }

  // ─── SIMPTOM JAVOBLARI ──────────────────────────────────────────────────────
  if (answers && answers.size > 0) {
    ctx = { ...ctx, y };
    ctx = newPageIfNeeded(ctx, 14);
    y = ctx.y;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(ml, y, ml + cw, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(normalizeUzText("Simptom javoblari"), ml, y);
    y += 8;

    doc.setFontSize(8);
    for (const [code, ans] of answers.entries()) {
      ctx = { ...ctx, y };
      ctx = newPageIfNeeded(ctx, 5);
      y = ctx.y;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(normalizeUzText(`${code}:`), ml, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(ANSWER_LABEL_UZ[String(ans)] ?? String(ans), ml + 50, y);
      y += 5;
    }

    y += 4;
  }

  // ─── VAQT KONTEKSTI ─────────────────────────────────────────────────────────
  if (timeline && Object.keys(timeline).length > 0) {
    ctx = { ...ctx, y };
    ctx = newPageIfNeeded(ctx, 14);
    y = ctx.y;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(normalizeUzText("Vaqt konteksti"), ml, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    if (timeline.onsetBucket) {
      doc.text(normalizeUzText(`Boshlanishi: ${ONSET_LABEL_UZ[timeline.onsetBucket] ?? timeline.onsetBucket}`), ml, y);
      y += 5;
    }
    if (timeline.context) {
      doc.text(normalizeUzText(`Holat: ${CONTEXT_LABEL_UZ[timeline.context] ?? timeline.context}`), ml, y);
      y += 5;
    }
    if (timeline.priorConsult) {
      doc.text(normalizeUzText(`Avvalgi murojaat: ${CONSULT_LABEL_UZ[timeline.priorConsult] ?? timeline.priorConsult}`), ml, y);
      y += 5;
    }
    if (timeline.notes) {
      const noteLines = doc.splitTextToSize(normalizeUzText(timeline.notes), cw);
      doc.text(noteLines.slice(0, 2) as string[], ml, y);
      y += noteLines.slice(0, 2).length * 4;
    }
    y += 4;
  }

  // ─── FOOTER (barcha sahifalarda) ─────────────────────────────────────────────
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const fy = pageH - 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      normalizeUzText("Bu hujjat tibbiy maslahat emas. Tashxis faqat shifokor tomonidan qo'yiladi. Shoshilinch holatda 103 ga qo'ng'iroq qiling."),
      ml, fy
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const year = new Date().getFullYear();
    doc.text(`\u00A9 MedSmart-Pro ${year}`, pageW - mr, fy, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(ml, fy - 4, pageW - mr, fy - 4);
  }

  // ─── SAQLASH ───────────────────────────────────────────────────────────────
  const fileName = `triage-${disease.slug}-${Date.now()}.pdf`;
  doc.save(fileName);
}
