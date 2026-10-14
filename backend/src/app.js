import express from 'express';
import helmet from 'helmet';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'gestion-empleados' });
  });
  return app;
}
