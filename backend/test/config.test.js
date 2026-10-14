import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readConfig } from '../src/config.js';

test('the default configuration selects only the local exercise services', () => {
  assert.deepEqual(readConfig({}), {
    port: 3210,
    mongoUri: 'mongodb://127.0.0.1:27108/gestion_empleados_dev',
    clientOrigin: 'http://127.0.0.1:4210',
  });
});

test('configuration accepts explicit local development settings', () => {
  assert.equal(readConfig({ PORT: '3211' }).port, 3211);
  assert.equal(
    readConfig({ MONGODB_URI: 'mongodb://localhost:27017/otra_prueba' }).mongoUri,
    'mongodb://localhost:27017/otra_prueba',
  );
});

test('configuration rejects invalid ports and remote or malformed database addresses', () => {
  for (const environment of [
    { PORT: '-1' },
    { PORT: 'abc' },
    { PORT: '70000' },
    { MONGODB_URI: 'mongodb://remote.example:27017/produccion' },
    { MONGODB_URI: 'mongodb://127.0.0.1:27108/' },
    { CLIENT_ORIGIN: 'https://remote.example' },
  ]) {
    assert.throws(() => readConfig(environment));
  }
});
