import jsPDF from 'jspdf';
import type { DiseaseDetail } from '../types/api/disease';
import { CANONICAL_MARKERS } from './canonical-markers';

export interface PdfExportOptions {
  includeBlocks?: string[]; // marker ro'yxati, bo'sh = barchasi
  audienceLevel?: 'L1' | 'L2' | 'L3';
  includeDisclaimer?: boolean;
}

/** UZ spetsifik harflarni ASCII ga almashtirish (jsPDF Helvetica muammosi uchun) */
function normalizeUzText(text: string): string {
  return text
    .replace(/o\u02BB/g, "o'")
    .replace(/g\u02BB/g, "g'")
    .replace(/O\u02BB/g, "O'")
    .replace(/G\u02BB/g, "G'")
    .replace(/\u02BC/g, "'");
}

/** Markdown belgilarini stripping */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^-\s+/gm, '• ')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

/** Marker id dan UZ label topish */
function getMarkerLabel(marker: string): string {
  const found = CANONICAL_MARKERS.find((m) => m.id === marker);
  return found ? found.label : marker;
}

export async function exportDiseaseToPdf(
  disease: DiseaseDetail,
  options: PdfExportOptions = {},
): Promise<void> {
  const { includeBlocks, includeDisclaimer = true } = options;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const pageHeight = 297;
  const footerHeight = 15;
  const maxY = pageHeight - footerHeight - 10;

  let y = 15;

  // ─── HEADER ─────────────────────────────────────────────────────────────────
  // "MedSmart-Pro" — bold, 14pt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139); // muted slate
  doc.text('MedSmart-Pro', marginLeft, y);

  // Sana — o'ng tomonda
  const today = new Date().toLocaleDateString('ru-RU'); // ISO ga yaqin format
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(today, pageWidth - marginRight, y, { align: 'right' });

  y += 10;

  // ─── ICD-10 + NOM ────────────────────────────────────────────────────────────
  // ICD-10 — mono 10pt
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(normalizeUzText(disease.icd10), marginLeft, y);

  y += 8;

  // nameUz — bold 18pt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const nameLines = doc.splitTextToSize(normalizeUzText(disease.nameUz), contentWidth);
  doc.text(nameLines, marginLeft, y);
  y += nameLines.length * 7;

  // ─── LOTIN NOMI ─────────────────────────────────────────────────────────────
  if (disease.nameLat) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizeUzText(disease.nameLat), marginLeft, y);
    y += 7;
  }

  // ─── AJRATUVCHI CHIZIQ ───────────────────────────────────────────────────────
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  // ─── BLOKLAR ─────────────────────────────────────────────────────────────────
  const publishedBlocks = disease.blocks
    .filter((b) => b.status === 'PUBLISHED')
    .filter((b) => !includeBlocks || includeBlocks.length === 0 || includeBlocks.includes(b.marker))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  for (const block of publishedBlocks) {
    // Sahifa almashish tekshiruvi — marker sarlavhasi uchun joy
    if (y > maxY - 14) {
      doc.addPage();
      y = 15;
    }

    // Marker sarlavhasi — bold 11pt
    const markerLabel = normalizeUzText(getMarkerLabel(block.marker));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(markerLabel, marginLeft, y);
    y += 8;

    // Matn content — 9pt, word-wrap
    const rawText = normalizeUzText(stripMarkdown(block.contentMd));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const lines = doc.splitTextToSize(rawText, contentWidth);
    for (const line of lines) {
      if (y > maxY) {
        doc.addPage();
        y = 15;
      }
      doc.text(line as string, marginLeft, y);
      y += 4;
    }

    // Bloklar orasida bo'shliq
    y += 6;
  }

  // ─── FOOTER (barcha sahifalarda) ─────────────────────────────────────────────
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 8;

    // Disclaimer — faqat oxirgi sahifada yoki har sahifada
    if (includeDisclaimer) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const disclaimerText =
        "Bu hujjat tibbiy maslahat emas. Shifokorga murojaat qiling.";
      doc.text(normalizeUzText(disclaimerText), marginLeft, footerY);
    }

    // Copyright — o'ng tomonda
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const year = new Date().getFullYear();
    doc.text(`\u00A9 MedSmart-Pro ${year}`, pageWidth - marginRight, footerY, { align: 'right' });

    // Sahifa raqami — markazda
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });

    // Footer ajratuvchi chiziq
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 4, pageWidth - marginRight, footerY - 4);
  }

  // ─── SAQLASH ─────────────────────────────────────────────────────────────────
  const fileName = `${disease.slug}-medsmart.pdf`;
  doc.save(fileName);
}
