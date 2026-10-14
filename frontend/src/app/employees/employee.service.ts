import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Employee, EmployeeInput, EmployeeResult } from './employee';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/empleados';

  list() {
    return this.http.get<Employee[]>(this.url);
  }

  find(id: string) {
    return this.http.get<Employee>(`${this.url}/${encodeURIComponent(id)}`);
  }

  create(employee: EmployeeInput) {
    return this.http.post<EmployeeResult>(this.url, employee);
  }

  update(id: string, employee: EmployeeInput) {
    return this.http.put<EmployeeResult>(`${this.url}/${encodeURIComponent(id)}`, employee);
  }

  remove(id: string) {
    return this.http.delete<{ status: string }>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
