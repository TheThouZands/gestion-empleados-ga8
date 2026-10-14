import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmployeeForm } from './employee-form.component';

describe('EmployeeForm', () => {
  const input = { name: 'Ana Torres', position: 'Analista', office: 'Bogotá', salary: 2500000 };
  let form: EmployeeForm;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    form = TestBed.createComponent(EmployeeForm).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('requires all four fields', () => {
    form.save();
    expect(form.form.invalid).toBe(true);
    expect(form.failed()).toBe(true);
    http.expectNone('/api/empleados');
  });
  it.each(['name', 'position', 'office'] as const)('rejects whitespace in %s', (field) => {
    form.form.setValue({ ...input, [field]: '   ' });
    expect(form.form.invalid).toBe(true);
  });
  it.each([-1, 1.234, 1000000001])('rejects invalid salary %s', (salary) => {
    form.form.setValue({ ...input, salary });
    form.save();
    expect(form.form.invalid).toBe(true);
    http.expectNone('/api/empleados');
  });
  it('accepts zero salary', () => {
    form.form.setValue({ ...input, salary: 0 });
    expect(form.form.valid).toBe(true);
  });
  it('rejects text longer than 120 characters', () => {
    form.form.setValue({ ...input, office: 'x'.repeat(121) });
    expect(form.form.invalid).toBe(true);
  });
  it('trims text and resets only after success', () => {
    form.form.setValue({ ...input, name: ' Ana Torres ' });
    form.save();
    const request = http.expectOne('/api/empleados');
    expect(request.request.body).toEqual(input);
    expect(form.busy()).toBe(true);
    expect(form.form.controls.name.value).toBe(' Ana Torres ');
    request.flush({
      status: 'Empleado guardado',
      empleado: { ...input, _id: '507f1f77bcf86cd799439011' },
    });
    expect(form.busy()).toBe(false);
    expect(form.form.controls.name.value).toBe('');
    expect(form.form.controls.salary.value).toBe(null);
    expect(form.savedId()).toBe('507f1f77bcf86cd799439011');
  });
  it('retains values after a server error', () => {
    form.form.setValue(input);
    form.save();
    http.expectOne('/api/empleados').flush({}, { status: 500, statusText: 'Server Error' });
    expect(form.form.getRawValue()).toEqual(input);
    expect(form.failed()).toBe(true);
    expect(form.busy()).toBe(false);
  });
  it('prevents another submission and clearing during the request', () => {
    form.form.setValue(input);
    form.save();
    form.save();
    form.clear();
    expect(form.form.getRawValue()).toEqual(input);
    http.expectOne('/api/empleados').flush({
      status: 'Empleado guardado',
      empleado: { ...input, _id: '507f1f77bcf86cd799439011' },
    });
  });
  it('clears values and feedback without sending a request', () => {
    form.form.setValue(input);
    form.clear();
    expect(form.form.controls.name.value).toBe('');
    expect(form.form.controls.salary.value).toBe(null);
    expect(form.notice()).toBe('');
    http.expectNone('/api/empleados');
  });
});
