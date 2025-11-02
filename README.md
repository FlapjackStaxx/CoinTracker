# CoinTracker

CoinTracker now ships with a lightweight Node.js + Express backend that powers the prototype
for scanning and cataloging a foreign coin and banknote collection. The
[`docs/app_design.md`](docs/app_design.md) document still captures the long-term product
vision, while this repository provides a working REST API you can run locally.

## Features

- ✅ Express REST API with CRUD, export, and recognition endpoints for your collection.
- ✅ JSON persistence powered by [lowdb](https://github.com/typicode/lowdb) so the project runs without native build tools.
- ✅ Deterministic recognition stub so you can prototype camera-driven workflows.
- ✅ Vitest + Supertest coverage that exercises the health check, CRUD lifecycle, and
  recognition placeholder.

## Prerequisites

- [Node.js 18+](https://nodejs.org/) (the LTS release works great on Windows, macOS, and Linux).
- npm (installed with Node). Yarn or pnpm will also work if you prefer an alternative package
  manager.

## Setup & Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the API server:

   ```bash
   npm start
   ```

   The service listens on [`http://127.0.0.1:8000`](http://127.0.0.1:8000) by default. Pass
   `PORT=9000` (or any other port) when launching to override.

3. Explore the endpoints with your favorite HTTP client. Useful routes:

   - `GET /health` – quick health probe.
   - `GET /items` – list your collection.
   - `POST /items` – create a new entry (name, country, and denomination are required).
   - `PATCH /items/{id}` – update an item.
   - `DELETE /items/{id}` – remove an item when it leaves your collection.
   - `GET /items/{id}/export` – fetch a shareable summary payload.
   - `POST /recognize` – prototype vision endpoint that returns deterministic sample data.

   Records are stored in `cointracker.json` in the repository root. Delete the file at any time to
   start fresh.

### Windows quickstart

```powershell
# From a PowerShell prompt in the repository root
npm install
npm start
```

Use `Ctrl+C` to stop the server.

## Running Tests

```bash
npm test
```

Vitest spins up the Express app against an in-memory lowdb adapter so the suite runs quickly
without touching your real data file.
