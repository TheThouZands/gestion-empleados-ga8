export interface EmployeeInput {
  name: string;
  position: string;
  office: string;
  salary: number;
}

export interface Employee extends EmployeeInput {
  _id: string;
}

export interface EmployeeResult {
  status: string;
  empleado: Employee;
}
