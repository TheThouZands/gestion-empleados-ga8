import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { EmployeeForm } from './employees/employee-form.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Empleados');
  });

  it('opens the registration dialog and clears the form', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = vi.fn();
    const form = fixture.debugElement.query(By.directive(EmployeeForm))
      .componentInstance as EmployeeForm;
    form.form.controls.name.setValue('Dato anterior');
    fixture.componentInstance.openRegistration();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(form.form.controls.name.value).toBe('');
  });

  it('closes the dialog and shows the saved record', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.close = vi.fn();
    const employee = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Ana Torres',
      position: 'Analista',
      office: 'Bogotá',
      salary: 2500000,
    };
    fixture.componentInstance.onSaved(employee);
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.lastEmployee()).toEqual(employee);
  });

  it('prevents closing while a save is in progress', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
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
});
