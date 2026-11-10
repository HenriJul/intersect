# Intersect — Topic 2: Cross-Object Performance Analysis (M1 Prototype)

## Start Here (Milestone 1 Review)

- **Live Deployed Prototype:** [lab-intersect.vercel.app](https://lab-intersect.vercel.app)
- **Standalone Public GitHub Repository:** [github.com/HenriJul/intersect](https://github.com/HenriJul/intersect)
- **Detailed User Guide & User Types:** [`topic-2-cross-object-performance-analysis/README.md`](topic-2-cross-object-performance-analysis/README.md)
- **Architecture Assumptions, Real-vs-Precomputed Scope & M2–M4 Roadmap:** [`topic-2-cross-object-performance-analysis/docs/NEXT_STEPS.md`](topic-2-cross-object-performance-analysis/docs/NEXT_STEPS.md)

**Intersect** is an interactive web prototype for **Topic 2: Cross-Object Performance Analysis**. It is designed for **non-technical business users** to identify, understand, and act on operational bottlenecks where multiple business objects (orders, items, packages, purchase orders, goods receipts, invoices, and staff) must synchronize at shared process steps.

---

## Who Uses Intersect & How to Use It by Role

Intersect translates multi-object process mining into plain, self-explanatory language for five types of users (see [`topic-2-cross-object-performance-analysis/README.md`](topic-2-cross-object-performance-analysis/README.md) for the full step-by-step walkthrough):

1. **Warehouse & Fulfillment Manager (*Operational Line Manager*):**
   - **Goal:** Prove whether shipping delays come from slow warehouse staff or from missing/out-of-stock items blocking package assembly.
   - **How to use:** Select **Order Management** → click **View Delay Breakdown** on `Create Package` (`3.8 days` avg wait) to see how wait time splits between **Waiting for All Items** (`2.4d`), **Waiting for Other Objects** (`0.6d`), and **Waiting for Team** (`0.8d`) → open **Case Timeline** (`Package p-660016`) to inspect a real delayed shipment.
2. **Accounts Payable & Billing Lead (*Downstream Process Owner*):**
   - **Goal:** Understand why supplier payments (`€1.42M`) or customer invoices are stalled by upstream handoffs.
   - **How to use:** Select **Procure-to-Pay** → inspect `Execute Payment` and `Perform Two-Way Match` on **Process Flow** and **Delay Breakdown** to see how split supplier deliveries (`2.5 receipts per PO`) block invoice clearance → compare delayed vs. on-time payments on **Case Timeline**.
3. **Category & Procurement Manager (*Upstream Coordinator*):**
   - **Goal:** See how upstream exceptions (`Item Out of Stock → Reorder Item` or `Delegate PR Approval`) cascade into downstream bottlenecks.
   - **How to use:** On **Process Flow**, toggle **Show Exceptions** and **Highlight Delay Chain** → review the **Upstream & Downstream Impact** chain on **Delay Breakdown** → check **Top Delay Factors** on **Compare Cases**.
4. **COO / VP of Supply Chain (*Executive Decision-Maker*):**
   - **Goal:** Decide whether to add staff capacity or fix cross-object batching/handoff rules.
   - **How to use:** Adjust the global **Delay Threshold** slider (`1.5d–7.5d`) in the top-right header → check **Team Workload** to see if shared teams are overloaded → use the **Estimate Improvement** slider on **Compare Cases** to quantify how many delayed cases and euros (`€`) return on-time.
5. **Operational Excellence Lead (*Workshop Facilitator / Analyst*):**
   - **Goal:** Guide cross-functional teams through any OCEL dataset and tailor plain-language explanations to the company's domain.
   - **How to use:** Use the **`i` (How to use this page)** button in each header during workshops, toggle **Hide / Show Descriptions** on **Delay Breakdown**, and click **Edit Explanations** to customize descriptions saved per log schema.

---

## 3-Step Local Quickstart

```bash
# 1. Enter the Topic 2 directory
cd topic-2-cross-object-performance-analysis

# 2. Launch the zero-dependency Python web + REST API server (Python 3.10+)
python3 backend/server.py

# 3. Open http://localhost:8080 in your browser and select "Order Management" or "Procure-to-Pay"
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

All three datasets are in [OCEL 2.0](https://www.ocel-standard.org/) JSON format (object-centric event log), under [`datasets/`](datasets):

- `order-management.json` — B2B order management process (`21,008 events`, `10,840 objects`, `6 object types`).
- `ocel2-p2p.json` — Procure-to-Pay process (`14,671 events`, `9,543 objects`, `7 object types`).
- `sf-fire-ems-2025-q1.jsonocel` — San Francisco Fire/EMS dispatch data for Q1 2025 (used by topic 3).

## Running Automated Verification

From the repository root:

```bash
node topic-2-cross-object-performance-analysis/tests/smoke_test.mjs
```
