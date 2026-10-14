import { employeeIdSchema, employeeInputSchema } from '../validation/employee-input.js';
import { HttpError } from '../errors/http-error.js';

function readId(value) {
  const result = employeeIdSchema.safeParse(value);
  if (!result.success) throw new HttpError(400, 'invalid_id', 'El identificador no es válido.');
  return result.data;
}

function readEmployee(value) {
  const result = employeeInputSchema.safeParse(value);
  if (!result.success) {
    throw new HttpError(
      422,
      'invalid_employee',
      'Revise los datos del empleado.',
      result.error.issues.map((issue) => ({
        field: String(issue.path[0] || 'body'),
        message:
          issue.code === 'unrecognized_keys'
            ? 'No envíe campos adicionales.'
            : 'Revise este valor.',
      })),
    );
  }
  return result.data;
}

function requireEmployee(value) {
  if (!value) throw new HttpError(404, 'employee_not_found', 'No se encontró el empleado.');
  return value;
}

// Facade: one contract for the application, independent of the MongoDB implementation.
export class EmployeeService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.list();
  }

  async find(id) {
    return requireEmployee(await this.repository.find(readId(id)));
  }

  create(input) {
    return this.repository.create(readEmployee(input));
  }

  async update(id, input) {
    return requireEmployee(await this.repository.update(readId(id), readEmployee(input)));
  }

  async delete(id) {
    return requireEmployee(await this.repository.delete(readId(id)));
  }
}
