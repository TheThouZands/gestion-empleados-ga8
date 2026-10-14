import { createApp } from './app.js';
import { readConfig } from './config.js';
import { connectDatabase } from './database.js';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createEmployeeModel } from './models/employee.js';
import { MongoEmployeeRepository } from './repositories/mongo-employee-repository.js';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(envPath)) loadEnvFile(envPath);
const config = readConfig();
const connection = await connectDatabase(config.mongoUri);
const repository = new MongoEmployeeRepository(createEmployeeModel(connection));
const buildPath = fileURLToPath(new URL('../../frontend/dist/frontend/browser/', import.meta.url));
const frontendPath = existsSync(buildPath + 'index.html') ? buildPath : undefined;
const server = createApp({ repository, config, frontendPath }).listen(
  config.port,
  '127.0.0.1',
  () => {
    console.log(`Aplicación disponible en http://127.0.0.1:${config.port}`);
  },
);

let closing = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    if (closing) return;
    closing = true;
    server.close(async () => {
      await connection.close();
      process.exitCode = 0;
    });
  });
}
