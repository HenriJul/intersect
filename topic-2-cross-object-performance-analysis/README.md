# Intersect — Cross-Object Performance Analysis (M1 Prototype)

- **Live Prototype:** [lab-intersect.vercel.app](https://lab-intersect.vercel.app)
- **GitHub Repository:** [github.com/HenriJul/intersect](https://github.com/HenriJul/intersect)
- **Architecture, Assumptions & M2–M4 Roadmap:** [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md)

**Intersect** is an interactive web application for **Topic 2: Cross-Object Performance Analysis**. It is designed specifically for **non-technical business users** to discover, understand, and resolve bottlenecks that happen where multiple business objects (orders, items, packages, purchase orders, goods receipts, invoices, and staff) must come together at shared process steps.

---

## Target User Types & How Each User Uses Intersect

Because cross-object delays happen *between* departments, Intersect is built around five concrete user types. Every screen uses plain business language rather than technical process-mining jargon so all five roles can collaborate in the same tool:

| User Type | Role & Core Question | Primary Screens Used | How They Use Intersect (Step-by-Step) |
| :--- | :--- | :--- | :--- |
| **1. Warehouse & Fulfillment Manager**<br>*(Operational Line Manager)* | Oversees picking, packing, and shipping.<br>**Question:** *"Why is my team blamed for 3.8-day packing delays when pickers work fast?"* | **Overview** → **Delay Breakdown** → **Team Workload** → **Case Timeline** | 1. Selects **Order Management** on the starter screen.<br>2. Sees `Create Package (3.8 days)` ranked `#1` on **Overview** and clicks **View Delay Breakdown**.<br>3. Uses the 3-part bar on **Delay Breakdown** to prove that **78% of the wait (`3.0d`)** is spent waiting for missing/out-of-stock items, while only **22% (`0.8d`)** is warehouse team queue.<br>4. Opens **Case Timeline** (`Package p-660016`) to show peers a concrete order where picked items sat waiting 10 days for 1 reordered item. |
| **2. Accounts Payable & Billing Lead**<br>*(Downstream Process Owner)* | Manages invoice matching, supplier payments, and customer billing.<br>**Question:** *"Why is €1.42M in supplier invoices stuck waiting 5.3 days to be paid?"* | **Overview** → **Process Flow** → **Delay Breakdown** → **Case Timeline** | 1. Selects **Procure-to-Pay** on the starter screen.<br>2. Clicks `Execute Payment` on **Process Flow** to see how 4 lanes (`Purchase Orders`, `Goods Receipts`, `Invoices & Payments`) converge at payment.<br>3. Opens **Delay Breakdown** for `Perform Two-Way Match` and `Execute Payment` to see that split supplier deliveries (`2.5 receipts per PO`) block invoice clearance.<br>4. Switches to **Case Timeline** (`Show Both`) to contrast a delayed split-shipment payment (`payment:807`) against a single-delivery payment (`payment:6`). |
| **3. Category & Procurement Manager**<br>*(Upstream Coordinator)* | Manages requisitions, PO approvals, and supplier replenishment.<br>**Question:** *"How do upstream approval delays or out-of-stock items ripple into downstream operations?"* | **Process Flow** → **Delay Breakdown** → **Compare Cases** | 1. On **Process Flow**, clicks **Highlight Delay Chain** and **Show Exceptions** to see how upstream rework (`Item Out of Stock → Reorder Item` or `Delegate PR Approval`) propagates downstream.<br>2. Checks the **Upstream & Downstream Impact** chain on **Delay Breakdown**.<br>3. Opens **Compare Cases** to see how much slower cases are with specific risk factors (`Has Out-of-Stock Item: 3.4× slower`; `3+ Partial Goods Receipts: 2.9× slower`). |
| **4. COO / VP of Supply Chain**<br>*(Executive Decision-Maker)* | Owns cross-departmental budget and SLA targets.<br>**Question:** *"Should I hire more staff, or change our handoff/batching rules?"* | **Overview** → **Team Workload** → **Compare Cases** | 1. Adjusts the global **Delay Threshold** slider (`1.5d–7.5d`) in the top-right header to test stricter or looser company SLA targets across all pages.<br>2. Compares **Delay Breakdown** (missing objects vs. team queue) with **Team Workload** to see if a department is genuinely overloaded (`>85%` load) or simply blocked by upstream handoffs.<br>3. Uses the **Estimate Improvement** slider on **Compare Cases** to preview how many delayed cases and euros (`€`) return on-time if the primary delay driver is reduced. |
| **5. Operational Excellence Lead**<br>*(Workshop Facilitator / Analyst)* | Facilitates process-improvement meetings across departments and onboards new datasets.<br>**Question:** *"How do I explain these metrics clearly to non-technical stakeholders for any event log?"* | **All 6 Subpages** + **Edit Explanations Modal** | 1. Uses the **`i` (How to use this page)** button in any page header to walk stakeholders through the view.<br>2. On **Delay Breakdown**, clicks **Edit Explanations** to customize the plain-language descriptions for the company's specific process; custom text is automatically saved to the log's schema (object and event types).<br>3. Uses **Hide / Show Descriptions** to toggle between guided prose for newcomers and a compact metrics view for recurring weekly reviews. |

---

## How to Use the Prototype (Page-by-Page Walkthrough)

1. **Starter Screen (`Select Event Log`):**
   - Choose **Order Management** or **Procure-to-Pay** from the dropdown, or click **Upload Event Log** to select a `.json` OCEL file.
2. **Overview (`Subpage 1`):**
   - View top-level process KPIs and the **Top 3 Bottlenecks** with their average wait time, affected financial value (`€`), and main delay source.
   - Use the **Delay Threshold** slider in the top-right header (`1.5d` – `7.5d`) to dynamically update delayed counts and affected value across the entire app.
3. **Process Flow (`Subpage 2`):**
   - See how separate business objects travel along horizontal lanes and meet at vertical shared steps (intersections).
   - Click any shared step pill to inspect it, or toggle **Show Exceptions** and **Highlight Delay Chain**.
4. **Delay Breakdown (`Subpage 3`):**
   - See whether a step's wait time comes from **Waiting for All Items** (bundling multiple items of the same type), **Waiting for Other Objects** (waiting on another lane), or **Waiting for Team** (staff queue).
   - Inspect **Slowest Incoming Objects** and the 3-stage **Upstream & Downstream Impact** chain.
   - Use **Hide / Show Descriptions** to toggle explanatory text, or **Edit Explanations** to customize descriptions for logs sharing the same schema.
5. **Team Workload (`Subpage 4`):**
   - Select any team (`Warehousing`, `Shipment`, `Sales`, `Finance`, `Procurement`) to see how their time is split across competing steps and how delayed backlogs track against team load over time.
6. **Compare Cases (`Subpage 5`):**
   - Compare **On-Time Cases** vs. **Delayed Cases** under your active Delay Threshold, inspect the **Top Delay Factors**, and drag the **Estimate Improvement** slider to simulate reducing the main delay source.
7. **Case Timeline (`Subpage 6`):**
   - Inspect real object timelines from the log (`Delayed Example`, `On-Time Example`, or `Show Both`) and click any event dot to see its exact timestamp and actor.

---

## Running Locally

From `software-lab/topic-2-cross-object-performance-analysis/`:

```bash
# Option 1: Run Frontend WebApp + Python REST API Server (default port 8080)
python3 backend/server.py
# -> Open http://localhost:8080

# Custom port if 8080 is in use:
python3 backend/server.py 8081

# Option 2: Serve the Frontend WebApp as static files
python3 -m http.server 3000 --directory frontend
# -> Open http://localhost:3000
```

> **Prerequisites & Notes:**
> - **Python Version:** Python `3.10+` (zero external packages required to run the UI; `pandas >= 2.0` optional for live `/api/v1/logs` summary extraction).
> - **Do Not Open `frontend/index.html` via `file://`:** Native ES module imports (`<script type="module">`) require an HTTP server (`localhost` or [lab-intersect.vercel.app](https://lab-intersect.vercel.app)) due to browser CORS restrictions.
> - **Automated Smoke Tests:** Run `node tests/smoke_test.mjs` to verify all 6 views and empirical cohort calculations.
