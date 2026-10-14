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
import { matAdd, matClose, matDeleteOutline } from '@ng-icons/material-icons/baseline';
import { Employee } from './employees/employee';
import { EmployeeForm } from './employees/employee-form.component';
import { EmployeeService } from './employees/employee.service';
import { MaterialToastService } from './material-toast.service';

@Component({
  imports: [EmployeeForm, DecimalPipe, NgIcon],
  providers: [provideIcons({ matAdd, matClose, matDeleteOutline })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class App {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('registrationDialog');
  private readonly employeeForm = viewChild.required(EmployeeForm);
  private readonly deletionDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('deletionDialog');
  private readonly service = inject(EmployeeService);
  private readonly toast = inject(MaterialToastService);
  private readonly destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(false);
  readonly listError = signal('');
  readonly pendingDeletion = signal<Employee | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

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
    this.toast.show('Empleado guardado.');
    this.loadEmployees();
  }

  askDeletion(employee: Employee) {
    if (this.deleting()) return;
    this.pendingDeletion.set(employee);
    this.deleteError.set('');
    this.deletionDialog().nativeElement.showModal();
  }

  cancelDeletion(event?: Event) {
    event?.preventDefault();
    if (this.deleting()) return;
    this.deletionDialog().nativeElement.close();
    this.pendingDeletion.set(null);
    this.deleteError.set('');
  }

  confirmDeletion() {
    const employee = this.pendingDeletion();
    if (!employee || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.service
      .remove(employee._id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(false)),
      )
      .subscribe({
        next: () => this.finishDeletion(employee._id),
        error: (error) => {
          if (error.status === 404) this.finishDeletion(employee._id, true);
          else this.deleteError.set('No se pudo eliminar el registro. Intente de nuevo.');
        },
      });
  }

  private finishDeletion(id: string, alreadyAbsent = false) {
    this.employees.update((employees) => employees.filter((employee) => employee._id !== id));
    this.deletionDialog().nativeElement.close();
    this.pendingDeletion.set(null);
    this.toast.show(alreadyAbsent ? 'El registro ya no existe.' : 'Empleado eliminado.');
    this.loadEmployees();
  }
}
