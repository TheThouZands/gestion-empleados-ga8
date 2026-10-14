import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAdd, matClose } from '@ng-icons/material-icons/baseline';
import { Employee } from './employees/employee';
import { EmployeeForm } from './employees/employee-form.component';

@Component({
  imports: [EmployeeForm, CurrencyPipe, NgIcon],
  providers: [provideIcons({ matAdd, matClose })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class App {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('registrationDialog');
  private readonly employeeForm = viewChild.required(EmployeeForm);
  readonly lastEmployee = signal<Employee | null>(null);

  openRegistration() {
    this.employeeForm().clear();
    this.dialog().nativeElement.showModal();
  }

  closeRegistration(event?: Event) {
    event?.preventDefault();
    if (!this.employeeForm().busy()) this.dialog().nativeElement.close();
  }

  onSaved(employee: Employee) {
    this.lastEmployee.set(employee);
    this.dialog().nativeElement.close();
  }
}
