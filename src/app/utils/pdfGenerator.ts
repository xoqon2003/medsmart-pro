import type { Application, Conclusion, Payment } from '../types';

// ---- Helpers ----
function safeText(str: string | undefined | null): string {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDateStr(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatPriceStr(p: number): string {
  return new Intl.NumberFormat('uz-UZ').format(p) + " so'm";
}

function getConclusionColor(type: string): { bg: string; border: string; label: string; icon: string } {
  const map: Record<string, { bg: string; border: string; label: string; icon: string }> = {
    ai_analysis:  { bg: '#f5f3ff', border: '#7c3aed', label: 'AI Tahlil',             icon: '🤖' },
    radiolog:     { bg: '#ecfdf5', border: '#059669', label: 'Radiolog xulosasi',      icon: '🩻' },
    specialist:   { bg: '#faf5ff', border: '#9333ea', label: 'Mutaxassis xulosasi',    icon: '🔬' },
    doctor:       { bg: '#eff6ff', border: '#2563eb', label: 'Shifokor xulosasi',      icon: '👨‍⚕️' },
  };
  return map[type] || { bg: '#f9fafb', border: '#9ca3af', label: type, icon: '📄' };
}

function buildConclusionHtml(c: Conclusion): string {
  const col = getConclusionColor(c.conclusionType);
  const aiBar = c.aiAnalysis
    ? `<div class="ai-bar">
        <div class="ai-bar-track"><div class="ai-bar-fill" style="width:${c.aiAnalysis.confidence}%;"></div></div>
        <span class="ai-conf">${c.aiAnalysis.confidence}% ishonch</span>
      </div>
      <div class="anomaly-list">
        ${c.aiAnalysis.anomalies.map(a => `<div class="anomaly-item">⚠️ ${safeText(a)}</div>`).join('')}
      </div>
      <div class="ai-note">ℹ️ ${safeText(c.aiAnalysis.notes)}</div>`
    : '';

  return `
    <div class="conclusion-card" style="border-left:4px solid ${col.border};background:${col.bg};">
      <div class="c-header">
        <span class="c-badge" style="border-color:${col.border};color:${col.border};">${col.icon} ${col.label}</span>
        <span class="c-date">${formatDateStr(c.signedAt)}</span>
      </div>
      <div class="c-author">👤 ${safeText(c.authorName || "Noma'lum")}</div>
      ${aiBar}
      <table class="c-table">
        <tr><th>Tasvir tavsifi</th><td>${safeText(c.description)}</td></tr>
        <tr><th>Topilmalar</th><td>${safeText(c.findings)}</td></tr>
        <tr><th>Xulosa</th><td>${safeText(c.impression)}</td></tr>
        ${c.recommendations ? `<tr><th>Tavsiyalar</th><td>${safeText(c.recommendations)}</td></tr>` : ''}
      </table>
    </div>`;
}

function buildReportHtml(app: Application, conclusions: Conclusion[], title = 'RADIOLOGIK XULOSA HISOBOTI'): string {
  const patient = app.patient;
  const anamnez = app.anamnez;

  const serviceMap: Record<string, string> = {
    ai_radiolog: 'AI + Radiolog',
    radiolog_only: 'Faqat Radiolog',
    radiolog_specialist: 'Radiolog + Mutaxassis',
  };
  const urgencyMap: Record<string, string> = {
    normal: 'Oddiy (48-72 soat)',
    urgent: 'Tezkor (24 soat)',
    emergency: 'SHOSHILINCH (4-12 soat)',
  };

  const conclusionsHtml = conclusions.map(buildConclusionHtml).join('');

  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeText(app.arizaNumber)} — RadConsult Xulosa</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111827; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 32px 40px; }

  /* ---- Header ---- */
  .report-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #1d4ed8; margin-bottom: 20px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #1d4ed8, #0369a1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; }
  .brand-name { font-size: 20px; font-weight: 700; color: #1d4ed8; }
  .brand-sub  { font-size: 11px; color: #6b7280; }
  .report-meta { text-align: right; }
  .report-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 2px; }
  .report-id   { font-size: 13px; color: #2563eb; font-weight: 600; }
  .report-date { font-size: 11px; color: #6b7280; }

  /* ---- Sections ---- */
  .section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; }
  .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .info-item .label { font-size: 10px; color: #9ca3af; margin-bottom: 2px; }
  .info-item .value { font-size: 13px; color: #111827; font-weight: 500; }
  .emergency-badge { display: inline-block; background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; margin-top: 6px; }
  .patient-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .patient-sub  { font-size: 12px; color: #6b7280; }

  /* ---- Conclusions ---- */
  .conclusions-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 12px; }
  .conclusion-card { border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid; }
  .c-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .c-badge  { font-size: 11px; font-weight: 600; border: 1px solid; border-radius: 20px; padding: 2px 8px; background: rgba(255,255,255,.7); }
  .c-date   { font-size: 10px; color: #6b7280; }
  .c-author { font-size: 11px; color: #374151; margin-bottom: 8px; }
  .ai-bar   { margin-bottom: 8px; }
  .ai-bar-track { background: #ede9fe; border-radius: 4px; height: 6px; margin-bottom: 4px; }
  .ai-bar-fill  { background: #7c3aed; border-radius: 4px; height: 100%; }
  .ai-conf  { font-size: 10px; color: #7c3aed; font-weight: 600; }
  .anomaly-list { margin-bottom: 6px; }
  .anomaly-item { font-size: 11px; color: #374151; margin-bottom: 2px; padding-left: 4px; }
  .ai-note  { font-size: 10px; color: #9ca3af; font-style: italic; margin-bottom: 8px; }
  .c-table  { width: 100%; border-collapse: collapse; font-size: 12px; }
  .c-table th { width: 130px; text-align: left; color: #6b7280; padding: 3px 0; font-weight: 500; vertical-align: top; }
  .c-table td { color: #111827; padding: 3px 0 3px 8px; border-left: 2px solid rgba(0,0,0,.08); line-height: 1.5; }

  /* ---- Payment ---- */
  .payment-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .payment-row .label { color: #6b7280; }
  .payment-row .value { color: #111827; font-weight: 500; }
  .paid-badge { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; }

  /* ---- Disclaimer ---- */
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px; margin-top: 16px; font-size: 11px; color: #92400e; line-height: 1.6; }
  .disclaimer strong { color: #78350f; }

  /* ---- Footer ---- */
  .report-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-left { font-size: 10px; color: #9ca3af; }
  .footer-right { font-size: 10px; color: #9ca3af; text-align: right; }
  .qr-placeholder { width: 50px; height: 50px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #9ca3af; text-align: center; }

  /* ---- Print ---- */
  @media print {
    body { font-size: 11px; }
    .page { padding: 16px 20px; }
    .no-print { display: none !important; }
    .conclusion-card { page-break-inside: avoid; }
  }
  .print-btn {
    position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: #fff; border: none;
    border-radius: 12px; padding: 10px 20px; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2);
    display: flex; align-items: center; gap: 8px;
  }
  .print-btn:hover { background: #1d4ed8; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="report-header">
    <div class="brand">
      <div class="brand-icon">🩻</div>
      <div>
        <div class="brand-name">RadConsult</div>
        <div class="brand-sub">Masofaviy Radiologik Konsultatsiya</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">${safeText(title)}</div>
      <div class="report-id">${safeText(app.arizaNumber)}</div>
      <div class="report-date">Sana: ${formatDateStr(new Date().toISOString())}</div>
    </div>
  </div>

  <!-- Patient Info -->
  <div class="section">
    <div class="section-title">Bemor ma'lumotlari</div>
    ${patient ? `
      <div class="patient-name">${safeText(patient.fullName)}</div>
      <div class="patient-sub">
        ${patient.gender === 'male' ? 'Erkak' : 'Ayol'} •
        ${patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : '—'} yosh •
        ${safeText(patient.city)}
      </div>
      <div class="patient-sub">${safeText(patient.phone)}</div>
    ` : '<div>—</div>'}
    ${patient?.chronicDiseases ? `<div style="margin-top:6px;color:#dc2626;font-size:11px;">⚠️ Surunkali kasalliklar: ${safeText(patient.chronicDiseases)}</div>` : ''}
  </div>

  <!-- Scan Info -->
  <div class="section">
    <div class="section-title">Tekshiruv ma'lumotlari</div>
    <div class="info-grid">
      <div class="info-item"><div class="label">Tasvir turi</div><div class="value">${safeText(app.scanType)}</div></div>
      <div class="info-item"><div class="label">Organ / Soha</div><div class="value">${safeText(app.organ)}</div></div>
      <div class="info-item"><div class="label">Tekshiruv sanasi</div><div class="value">${safeText(app.scanDate)}</div></div>
      <div class="info-item"><div class="label">Xizmat turi</div><div class="value">${safeText(serviceMap[app.serviceType] || app.serviceType)}</div></div>
      <div class="info-item"><div class="label">Muhimlik darajasi</div><div class="value">${safeText(urgencyMap[app.urgency] || app.urgency)}</div></div>
      ${app.scanFacility ? `<div class="info-item"><div class="label">Tashkilot</div><div class="value">${safeText(app.scanFacility)}</div></div>` : ''}
    </div>
    ${app.urgency === 'emergency' ? '<div class="emergency-badge">🔴 SHOSHILINCH ARIZA</div>' : ''}
  </div>

  <!-- Anamnez -->
  ${anamnez ? `
  <div class="section">
    <div class="section-title">Shikoyat va anamnez</div>
    <div class="info-grid">
      <div class="info-item" style="grid-column:1/-1"><div class="label">Asosiy shikoyat</div><div class="value">${safeText(anamnez.complaint)}</div></div>
      <div class="info-item"><div class="label">Davomiyligi</div><div class="value">${safeText(anamnez.duration)}</div></div>
      ${anamnez.hasPain ? `<div class="info-item"><div class="label">Og'riq darajasi</div><div class="value">${anamnez.painLevel}/10</div></div>` : ''}
      ${anamnez.medications ? `<div class="info-item"><div class="label">Dorilar</div><div class="value">${safeText(anamnez.medications)}</div></div>` : ''}
      ${anamnez.allergies ? `<div class="info-item"><div class="label">Allergiyalar</div><div class="value" style="color:#dc2626;">${safeText(anamnez.allergies)}</div></div>` : ''}
      ${anamnez.additionalInfo ? `<div class="info-item" style="grid-column:1/-1"><div class="label">Qo'shimcha</div><div class="value">${safeText(anamnez.additionalInfo)}</div></div>` : ''}
    </div>
  </div>` : ''}

  <!-- Conclusions -->
  <div class="conclusions-title">Xulosalar (${conclusions.length} ta)</div>
  ${conclusionsHtml}

  <!-- Payment -->
  ${app.payment ? `
  <div class="section">
    <div class="section-title">To'lov ma'lumotlari</div>
    <div class="payment-row"><span class="label">Summa</span><span class="value">${formatPriceStr(app.payment.amount)}</span></div>
    <div class="payment-row"><span class="label">To'lov tizimi</span><span class="value">${(app.payment.provider || '').toUpperCase()}</span></div>
    ${app.payment.providerTransactionId ? `<div class="payment-row"><span class="label">Tranzaksiya ID</span><span class="value">${safeText(app.payment.providerTransactionId)}</span></div>` : ''}
    <div class="payment-row"><span class="label">Holat</span><span class="value"><span class="paid-badge">${app.payment.status === 'paid' ? '✅ To\'langan' : app.payment.status}</span></span></div>
    ${app.payment.paidAt ? `<div class="payment-row"><span class="label">To'lov sanasi</span><span class="value">${formatDateStr(app.payment.paidAt)}</span></div>` : ''}
  </div>` : ''}

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠️ Muhim eslatma:</strong> Ushbu hujjat faqat maslahatlashuv maqsadida tayyorlangan. 
    Radiologik xulosalar klinik ko'rikni va shifokor maslahatiни almashtirmaydi. 
    Davolash va tibbiy qarorlar uchun mutaxassis shifokorga murojaat qiling. 
    Xulosalar RadConsult platformasi orqali ${formatDateStr(new Date().toISOString())} sanasida rasmiylashtirilgan.
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <div class="footer-left">
      <div style="font-weight:600;color:#374151;">RadConsult Platform</div>
      <div>${safeText(app.arizaNumber)} • ${formatDateStr(new Date().toISOString())}</div>
      ${app.radiolog ? `<div>Radiolog: ${safeText(app.radiolog.fullName)} • ${safeText(app.radiolog.license)}</div>` : ''}
    </div>
    <div class="footer-right">
      <div class="qr-placeholder">QR<br/>Tekshirish</div>
      <div style="margin-top:4px;">Autentik hujjat</div>
    </div>
  </div>

</div>

<button class="print-btn no-print" onclick="window.print()">
  🖨️ PDF sifatida saqlash
</button>

</body>
</html>`;
}

// ---- Public API ----

/**
 * Download conclusion(s) as a formatted HTML report file.
 * The file can be opened in browser and printed/saved as PDF.
 */
export function downloadConclusionReport(
  app: Application,
  conclusions?: Conclusion[],
  fileName?: string
): void {
  const cons = conclusions ?? (app.conclusions || []);
  const html = buildReportHtml(app, cons);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName ?? `${app.arizaNumber}-xulosa.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Download a single conclusion as HTML.
 */
export function downloadSingleConclusion(app: Application, conclusion: Conclusion): void {
  const typeMap: Record<string, string> = {
    ai_analysis: 'AI-Tahlil',
    radiolog: 'Radiolog-Xulosasi',
    specialist: 'Mutaxassis-Xulosasi',
    doctor: 'Shifokor-Xulosasi',
  };
  const html = buildReportHtml(
    app,
    [conclusion],
    `${typeMap[conclusion.conclusionType] || 'Xulosa'} — ${conclusion.authorName || ''}`
  );
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${app.arizaNumber}-${typeMap[conclusion.conclusionType] || 'xulosa'}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Open the conclusion report in a new tab for printing.
 */
export function printConclusionReport(app: Application, conclusions?: Conclusion[]): void {
  const cons = conclusions ?? (app.conclusions || []);
  const html = buildReportHtml(app, cons);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }
}

/**
 * Generate a simple text summary for clipboard/share.
 */
export function generateTextSummary(app: Application, conclusions?: Conclusion[]): string {
  const cons = conclusions ?? (app.conclusions || []);
  const lines: string[] = [
    `RadConsult — ${app.arizaNumber}`,
    `Bemor: ${app.patient?.fullName || '—'}`,
    `Tasvir: ${app.scanType} • ${app.organ} • ${app.scanDate}`,
    `Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
    '',
    '=== XULOSALAR ===',
  ];
  cons.forEach((c, i) => {
    const label = { ai_analysis: 'AI Tahlil', radiolog: 'Radiolog', specialist: 'Mutaxassis', doctor: 'Shifokor' }[c.conclusionType] || c.conclusionType;
    lines.push(`\n[${i + 1}] ${label} — ${c.authorName || 'Noma\'lum'}`);
    lines.push(`Topilmalar: ${c.findings}`);
    lines.push(`Xulosa: ${c.impression}`);
    if (c.recommendations) lines.push(`Tavsiyalar: ${c.recommendations}`);
  });
  lines.push('\n⚠️ Bu xulosa klinik ко\'rikni almashтirmaydi. RadConsult platform.');
  return lines.join('\n');
}

/**
 * Copy text summary to clipboard and share via Web Share API if available.
 */
export async function shareConclusion(app: Application, conclusions?: Conclusion[]): Promise<'shared' | 'copied' | 'error'> {
  const cons = conclusions ?? (app.conclusions || []);
  const text = generateTextSummary(app, cons);
  try {
    if (navigator.share) {
      await navigator.share({
        title: `RadConsult — ${app.arizaNumber}`,
        text: text,
      });
      return 'shared';
    } else {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    return 'error';
  }
}

// ---- Payment Receipt ----

const PROVIDER_NAMES: Record<string, string> = {
  personal_card: 'Shaxsiy karta',
  payme: 'Payme',
  click: 'Click',
  uzcard: 'Uzcard',
  humo: 'Humo',
  uzum: 'Uzum Bank',
  cash: 'Naqd pul',
};

function buildReceiptHtml(payment: Payment, arizaNumber: string, patientName?: string): string {
  const providerName = PROVIDER_NAMES[payment.provider] || payment.provider;
  const chekNumber = `CHK-${arizaNumber.replace(/^[A-Z]+-/, '')}`;

  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeText(arizaNumber)} — To'lov cheki</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111827; background: #f9fafb; }
  .receipt { max-width: 420px; margin: 32px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.08); overflow: hidden; }

  .receipt-header { background: linear-gradient(135deg, #1d4ed8, #0369a1); padding: 24px 24px 20px; text-align: center; color: #fff; }
  .receipt-logo { font-size: 24px; margin-bottom: 4px; }
  .receipt-brand { font-size: 18px; font-weight: 700; }
  .receipt-sub { font-size: 11px; opacity: .8; margin-top: 2px; }

  .receipt-status { text-align: center; padding: 20px 24px 16px; }
  .status-icon { font-size: 48px; margin-bottom: 8px; }
  .status-text { font-size: 16px; font-weight: 700; color: #16a34a; }

  .receipt-body { padding: 0 24px 20px; }
  .receipt-divider { border: none; border-top: 2px dashed #e5e7eb; margin: 16px 0; }
  .receipt-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; }
  .receipt-row .label { color: #6b7280; font-size: 12px; }
  .receipt-row .value { color: #111827; font-size: 13px; font-weight: 500; text-align: right; max-width: 60%; }
  .receipt-total { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin: 12px 0; }
  .receipt-total .label { font-size: 13px; color: #374151; font-weight: 600; }
  .receipt-total .value { font-size: 20px; color: #16a34a; font-weight: 700; }

  .receipt-footer { background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
  .receipt-footer p { font-size: 10px; color: #9ca3af; line-height: 1.6; }
  .receipt-qr { width: 60px; height: 60px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; margin: 8px auto; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #9ca3af; }

  @media print {
    body { background: #fff; }
    .receipt { box-shadow: none; margin: 0 auto; }
    .no-print { display: none !important; }
  }
  .print-btn {
    position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: #fff; border: none;
    border-radius: 12px; padding: 10px 20px; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2);
    display: flex; align-items: center; gap: 8px;
  }
  .print-btn:hover { background: #1d4ed8; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="receipt-header">
    <div class="receipt-logo">🏥</div>
    <div class="receipt-brand">MedSmartPro</div>
    <div class="receipt-sub">Tibbiy xizmatlar platformasi</div>
  </div>

  <div class="receipt-status">
    <div class="status-icon">✅</div>
    <div class="status-text">To'lov tasdiqlandi</div>
  </div>

  <div class="receipt-body">
    <hr class="receipt-divider" />
    <div class="receipt-row"><span class="label">Chek raqami</span><span class="value">${safeText(chekNumber)}</span></div>
    <div class="receipt-row"><span class="label">Ariza raqami</span><span class="value" style="color:#2563eb;">${safeText(arizaNumber)}</span></div>
    ${patientName ? `<div class="receipt-row"><span class="label">Bemor</span><span class="value">${safeText(patientName)}</span></div>` : ''}
    <div class="receipt-row"><span class="label">To'lov sanasi</span><span class="value">${payment.paidAt ? formatDateStr(payment.paidAt) : formatDateStr(payment.createdAt)}</span></div>
    <div class="receipt-row"><span class="label">To'lov usuli</span><span class="value">${safeText(providerName)}</span></div>
    ${payment.providerTransactionId ? `<div class="receipt-row"><span class="label">Tranzaksiya ID</span><span class="value" style="font-family:monospace;font-size:11px;">${safeText(payment.providerTransactionId)}</span></div>` : ''}
    <hr class="receipt-divider" />
    <div class="receipt-total">
      <div class="receipt-row" style="padding:0;">
        <span class="label">Jami to'langan</span>
        <span class="value">${formatPriceStr(payment.amount)}</span>
      </div>
    </div>
  </div>

  <div class="receipt-footer">
    <div class="receipt-qr">QR<br/>Tekshirish</div>
    <p>Ushbu chek MedSmartPro platformasi tomonidan avtomatik yaratilgan.<br/>
    ${formatDateStr(new Date().toISOString())} • ${safeText(arizaNumber)}</p>
  </div>
</div>

<button class="print-btn no-print" onclick="window.print()">
  🖨️ Chop etish / PDF saqlash
</button>
</body>
</html>`;
}

/**
 * Download payment receipt as HTML file.
 */
export function downloadPaymentReceipt(
  payment: Payment,
  arizaNumber: string,
  patientName?: string,
): void {
  const html = buildReceiptHtml(payment, arizaNumber, patientName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${arizaNumber}-tolov-cheki.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Open payment receipt in new tab for printing.
 */
export function printPaymentReceipt(
  payment: Payment,
  arizaNumber: string,
  patientName?: string,
): void {
  const html = buildReceiptHtml(payment, arizaNumber, patientName);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }
}
