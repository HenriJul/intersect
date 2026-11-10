# Intersect — Architecture Assumptions, M1 Scope & M2–M4 Roadmap

This document specifies **what is live vs. precomputed in Milestone 1**, the **formal OPerA & statistical assumptions**, **remaining technical uncertainties**, our **prioritized Milestone 2–4 engineering roadmap with measurable exit criteria**, and our **validation plan**.

---

## 1. What Is Real vs. Precomputed / Simulated in M1

| Component / Feature | M1 Status | How It Works Today | Target Milestone for Live Generic Computation |
|---|---|---|---|
| **OCEL 2.0 Structural Ingestion (`/api/v1/logs`)** | **Live (Python)** | `backend/server.py` uses `ocel_common/ocel_loader.py` to parse `datasets/order-management.json` (21,008 events, 10,840 objects) and `datasets/ocel2-p2p.json` (14,671 events, 9,543 objects) and serialize `LogSummaryDTO` (`backend/api_contract.py`). | **M1 (Done)** |
| **Global Delay Threshold Cohort Counts (`1.5d–7.5d`)** | **Real Empirical Cohorts (JS)** | `frontend/src/data/empiricalCohortData.js` embeds the exact sorted per-event wait distributions extracted from `order-management.json` ($n = 1,106$ multi-item package pools) and `ocel2-p2p.json` ($n = 1,166$ payment executions) and evaluates `wait > slaDays` directly. | **M2** (computed dynamically in Python for any uploaded OCEL) |
| **OPerA Wait Decomposition (`Delay Breakdown`)** | **Precomputed from Real OCELs** | Pooling, lagging, and post-synchronization queue metrics (`2.4d + 0.6d = 3.0d` sync + `0.8d` queue on `Create Package`; `0.85d + 1.65d = 2.5d` sync + `2.8d` queue on `Execute Payment`) were computed offline from the two datasets and stored in `demoPayloads.js`. | **M2** |
| **Statistical Significance Layer (`Compare Cases`)** | **Precomputed Non-Parametric Tests** | Sample sizes ($n$), 95% bootstrap confidence intervals (1,000 resamples), Cliff's $\delta$ effect sizes, and Benjamini–Hochberg FDR-corrected Mann–Whitney U $p$-values were computed offline on the two OCEL logs. | **M2** |
| **What-If Scenario Simulator (`Compare Cases`)** | **Empirical CDF Shift** | Evaluates how many delayed events ($w > \text{threshold}$) in `EMPIRICAL_EVENT_WAITS` drop to $w \cdot (1 - r \cdot s) \le \text{threshold}$ under reduction $r$ of primary blocker share $s$. | **M3** (stratified cohort counterfactual engine) |
| **Case Timeline Swimlanes (`Case Timeline`)** | **Real OCEL 2.0 Instances** | Uses verified object IDs, timestamps, and actors (`Package p-660016`, `Package p-660007`, `Payment payment:807`, `Payment payment:6`) from the JSON logs. | **M2** (search & select any case ID from log) |
| **Schema-Matched Explanations (`schemaTexts.js`)** | **Live in `localStorage`** | Keyed on the canonical OCEL 2.0 schema signature (`ocelObjectTypes` + `ocelEventTypes`) and persisted across sessions. | **M3** (persisted in backend SQLite / JSON store) |
| **File Upload (`POST /api/v1/logs/upload`)** | **Prototype Stub** | Accepts `.json`/`.jsonocel`/`.sqlite` files, displays a confirmation banner, and maps to the two reference datasets for M1 review. | **M3** |

---

## 2. Methodological & Data Assumptions

