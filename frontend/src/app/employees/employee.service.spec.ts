import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  const input = { name: 'Ana Torres', position: 'Analista', office: 'Bogotá', salary: 2500000 };
  const employee = { ...input, _id: '507f1f77bcf86cd799439011' };
  let service: EmployeeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lists employees with GET', () => {
    service.list().subscribe((result) => expect(result).toEqual([employee]));
    const request = http.expectOne('/api/empleados');
    expect(request.request.method).toBe('GET');
    request.flush([employee]);
  });

  it('finds one employee with GET', () => {
    service.find(employee._id).subscribe((result) => expect(result).toEqual(employee));
    const request = http.expectOne(`/api/empleados/${employee._id}`);
    expect(request.request.method).toBe('GET');
    request.flush(employee);
  });

  it('sends only the registration fields with POST', () => {
    service.create(input).subscribe((result) => expect(result.empleado).toEqual(employee));
    const request = http.expectOne('/api/empleados');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    request.flush(
      { status: 'Empleado guardado', empleado: employee },
      { status: 201, statusText: 'Created' },
    );
  });

  it('updates an employee with PUT', () => {
    service.update(employee._id, input).subscribe();
    const request = http.expectOne(`/api/empleados/${employee._id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(input);
    request.flush({ status: 'Empleado actualizado', empleado: employee });
  });

  it('deletes an employee with DELETE', () => {
    service.remove(employee._id).subscribe();
    const request = http.expectOne(`/api/empleados/${employee._id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ status: 'Empleado eliminado' });
  });

  it('passes server errors to the caller', () => {
    service.create(input).subscribe({ error: (error) => expect(error.status).toBe(422) });
    http
      .expectOne('/api/empleados')
      .flush(
        { error: { code: 'invalid_input' } },
        { status: 422, statusText: 'Unprocessable Content' },
      );
  });
});
