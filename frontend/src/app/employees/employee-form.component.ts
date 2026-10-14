import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { EmployeeService } from './employee.service';

const nonBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim().length > 0 ? null : { required: true };

const validSalary: ValidatorFn = (control) => {
  const value = control.value;
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.abs(value * 100 - Math.round(value * 100)) < 0.00001
    ? null
    : { salary: true };
};

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeForm {
  private readonly service = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly notice = signal('');
  readonly failed = signal(false);
  readonly savedId = signal('');
  readonly fields = [
    { name: 'name', label: 'Nombre', autocomplete: 'name', placeholder: 'Nombre completo' },
    {
      name: 'position',
      label: 'Cargo',
      autocomplete: 'organization-title',
      placeholder: 'Cargo del empleado',
    },
    { name: 'office', label: 'Oficina', autocomplete: 'off', placeholder: 'Oficina o sede' },
  ] as const;
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank, Validators.maxLength(120)],
    }),
    position: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank, Validators.maxLength(120)],
    }),
    office: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank, Validators.maxLength(120)],
    }),
    salary: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(1000000000),
      validSalary,
    ]),
  });

  save() {
    if (this.busy()) return;
    this.notice.set('');
    this.savedId.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.failed.set(true);
      this.notice.set('Revise los campos indicados antes de guardar.');
      return;
    }
    const values = this.form.getRawValue();
    if (values.salary === null) return;
    this.busy.set(true);
    this.failed.set(false);
    this.service
      .create({
        name: values.name.trim(),
        position: values.position.trim(),
        office: values.office.trim(),
        salary: values.salary,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.form.reset();
          this.savedId.set(result.empleado._id);
          this.notice.set('Empleado guardado. Puede registrar otro empleado.');
        },
        error: (error: HttpErrorResponse) => {
          this.failed.set(true);
          this.notice.set(
            error.status === 422
              ? 'El servidor rechazó los datos. Revise los campos e intente de nuevo.'
              : 'No se pudo guardar el empleado. Sus datos siguen en el formulario. Intente de nuevo.',
          );
        },
      });
  }

  clear() {
    if (this.busy()) return;
    this.form.reset();
    this.notice.set('');
    this.savedId.set('');
    this.failed.set(false);
  }
}
