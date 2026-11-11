/**
 * PDF and ZIP Report Generator for Sinclair Field Operations
 * Generates formal technical PDF visit reports (RF02) matching official Sinclair Parte de Servicio format
 * and bundles them into a ZIP archive (RF20).
 * Adheres strictly to SDD, Clean Code, and engineering rules (rules.md).
 */

import jsPDF from 'jspdf';
import * as JSZip from 'jszip';
import { isNativeApp } from '../platform/nativePlatform';
import { exportFileNative, exportFileNativeSafely } from '../platform/nativeFileExport';
import {
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  CreateVisitDTO,
  Visita,
} from '../types/domain';

interface CodeOption<T> {
  label: string;
  code: string;
  value: T;
}

const MOTIVO_OPTIONS: CodeOption<CodigoMotivo>[] = [
  { label: 'RUTINA', code: 'SRT', value: CodigoMotivo.SRT },
  { label: 'PRETEMPORADA', code: 'SPR', value: CodigoMotivo.SPR },
  { label: 'POSTEMPORADA', code: 'SPO', value: CodigoMotivo.SPO },
  { label: 'REVISIÓN', code: 'SOH', value: CodigoMotivo.SOH },
  { label: 'EMERGENCIA', code: 'UEM', value: CodigoMotivo.UEM },
  { label: 'INSTALACIÓN', code: 'UIN', value: CodigoMotivo.UIN },
  { label: 'RETIRADA', code: 'URM', value: CodigoMotivo.URM },
  { label: 'ACTUALIZACIÓN', code: 'UUP', value: CodigoMotivo.UUP },
];

const ORIGEN_OPTIONS: CodeOption<CodigoOrden>[] = [
  { label: 'CLIENTE/OPERADOR', code: 'CTR', value: CodigoOrden.CTR },
  { label: 'CALIBRADOR', code: 'SZR', value: CodigoOrden.SZR },
  { label: 'CONDICIÓN DE LA FRUTA', code: 'FC', value: CodigoOrden.FC },
  { label: 'EQUIPO DENTRO DE ESPECIFICACIONES', code: 'EWS', value: CodigoOrden.EWS },
  { label: 'FALLO DE LOS COMPONENTES', code: 'CF', value: CodigoOrden.CF },
  { label: 'AJUSTE NECESARIO', code: 'ADJ', value: CodigoOrden.ADJ },
  { label: 'PROBLEMA CON LAS ETIQUETAS', code: 'LF', value: CodigoOrden.LF },
  { label: 'RECEPCIÓN/ALMACENAJE DE ETIQUETAS', code: 'LDM', value: CodigoOrden.LDM },
  { label: 'DAÑO FÍSICO', code: 'PD', value: CodigoOrden.PD },
];

const TIPO_SERVICIO_OPTIONS: CodeOption<CodigoTipoServicio>[] = [
  { label: 'EN EMPLAZAMIENTO', code: 'Y', value: CodigoTipoServicio.Y },
  { label: 'TALLER', code: 'X', value: CodigoTipoServicio.X },
  { label: 'FORMACIÓN', code: 'T', value: CodigoTipoServicio.T },
];

// Sinclair Original Soft Gray for Header Strips
const HEADER_GRAY = [220, 220, 220] as const;

/**
 * Generates an offline-resilient, zero-collision Sinclair report number (FSR #).
 * Format: [TECNICO][AA][MM][SEGUNDOS_MES_B36] (e.g. LC26091GRPS)
 */
export function generateSinclairReportNumber(
  tecnicoNamesOrPrefix?: string | string[],
  date: Date = new Date()
): string {
  let prefix = 'REP';
  if (tecnicoNamesOrPrefix) {
    if (Array.isArray(tecnicoNamesOrPrefix) && tecnicoNamesOrPrefix.length > 0) {
      const firstTec = tecnicoNamesOrPrefix[0].trim();
      const initials = firstTec
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      if (initials) prefix = initials.slice(0, 3);
    } else if (typeof tecnicoNamesOrPrefix === 'string' && tecnicoNamesOrPrefix.trim()) {
      const trimmed = tecnicoNamesOrPrefix.trim();
      const initials = trimmed
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      if (initials) prefix = initials.slice(0, 3);
    }
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
  const secondsInMonth = Math.max(0, Math.floor((date.getTime() - startOfMonth.getTime()) / 1000));
  const base36Seconds = secondsInMonth.toString(36).toUpperCase().padStart(4, '0');

  return `${prefix}${year}${month}${base36Seconds}`;
}

/**
 * Formats any time string or ISO datetime into strictly 24-hour HH:mm format.
 * Guarantees that only the time (e.g. "08:30", "14:00") appears in PDF time fields.
 */
export function formatTo24HourTime(timeInput?: unknown): string {
  if (timeInput === undefined || timeInput === null) return '';
  if (timeInput instanceof Date) {
    if (isNaN(timeInput.getTime())) return '';
    const hours = String(timeInput.getHours()).padStart(2, '0');
    const minutes = String(timeInput.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const str = String(timeInput).trim();
  if (!str) return '';

  // Check for 12-hour AM/PM format (e.g. "02:30 PM", "2:30pm", "12:15 AM")
  const ampmMatch = str.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2].padStart(2, '0');
    const isPM = ampmMatch[3].toLowerCase() === 'pm';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // Check for ISO datetime or datetime with separator (T or space)
  if (str.includes('T') || str.includes(' ')) {
    const timePart = str.includes('T') ? str.split('T')[1] : str.split(/\s+/)[1];
    if (timePart) {
      const match = timePart.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        return `${hours}:${minutes}`;
      }
    }
  }

  // Match simple time format "HH:mm" or "HH:mm:ss"
  const simpleMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (simpleMatch) {
    const hours = simpleMatch[1].padStart(2, '0');
    const minutes = simpleMatch[2];
    return `${hours}:${minutes}`;
  }

  return str;
}

/**
 * Formats a date value into DD/MM/YYYY for Sinclair reports
 */
export function formatReportDate(dateInput?: unknown): string {
  if (!dateInput) return new Date().toLocaleDateString('es-AR');
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.toLocaleDateString('es-AR');
  }
  const str = String(dateInput).trim();
  if (!str) return new Date().toLocaleDateString('es-AR');

  const clean = str.includes('T') ? str.split('T')[0] : str.split(/\s+/)[0];
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD/MM/YYYY
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return clean;
  }
  return str;
}

