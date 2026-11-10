# Intersect — Topic 2: Cross-Object Performance Analysis (M1 Prototype)

## Start Here (Milestone 1 Review)

- **Live Deployed Prototype:** [lab-intersect.vercel.app](https://lab-intersect.vercel.app)
- **Standalone Public GitHub Repository:** [github.com/HenriJul/intersect](https://github.com/HenriJul/intersect)
- **Topic 2 User Guide:** [`topic-2-cross-object-performance-analysis/README.md`](topic-2-cross-object-performance-analysis/README.md)
- **Assumptions, Real-vs-Simulated Matrix & M2–M4 Roadmap:** [`topic-2-cross-object-performance-analysis/docs/NEXT_STEPS.md`](topic-2-cross-object-performance-analysis/docs/NEXT_STEPS.md)

### 3-Step Local Quickstart

```bash
# 1. Enter the Topic 2 directory
cd topic-2-cross-object-performance-analysis

# 2. Launch the zero-dependency Python web + REST API server (Python 3.10+)
python3 backend/server.py

# 3. Open http://localhost:8080 in your browser and start with "Scenario 1: Order Management"
```

> **Prerequisites & Troubleshooting:**
> - **Python Version:** Python `3.10+` (`pandas >= 2.0` optional if querying `/api/v1/logs`; static UI requires zero external packages).
> - **Port Conflict:** If port `8080` is already in use, pass any custom port: `python3 backend/server.py 8081`.
> - **Do Not Open via `file://`:** Because the frontend uses native ES modules (`<script type="module">`), opening `frontend/index.html` directly from the filesystem (`file://`) is blocked by browser CORS policy. Always use [lab-intersect.vercel.app](https://lab-intersect.vercel.app), `python3 backend/server.py`, or `python3 -m http.server 3000 --directory frontend`.

---

## Repository Structure

```
datasets/                                    OCEL 2.0 JSON datasets (order-management.json, ocel2-p2p.json)
ocel_common/ocel_loader.py                   shared OCEL 2.0 loading helper
topic-2-cross-object-performance-analysis/   Intersect M1 Prototype (frontend/ + backend/ + docs/ + tests/)
topic-1-streaming-events/                    starter folder for topic 1
topic-3-geo-process-exploration/             starter folder for topic 3
```

## Datasets

All three datasets are in [OCEL 2.0](https://www.ocel-standard.org/) JSON
format (object-centric event log), under [`datasets/`](datasets):

- `order-management.json` — B2B order management process (`21,008 events`, `10,840 objects`, `6 object types`). **Recommended starting dataset for Intersect.**
- `ocel2-p2p.json` — Procure-to-Pay process (`14,671 events`, `9,543 objects`, `7 object types`).
- `sf-fire-ems-2025-q1.jsonocel` — San Francisco Fire/EMS dispatch data for Q1 2025 (used by topic 3).

## Running Automated Verification

From the repository root:

```bash
node topic-2-cross-object-performance-analysis/tests/smoke_test.mjs
```
