/**
 * PDF and ZIP Report Generator for Sinclair Field Operations
 * Generates formal technical PDF visit reports (RF02) and bundles them into a ZIP archive (RF20).
 * Adheres strictly to SDD and Clean Code standards.
 */

import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { Visita } from '../types/domain';

/**
 * Generates a formal jsPDF document for a single visit report
 */
export function generateVisitPDF(visita: Visita): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { reporte, empaque, tecnicos, vehiculo } = visita;

  // Colors
  const primaryBlue = [15, 44, 89]; // #0F2C59
  const darkSlate = [30, 41, 59];
  const lightGray = [241, 245, 249];

  // Header Banner
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SINCLAIR SYSTEMS INTERNATIONAL', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('REPORTE TÉCNICO DE VISITA Y SERVICIO EN PLANTA', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`REPORTE N° ${reporte.numero}`, 196, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${visita.id}`, 196, 18, { align: 'right' });

  // Section 1: General Info & Location
  let y = 34;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, y, 182, 30, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 30, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('1. INFORMACIÓN DE LA VISITA Y EMPAQUE', 18, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', 18, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(visita.fecha || 'N/A', 36, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Empaque:', 18, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(`${empaque?.nombre || 'Planta'} (${empaque?.ubicacion || 'N/A'})`, 36, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.text('Distancia:', 18, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(`${empaque?.distancia || 0} km (Base Central)`, 36, y + 25);

  doc.setFont('helvetica', 'bold');
  doc.text('Horario:', 110, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reporte.hora_inicio || '08:00'} a ${reporte.hora_fin || '12:00'} hs`, 130, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Solicitado por:', 110, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(visita.solicitado_por || reporte.nombre_cliente || 'Planta', 130, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.text('Fuera de Hora:', 110, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(reporte.fuera_de_hora ? 'SÍ (Tarifa Especial)' : 'NO (Jornada Regular)', 130, y + 25);

  // Section 2: Fleet & Assigned Technicians
  y += 35;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'F');
  doc.roundedRect(14, y, 182, 28, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('2. CUADRILLA TÉCNICA Y VEHÍCULO DE FLOTA', 18, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  doc.setFont('helvetica', 'bold');
  doc.text('Técnicos:', 18, y + 13);
  doc.setFont('helvetica', 'normal');
  const tecNames = tecnicos?.map((t) => `${t.nombre} (${t.rol})`).join(', ') || 'N/A';
  doc.text(tecNames, 36, y + 13, { maxWidth: 155 });

  doc.setFont('helvetica', 'bold');
  doc.text('Vehículo:', 18, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vehículo Asignado: Flota Sinclair (${vehiculo || 'Amarok'})`, 36, y + 21, {
    maxWidth: 155,
  });

  // Section 3: Technical Structure & Service Details
  y += 33;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
  doc.roundedRect(14, y, 182, 22, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('3. CLASIFICACIÓN DEL SERVICIO TÉCNICO', 18, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  doc.setFont('helvetica', 'bold');
  doc.text('Motivo:', 18, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `[${reporte.codigo_motivo || 'SRT'}] ${visita.motivo || 'Mantenimiento en Línea'}`,
    36,
    y + 13
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Tipo Servicio:', 110, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Código ${reporte.codigo_tipo_servicio || 'Y'} | Origen: ${reporte.codigo_origen || 'CTR'}`,
    130,
    y + 13
  );

  // Section 4: Machine Structure Table
  y += 28;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('4. ESTRUCTURA DE MÁQUINAS E INTERVENCIONES', 14, y + 4);

  y += 7;
  // Table Header
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO RES', 18, y + 5);
  doc.text('N° PARTE / COMPONENTE', 55, y + 5);
  doc.text('CANTIDAD', 110, y + 5);
  doc.text('OTRAS ACCIONES', 135, y + 5);
  doc.text('TIEMPO', 185, y + 5, { align: 'right' });

  y += 7;
  const items = reporte.estructura || [];
  if (items.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text('No se registraron líneas de estructura detalladas en este reporte.', 18, y + 5);
    y += 7;
  } else {
    items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(14, y, 182, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 7, 196, y + 7);

      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(item.codigo_res || 'CAB', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(item.numero_partes || 'Partes Generales', 55, y + 5);
      doc.text(String(item.cantidad || '1'), 110, y + 5);
      doc.text(item.otras_acciones || 'Ajuste y calibración', 135, y + 5, { maxWidth: 45 });
      doc.text(`${item.tiempo_servicio || 0.5} h`, 185, y + 5, { align: 'right' });

      y += 7;
    });
  }

  // Section 5: Comments & Observations
  y += 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
  doc.roundedRect(14, y, 182, 22, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('5. OBSERVACIONES TÉCNICAS Y COMENTARIOS:', 18, y + 5);

  doc.setFontSize(7.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'normal');
  const commentText = reporte.comentarios || 'Operación completada sin novedades extraordinarias.';
  doc.text(commentText, 18, y + 11, { maxWidth: 174 });

  // Section 6: Signatures
  y += 27;
  doc.setDrawColor(148, 163, 184);
  doc.line(25, y + 16, 85, y + 16);
  doc.line(125, y + 16, 185, y + 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('FIRMA RESPONSABLE DE PLANTA', 55, y + 21, { align: 'center' });
  doc.text('FIRMA TÉCNICO SINCLAIR', 155, y + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(reporte.nombre_cliente || 'Responsable de Empaque', 55, y + 25, { align: 'center' });
  doc.text(tecnicos?.[0]?.nombre || 'Técnico Sinclair Certificado', 155, y + 25, { align: 'center' });

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento oficial generado automáticamente por el Sistema Sinclair Field Operations • ${new Date().toLocaleString()}`,
    105,
    285,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads a single visit report as a PDF file
 */
export function downloadVisitPDF(visita: Visita) {
  const doc = generateVisitPDF(visita);
  const fileName = `Reporte_Sinclair_${visita.reporte.numero}_${visita.fecha}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a ZIP file containing PDF reports for the given list of visits
 */
export async function downloadVisitsAsZip(
  visitas: Visita[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Reportes_Sinclair_PDF');

  const total = visitas.length;

  for (let i = 0; i < total; i++) {
    const visita = visitas[i];
    const doc = generateVisitPDF(visita);
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
    summaryContent += `${v.reporte.numero},"${v.fecha}","${v.empaque?.nombre || 'Planta'}","${tecStr}","${v.reporte.hora_inicio}-${v.reporte.hora_fin}","${v.estado_sincronizacion}"\n`;
  });

  zip.file('indice_reportes.csv', summaryContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reportes_Sinclair_PDF_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
