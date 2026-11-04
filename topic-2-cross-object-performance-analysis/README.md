# Topic 2: Cross-Object Performance Analysis — Intersect (M1 Prototype)

Minimalist, white-background web frontend prototype separated from a Python REST API backend (`order-management.json` & `ocel2-p2p.json`).

## Quickstart

From `software-lab/topic-2-cross-object-performance-analysis/`:

```bash
# Option 1: Launch Frontend WebApp + Separated Python REST API Stub
python3 backend/server.py
# -> Open http://localhost:8080

# Option 2: Run the Frontend WebApp standalone as static files
python3 -m http.server 3000 --directory frontend
# -> Open http://localhost:3000
```

## Architecture

- **`frontend/`** — Pure client-side web application (white canvas + left sidebar navigation):
  1. **Overview:** Summary KPIs and Top 3 bottlenecks.
  2. **Process Flow:** Full-width multi-object flow diagram (`Show Exceptions`, `Highlight Delay Chain`).
  3. **Delay Breakdown:** Split between *Waiting for All Items*, *Waiting for Other Objects*, and *Waiting for Team*, plus slowest incoming objects and upstream/downstream impact.
  4. **Team Workload:** Shared team workload split and waiting-cases timeline.
  5. **Compare Cases:** On-time vs. delayed factor comparison and delay-reduction estimator.
  6. **Case Timeline:** Individual multi-object timelines (*Delayed Example* vs. *On-Time Example*).
- **`backend/`** — Decoupled Python REST API service (`/api/v1/*`) inspecting OCEL 2.0 logs via `ocel_common/ocel_loader.py`.
