import mongoose from 'mongoose';

export const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    position: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    office: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    salary: {
      type: Number,
      required: true,
      min: 0,
      max: 1_000_000_000,
      validate: {
        validator: (value) =>
          Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 0.00001,
        message: 'El salario debe tener como máximo dos decimales.',
      },
    },
  },
  { collection: 'empleados', timestamps: true, versionKey: false, strict: 'throw' },
);

export function createEmployeeModel(connection) {
  return connection.models.Empleado || connection.model('Empleado', employeeSchema);
}

export function employeeView(document) {
  return {
    _id: String(document._id),
    name: document.name,
    position: document.position,
    office: document.office,
    salary: document.salary,
  };
}
