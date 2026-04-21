import jsPDF from 'jspdf';
import type {
  DiseaseDetail,
  DiseaseScientist,
  DiseaseResearch,
  DiseaseGenetic,
  InheritancePattern,
  ScientistRole,
} from '../types/api/disease';
import { CANONICAL_MARKERS } from './canonical-markers';

export interface PdfExportOptions {
  includeBlocks?: string[]; // marker ro'yxati, bo'sh = barchasi
  audienceLevel?: 'L1' | 'L2' | 'L3';
  includeDisclaimer?: boolean;
  /** Metadata seksiyalari — bo'sh / undefined bo'lsa chiqarilmaydi */
  scientists?: DiseaseScientist[];
  research?: DiseaseResearch[];
  genetics?: DiseaseGenetic[];
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

/** ScientistRole → ko'rinadigan UZ matn */
function roleLabel(role: ScientistRole): string {
  const map: Record<ScientistRole, string> = {
    DISCOVERER: 'Kashfiyotchi',
    CLASSIFIER: 'Klassifikator',
    CONTRIBUTOR: 'Hissa qo\'shgan',
    RESEARCHER: 'Tadqiqotchi',
    EDITOR: 'Muharrir',
  };
  return map[role] ?? role;
}

/** InheritancePattern → qisqa UZ matn */
function inheritanceLabel(p: InheritancePattern | null): string {
  if (!p) return '';
  const map: Record<InheritancePattern, string> = {
    AUTOSOMAL_DOMINANT: 'Autosomal dominant',
    AUTOSOMAL_RECESSIVE: 'Autosomal retsessiv',
    X_LINKED_DOMINANT: 'X-bog\'liq dominant',
    X_LINKED_RECESSIVE: 'X-bog\'liq retsessiv',
    MITOCHONDRIAL: 'Mitoxondrial',
    COMPLEX: 'Murakkab',
    SPORADIC: 'Sporadik',
  };
  return map[p] ?? p;
}

/** Penetrans sonini foizga aylantirish */
function penetrancePercent(val: string | number | null): string {
  if (val === null || val === undefined) return '';
  const num = Number(val);
  if (Number.isNaN(num)) return '';
  return `${(num * 100).toFixed(1)}%`;
}

// ─── METADATA SECTION RENDER HELPERS ─────────────────────────────────────────

type PdfDoc = jsPDF;

interface RenderCtx {
  doc: PdfDoc;
  marginLeft: number;
  contentWidth: number;
  pageHeight: number;
  maxY: number;
  y: number;
}

function checkNewPage(ctx: RenderCtx, neededHeight: number): RenderCtx {
  if (ctx.y + neededHeight > ctx.maxY) {
    ctx.doc.addPage();
    return { ...ctx, y: 15 };
  }
  return ctx;
}

/** Metadata seksiya sarlavhasi (section divider stilida) */
function renderMetaSectionHeader(ctx: RenderCtx, title: string): RenderCtx {
  ctx = checkNewPage(ctx, 16);
  const { doc, marginLeft, contentWidth } = ctx;
  let { y } = ctx;

  // Divider chiziq
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += 5;

  // Sarlavha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(normalizeUzText(title), marginLeft, y);
  y += 8;

  return { ...ctx, y };
}

/** Olimlar seksiyasi */
function renderScientists(ctx: RenderCtx, scientists: DiseaseScientist[]): RenderCtx {
  if (!scientists.length) return ctx;

  ctx = renderMetaSectionHeader(ctx, "Olimlar va tarix");
  const { doc, marginLeft, contentWidth } = ctx;
  let { y } = ctx;

  for (const sci of scientists) {
    ctx = checkNewPage({ ...ctx, y }, 20);
    y = ctx.y;

    // Ism — bold 10pt
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(normalizeUzText(sci.fullName), marginLeft, y);
    y += 5;

    // Rol • mamlakat • yillar — 8pt muted
    const roleLine = [
      roleLabel(sci.role),
      sci.country ? normalizeUzText(sci.country) : null,
      sci.birthYear
        ? `${sci.birthYear}${sci.deathYear ? `-${sci.deathYear}` : '–'}`
        : null,
    ]
      .filter(Boolean)
      .join(' • ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizeUzText(roleLine), marginLeft, y);
    y += 5;

    // Bio (qisqartirilgan) — 8pt
    if (sci.bioMd) {
      const bioText = normalizeUzText(stripMarkdown(sci.bioMd));
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const bioLines = doc.splitTextToSize(bioText, contentWidth);
      const maxLines = 3;
      for (let i = 0; i < Math.min(bioLines.length, maxLines); i++) {
        ctx = checkNewPage({ ...ctx, y }, 4);
        y = ctx.y;
        doc.text(bioLines[i] as string, marginLeft, y);
        y += 4;
      }
    }
    y += 4;
  }

  return { ...ctx, y };
}

/** Tadqiqotlar seksiyasi */
function renderResearch(ctx: RenderCtx, research: DiseaseResearch[]): RenderCtx {
  if (!research.length) return ctx;

  ctx = renderMetaSectionHeader(ctx, "Ilmiy tadqiqotlar");
  const { doc, marginLeft, contentWidth } = ctx;
  let { y } = ctx;

  for (const res of research) {
    ctx = checkNewPage({ ...ctx, y }, 22);
    y = ctx.y;

    // Sarlavha — bold 9pt (word-wrap)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(normalizeUzText(res.title), contentWidth);
    const maxTitleLines = 2;
    for (let i = 0; i < Math.min(titleLines.length, maxTitleLines); i++) {
      ctx = checkNewPage({ ...ctx, y }, 4);
      y = ctx.y;
      doc.text(titleLines[i] as string, marginLeft, y);
      y += 4.5;
    }

    // Mualliflar • jurnal • yil • tур
    const metaLine = [
      normalizeUzText(res.authors),
      res.journal ? normalizeUzText(res.journal) : null,
      `${res.year}`,
      res.type,
      `Dalil: ${res.evidenceLevel}`,
      res.isLandmark ? 'Landmark' : null,
    ]
      .filter(Boolean)
      .join(' • ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const metaLines = doc.splitTextToSize(normalizeUzText(metaLine), contentWidth);
    for (let i = 0; i < Math.min(metaLines.length, 2); i++) {
      ctx = checkNewPage({ ...ctx, y }, 4);
      y = ctx.y;
      doc.text(metaLines[i] as string, marginLeft, y);
      y += 4;
    }

    // Xulosa matni — qisqartirilgan
    const summaryText = normalizeUzText(stripMarkdown(res.summaryMd));
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
    for (let i = 0; i < Math.min(summaryLines.length, 3); i++) {
      ctx = checkNewPage({ ...ctx, y }, 4);
      y = ctx.y;
      doc.text(summaryLines[i] as string, marginLeft, y);
      y += 4;
    }

    // DOI (agar mavjud)
    if (res.doi) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(99, 102, 241);
      const doiStr = `DOI: ${res.doi}`;
      const doiLines = doc.splitTextToSize(doiStr, contentWidth);
      ctx = checkNewPage({ ...ctx, y }, 4);
      y = ctx.y;
      doc.text(doiLines[0] as string, marginLeft, y);
      y += 4;
    }

    y += 4;
  }

  return { ...ctx, y };
}

/** Genetika seksiyasi */
function renderGenetics(ctx: RenderCtx, genetics: DiseaseGenetic[]): RenderCtx {
  if (!genetics.length) return ctx;

  ctx = renderMetaSectionHeader(ctx, "Genetika va populyatsiya");
  const { doc, marginLeft, contentWidth } = ctx;
  let { y } = ctx;

  for (const gen of genetics) {
    ctx = checkNewPage({ ...ctx, y }, 16);
    y = ctx.y;

    // Gen simvoli + variant turi
    const geneTitle = [
      gen.geneSymbol ? normalizeUzText(gen.geneSymbol) : null,
      gen.variantType ? normalizeUzText(gen.variantType) : null,
    ]
      .filter(Boolean)
      .join(' — ');

    if (geneTitle) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(geneTitle, marginLeft, y);
      y += 5;
    }

    // Irsiyat + penetrans
    const detailLine = [
      gen.inheritancePattern ? inheritanceLabel(gen.inheritancePattern) : null,
      gen.penetrance !== null ? `Penetrans: ${penetrancePercent(gen.penetrance)}` : null,
    ]
      .filter(Boolean)
      .join(' • ');

    if (detailLine) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(normalizeUzText(detailLine), marginLeft, y);
      y += 5;
    }

    // Populyatsiya eslatmasi
    if (gen.populationNoteMd) {
      const noteText = normalizeUzText(stripMarkdown(gen.populationNoteMd));
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(noteText, contentWidth);
      for (let i = 0; i < Math.min(noteLines.length, 3); i++) {
        ctx = checkNewPage({ ...ctx, y }, 4);
        y = ctx.y;
        doc.text(noteLines[i] as string, marginLeft, y);
        y += 4;
      }
    }

    y += 4;
  }

  return { ...ctx, y };
}

export async function exportDiseaseToPdf(
  disease: DiseaseDetail,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    includeBlocks,
    includeDisclaimer = true,
    scientists = [],
    research = [],
    genetics = [],
  } = options;

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

  // ─── METADATA SEKSIYALARI ─────────────────────────────────────────────────────
  const hasMetadata = scientists.length > 0 || research.length > 0 || genetics.length > 0;

  if (hasMetadata) {
    // Asosiy bloklar va metadata orasida kichik bo'shliq
    y += 4;

    let ctx: RenderCtx = {
      doc,
      marginLeft,
      contentWidth,
      pageHeight,
      maxY,
      y,
    };

    ctx = renderScientists(ctx, scientists);
    ctx = renderResearch(ctx, research);
    ctx = renderGenetics(ctx, genetics);

    y = ctx.y;
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
