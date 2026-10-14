import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { connectDatabase } from '../src/database.js';
import { createEmployeeModel } from '../src/models/employee.js';
import { MongoEmployeeRepository } from '../src/repositories/mongo-employee-repository.js';
import { createApp } from '../src/app.js';
import { once } from 'node:events';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const testsRoot = resolve(projectRoot, '.local/tests');

test(
  'MongoDB CRUD persists a record across a complete database restart',
  { timeout: 240000 },
  async () => {
    await mkdir(testsRoot, { recursive: true });
    const dataPath = await mkdtemp(resolve(testsRoot, 'storage-'));
    assert.ok(resolve(dataPath).startsWith(testsRoot + sep));
    const database = new MongoMemoryServer({
      binary: { version: '8.2.6', downloadDir: resolve(projectRoot, '.local/mongo-binaries') },
      instance: { dbPath: dataPath, storageEngine: 'wiredTiger' },
    });
    let connection;
    try {
      await database.start();
      connection = await connectDatabase(database.getUri('gestion_empleados_test'));
      let repository = new MongoEmployeeRepository(createEmployeeModel(connection));
      const created = await repository.create({
        name: 'Persona local',
        position: 'Analista',
        office: 'Cali',
        salary: 19.99,
      });
      assert.match(created._id, /^[a-f\d]{24}$/);
      assert.deepEqual(await repository.list(), [created]);
      assert.deepEqual(await repository.find(created._id), created);
      const edited = await repository.update(created._id, {
        name: 'Persona editada',
        position: 'Analista',
        office: 'Bogotá',
        salary: 3000,
      });
      assert.equal(edited.office, 'Bogotá');
      await assert.rejects(
        repository.update(created._id, {
          name: 'Persona editada',
          position: 'Analista',
          office: 'Bogotá',
          salary: -1,
        }),
      );
      assert.deepEqual(await repository.find(created._id), edited);
      await connection.close();
      connection = undefined;
      await database.stop({ doCleanup: false, force: false });
      await database.start();
      connection = await connectDatabase(database.getUri('gestion_empleados_test'));
      repository = new MongoEmployeeRepository(createEmployeeModel(connection));
      assert.deepEqual(await repository.find(created._id), edited);
      assert.deepEqual(await repository.delete(created._id), edited);
      assert.equal(await repository.find(created._id), null);
      assert.equal(
        await repository.update(created._id, {
          name: 'Persona local',
          position: 'Analista',
          office: 'Cali',
          salary: 0,
        }),
        null,
      );
      assert.equal(await repository.delete(created._id), null);

      const server = createApp({ repository }).listen(0, '127.0.0.1');
      await once(server, 'listening');
      const url = `http://127.0.0.1:${server.address().port}/api/empleados`;
      const input = { name: 'Persona HTTP', position: 'Analista', office: 'Cali', salary: 19.99 };
      const options = (method, body) => ({
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      try {
        const response = await fetch(url, options('POST', input));
        assert.equal(response.status, 201);
        const saved = (await response.json()).empleado;
        assert.deepEqual(await repository.find(saved._id), saved);
        assert.deepEqual(await (await fetch(url)).json(), [saved]);
        assert.deepEqual(await (await fetch(`${url}/${saved._id}`)).json(), saved);
        const update = await fetch(
          `${url}/${saved._id}`,
          options('PUT', { ...input, office: 'Bogotá' }),
        );
        assert.equal(update.status, 200);
        assert.equal((await update.json()).empleado.office, 'Bogotá');
        assert.equal((await repository.find(saved._id)).office, 'Bogotá');
        const invalid = await fetch(url, options('POST', { ...input, salary: -1 }));
        assert.equal(invalid.status, 422);
        assert.equal((await repository.list()).length, 1);
        assert.equal((await fetch(`${url}/${saved._id}`, { method: 'DELETE' })).status, 200);
        assert.equal(await repository.find(saved._id), null);
        assert.equal((await fetch(`${url}/${saved._id}`)).status, 404);
      } finally {
        await new Promise((done) => server.close(done));
      }
    } finally {
      if (connection) await connection.close();
      await database.stop({ doCleanup: false, force: false });
      // The target is the unique test directory created above, never the development store.
      assert.ok(resolve(dataPath).startsWith(testsRoot + sep));
      await rm(dataPath, { recursive: true, force: true });
    }
  },
);
