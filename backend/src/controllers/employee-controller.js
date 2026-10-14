export function createEmployeeController(service) {
  return {
    async list(_request, response) {
      response.json(await service.list());
    },
    async find(request, response) {
      response.json(await service.find(request.params.id));
    },
    async create(request, response) {
      const empleado = await service.create(request.body);
      response.location(`/api/empleados/${empleado._id}`).status(201).json({
        status: 'Empleado guardado',
        empleado,
      });
    },
    async update(request, response) {
      response.json({
        status: 'Empleado actualizado',
        empleado: await service.update(request.params.id, request.body),
      });
    },
    async delete(request, response) {
      await service.delete(request.params.id);
      response.json({ status: 'Empleado eliminado' });
    },
  };
}
