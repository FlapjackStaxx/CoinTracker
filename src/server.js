import { createApp } from './app.js';
import { createDatabase } from './db.js';

const port = Number.parseInt(process.env.PORT ?? '8000', 10);
const db = createDatabase();
const app = createApp(db);

const server = app.listen(port, () => {
  console.log(`CoinTracker API listening on port ${port}`);
});

function shutdown() {
  console.log('Shutting down CoinTracker API');
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
