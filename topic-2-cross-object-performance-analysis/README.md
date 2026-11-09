# Intersect — Cross-Object Performance Analysis (M1 Prototype)

**Live Prototype:** [lab-intersect.vercel.app](https://lab-intersect.vercel.app)

**Intersect** is an interactive web prototype for **Topic 2: Cross-Object Performance Analysis**. It helps non-technical stakeholders spot and understand operational bottlenecks that occur where multiple business objects (such as orders, items, packages, purchase orders, goods receipts, invoices, and staff) meet at shared process steps.

---

## How to Use the Prototype

### 1. Choose an Event Log
When you open [lab-intersect.vercel.app](https://lab-intersect.vercel.app), you start on the log selection screen:
- Use the **Select an example log...** dropdown to open **`Order Management`** (`order-management.json`) or **`Procure-to-Pay`** (`ocel2-p2p.json`).
- Or click **Upload Event Log** to select a local `.json` / `.jsonocel` file.
- You can switch datasets at any time from the **Dataset** dropdown in the bottom-left sidebar, or click the **Intersect** logo in the top-left to return to the starter screen.

### 2. Explore the 6 Pages (Left Sidebar)
1. **Overview:** Shows top-level process KPIs and the **Top 3 Bottlenecks** ranked by average wait time and business impact. Click **View in Process Flow** or **View Delay Breakdown** on any row to drill directly into that step.
2. **Process Flow:** Displays each object type on its own horizontal lane and highlights shared steps where multiple objects must meet.
   - Click any vertical shared step in the diagram to select it.
   - Click **Show Exceptions** to reveal rework loops or **Highlight Delay Chain** to trace how upstream delays propagate downstream.
3. **Delay Breakdown:** Breaks down a shared step's wait time into three plain-language buckets: **Waiting for All Items** (pooling), **Waiting for Other Objects** (synchronization), and **Waiting for Team** (resource queue), alongside **Slowest Incoming Objects** and **Upstream & Downstream Impact**.
   - Use the **Process Step** dropdown in the header to switch steps.
   - Click **Hide Descriptions / Show Descriptions** to toggle the plain-language explanations on or off.
   - Click **Edit Explanations** to open the schema text editor overlay and customize the descriptions for all logs sharing the same object and event types.
4. **Team Workload:** Shows how shared teams (`Warehousing`, `Shipment`, `Sales`, `Finance`, `Procurement`) split their capacity across different activities and where delayed backlogs build up over time.
5. **Compare Cases:** Contrasts **On-Time Cases** against **Delayed Cases**, highlights the **Top Delay Factors** (with vs. without each factor), and provides an **Estimate Improvement** slider to preview how many cases and euros would be recovered by reducing the main delay.
6. **Case Timeline:** Visualizes real multi-object examples from the event log (**Delayed Example**, **On-Time Example**, or **Show Both**). Click any colored event dot on a lane to see its exact timestamp and actor.

### 3. Global Controls
- **Delay Threshold Slider (Top-Right Page Header):** Drag between `1.5d` and `7.5d` on any page to redefine what wait time counts as a delay across all views.
- **Page Guide (`i` Button Next to Page Title):** Click the info icon next to any page title to open a short overlay explaining how to use that page.
- **Night Mode Toggle (Top-Right Sun Icon):** Switch between light mode and dark mode.

---

## Running Locally (Optional)

From `software-lab/topic-2-cross-object-performance-analysis/`:

```bash
# Option 1: Run Frontend WebApp + Python REST API Stub
python3 backend/server.py
# -> Open http://localhost:8080

# Option 2: Serve the Frontend WebApp as static files
python3 -m http.server 3000 --directory frontend
# -> Open http://localhost:3000
```
