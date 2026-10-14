import { Router } from 'express';
import { HttpError } from '../errors/http-error.js';
import { createEmployeeController } from '../controllers/employee-controller.js';

export function createEmployeeRouter(service) {
  const router = Router();
  const controller = createEmployeeController(service);
  router.use((request, _response, next) => {
    if (['POST', 'PUT'].includes(request.method) && !request.is('application/json')) {
      return next(new HttpError(415, 'json_required', 'Envíe los datos en formato JSON.'));
    }
    next();
  });
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.find);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
}
