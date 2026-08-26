/**
 * Main Server Entry Point (Express + Vite)
 * Adheres strictly to SDD and AI Studio runtime specifications
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createCoreRouter } from './src/server/controllers/CoreController';
import { createVisitsRouter } from './src/server/controllers/VisitsController';
import { DomainError } from './src/types/errors';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers with support for signatures and batch payloads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      system: 'Visit Manager - Technical Field Operations',
      timestamp: new Date().toISOString(),
    });
  });

  // RF24: Two distinct API Routers
  app.use('/api/visits', createVisitsRouter());
  app.use('/api/core', createCoreRouter());

  // Error Handling Middleware (Domain exceptions transformation)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof DomainError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          name: err.name,
        },
      });
      return;
    }

    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Unhandled domain error:', message);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Visit Manager Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