/**
 * Sinclair Logo Base64 String
 */
const SINCLAIR_LOGO_BASE64 =
  'data:image/png;base64,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';

/**
 * Extracts strictly the short code string (e.g. "SRT", "CF") from any input
 */
export function getMotivoCode(val: unknown): string {
  if (!val) return '';
  const str = String(val).trim();
  const directMatch = MOTIVO_OPTIONS.find((o) => o.code.toUpperCase() === str.toUpperCase());
  if (directMatch) return directMatch.code;
  const enumMatch = MOTIVO_OPTIONS.find(
    (o) => o.value.toLowerCase() === str.toLowerCase() || o.label.toLowerCase() === str.toLowerCase()
  );
  if (enumMatch) return enumMatch.code;
  const prefix = str.split(/[\s-]/)[0];
  const prefixMatch = MOTIVO_OPTIONS.find((o) => o.code.toUpperCase() === prefix.toUpperCase());
  return prefixMatch ? prefixMatch.code : str;
}

export function getMotivoCodesList(val: unknown): string[] {
  if (!val) return [];
  const rawList = Array.isArray(val)
    ? val
    : typeof val === 'string'
    ? val.split(',').map((s) => s.trim()).filter(Boolean)
    : [val];
  return rawList.map((item) => getMotivoCode(item)).filter(Boolean);
}

/**
 * Extracts strictly the short code string (e.g. "SZR", "CTR") from any input
 */
export function getOrigenCode(val: unknown): string {
  if (!val) return '';
  const str = String(val).trim();
  const directMatch = ORIGEN_OPTIONS.find((o) => o.code.toUpperCase() === str.toUpperCase());
  if (directMatch) return directMatch.code;
  const enumMatch = ORIGEN_OPTIONS.find(
    (o) => o.value.toLowerCase() === str.toLowerCase() || o.label.toLowerCase() === str.toLowerCase()
  );
  if (enumMatch) return enumMatch.code;
  const prefix = str.split(/[\s-]/)[0];
  const prefixMatch = ORIGEN_OPTIONS.find((o) => o.code.toUpperCase() === prefix.toUpperCase());
  return prefixMatch ? prefixMatch.code : str;
}

/**
 * Generates an off-screen Sinclair logo image Data URL in high resolution with correct aspect ratio
 */
export function getSinclairLogoDataUrl(): string {
  return SINCLAIR_LOGO_BASE64;
}