1. **OPerA Synchronization Decomposition ([Park et al., 2022](https://ar5iv.labs.arxiv.org/html/2204.10662)):**
   - For a shared convergence event $e$ and each participating prerequisite object $o \in O(e)$, let $a(o)$ denote the completion timestamp of $o$'s immediately preceding event.
   - **Pooling Time ($\text{pool}_{\tau}(e)$):** $\max_{o \in O_{\tau}(e)} a(o) - \min_{o \in O_{\tau}(e)} a(o)$ across multiple instances of the same object type $\tau$ (e.g., the ~6.8 `items` bundled into one `package`).
   - **Lagging Time ($\text{lag}(e)$):** Additional cross-type arrival gap between distinct prerequisite object types.
   - **Synchronization Time ($\text{sync}(e)$):** $\max_{o \in O_{\text{prereq}}(e)} a(o) - \min_{o \in O_{\text{prereq}}(e)} a(o) = \text{pool}(e) + \text{lag}(e)$.
   - **Post-Synchronization Queue Time ($\text{queue}(e)$):** $t(e) - \max_{o \in O_{\text{prereq}}(e)} a(o)$, capturing resource/team contention after all prerequisite objects are ready.
2. **Completion-Only Timestamps (Service Time $\approx 0$):**
   - Both `order-management.json` and `ocel2-p2p.json` record single atomic timestamps per event (no separate `start` / `complete` lifecycle transitions). We therefore assume activity execution time is negligible relative to multi-day inter-event waiting times ($\text{sojourn time} \approx \text{waiting time}$).
3. **Event-Level Aggregation (Preventing Convergence Inflation):**
   - Because `create package` touches 14.5 objects on average (1 package, ~6.8 items, orders, products, employees, customer), computing averages per object would inflate the same wall-clock wait ~14×. All gate wait distributions and cohort counts are aggregated **once per convergence event instance** ($n = 1,106$ multi-item packages; $n = 1,166$ payments).
4. **Prerequisite vs. Context / Master Object Filtering:**
   - Static catalog and master objects (`products` and `customers` in Order Management; `material` catalog entries in P2P) do not undergo predecessor flow activities prior to every gate. They are filtered via E2O relationship qualifiers so they do not introduce artificial synchronization spans.
5. **Composite Bottleneck Ranking Score:**
   - Overview ranks shared steps by a **Composite Business Impact Score** combining total object-wait days ($\text{mean wait} \times \text{event volume}$) and downstream rework/dunning amplification, while providing a one-click toggle to sort strictly by **Raw Average Wait Time**.

---

## 3. Remaining Technical Uncertainties & Risks

1. **Resource / Team Inference on Logs Without Explicit Staff Objects:**
   - `order-management.json` models staff as first-class `employees` objects (`Warehousing`, `Shipment`, `Sales`), whereas `ocel2-p2p.json` does not include an employee object type (departments are inferred from activity domains). In M2/M3, the engine must support three fallback modes: (a) explicit resource object types, (b) event-level `org:resource` / `org:role` attributes, and (c) activity-cluster grouping when resource metadata is absent.
2. **Automatic Layered DAG Layout for Arbitrary OC-DFGs:**
   - M1 uses curated horizontal swimlanes (`tracks`) for the two reference processes. Arbitrary OCEL logs with 10+ object types can produce dense edge crossings. In M2, we will implement a Sugiyama-style layered layout that ranks active flow object types into horizontal tracks and collapses static lookup object types into badge annotations.
3. **Confounded Downstream Cascades vs. Direct Causality:**
   - Observational event logs exhibit confounding (e.g., a large B2B order or specific vendor plant `Plant 4000` can simultaneously increase both upstream PO approval time and downstream invoice matching delay). In M3, downstream impact claims will be stratified by order size and vendor/plant cohorts.
4. **Large Log Scalability (`~300 MB` `.jsonocel` / `.sqlite`):**
   - In-memory pandas joins over millions of E2O relations can exceed interactive latency budgets (`< 2s`). M3 will pre-index predecessor event timestamps per `(event_id, object_id)` on ingestion and cache the decomposed gate tables.

---

## 4. Prioritized Roadmap (M2 → M4) & Exit Criteria

### Milestone 2 — Live Python OPerA & Statistical Engine (Priority 1)
- **Deliverables:**
  1. Implement `backend/opera_engine.py` to compute per-event `pooling_days`, `lagging_days`, `sync_days`, and `queue_days` dynamically from any loaded OCEL 2.0 file.
  2. Implement `backend/stats_engine.py` to run two-sided Mann–Whitney U tests, 1,000-sample bootstrap 95% CIs, Cliff's $\delta$, and Benjamini–Hochberg correction across candidate delay factors (suppressing factors with $n < 30$).
  3. Serve full view payloads from `GET /api/v1/logs/{log_id}/analysis` and wire `ocelClient.js` to consume live backend computations first.
- **Exit Criteria:**
  - Deleting hardcoded numbers from `demoPayloads.js` still reproduces the exact `Create Package` (`3.80d`) and `Execute Payment` (`5.27d`) decompositions within $\pm 0.05\text{d}$ via API, with API response time $< 800\text{ ms}$ on both reference logs.

### Milestone 3 — Generic OC-DFG Layout & Live File Upload (Priority 2)
- **Deliverables:**
  1. Implement `POST /api/v1/logs/upload` for arbitrary `.json`, `.jsonocel`, and `.sqlite` OCEL 2.0 files.
  2. Replace log-specific SVG path helpers (`renderOrderManagementPaths` / `renderP2PPaths`) with a fully data-driven Sugiyama swimlane + intersection gate layout generator.
  3. Add an interactive Case Picker on `Case Timeline` so users can search and inspect any object/event instance in the uploaded log.
- **Exit Criteria:**
  - Uploading an unseen third OCEL 2.0 dataset (e.g., `sf-fire-ems` subset or synthetic benchmark log) renders all 6 views with zero console/runtime errors and valid OPerA decompositions in $< 3\text{ s}$.

### Milestone 4 — Stratified Counterfactuals, Export & Polish (Priority 3)
- **Deliverables:**
  1. Upgrade the What-If simulator to use stratified historical cohort deltas (controlling for order size / vendor group).
  2. Persist custom schema-matched explanations in a backend store with JSON export/import so teams can share domain templates.
  3. Full WCAG 2.1 AA keyboard navigation and automated end-to-end Playwright + pytest CI suite.
- **Exit Criteria:**
  - 100% pass rate on backend unit/contract tests and frontend render/interaction tests; validated with 3 non-technical test users completing the 5 Slide 27 diagnostic questions in $< 8$ minutes.

---

## 5. Validation Plan

1. **Synthetic Ground-Truth OCEL Verification (Unit Level):**
   - Construct a minimal synthetic OCEL 2.0 log (10 orders, 30 items, 10 packages, 2 staff) with analytically known pooling (`2.00d`), lagging (`1.00d`), and post-sync queue (`0.50d`) times, and assert exact equality in `pytest`.
2. **Golden Regression Suite on Reference Logs (Integration Level):**
   - Assert that the Python engine reproduces our verified golden benchmarks on `order-management.json` (`Create Package`: $n=1,128$ events, $1,106$ multi-item pools, mean total wait $3.80\text{d}$, median $3.26\text{d}$) and `ocel2-p2p.json` (`Execute Payment`: $n=1,166$ events, mean wait $5.27\text{d}$, median $4.70\text{d}$).
3. **Automated Render & Contract Smoke Suite:**
   - Run `tests/smoke_test.mjs` across all 6 views, both logs, multiple threshold settings (`1.5d`, `3.0d`, `7.5d`), and both description modes, plus contract verification between `backend/api_contract.py` and `backend/server.py`.

---

## 6. Resolved M1 Review Audit Log

- **Empirical Threshold Cohorts:** Replaced the synthetic power-law formula with exact empirical wait-time arrays (`frontend/src/data/empiricalCohortData.js`, $n = 1,106$ and $n = 1,166$).
- **Timeline Badge Consistency:** Separated **cross-object gate wait** (`0.9d gate wait ≤ 3.0d threshold`) from **end-to-end case span** (`4.6d end-to-end`) on `Package p-660007` and `Payment payment:6`, eliminating the apparent threshold contradiction.
- **Bottleneck Ranking Transparency:** Documented the Composite Business Impact Score on Overview and added an interactive `Rank by: Impact Score | Avg Wait Time` toggle.
- **Statistical Rigor (Q2):** Added sample sizes ($n$), 95% bootstrap CIs, Cliff's $\delta$ effect sizes, and BH-corrected Mann–Whitney U $p$-values to `Compare Cases` and `Overview`.
- **End-to-End Context & Decision Closure:** Added guided scenario cards on the starter screen, a persistent `Active Bottleneck Focus` bar across `Team Workload`, `Compare Cases`, and `Case Timeline`, inline event inspection inside each swimlane card, and a closing `Recommended Decision` card on `Case Timeline`.
