import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAdd, matClose } from '@ng-icons/material-icons/baseline';
import { Employee } from './employees/employee';
import { EmployeeForm } from './employees/employee-form.component';
import { EmployeeService } from './employees/employee.service';

@Component({
  imports: [EmployeeForm, DecimalPipe, NgIcon],
  providers: [provideIcons({ matAdd, matClose })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class App {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('registrationDialog');
  private readonly employeeForm = viewChild.required(EmployeeForm);
  private readonly service = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(false);
  readonly listError = signal('');

  constructor() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.listRequest?.unsubscribe();
    this.loading.set(true);
    this.listError.set('');
    this.listRequest = this.service
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (employees) => this.employees.set(employees),
        error: () => this.listError.set('No se pudo cargar la lista de empleados.'),
      });
  }

  openRegistration() {
    this.employeeForm().clear();
    this.dialog().nativeElement.showModal();
  }

  closeRegistration(event?: Event) {
    event?.preventDefault();
    if (!this.employeeForm().busy()) this.dialog().nativeElement.close();
  }

  onSaved(employee: Employee) {
    this.employees.update((employees) => [
      ...employees.filter((item) => item._id !== employee._id),
      employee,
    ]);
    this.dialog().nativeElement.close();
    this.loadEmployees();
  }
}
