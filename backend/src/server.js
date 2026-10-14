import { createApp } from './app.js';

const port = Number(process.env.PORT || 3210);
const server = createApp().listen(port, '127.0.0.1', () => {
  console.log(`API disponible en http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close());
}
