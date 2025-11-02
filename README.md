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

1. Ensure you are using Python 3.10 or newer and install dependencies (ideally in a
   fresh virtual environment so the latest dependency pins are applied):

   ```bash
   pip install -r requirements.txt
   ```

   > **Upgrading from an earlier checkout?** If you created a virtual environment
   > before pulling the latest changes, delete the old `.venv` folder (or run
   > `pip uninstall fastapi pydantic`), then recreate the environment and reinstall
   > dependencies so FastAPI pulls in Pydantic v2.

2. Launch the API server:

   ```bash
   uvicorn cointracker.main:app --reload
   ```

3. Open the interactive docs at http://127.0.0.1:8000/docs to exercise the endpoints.

### Windows quickstart

```powershell
# From a PowerShell prompt in the repository root
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn cointracker.main:app --reload
```

Press `Ctrl+C` to stop the server. Run `deactivate` to exit the virtual environment.

## Running Tests

```bash
pytest
```
