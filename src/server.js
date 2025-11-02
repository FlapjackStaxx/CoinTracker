import { createApp } from './app.js';
import { createDatabase } from './db.js';

const port = Number.parseInt(process.env.PORT ?? '8000', 10);

async function start() {
  try {
    const db = await createDatabase();
    const app = createApp(db);

    const server = app.listen(port, () => {
      console.log(`CoinTracker API listening on port ${port}`);
    });

    const shutdown = () => {
      console.log('Shutting down CoinTracker API');
      server.close(async () => {
        try {
          await db.write();
        } catch (error) {
          console.error('Failed to flush database to disk', error);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Unable to start CoinTracker API', error);
    process.exit(1);
  }
}

start();
