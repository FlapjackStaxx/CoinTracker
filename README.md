# CoinTracker

CoinTracker combines a working FastAPI backend with a detailed product design for a mobile
app that scans and catalogs a foreign coin and banknote collection. See
[`docs/app_design.md`](docs/app_design.md) for the conceptual plan.

## Features

- ✅ REST API for CRUD management of collection items (create, read, update, delete, export).
- ✅ Prototype recognition endpoint that returns deterministic placeholder suggestions for images.
- ✅ SQLite persistence with SQLAlchemy and Pydantic validation.
- ✅ Automated test coverage for health check, CRUD flow, and recognition placeholder.

## Getting Started

1. Install dependencies (ideally in a virtual environment):

   ```bash
   pip install -r requirements.txt
   ```

2. Launch the API server:

   ```bash
   uvicorn cointracker.main:app --reload
   ```

3. Open the interactive docs at http://127.0.0.1:8000/docs to exercise the endpoints.

## Running Tests

```bash
pytest
```
