/**
 * CoreController - Express Router for Core Domain Functionalities (API 2)
 * Handles Empaques, Machines, Operations, Consumibles, Tecnicos, and Statistics
 * Adheres strictly to RF24 and SDD specifications
 */

import { Router, Request, Response, NextFunction } from 'express';
import { CambioService } from '../services/CambioService';
import { ConsumibleService } from '../services/ConsumibleService';
import { EmpaqueService } from '../services/EmpaqueService';
import { ExternalProviderService } from '../services/ExternalProviderService';
import { MachineService } from '../services/MachineService';
import { ReemplazoService } from '../services/ReemplazoService';
import { ServicioService } from '../services/ServicioService';
import { StatisticsService } from '../services/StatisticsService';
import { TecnicoService } from '../services/TecnicoService';
import { DatabaseStore } from '../repositories/DatabaseStore';

export function createCoreRouter(): Router {
  const router = Router();

  const empaqueService = new EmpaqueService();
  const machineService = new MachineService();
  const reemplazoService = new ReemplazoService();
  const cambioService = new CambioService();
  const servicioService = new ServicioService();
  const consumibleService = new ConsumibleService();
  const tecnicoService = new TecnicoService();
  const statsService = new StatisticsService();
  const providerService = new ExternalProviderService();

  // --- Empaques ---
  router.get('/empaques', (_req: Request, res: Response) => {
    res.json(empaqueService.getAll());
  });
  router.get('/empaques/alerts/unvisited', (_req: Request, res: Response) => {
    res.json(empaqueService.getUnvisitedAlerts());
  });
  router.get('/empaques/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(empaqueService.getById(req.params.id));
    } catch (e) {
      next(e);
    }
  });
  router.post('/empaques', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(empaqueService.create(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/empaques/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(empaqueService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/empaques/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: empaqueService.delete(req.params.id) });
    } catch (e) {
      next(e);
    }
  });

  // --- Machines (Cabezales, Caseteras, Frenos) ---
  router.get('/machines/location/:empaqueId', (req: Request, res: Response) => {
    res.json(machineService.getEquipmentByLocation(req.params.empaqueId));
  });
  router.get('/machines/movements', (_req: Request, res: Response) => {
    res.json(machineService.getAllMovements());
  });
  router.post('/machines/movements', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(machineService.addMovement(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.get('/machines/movements/:id', (req: Request, res: Response) => {
    res.json(machineService.getMovementsByMachine(req.params.id));
  });

  // Cabezales
  router.get('/machines/cabezales', (_req: Request, res: Response) => {
    res.json(machineService.getAllCabezales());
  });
  router.post('/machines/cabezales', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(machineService.createCabezal(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/machines/cabezales/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(machineService.updateCabezal(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/machines/cabezales/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: machineService.deleteCabezal(req.params.id) });
    } catch (e) {
      next(e);
    }
  });

  // Caseteras
  router.get('/machines/caseteras', (_req: Request, res: Response) => {
    res.json(machineService.getAllCaseteras());
  });
  router.post('/machines/caseteras', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(machineService.createCasetera(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/machines/caseteras/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(machineService.updateCasetera(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/machines/caseteras/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: machineService.deleteCasetera(Number(req.params.id)) });
    } catch (e) {
      next(e);
    }
  });

  // Frenos
  router.get('/machines/frenos', (_req: Request, res: Response) => {
    res.json(machineService.getAllFrenos());
  });
  router.post('/machines/frenos', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(machineService.createFreno(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/machines/frenos/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(machineService.updateFreno(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/machines/frenos/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: machineService.deleteFreno(req.params.id) });
    } catch (e) {
      next(e);
    }
  });

  // --- Operations: Reemplazo, Cambio, Servicio ---
  router.get('/operations/reemplazos', (_req: Request, res: Response) => {
    res.json(reemplazoService.getAllReemplazos());
  });
  router.get('/operations/reemplazos/by-machine/:id', (req: Request, res: Response) => {
    res.json(reemplazoService.getMachineReplaces(req.params.id));
  });
  router.post('/operations/reemplazos', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(reemplazoService.createReeplace(req.body));
    } catch (e) {
      next(e);
    }
  });

  router.get('/operations/cambios', (_req: Request, res: Response) => {
    res.json(cambioService.getAllCambios());
  });
  router.get('/operations/cambios/by-freno/:id', (req: Request, res: Response) => {
    res.json(cambioService.getFrenoCambios(req.params.id));
  });
  router.get('/operations/cambios/by-cabezal/:id', (req: Request, res: Response) => {
    res.json(cambioService.getCabezalCambios(req.params.id));
  });
  router.post('/operations/cambios', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(cambioService.createCambio(req.body));
    } catch (e) {
      next(e);
    }
  });

  router.get('/operations/servicios', (_req: Request, res: Response) => {
    res.json(servicioService.getAllServices());
  });
  router.get('/operations/servicios/by-machine/:id', (req: Request, res: Response) => {
    res.json(servicioService.getMachineServices(req.params.id));
  });
  router.post('/operations/servicios', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(servicioService.createService(req.body));
    } catch (e) {
      next(e);
    }
  });

  // --- Consumibles ---
  router.get('/consumibles', (_req: Request, res: Response) => {
    res.json(consumibleService.getAll());
  });
  router.get('/consumibles/alerts/low-stock', (_req: Request, res: Response) => {
    res.json(consumibleService.getLowStockAlerts());
  });
  router.post('/consumibles', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(consumibleService.create(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/consumibles/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(consumibleService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/consumibles/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: consumibleService.delete(req.params.id) });
    } catch (e) {
      next(e);
    }
  });
  router.patch('/consumibles/:id/toggle-critical', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(consumibleService.toggleCritical(req.params.id));
    } catch (e) {
      next(e);
    }
  });
  router.post('/consumibles/:id/restock', (req: Request, res: Response, next: NextFunction) => {
    try {
      const amount = Number(req.body.amount);
      res.json(consumibleService.restock(req.params.id, amount));
    } catch (e) {
      next(e);
    }
  });

  // --- Tecnicos ---
  router.get('/tecnicos', (_req: Request, res: Response) => {
    res.json(tecnicoService.getAll());
  });
  router.get('/tecnicos/activity/stats', (_req: Request, res: Response) => {
    res.json(tecnicoService.getActivityStats());
  });
  router.post('/tecnicos', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(tecnicoService.create(req.body));
    } catch (e) {
      next(e);
    }
  });
  router.put('/tecnicos/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(tecnicoService.update(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  });
  router.delete('/tecnicos/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: tecnicoService.delete(req.params.id) });
    } catch (e) {
      next(e);
    }
  });

  // --- Statistics & Provider Telemetry ---
  router.get('/statistics/dashboard', (_req: Request, res: Response) => {
    res.json(statsService.getDashboardStats());
  });
  router.get('/provider/telemetry', (_req: Request, res: Response) => {
    res.json(providerService.exportProviderTelemetry());
  });

  // --- Audit Trail Logs ---
  router.get('/audit-logs', (req: Request, res: Response) => {
    const { category, userId, search, startDate, endDate, limit } = req.query;
    const db = DatabaseStore.getInstance();
    let logs = [...db.auditLogs];

    if (category && category !== 'all') {
      logs = logs.filter((l) => l.category === category);
    }
    if (userId && userId !== 'all') {
      logs = logs.filter((l) => l.userId.toLowerCase() === String(userId).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      logs = logs.filter(
        (l) =>
          l.targetId.toLowerCase().includes(q) ||
          l.targetName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }
    if (startDate) {
      logs = logs.filter((l) => new Date(l.timestamp) >= new Date(String(startDate)));
    }
    if (endDate) {
      const end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
      logs = logs.filter((l) => new Date(l.timestamp) <= end);
    }

    if (limit) {
      logs = logs.slice(0, Number(limit));
    }

    res.json(logs);
  });

  router.post('/audit-logs', (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = DatabaseStore.getInstance();
      const entry = db.addAuditLog(req.body);
      res.status(201).json(entry);
    } catch (e) {
      next(e);
    }
  });

  // Auth endpoint with password verification
  router.post('/auth/login', (req: Request, res: Response) => {
    const { email, id, password } = req.body;
    const tecnicos = tecnicoService.getAll();
    const user = tecnicos.find(
      (t) =>
        (email && t.email.toLowerCase() === email.toLowerCase()) ||
        (id && t.id.toLowerCase() === id.toLowerCase())
    );

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado en el sistema.' });
    }

    if (user.password && password && user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta. Verifique sus credenciales.' });
    }

    // Update last connection time
    tecnicoService.update(user.id, { ultima_conexion: new Date().toISOString() });

    res.json({
      user,
      token: `jwt_session_${user.id}_${Date.now()}`,
    });
  });

  return router;
}
