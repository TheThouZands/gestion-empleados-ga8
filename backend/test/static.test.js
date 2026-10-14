import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

test('serves a compiled frontend without replacing unknown API routes', async () => {
  const root = resolve(tmpdir());
  const frontendPath = await mkdtemp(resolve(root, 'ga8-static-'));
  assert.ok(frontendPath.startsWith(root + sep));
  const html = '<!doctype html><html lang="es"><title>Registro</title></html>';
  await writeFile(resolve(frontendPath, 'index.html'), html);
  const server = createApp({ frontendPath }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(await response.text(), html);
    const missing = await fetch(url + '/api/not-a-route');
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'route_not_found');
  } finally {
    await new Promise((done) => server.close(done));
    assert.ok(frontendPath.startsWith(root + sep));
    await rm(frontendPath, { recursive: true, force: true });
  }
});
