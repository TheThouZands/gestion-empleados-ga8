import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import spanishColombia from '@angular/common/locales/es-CO';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { App } from './app.component';
import { EmployeeForm } from './employees/employee-form.component';

describe('App', () => {
  beforeAll(() => registerLocaleData(spanishColombia));
  const employee = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Ana Torres',
    position: 'Analista',
    office: 'Bogotá',
    salary: 2500000,
  };
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'es-CO' },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    http.expectOne('/api/empleados').flush([employee]);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('creates the app', () => expect(fixture.componentInstance).toBeTruthy());
  it('formats salary with Spanish separators', () => {
    expect(fixture.nativeElement.querySelector('tbody .salary').textContent).toContain(
      '2.500.000,00',
    );
  });
  it('shows the employees loaded from the API in a table', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('h1')?.textContent).toContain('Empleados');
    expect(html.querySelector('tbody')?.textContent).toContain('Ana Torres');
    expect(fixture.componentInstance.employees()).toEqual([employee]);
    expect(fixture.componentInstance.loading()).toBe(false);
  });
  it('opens the dialog and clears the form', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = vi.fn();
    const form = fixture.debugElement.query(By.directive(EmployeeForm))
      .componentInstance as EmployeeForm;
    form.form.controls.name.setValue('Dato anterior');
    fixture.componentInstance.openRegistration();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(form.form.controls.name.value).toBe('');
  });
  it('returns to the refreshed table after saving', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.close = vi.fn();
    const added = { ...employee, _id: '507f1f77bcf86cd799439012', name: 'Luis Vega' };
    fixture.componentInstance.onSaved(added);
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.employees()).toEqual([employee, added]);
    http.expectOne('/api/empleados').flush([employee, added]);
    expect(fixture.componentInstance.employees()).toEqual([employee, added]);
  });
  it('prevents closing while a save is in progress', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.close = vi.fn();
    const form = fixture.debugElement.query(By.directive(EmployeeForm))
      .componentInstance as EmployeeForm;
    form.busy.set(true);
    fixture.componentInstance.closeRegistration();
    expect(dialog.close).not.toHaveBeenCalled();
    form.busy.set(false);
    fixture.componentInstance.closeRegistration();
    expect(dialog.close).toHaveBeenCalledOnce();
  });
  it('shows the empty state only after a successful load', () => {
    fixture.componentInstance.loadEmployees();
    http.expectOne('/api/empleados').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain(
      'Todavía no hay empleados.',
    );
  });
  it('keeps visible entries on a failed refresh and permits retry', () => {
    fixture.componentInstance.loadEmployees();
    http.expectOne('/api/empleados').flush({}, { status: 500, statusText: 'Server Error' });
    expect(fixture.componentInstance.employees()).toEqual([employee]);
    expect(fixture.componentInstance.listError()).toBeTruthy();
    fixture.componentInstance.loadEmployees();
    http.expectOne('/api/empleados').flush([employee]);
    expect(fixture.componentInstance.listError()).toBe('');
  });
  it('cancels a stale load before starting another', () => {
    fixture.componentInstance.loadEmployees();
    const stale = http.expectOne('/api/empleados');
    fixture.componentInstance.loadEmployees();
    expect(stale.cancelled).toBe(true);
    http.expectOne('/api/empleados').flush([employee]);
    expect(fixture.componentInstance.employees()).toEqual([employee]);
  });
});
