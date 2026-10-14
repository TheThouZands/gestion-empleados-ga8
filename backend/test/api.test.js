import assert from 'node:assert/strict';
import { once } from 'node:events';
import { before, after, test } from 'node:test';
import { createApp } from '../src/app.js';

const id = '507f1f77bcf86cd799439011';
const input = { name: 'Persona API', position: 'Analista', office: 'Cali', salary: 3000 };
const records = new Map();
const repository = {
  list: async () => [...records.values()],
  find: async (key) => records.get(key) || null,
  create: async (value) => {
    const employee = { _id: id, ...value };
    records.set(id, employee);
    return employee;
  },
  update: async (key, value) => {
    if (!records.has(key)) return null;
    const employee = { _id: key, ...value };
    records.set(key, employee);
    return employee;
  },
  delete: async (key) => {
    const value = records.get(key);
    records.delete(key);
    return value || null;
  },
};
let server;
let base;
before(async () => {
  server = createApp({ repository }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => new Promise((resolve) => server.close(resolve)));

const request = (path, method = 'GET', body, headers = {}) =>
  fetch(base + path, {
    method,
    headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

test('GET lists employees without cache', async () => {
  const response = await request('/api/empleados');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), []);
});
test('POST creates a valid employee and returns its location and data', async () => {
  const response = await request('/api/empleados', 'POST', input);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('location'), `/api/empleados/${id}`);
  assert.deepEqual((await response.json()).empleado, { _id: id, ...input });
});
test('GET reads the requested employee', async () => {
  const response = await request(`/api/empleados/${id}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).name, input.name);
});
test('PUT validates and updates all exercise fields', async () => {
  const response = await request(`/api/empleados/${id}`, 'PUT', { ...input, office: 'Bogotá' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).empleado.office, 'Bogotá');
});
test('POST rejects invalid fields without adding a record', async () => {
  const response = await request('/api/empleados', 'POST', { ...input, salary: -1 });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error.code, 'invalid_employee');
  assert.equal(records.size, 1);
});
test('PUT rejects additional properties and leaves the employee unchanged', async () => {
  const response = await request(`/api/empleados/${id}`, 'PUT', { ...input, role: 'admin' });
  assert.equal(response.status, 422);
  assert.equal(records.get(id).office, 'Bogotá');
});
test('requests reject malformed employee identifiers', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const response = await request(
      '/api/empleados/not-an-id',
      method,
      method === 'PUT' ? input : undefined,
    );
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'invalid_id');
  }
});
test('requests report a missing employee instead of a false success', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const response = await request(
      '/api/empleados/000000000000000000000000',
      method,
      method === 'PUT' ? input : undefined,
    );
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, 'employee_not_found');
  }
});
test('DELETE removes the employee', async () => {
  const response = await request(`/api/empleados/${id}`, 'DELETE');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'Empleado eliminado');
  assert.equal(records.size, 0);
});
test('unknown routes return a JSON error', async () => {
  const response = await request('/api/unknown');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'route_not_found');
});
test('mutations require the JSON media type', async () => {
  const response = await request('/api/empleados', 'POST', input, { 'Content-Type': 'text/plain' });
  assert.equal(response.status, 415);
});
test('malformed JSON has a controlled response', async () => {
  const response = await fetch(base + '/api/empleados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'invalid_json');
});
test('oversized JSON is rejected before it reaches the employee service', async () => {
  const response = await request('/api/empleados', 'POST', { ...input, name: 'x'.repeat(17000) });
  assert.equal(response.status, 413);
});
test('unapproved browser origins are rejected', async () => {
  const response = await request('/api/empleados', 'POST', input, {
    Origin: 'https://example.invalid',
  });
  assert.equal(response.status, 403);
  assert.equal(records.size, 0);
});
test('the configured local frontend can call the API', async () => {
  const response = await request('/api/empleados', 'GET', undefined, {
    Origin: 'http://127.0.0.1:4210',
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:4210');
});
