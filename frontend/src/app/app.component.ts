import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmployeeForm } from './employees/employee-form.component';

@Component({
  imports: [EmployeeForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class App {}