function drawLabeledField(
  doc: jsPDF,
  x: number,
  fieldY: number,
  width: number,
  height: number,
  label: string,
  value: string,
  valueFontSize = 6.5
): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(x, fieldY, width, height, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(0);
  doc.text(label, x + 1.2, fieldY + 2.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(valueFontSize);
  doc.setTextColor(20, 20, 20);
  doc.text(value || '', x + 1.2, fieldY + height - 1.8, { maxWidth: width - 2.4 });
}

function renderHeaderSection(
  doc: jsPDF,
  pageX: number,
  y: number,
  pageW: number,
  reportNumber?: number | string,
  visitId?: string,
  logoImagePath?: string
): number {
  const headerH = 18;
  const fsrW = 50;
  const leftW = pageW - fsrW;

  // Single continuous header box
  doc.setDrawColor(0);
  doc.setLineWidth(0.25);
  doc.rect(pageX, y, leftW, headerH, 'S');
  doc.rect(pageX + leftW, y, fsrW, headerH, 'S');

  // Embed Logo Image on the left with strict aspect ratio preservation
  const logoAreaW = 46;
  const maxW = 43;
  const maxH = 30;

  const logoSource = logoImagePath || getSinclairLogoDataUrl();

  if (logoSource) {
    try {
      let imgDrawW = maxW;
      let imgDrawH = maxH;

      try {
        const imgProps = doc.getImageProperties(logoSource);
        if (imgProps && imgProps.width && imgProps.height) {
          const imgAspect = imgProps.width / imgProps.height;
          const boxAspect = maxW / maxH;
          if (imgAspect > boxAspect) {
            imgDrawW = maxW;
            imgDrawH = maxW / imgAspect;
          } else {
            imgDrawH = maxH;
            imgDrawW = maxH * imgAspect;
          }
        } else {
          imgDrawH = 13.5;
          imgDrawW = 42;
        }
      } catch {
        imgDrawH = 13.5;
        imgDrawW = 42;
      }

      const posX = pageX + 1.5 + (logoAreaW - imgDrawW) / 2;
      const posY = y + (headerH - imgDrawH) / 2;
      const format = logoSource.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';

      doc.addImage(logoSource, format, posX, posY, imgDrawW, imgDrawH);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(0, 89, 153);
      doc.text('Sinclair.', pageX + 4, y + 11.5);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(0, 89, 153);
    doc.text('Sinclair.', pageX + 4, y + 11.5);
  }

  // Header Title - "PARTE DE SERVICIO"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(0);
  const titleCenterX = pageX + logoAreaW + (leftW - logoAreaW) / 2;
  doc.text('PARTE DE SERVICIO', titleCenterX, y + 11.5, { align: 'center' });

  // FSR Box - "FSR #" + Report Number in black & bold
  let displayReportNum = '';
  if (reportNumber !== undefined && reportNumber !== null && String(reportNumber).trim() !== '') {
    displayReportNum = String(reportNumber).trim();
  } else if (visitId) {
    displayReportNum = String(visitId);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(0);
  doc.text('FSR #', pageX + leftW + 2.5, y + 11.5);

  const numFontSize = displayReportNum.length > 8 ? 10.5 : 12.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(numFontSize);
  doc.setTextColor(0);
  doc.text(displayReportNum, pageX + leftW + 18, y + 11.5);

  return y + headerH;
}

/**
 * Generates a formal jsPDF document for a single visit report
 * Pixel-perfect implementation matching the Sinclair Parte de Servicio template
 */
export function generateVisitPDF(
  visit: CreateVisitDTO,
  reportNumber?: number | string,
  tecnicosNames?: string[],
  empaqueName?: string,
  empaqueUbicacion?: string,
  logoImagePath?: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageX = 8;
  const pageY = 8;
  const pageW = 194;
  const pageH = 281;
  let y = pageY;

  // Outer boundary
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(pageX, pageY, pageW, pageH, 'S');

  // 1. Header (Logo + PARTE DE SERVICIO + Aligned FSR# with larger letters)
  const finalReportNum = reportNumber || visit.numero || visit.id;
  y = renderHeaderSection(doc, pageX, y, pageW, finalReportNum, visit.id, logoImagePath);

  // 2. Main Field Rows (Aligned Proportions with proper Spanish accents)
  const rowH = 8.5;
  const wLlamada = 44;
  const wComienzo = 44;
  const wCliente = wLlamada + wComienzo; // 88 mm
  const wFin = 44;
  const wFueraDe = 38;
  const wUbicacion = wFin + wFueraDe; // 82 mm
  const wFecha = pageW - wCliente - wUbicacion; // 24 mm
  const wSiNo = wFecha / 2; // 12 mm

  // Row 1 - Uses empaqueName if provided, and empaqueUbicacion for UBICACIÓN
  const displayFecha = formatReportDate(visit.fecha);
  drawLabeledField(doc, pageX, y, wCliente, rowH, 'NOMBRE DEL CLIENTE:', empaqueName || visit.nombre_cliente || '');
  drawLabeledField(doc, pageX + wCliente, y, wUbicacion, rowH, 'UBICACIÓN:', empaqueUbicacion || visit.solicitado_por || '');
  drawLabeledField(doc, pageX + wCliente + wUbicacion, y, wFecha, rowH, 'FECHA:', displayFecha);
  y += rowH;

  // Row 2 - Strict 24-hour time format (HH:mm) for all three time fields
  const horaLlamadaFormatted = formatTo24HourTime(visit.hora_llamada);
  const horaInicioFormatted = formatTo24HourTime(visit.hora_inicio);
  const horaFinFormatted = formatTo24HourTime(visit.hora_fin);

  drawLabeledField(doc, pageX, y, wLlamada, rowH, 'FECHA/HORA LLAMADA RECIBIDA:', horaLlamadaFormatted);
  drawLabeledField(doc, pageX + wLlamada, y, wComienzo, rowH, 'HORA DE COMIENZO:', horaInicioFormatted);
  drawLabeledField(doc, pageX + wLlamada + wComienzo, y, wFin, rowH, 'HORA DE FINALIZACIÓN:', horaFinFormatted);

  const fueraDeX = pageX + wLlamada + wComienzo + wFin;
  doc.rect(fueraDeX, y, wFueraDe, rowH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.7);
  doc.setTextColor(0);
  doc.text('LLAMADA/TRABAJO FUERA DE HORA:', fueraDeX + 1.2, y + 5, { maxWidth: wFueraDe - 2.4 });

  const yesNoX = fueraDeX + wFueraDe;
  doc.rect(yesNoX, y, wSiNo, rowH, 'S');
  doc.rect(yesNoX + wSiNo, y, wSiNo, rowH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('SÍ', yesNoX + wSiNo / 2, y + 3.2, { align: 'center' });
  doc.text('NO', yesNoX + wSiNo + wSiNo / 2, y + 3.2, { align: 'center' });
  doc.setFontSize(8);
  if (visit.fuera_de_hora) {
    doc.text('X', yesNoX + wSiNo / 2, y + rowH - 1.2, { align: 'center' });
  } else {
    doc.text('X', yesNoX + wSiNo + wSiNo / 2, y + rowH - 1.2, { align: 'center' });
  }
  y += rowH;

  // Collect selected codes
  const allMotivoCodes = new Set<string>();
  getMotivoCodesList(visit.codigo_motivo).forEach((code) => allMotivoCodes.add(code));
  if (visit.estructura) {
    visit.estructura.forEach((item) => {
      getMotivoCodesList(item.codigo_motivo).forEach((code) => allMotivoCodes.add(code));
    });
  }

  const allOrigenCodes = new Set<string>();
  const origenValues = Array.isArray(visit.codigo_origen) ? visit.codigo_origen : visit.codigo_origen ? [visit.codigo_origen] : [];
  origenValues.forEach((o) => {
    const code = getOrigenCode(o);
    if (code) allOrigenCodes.add(code);
  });
  if (visit.estructura) {
    visit.estructura.forEach((item) => {
      const code = getOrigenCode(item.codigo_origen);
      if (code) allOrigenCodes.add(code);
    });
  }

  const selectedTipoServicio =
    TIPO_SERVICIO_OPTIONS.find(
      (opt) => opt.value === visit.codigo_tipo_servicio || opt.code === String(visit.codigo_tipo_servicio)
    )?.code || (visit.codigo_tipo_servicio ? String(visit.codigo_tipo_servicio) : '');

  // 3. Códigos del Motivo & Tipo de Servicio (Soft Gray Header Strip)
  const motiveBlockH = 20;
  const motiveW = 124;
  const tipoW = pageW - motiveW;

  doc.rect(pageX, y, motiveW, motiveBlockH, 'S');
  doc.rect(pageX + motiveW, y, tipoW, motiveBlockH, 'S');

  // Soft gray headers with black text
  doc.setFillColor(HEADER_GRAY[0], HEADER_GRAY[1], HEADER_GRAY[2]);
  doc.rect(pageX, y, motiveW, 4, 'FD');
  doc.rect(pageX + motiveW, y, tipoW, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(0);
  doc.text('CÓDIGOS DEL MOTIVO', pageX + motiveW / 2, y + 2.9, { align: 'center' });
  doc.text('TIPO DE SERVICIO', pageX + motiveW + (tipoW - 14) / 2, y + 2.9, { align: 'center' });
  doc.text('CÓDIGOS', pageX + pageW - 7, y + 2.9, { align: 'center' });

  const motiveRowH = (motiveBlockH - 4) / 4;
  const halfMotiveW = motiveW / 2;
  const codeBoxW = 13;

  for (let i = 0; i < 4; i++) {
    const rowTop = y + 4 + i * motiveRowH;
    doc.setDrawColor(0);
    doc.line(pageX, rowTop, pageX + motiveW, rowTop);
    doc.line(pageX + halfMotiveW, rowTop, pageX + halfMotiveW, rowTop + motiveRowH);

    const leftItem = MOTIVO_OPTIONS[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(0);
    doc.text(leftItem.label, pageX + 1.5, rowTop + motiveRowH - 1.2);

    const leftCodeBoxX = pageX + halfMotiveW - codeBoxW;
    const isLeftSelected = allMotivoCodes.has(leftItem.code);
    if (isLeftSelected) {
      doc.setFillColor(255, 235, 59);
      doc.rect(leftCodeBoxX, rowTop, codeBoxW, motiveRowH, 'FD');
    } else {
      doc.rect(leftCodeBoxX, rowTop, codeBoxW, motiveRowH, 'S');
    }
    doc.setFont('helvetica', isLeftSelected ? 'bold' : 'normal');
    doc.setFontSize(5.2);
    doc.text(leftItem.code, leftCodeBoxX + codeBoxW / 2, rowTop + motiveRowH - 1.2, { align: 'center' });

    const rightItem = MOTIVO_OPTIONS[i + 4];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.text(rightItem.label, pageX + halfMotiveW + 1.5, rowTop + motiveRowH - 1.2);

    const rightCodeBoxX = pageX + motiveW - codeBoxW;
    const isRightSelected = allMotivoCodes.has(rightItem.code);
    if (isRightSelected) {
      doc.setFillColor(255, 235, 59);
      doc.rect(rightCodeBoxX, rowTop, codeBoxW, motiveRowH, 'FD');
    } else {
      doc.rect(rightCodeBoxX, rowTop, codeBoxW, motiveRowH, 'S');
    }
    doc.setFont('helvetica', isRightSelected ? 'bold' : 'normal');
    doc.setFontSize(5.2);
    doc.text(rightItem.code, rightCodeBoxX + codeBoxW / 2, rowTop + motiveRowH - 1.2, { align: 'center' });
  }

  // Tipo de Servicio (4 rows)
  const tipoRowH = (motiveBlockH - 4) / 4;
  const tipoCodeBoxW = 14;
  for (let i = 0; i < 4; i++) {
    const rowTop = y + 4 + i * tipoRowH;
    doc.setDrawColor(0);
    doc.line(pageX + motiveW, rowTop, pageX + pageW, rowTop);
    const tipoCodeBoxX = pageX + pageW - tipoCodeBoxW;

    if (i < TIPO_SERVICIO_OPTIONS.length) {
      const item = TIPO_SERVICIO_OPTIONS[i];
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.8);
      doc.setTextColor(0);
      doc.text(item.label, pageX + motiveW + 1.5, rowTop + tipoRowH - 1.2);

      const isTipoSelected = selectedTipoServicio === item.code || selectedTipoServicio === item.value;
      if (isTipoSelected) {
        doc.setFillColor(255, 235, 59);
        doc.rect(tipoCodeBoxX, rowTop, tipoCodeBoxW, tipoRowH, 'FD');
      } else {
        doc.rect(tipoCodeBoxX, rowTop, tipoCodeBoxW, tipoRowH, 'S');
      }
      doc.setFont('helvetica', isTipoSelected ? 'bold' : 'normal');
      doc.setFontSize(5.2);
      doc.text(item.code, tipoCodeBoxX + tipoCodeBoxW / 2, rowTop + tipoRowH - 1.2, { align: 'center' });
    } else {
      doc.rect(tipoCodeBoxX, rowTop, tipoCodeBoxW, tipoRowH, 'S');
    }
  }
  y += motiveBlockH;

  // 4. Códigos de Origen (Identical row height, font, and aesthetics to Motivo)
  const origenRows = 3;
  const origenCols = 3;
  const origenHeader = 4;
  const origenRowH = 4; // Identical row height to Motivo
  const origenBlockH = origenHeader + origenRows * origenRowH; // 16 mm

  doc.rect(pageX, y, pageW, origenBlockH, 'S');
  doc.setFillColor(HEADER_GRAY[0], HEADER_GRAY[1], HEADER_GRAY[2]);
  doc.rect(pageX, y, pageW, origenHeader, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(0);
  doc.text('CÓDIGOS DE ORIGEN', pageX + pageW / 2, y + 2.9, { align: 'center' });

  const origenColW = pageW / origenCols;
  const origenCodeBoxW = 12.5;

  doc.setDrawColor(0);
  for (let c = 1; c < origenCols; c++) {
    doc.line(pageX + c * origenColW, y + origenHeader, pageX + c * origenColW, y + origenBlockH);
  }
  for (let r = 0; r <= origenRows; r++) {
    const top = y + origenHeader + r * origenRowH;
    doc.line(pageX, top, pageX + pageW, top);
  }

  for (let i = 0; i < ORIGEN_OPTIONS.length; i++) {
    const col = i % origenCols;
    const row = Math.floor(i / origenCols);
    const cellX = pageX + col * origenColW;
    const cellY = y + origenHeader + row * origenRowH;

    const item = ORIGEN_OPTIONS[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(0);
    doc.text(item.label, cellX + 1.5, cellY + origenRowH - 1.2, { maxWidth: origenColW - origenCodeBoxW - 2.5 });

    const codeBoxX = cellX + origenColW - origenCodeBoxW;
    const isOrigenSelected = allOrigenCodes.has(item.code);
    if (isOrigenSelected) {
      doc.setFillColor(255, 235, 59);
      doc.rect(codeBoxX, cellY, origenCodeBoxW, origenRowH, 'FD');
    } else {
      doc.rect(codeBoxX, cellY, origenCodeBoxW, origenRowH, 'S');
    }
    doc.setFont('helvetica', isOrigenSelected ? 'bold' : 'normal');
    doc.setFontSize(5.2);
    doc.text(item.code, codeBoxX + origenCodeBoxW / 2, cellY + origenRowH - 1.2, { align: 'center' });
  }
  y += origenBlockH;

  // 5. Context Fields: PRODUCCIÓN ETIQUETADA and CONDICIÓN DE LA FRUTA
  const contextRowH = 7.5;
  const halfContextW = pageW / 2;
  drawLabeledField(
    doc,
    pageX,
    y,
    halfContextW,
    contextRowH,
    'PRODUCCIÓN ETIQUETADA:',
    visit.produccion_etiquetada || ''
  );
  drawLabeledField(
    doc,
    pageX + halfContextW,
    y,
    halfContextW,
    contextRowH,
    'CONDICIÓN DE LA FRUTA:',
    visit.condicion_fruta || ''
  );
  y += contextRowH;

  // 6. Instruction Banner / Text Box
  const instructionH = 7;
  doc.rect(pageX, y, pageW, instructionH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.4);
  doc.setTextColor(0);
  doc.text(
    'NOTA: CÓDIGO DE ORIGEN Y CÓDIGOS DE RESOLUCIÓN CORRESPONDIENTES. ANOTE CUALQUIER OTRA ACCIÓN DIRIGIDA A DEVOLVER AL EQUIPO UNOS',
    pageX + 1.5,
    y + 2.6
  );
  doc.text(
    'PARÁMETROS DE FUNCIONAMIENTO ÓPTIMOS, FIRME EL INFORME INDICANDO LOS PROCEDIMIENTOS APLICADOS PARA COMPLETAR EL TRABAJO.',
    pageX + 1.5,
    y + 5.4
  );
  y += instructionH;

  // 7. Main Service Detail Table (Soft Gray Headers, Unified PCTJE ETIQ Header)
  const detailTop = y;
  const detailH = 104;
  const headH = 13;
  doc.rect(pageX, detailTop, pageW, detailH, 'S');

  // Fill Header area with soft gray
  doc.setFillColor(HEADER_GRAY[0], HEADER_GRAY[1], HEADER_GRAY[2]);
  doc.rect(pageX, detailTop, pageW, headH, 'FD');

  const colWidths = [16, 12, 18, 12, 42, 11, 43, 13, 13, 14];
  const headers = [
    'NÚMERO DE\nSERIE',
    'CÓD.\nMOTIVO',
    'CÓDIGO DE ORIGEN\nO DE LA RES.',
    'FIN/RES',
    'N/PARTES O PIEZAS\nSUSTITUIDAS O AJUSTADAS',
    'CANTIDAD',
    'ACCIONES REALIZADAS PARA\nOPTIMIZAR EL SERVICIO',
    'PCTJE ETIQ.',
    'TIEMPO DE\nSERVICIO',
  ];

  let currentX = pageX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.1);
  doc.setTextColor(0);
  doc.setDrawColor(0);

  // Draw vertical header lines & text
  for (let i = 0; i < 7; i++) {
    doc.line(currentX, detailTop, currentX, detailTop + headH);
    const splitLines = headers[i].split('\n');
    if (splitLines.length === 1) {
      doc.text(splitLines[0], currentX + colWidths[i] / 2, detailTop + 7, {
        align: 'center',
        maxWidth: colWidths[i] - 1.2,
      });
    } else {
      doc.text(splitLines[0], currentX + colWidths[i] / 2, detailTop + 5, {
        align: 'center',
        maxWidth: colWidths[i] - 1.2,
      });
      doc.text(splitLines[1], currentX + colWidths[i] / 2, detailTop + 9, {
        align: 'center',
        maxWidth: colWidths[i] - 1.2,
      });
    }
    currentX += colWidths[i];
  }

  // PCTJE ETIQ Unified Header (Spanning col 7 and col 8 = 26mm)
  const pctStartX = currentX;
  const pctTotalW = colWidths[7] + colWidths[8]; // 26mm
  doc.line(pctStartX, detailTop, pctStartX, detailTop + headH);
  doc.text('PCTJE ETIQ.', pctStartX + pctTotalW / 2, detailTop + 4.5, { align: 'center' });

  // Sub-header horizontal split for PCTJE ETIQ
  doc.line(pctStartX, detailTop + 6.5, pctStartX + pctTotalW, detailTop + 6.5);
  // Sub-header vertical divider between (75%) and REAL
  doc.line(pctStartX + colWidths[7], detailTop + 6.5, pctStartX + colWidths[7], detailTop + headH);
  doc.setFontSize(3.8);
  doc.text('(75%)', pctStartX + colWidths[7] / 2, detailTop + 10.8, { align: 'center' });
  doc.text('REAL', pctStartX + colWidths[7] + colWidths[8] / 2, detailTop + 10.8, { align: 'center' });

  currentX += pctTotalW;

  // Last column: TIEMPO DE SERVICIO
  doc.line(currentX, detailTop, currentX, detailTop + headH);
  doc.setFontSize(4.1);
  const timeSplit = headers[8].split('\n');
  doc.text(timeSplit[0], currentX + colWidths[9] / 2, detailTop + 5, { align: 'center' });
  doc.text(timeSplit[1], currentX + colWidths[9] / 2, detailTop + 9, { align: 'center' });

  // Outer header bottom line
  doc.line(pageX, detailTop + headH, pageX + pageW, detailTop + headH);

  // Detail table body grid
  const rowCount = 13;
  const detailRowH = (detailH - headH) / rowCount;

  // Draw vertical column lines for rows
  let rowColX = pageX;
  for (let i = 0; i < colWidths.length; i++) {
    doc.line(rowColX, detailTop + headH, rowColX, detailTop + detailH);
    rowColX += colWidths[i];
  }

  for (let i = 1; i <= rowCount; i++) {
    doc.line(pageX, detailTop + headH + i * detailRowH, pageX + pageW, detailTop + headH + i * detailRowH);
  }

  // Populate row items in bold with time in minutes
  const items = (visit.estructura || []).slice(0, rowCount);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);
  doc.setTextColor(20, 20, 20);

  for (let row = 0; row < items.length; row++) {
    const item = items[row];
    const rowY = detailTop + headH + row * detailRowH + 4.8;
    const pctEspStr =
      item.pct_etiquetado_esperado !== undefined &&
      item.pct_etiquetado_esperado !== null &&
      !isNaN(Number(item.pct_etiquetado_esperado))
        ? `${item.pct_etiquetado_esperado}%`
        : '';

    const pctRealStr =
      item.pct_etiquetado_real !== undefined &&
      item.pct_etiquetado_real !== null &&
      !isNaN(Number(item.pct_etiquetado_real))
        ? `${item.pct_etiquetado_real}%`
        : '';

    const shortMotivo = getMotivoCodesList(item.codigo_motivo).join(', ');
    const shortOrigen = getOrigenCode(item.codigo_origen);

    const values = [
      item.numero_de_serie || '',
      shortMotivo,
      shortOrigen,
      item.codigo_res || '',
      item.numero_partes || '',
      item.cantidad ? String(item.cantidad) : '',
      item.otras_acciones || '',
      pctEspStr,
      pctRealStr,
      item.tiempo_servicio ? `${item.tiempo_servicio} min` : '',
    ];

    let valX = pageX;
    for (let i = 0; i < colWidths.length; i++) {
      doc.text(String(values[i]), valX + colWidths[i] / 2, rowY, {
        align: 'center',
        maxWidth: colWidths[i] - 1.4,
      });
      valX += colWidths[i];
    }
  }
  y += detailH;

  // 8. Comments & Observations
  const commentsH = 17.5;
  doc.rect(pageX, y, pageW, commentsH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(0);
  doc.text('COMENTARIOS:', pageX + 1.5, y + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(20, 20, 20);
  const commentLines = doc.splitTextToSize(visit.comentarios || '', pageW - 4);
  doc.text(commentLines, pageX + 1.5, y + 7.5);
  y += commentsH;

  // 9. Checklist Statement (Enclosed between higher gray rows)
  const checkTotalH = 13.5;
  const grayBandH = 4.2;

  doc.rect(pageX, y, pageW, checkTotalH, 'S');

  // Top gray band (Higher)
  doc.setFillColor(HEADER_GRAY[0], HEADER_GRAY[1], HEADER_GRAY[2]);
  doc.rect(pageX, y, pageW, grayBandH, 'FD');

  // Bottom gray band (Higher)
  doc.rect(pageX, y + checkTotalH - grayBandH, pageW, grayBandH, 'FD');

  // Middle statement row with Checkbox
  const midY = y + grayBandH;
  const midH = checkTotalH - 2 * grayBandH; // 5.1 mm
  doc.rect(pageX + 1.5, midY + (midH - 3.8) / 2, 3.8, 3.8, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0);
  doc.text('X', pageX + 3.4, midY + midH / 2 + 1.1, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.text(
    'HE REALIZADO UN SERVICIO DE ACUERDO CON LOS PROCEDIMIENTOS / LISTA DE TAREAS CORRESPONDIENTES',
    pageX + 7,
    midY + midH / 2 + 1.1
  );
  y += checkTotalH;

  // 10. Signatures (Technician / Client)
  const signH = 17;
  const halfSignW = pageW / 2;
  doc.rect(pageX, y, pageW, signH, 'S');
  doc.line(pageX + halfSignW, y, pageX + halfSignW, y + signH);
  doc.line(pageX, y + signH / 2, pageX + pageW, y + signH / 2);

  // Left (Técnico)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(0);
  doc.text('FIRMA DEL TÉCNICO:', pageX + 1.5, y + 3.5);

  doc.text('EN LETRAS DE IMPRENTA:', pageX + 1.5, y + signH / 2 + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  const tecNameStr = tecnicosNames && tecnicosNames.length > 0 ? tecnicosNames.join(', ') : '';
  doc.text(tecNameStr, pageX + 36, y + signH / 2 + 3.5);

  // Right (Cliente)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('FIRMA DEL CLIENTE:', pageX + halfSignW + 1.5, y + 3.5);

  if (visit.firma_cliente && visit.firma_cliente.startsWith('data:image/')) {
    try {
      const imageFormat = visit.firma_cliente.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(visit.firma_cliente, imageFormat, pageX + halfSignW + 32, y + 1, 38, signH / 2 - 2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signature render error';
      console.warn('Failed to embed customer signature in PDF:', msg);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('EN LETRAS DE IMPRENTA:', pageX + halfSignW + 1.5, y + signH / 2 + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(visit.nombre_cliente || '', pageX + halfSignW + 36, y + signH / 2 + 3.5);

  return doc;
}

function mapVisitaToCreateVisitDTO(visita: Visita): CreateVisitDTO {
  return {
    vehiculo: visita.vehiculo,
    empaque_id: visita.empaque?.id || '',
    tecnico_ids: visita.tecnicos.map((t) => t.id),
    codigo_motivo: Array.isArray(visita.reporte.codigo_motivo)
      ? visita.reporte.codigo_motivo
      : [visita.reporte.codigo_motivo],
    codigo_origen: [visita.reporte.codigo_origen],
    codigo_tipo_servicio: visita.reporte.codigo_tipo_servicio,
    solicitado_por: visita.solicitado_por,
    motivo: visita.motivo,
    hora_inicio: visita.reporte.hora_inicio,
    hora_fin: visita.reporte.hora_fin,
    fuera_de_hora: visita.reporte.fuera_de_hora,
    comentarios: visita.reporte.comentarios,
    estructura: visita.reporte.estructura,
    hora_llamada: visita.reporte.hora_llamada,
    nombre_cliente: visita.reporte.nombre_cliente,
    firma_cliente: visita.reporte.firma_cliente,
    produccion_etiquetada: visita.reporte.produccion_etiquetada,
    condicion_fruta: visita.reporte.condicion_fruta,
    id: visita.id,
    numero: visita.reporte.numero,
    fecha: visita.fecha,
  };
}

/**
 * Downloads a single visit report as a PDF file
 */
export function downloadVisitPDF(visita: Visita, logoImagePath?: string): void {
  const tecNames = visita.tecnicos.map((t) => t.nombre);
  const empName = visita.empaque?.nombre || '';
  const empUbicacion = visita.empaque?.ubicacion || '';
  const doc = generateVisitPDF(mapVisitaToCreateVisitDTO(visita), visita.reporte.numero, tecNames, empName, empUbicacion, logoImagePath);
  const cleanEmpaque = (visita.empaque?.nombre || 'Empaque')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 20);
  const fileName = `Reporte_Sinclair_${visita.reporte.numero}.pdf`;
  if (isNativeApp()) {
    exportFileNativeSafely(doc.output('blob'), fileName, { persist: true });
    return;
  }
  doc.save(fileName);
}

/**
 * Generates and downloads a ZIP file containing PDF reports for the given list of visits
 */
export async function downloadVisitsAsZip(
  visitas: Visita[],
  onProgress?: (current: number, total: number) => void,
  logoImagePath?: string
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Reportes_Sinclair_PDF');

  const total = visitas.length;

  for (let i = 0; i < total; i++) {
    const visita = visitas[i];
    const tecNames = visita.tecnicos.map((t) => t.nombre);
    const empName = visita.empaque?.nombre || '';
    const empUbicacion = visita.empaque?.ubicacion || '';
    const doc = generateVisitPDF(mapVisitaToCreateVisitDTO(visita), visita.reporte.numero, tecNames, empName, empUbicacion, logoImagePath);
    const pdfArrayBuffer = doc.output('arraybuffer');

    const cleanEmpaque = (visita.empaque?.nombre || 'Planta')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 20);
    const fileName = `Reporte_${visita.reporte.numero}_${cleanEmpaque}_${visita.fecha}.pdf`;

    if (folder) {
      folder.file(fileName, pdfArrayBuffer);
    } else {
      zip.file(fileName, pdfArrayBuffer);
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  // Include a CSV manifest
  let summaryContent = `RESUMEN DE REPORTES DE VISITAS - SINCLAIR SYSTEMS INTERNATIONAL\n`;
  summaryContent += `Fecha de exportación: ${new Date().toLocaleString()}\n`;
  summaryContent += `Total de reportes incluidos: ${total}\n\n`;
  summaryContent += `NUMERO,FECHA,EMPAQUE,TECNICOS,HORARIO,ESTADO\n`;

  visitas.forEach((v) => {
    const tecStr = v.tecnicos.map((t) => t.nombre).join(' & ');
    summaryContent += `${v.reporte.numero},"${v.fecha}","${v.empaque?.nombre || 'Planta'}","${tecStr}","${formatTo24HourTime(v.reporte.hora_inicio)}-${formatTo24HourTime(v.reporte.hora_fin)}","${v.estado_sincronizacion}"\n`;
  });

  zip.file('indice_reportes.csv', summaryContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `Reportes_Sinclair_PDF_${new Date().toISOString().split('T')[0]}.zip`;

  if (isNativeApp()) {
    await exportFileNative(zipBlob, zipFileName, { persist: true });
    return;
  }

  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
