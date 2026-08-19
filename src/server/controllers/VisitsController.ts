/**
 * VisitsController - Express Router for Visits and Sinclair Reports (API 1)
 * Adheres strictly to RF24 and SDD specifications
 */

import { Router, Request, Response, NextFunction } from 'express';
import JSZip from 'jszip';
import {
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  Vehiculo,
} from '../../types/domain';
import { DomainError } from '../../types/errors';
import { VisitaService } from '../services/VisitaService';

export function createVisitsRouter(visitaService: VisitaService = new VisitaService()): Router {
  const router = Router();

  // RNF02: Fast enums endpoint
  router.get('/enums', (_req: Request, res: Response) => {
    res.json({
      codigos_motivo: Object.entries(CodigoMotivo).map(([k, v]) => ({ key: k, label: v })),
      codigos_orden: Object.entries(CodigoOrden).map(([k, v]) => ({ key: k, label: v })),
      codigos_tipo_servicio: Object.entries(CodigoTipoServicio).map(([k, v]) => ({
        key: k,
        label: v,
      })),
      vehiculos: Object.entries(Vehiculo).map(([k, v]) => ({ key: k, label: v })),
    });
  });

  // RF01, RF02, RNF03: Create single visit
  router.post('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = visitaService.createVisit(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // RF21, RF22, RF23: Asynchronous Batch Sync of pending offline visits
  router.post('/sync-batch', (req: Request, res: Response, next: NextFunction) => {
    try {
      const visits = Array.isArray(req.body.visits) ? req.body.visits : [];
      const result = visitaService.syncBatchVisits(visits);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // List all visits
  router.get('/', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const visits = visitaService.getAllVisits();
      res.json(visits);
    } catch (error) {
      next(error);
    }
  });

  // Filter visits by date range
  router.get('/filter/date-range', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { start, end } = req.query;
      const visits = visitaService.getVisitsByDateRange(String(start), String(end));
      res.json(visits);
    } catch (error) {
      next(error);
    }
  });

  // RF03: Export Sinclair reports between two dates to a ZIP file
  router.post('/export-zip', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.body;
      const visits = startDate && endDate
        ? visitaService.getVisitsByDateRange(startDate, endDate)
        : visitaService.getAllVisits();

      const zip = new JSZip();
      const folder = zip.folder(`Reportes_Sinclair_${startDate || 'inicio'}_${endDate || 'fin'}`);

      visits.forEach((v) => {
        const reportText = `===================================================
REPORTE TÉCNICO SINCLAIR - #${v.reporte.numero}
===================================================
Fecha: ${v.fecha}
Empaque: ${v.empaque.nombre} (${v.empaque.ubicacion})
Solicitado Por: ${v.solicitado_por}
Técnicos: ${v.tecnicos.map((t) => t.nombre).join(', ')}
Vehículo: ${v.vehiculo}
Motivo: ${v.motivo}

DETALLE DEL SERVICIO:
- Código Motivo: ${v.reporte.codigo_motivo}
- Código Origen/Orden: ${v.reporte.codigo_origen}
- Tipo Servicio: ${v.reporte.codigo_tipo_servicio}
- Hora Inicio: ${v.reporte.hora_inicio} | Hora Fin: ${v.reporte.hora_fin}
- Fuera de Hora: ${v.reporte.fuera_de_hora ? 'SÍ' : 'NO'}
- Producción Etiquetada: ${v.reporte.produccion_etiquetada || 'N/A'}
- Condición Fruta: ${v.reporte.condicion_fruta || 'N/A'}

ESTRUCTURA DE EQUIPOS:
${v.reporte.estructura
  .map(
    (e, idx) =>
      ` ${idx + 1}. Código Res: ${e.codigo_res} | Partes: ${e.numero_partes} | Cantidad: ${e.cantidad} | % Real: ${e.pct_etiquetado_real}% | Tiempo: ${e.tiempo_servicio}h | Acciones: ${e.otras_acciones}`
  )
  .join('\n')}

COMENTARIOS:
${v.reporte.comentarios || 'Sin comentarios adicionales.'}

FIRMA CLIENTE: ${v.reporte.nombre_cliente}
===================================================`;

        folder?.file(`Reporte_Sinclair_${v.reporte.numero}_${v.empaque.nombre.replace(/\s+/g, '_')}.txt`, reportText);
        folder?.file(`Reporte_Sinclair_${v.reporte.numero}.json`, JSON.stringify(v, null, 2));
      });

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Sinclair_Reports_${Date.now()}.zip"`
      );
      res.send(zipBuffer);
    } catch (error) {
      next(error);
    }
  });

  // Get single visit by ID
  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const visit = visitaService.getVisitById(req.params.id);
      res.json(visit);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
