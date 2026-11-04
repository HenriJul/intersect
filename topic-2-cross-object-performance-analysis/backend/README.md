# Python Backend (`backend/`) — Decoupled OCEL 2.0 Analytics Service

This directory houses the Python backend, strictly separated from the web frontend (`../frontend/`).

## Planned Full-Version Architecture (Sprints 1 & 2)

In the production implementation, the Python backend ingests **any valid OCEL 2.0 log** (`.json`, `.jsonocel`, `.sqlite`) via [`ocel_common/ocel_loader.py`](../../ocel_common/ocel_loader.py) and computes:

1. **Automated Multi-Object Intersection Discovery:** Identifies activities where `>= 2` distinct object types (or pooled object instances) converge.
2. **OPerA Timing Decomposition:** Computes *Synchronization Time* (`Counterpart Wait`), *Pooling Time* (`Bundle Completion Wait`), *Lagging Object Attribution* (`Primary Blocker`), and *Post-Sync Resource Queue Time* (`Team Queue`).
3. **Statistical Cohort & Rule Mining:** Segments primary business clusters into Healthy vs. Delayed cohorts and filters root-cause drivers by statistical significance and effect size.

## REST Endpoints (`api_contract.py` & `server.py`)

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Backend health & capability check |
| `GET` | `/api/v1/logs` | Lists available OCEL 2.0 logs & live structural counts |
| `POST` | `/api/v1/logs/upload` | *(M3/M4)* Generic OCEL 2.0 file upload & schema auto-discovery |
| `GET` | `/api/v1/logs/{log_id}` | Structural metadata & analytics payload for selected OCEL log |
