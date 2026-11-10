# Intersect — Cross-Object Performance Analysis (M1 Prototype)

- **Live Prototype:** [lab-intersect.vercel.app](https://lab-intersect.vercel.app)
- **GitHub Repository:** [github.com/HenriJul/intersect](https://github.com/HenriJul/intersect)
- **Architecture, Assumptions & M2–M4 Roadmap:** [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md)

**Intersect** is an interactive web prototype for **Topic 2: Cross-Object Performance Analysis**. It helps non-technical stakeholders and process analysts spot, decompose, and act on operational bottlenecks where multiple business objects (orders, items, packages, purchase orders, goods receipts, invoices, and staff) must synchronize at shared process steps.

---

## Guided 5-Minute Walkthrough (Recommended Start)

1. **Starter Screen (`Select Event Log`):**
   - Open [lab-intersect.vercel.app](https://lab-intersect.vercel.app) and click **Scenario 1: Order Management** (or select **Order Management** from the dropdown / upload a `.json` file).
2. **Overview (`Subpage 1`):**
   - Review the **Top 3 Bottlenecks** ranked by **Composite Business Impact** (`Wait × Volume × Downstream Cascade`).
   - Use the **Rank by: Impact Score | Avg Wait Time** toggle above the list to compare composite business impact (`#1 Create Package`, `3.8d avg · 4,203 pkg-days`) against raw average wait (`#1 Pay Order`, `6.1d avg`).
   - Drag the **Delay Threshold** slider (`1.5d` – `7.5d`) in the top-right header to see exact empirical cohort counts update from `order-management.json` ($n = 1,106$ multi-item packages).
3. **Process Flow (`Subpage 2`):**
   - Click any vertical shared gate (`Create Package`, `Pay Order`, `Confirm Order`, `Package Delivered`) or focus it with `Tab` + `Enter`.
   - Toggle **Show Exceptions** and **Highlight Delay Chain** to inspect rework loops and upstream-to-downstream propagation.
4. **Delay Breakdown (`Subpage 3`):**
   - Inspect how a step's wait splits into **Waiting for All Items (OPerA Pooling)**, **Waiting for Other Objects (OPerA Lagging)**, and **Waiting for Team (Post-Sync Queue)**.
   - Click **Hide Descriptions / Show Descriptions** to switch between guided prose and a compact metrics view.
   - Click **Edit Explanations** to customize plain-language descriptions keyed to the log's canonical OCEL 2.0 `objectTypes` + `eventTypes` schema signature.
5. **Team Workload (`Subpage 4`):**
   - Follow the **Active Bottleneck Focus** banner at the top of the page to see how the responsible team (`Warehousing`, `Shipment`, `Sales`, `Finance`, `Procurement`) splits capacity across competing workflows and where delayed backlogs peak.
6. **Compare Cases (`Subpage 5`):**
   - Compare **On-Time** vs. **Delayed** cohorts with non-parametric significance metrics ($n$, **95% Bootstrap CI**, **Cliff's $\delta$** effect size, and **Benjamini–Hochberg** corrected Mann–Whitney U $p$-values).
   - Drag the **Scenario What-If Simulator** slider (`-10%` to `-80%`) to evaluate on the empirical wait distribution how many delayed cases return below your active threshold.
7. **Case Timeline (`Subpage 6`):**
   - Contrast a **Delayed Example** (`Package p-660016`: `10.0d gate wait > 3.0d threshold · 19.0d end-to-end`) and an **On-Time Example** (`Package p-660007`: `0.9d gate wait ≤ 3.0d threshold · 4.6d end-to-end`), or select **Show Both**.
   - Click any event dot to inspect its exact timestamp and actor directly inside that case card's header, and review the closing **Recommended Decision** card at the bottom.

---

## Running Locally

From `software-lab/topic-2-cross-object-performance-analysis/`:

```bash
# Option 1: Run Frontend WebApp + Python REST API Stub (default port 8080)
python3 backend/server.py
# -> Open http://localhost:8080

# Custom port if 8080 is in use:
python3 backend/server.py 8081

# Option 2: Serve the Frontend WebApp as static files
python3 -m http.server 3000 --directory frontend
# -> Open http://localhost:3000
```

> **Prerequisites & Notes:**
> - **Python Version:** Python `3.10+`.
> - **Do Not Open `frontend/index.html` via `file://`:** Native ES module imports (`<script type="module">`) require an HTTP server (`localhost` or [lab-intersect.vercel.app](https://lab-intersect.vercel.app)) due to browser CORS restrictions.
> - **Smoke Tests:** Run `node tests/smoke_test.mjs` to verify all 6 views, empirical cohort monotonicity, and schema signatures.
