import { z } from 'zod';

const settingsSchema = z.object({
  port: z.coerce.number().int().min(1024).max(65535),
  mongoUri: z.string().regex(/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/[a-zA-Z\d_-]+$/),
  clientOrigin: z.url().refine((value) => {
    const url = new URL(value);
    return ['127.0.0.1', 'localhost'].includes(url.hostname) && url.protocol === 'http:';
  }),
});

export function readConfig(environment = process.env) {
  return settingsSchema.parse({
    port: environment.PORT || 3210,
    mongoUri: environment.MONGODB_URI || 'mongodb://127.0.0.1:27108/gestion_empleados_dev',
    clientOrigin: environment.CLIENT_ORIGIN || 'http://127.0.0.1:4210',
  });
}
