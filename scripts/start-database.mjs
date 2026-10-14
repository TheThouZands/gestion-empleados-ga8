import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

const root = new URL('../', import.meta.url);
const dataPath = fileURLToPath(new URL('.local/mongodb', root));
await mkdir(dataPath, { recursive: true });

// This is a real MongoDB process with WiredTiger disk storage, not a mocked database.
const database = new MongoMemoryServer({
  binary: {
    version: '8.2.6',
    downloadDir: fileURLToPath(new URL('.local/mongo-binaries', root)),
  },
  instance: { port: 27108, ip: '127.0.0.1', dbPath: dataPath, storageEngine: 'wiredTiger' },
});
await database.start(true);
console.log('MongoDB disponible en mongodb://127.0.0.1:27108/gestion_empleados_dev');
console.log('Los datos se conservan en .local/mongodb después de cerrar el proceso.');

let closing = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    if (closing) return;
    closing = true;
    await database.stop({ doCleanup: false, force: false });
    process.exitCode = 0;
  });
}
