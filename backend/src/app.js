import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { EmployeeService } from './services/employee-service.js';
import { createEmployeeRouter } from './routes/employee-routes.js';
import { HttpError } from './errors/http-error.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp({
  repository,
  config = { clientOrigin: 'http://127.0.0.1:4210', port: 3210 },
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api', (_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  const origins = new Set([config.clientOrigin, `http://127.0.0.1:${config.port}`]);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.has(origin)) return callback(null, true);
        callback(
          new HttpError(403, 'origin_not_allowed', 'El origen de la solicitud no está permitido.'),
        );
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'gestion-empleados' });
  });
  if (repository) app.use('/api/empleados', createEmployeeRouter(new EmployeeService(repository)));
  app.use((_request, _response, next) =>
    next(new HttpError(404, 'route_not_found', 'No se encontró la ruta.')),
  );
  app.use(errorHandler);
  return app;
}
