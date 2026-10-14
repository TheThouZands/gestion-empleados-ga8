import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';
import { createEmployeeModel, employeeView } from '../src/models/employee.js';
import { employeeIdSchema, employeeInputSchema } from '../src/validation/employee-input.js';

const input = { name: 'Persona de prueba', position: 'Analista', office: 'Cali', salary: 19.99 };

test('input validation trims the three text fields', () => {
  const result = employeeInputSchema.parse({ ...input, name: '  Persona de prueba  ' });
  assert.deepEqual(result, input);
});

for (const field of ['name', 'position', 'office']) {
  test(`input validation rejects a blank ${field}`, () => {
    assert.equal(employeeInputSchema.safeParse({ ...input, [field]: '   ' }).success, false);
  });
  test(`input validation rejects ${field} longer than 120 characters`, () => {
    assert.equal(
      employeeInputSchema.safeParse({ ...input, [field]: 'x'.repeat(121) }).success,
      false,
    );
  });
}

for (const salary of [-1, 1.234, Infinity, NaN, '3000', 1_000_000_001]) {
  test(`input validation rejects salary ${String(salary)}`, () => {
    assert.equal(employeeInputSchema.safeParse({ ...input, salary }).success, false);
  });
}

test('input validation accepts an explicitly entered zero salary', () => {
  assert.equal(employeeInputSchema.safeParse({ ...input, salary: 0 }).success, true);
});

test('input validation rejects missing properties and properties outside the contract', () => {
  assert.equal(employeeInputSchema.safeParse({ ...input, _id: 'spoofed' }).success, false);
  const withoutSalary = { ...input };
  delete withoutSalary.salary;
  assert.equal(employeeInputSchema.safeParse(withoutSalary).success, false);
});

test('identifier validation accepts ObjectId strings but not query objects or malformed strings', () => {
  assert.equal(employeeIdSchema.safeParse('507f1f77bcf86cd799439011').success, true);
  for (const value of ['bad-id', '', { $ne: null }, 'x'.repeat(24)]) {
    assert.equal(employeeIdSchema.safeParse(value).success, false);
  }
});

test('Mongoose applies the same field constraints before storage', async () => {
  const connection = mongoose.createConnection();
  try {
    const Employee = createEmployeeModel(connection);
    await new Employee(input).validate();
    await assert.rejects(new Employee({ ...input, name: ' ' }).validate());
    await assert.rejects(new Employee({ ...input, salary: -1 }).validate());
    await assert.rejects(new Employee({ ...input, salary: 1.234 }).validate());
  } finally {
    await connection.close();
  }
});

test('the public employee view exposes only the exercise fields and its identifier', () => {
  assert.deepEqual(
    employeeView({
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      ...input,
      createdAt: new Date(),
    }),
    { _id: '507f1f77bcf86cd799439011', ...input },
  );
});
